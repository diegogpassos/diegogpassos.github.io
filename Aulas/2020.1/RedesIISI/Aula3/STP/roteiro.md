# Spanning Tree Protocol

O *Spanning Tree Protocol*, ou STP, é um protocolo de grande importância em implementações de redes Ethernet de médio e grande porte. Devido à forma de operação do auto-aprendizado e à ausência de um mecanismo para mitigação de *loops* de encaminhamento no Ethernet --- por exemplo, um campo TTL decrementado a cada salto, como no IP ---, topologias Ethernet contendo *loops* muito provavelmente sofrerão com o problema de **tempestade de *broadcast***. Nessa situação, determinados quadros serão inundados várias e várias vezes pelas mesmas portas de cada *switch*, resultando em um excesso de tráfego que traz grande prejuízo ao desempenho da rede.

Para evitar esse problema, é necessário evitar a formação de *loops* na topologia de uma rede Ethernet. Embora isso possa parecer trivial, à medida que uma rede Ethernet cresce, essa tarefa se torna cada vez mais complicada, já que a probabilidade de um erro de configuração --- *e.g.*, alguém conectar um cabo em uma porta errada --- aumenta. O uso de VLANs --- um mecanismo comumente empregado nessas redes de média e larga escala --- facilita ainda mais esses erros, por gerar uma topologia lógica potencialmente diferente da topologia física. Outro complicador é que, não obstante seus severos efeitos no desempenho de uma rede Ethernet, *loops* são muitas vezes difíceis de diagnosticar e encontrar. Além disso, a introdução proposital de *loops* é muitas vezes desejável para aumentar a resiliência da rede a falhas.

É nesse contexto que surge o STP. Esse protocolo "protege" a rede contra os efeitos danosos dos *loops* ao gerar uma *topologia lógica* livre de *loops* sobre a qual os *switches* Ethernet efetivamente operam. Mais especificamente, o STP permite que os *switches* detectem *loops* físicos e desabilitem logicamente portas que os causam.

Para isso, o STP determina uma **árvore geradora** da topologia física. Uma árvore geradora de um grafo ou rede é um subconjunto daquela topologia contendo todos os nós/dispositivos da topologia original, mas com um número potencialmente menor de arestas/enlaces de forma que exista exatamente um caminho conectando cada par de nós/dispositivos. A existência de um único caminho entre dois nós implica a ausência de *loops*.

Embora existam vários detalhes na operação do STP[^Versoes], de forma simplificada, o protocolo realiza as seguintes atividades:


[^Versoes]: Note que o STP evoluiu ao longo dos anos, sofrendo várias alterações --- geralmente, com o propósito de acelerar sua convergência ou capacidade de se recuperar de falhas na rede. Em particular, hoje é comum o uso do RSTP (*Rapid Spanning Tree Protocol*). Entretanto, os princípios básicos do protocolo são os mesmos. Esse documento se foca justamente nesses princípios.
 
- Eleição de um dos *switches* para atuar como raiz.
- Definição do caminho mais curto entre cada *switch* e a raiz.
- Habilitação/desabilitação das portas de acordo com se elas estão ou não em algum dos caminhos mais curtos até a raiz.

Essas três atividades são realizadas de forma contínua pelo STP, porque a topologia de rede pode sofrer modificações ao longo do tempo --- por exemplo, enlaces podem falhar novas conexões físicas podem aparecer. Quando alguma alteração topológica ocorre, após algum tempo, o STP converge para uma nova configuração estável dos estados das portas.

Em geral, não há nada de particularmente especial sobre o *switch* eleito como raiz. De fato, essa raiz atua simplesmente como um ponto de referência comum para a construção da árvore geradora. Essa eleição é baseada simplesmente em um identificador numérico de cada *switch*: o *switch* de menor identificador é escolhido como raiz. Tal identificador é formado pela concatenação de uma valor de prioridade de 16 bits com um endereço MAC do *switch*, resultando em um número de 64 bits. Por padrão, a prioridade tem valor 32768, mas pode ser alterada por um administrador da rede se, por algum motivo, este deseja garantir que um certo *switch* seja ou não selecionado como raiz. Se todos os *switches* são configurados com um mesmo valor de prioridade --- ou se há mais de um com o menor valor de prioridade ---, então aquele com o endereço MAC de menor valor numérico será a raiz.

Para definir a árvore geradora sobre a topologia física, o STP basicamente determina e concatena os menores caminhos de cada *switch* até a raiz. Com base nessa informação, cada *switch* atribui um **estado** a cada uma das suas portas. O STP prevê vários estados possíveis para lidar com várias situações diferentes como, por exemplo:

- Porta faz parte do melhor caminho do *switch* até a raiz.
- Porta faz parte de um caminho alternativo do *switch* até a raiz --- e, portanto, geraria um *loop* se estivesse em uso normal.
- Porta não faz parte de nenhum caminho viável até a raiz --- por exemplo, porque há um *host* conectado a ela.
- Porta foi desabilitadamente manualmente pelo administrador.

Desse ponto em diante nesse material, iremos abstrair esses vários tipos de estado diferentes e focaremos apenas nas interconexões entre os *switches*, classificando cada porta como "habilitada" ou "desabilitada" de acordo com sua pertinência ou não há árvore geradora.

É importante notar que o STP trabalha com custos associados a cada enlace para a escolha dos melhores caminhos. Assim, se houver, por exemplo, dois caminhos possíveis de um *switch* até a raiz, um passando por apenas um enlace e outro passando por dois enlaces, é possível que o segundo caminho seja escolhido como o melhor. Os custos dos enlaces são determinados com base nas suas taxas de transmissão e os valores são especificados pelo padrão. Assim, enlaces mais rápidos recebem custos menores, o que faz com que esses sejam mais frequentemente mantidos habilitados, em relação a enlaces mais lentos.

O STP utiliza pacotes de controle chamados de BPDUs (*Bridge Protocol Data Units*). BPDUs são enviados periodicamente por cada *switch* por cada uma das suas portas. Ao receber um BPDU por uma de suas portas, um *switch* aprende, entre outras coisas, quais outros *switches* são seus vizinhos imediatos na topologia. Além disso, o BPDU contém outras informações que dão suporte à eleição da raiz e à determinação dos melhores caminhos até ela.

Em particular, um *switch* informa em seus BPDUs o seu identificador, o identificador do *switch* que ele **acredita atualmente** ser a raiz e o custo do caminho que ele **acredita atualmente** ser o melhor até a raiz. Inicialmente, quando o *switch* não sabe nada sobre a rede e sobre os outros *switches*, ele assume ser a raiz e, portanto, que o melhor caminho até a raiz tem custo trivialmente zero. À medida que BPDUs de seus vizinhos são recebidos, o *switch* aprende novas informações sobre a rede e pode atualizar sua visão sobre a raiz e sobre sua distância até ela. Mais precisamente, ao receber um novo BPDU, o *switch*:

1. Verifica se o ID da raiz informada no BPDU é menor que o ID de quem o *switch* atualmente assume ser a raiz.
  - Se for, o *switch* passa a considerar o ID recebido como sendo o da raiz da rede e atualiza sua distância para a raiz para ser a distância anunciada no BPDU somada ao custo do enlace pelo qual o BPDU foi recebido.
2. Caso contrário, se o ID da raiz informada no BPDU é igual ao ID de quem o *switch* atualmente assume ser a raiz:
  - Verifica se a distância anunciada no BPDU somada ao custo do enlace pelo qual o BPDU foi recebido é menor que o custo do melhor caminho conhecido atualmente.
    - Se for, atualiza seu melhor custo para o valor da soma e marca a porta pela qual o BPDU foi recebido como a porta que está no seu melhor caminho até a raiz[^DV].

[^DV]: Esse processo é muito similar a como protocolos de roteamento baseados em vetor de distâncias funcionam. A diferença aqui é que apenas uma distância importa: aquela para a raiz.

Depois de algumas trocas de BPDUs, a rede converge para um estado no qual todos os *switches* concordam sobre qual é a raiz e também conhecem seu melhor caminho até ela.

## Exemplos da Convergência do STP

Ao final dessa página, há uma pequena aplicação `javascript` que ilustra, de forma simplificada, o funcionamento do STP. A aplicação permite que se altere a topologia, adicionando ou removendo *switches* e enlaces. Os custos dos enlaces também podem ser livremente alterados. Para os switches, é possível alterar o endereço MAC, bem como a prioridade atribuída a cada um --- para efeito da eleição da raiz.

Cada alteração realizada automaticamente dispara um recálculo da árvore geradora. A árvore resultante é destacada em vermelho na topologia, enquanto os enlaces/portas desabilitados são ilustrados com linhas tracejadas. Além disso, a aplicação exibe um passo-a-passo do estado armazenado por cada *switch* --- quem é a raiz? qual a menor distância até a raiz? qual porta leva até a raiz? --- após cada troca de BPDUs.

Repare que essa aplicação assume que BPDUs são trocados de forma síncrona entre os *switches* --- *i.e.*, todos os *switches* enviam seus BPDUs exatamente ao mesmo tempo. Na prática, esses envios acontecem em momentos diferentes porque os *switches* não estão sincronizados. Entretanto, o algoritmo converge mesmo sem essa sincronia.

Utilize essa aplicação modificando a topologia e/ou os parâmetros de configuração dos *switches* para tentar responder as questões abaixo:

1. Há algum problema em executar o STP em uma topologia sem *loops*? O que acontece nesse caso?
2. Considere uma topologia em anel em que todos os enlace têm a mesma taxa de transmissão. Como fica a árvore geradora resultante?
3. Volte à situação do item anterior, mas considere agora que um dos enlaces do *switch* raiz é mais lento que os demais. Em particular, assuma que o seu custo é o dobro do custo dos demais enlaces. Como isso altera a árvore geradora? E se fosse o triplo?
4. Construa uma topologia contendo ao menos 4 *switches* que seja totalmente conectada --- *i.e.*, há enlaces de cada *switch* para todos os demais. Use os mesmos custos para todos os enlaces. Agora observe o passo-a-passo do STP. Quanto tempo demora para o protocolo convergir?
5. Volte ao cenário do item anterior, mas agora remova exatamente um enlace da topologia, necessariamente entre o *switch* raiz e um dos demais. Houve alteração no tempo de convergência? Todos os *switches* demoram o mesmo tempo para convergir ou algum demorou mais? No segundo caso, qual foi o switch que mais demorou a convergir?
6. Considere uma vez mais o cenário do item anterior. Continue removendo enlaces da topologia e observe novamente o tempo de convergência. Você consegue observar alguma relação entre alguma característica da topologia e esse tempo?

<iframe src="STP.html" onload="this.style.height=(this.contentWindow.document.body.scrollHeight+80)+ 'px'; this.style.width=(this.contentWindow.document.body.scrollWidth+50)+ 'px';" style="width: 100%;"/>



