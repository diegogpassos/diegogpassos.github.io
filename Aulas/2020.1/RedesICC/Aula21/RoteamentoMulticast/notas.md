---
title: Roteamento Multicast
---

Em uma comunicação *multicast*, mensagens são destinadas a um
**sub-conjunto dos nós de uma rede.** Este sub-conjunto é geralmente
próprio --- *i.e.*, não inclui todos os nós da rede --- já que, do
contrário, a comunicação seria *broadcast*. Este conjunto de nós aos
quais a mensagem *multicast* interessa recebe o nome de um **grupo
*multicast***. O problema de roteamento *multicast*, portanto, consiste
em encontrar uma árvore --- ou várias --- que interconecta todos os
membros do grupo *multicast*.

Note que uma árvore geradora atende a este requisito: é uma árvore que
interconecta todos os nós da rede --- e, portanto, todos os membros do
grupo *multicast*, qualquer que seja este grupo. Entretanto, é comum que
existam árvores muito menores que uma árvore geradora --- *i.e.*, que
envolvam menos nós da rede --- que ainda interconectem todos os nós do
grupo *multicast*. Desta forma, ao contrário de uma árvore geradora, uma
**árvore *multicast*** geralmente contém apenas um sub-conjunto
(potencialmente pequeno) do total de nós da rede. É importante
ressaltar, no entanto, que normalmente não é possível interconectar
todos os membros de um grupo *multicast* sem utilizar alguns outros nós
que não fazem parte do grupo. Logo, as árvores *multicast* contêm todos
os nós membros e, potencialmente, alguns nós não membros.

As abordagens para roteamento *multicast* podem ser divididas em duas
famílias: as baseadas em **árvore compartilhada** e as baseadas em
**árvores enraizadas na fonte**. Na primeira família, uma única árvore é
definida sobre a rede, sendo utilizada para o encaminhamento
independentemente da origem de cada pacote. Já na segunda, existirão
múltiplas árvores potencialmente diferentes, cada uma utilizada para o
encaminhamento de pacotes originados em cada membro do grupo
*multicast*.

## Soluções Baseadas em Árvores Enraizadas na Fonte

Nesta família de soluções, uma primeira abordagem é a utilização da
chamada *árvore de caminhos mais curtos*. Em um protocolo baseado em
estado de enlaces, quando o algoritmo de Dijkstra é executado, o nó que
efetua a execução descobre os melhores caminhos completos entre ele e
todos os demais nós da rede. Lembre-se que este conjunto de caminhos
forma uma árvore que conecta o nó local a todos os demais nós da rede.
Assumindo, portanto, que haja um protocolo baseado em estado de enlaces
utilizado para roteamento *unicast* na rede, basta que estas árvores de
caminhos mais curtos encontradas por cada nó sejam disseminadas por toda
a rede. Assim, quando um roteador recebe um pacote de *broadcast*, basta
que ele consulte quais de suas portas de saída pertencem à árvore de
caminhos mais curtos do nó de origem daquele pacote e faça o
encaminhamento por elas.

Outra solução nesta família é o uso do encaminhamento baseado em **caminho
reverso**, exatamente como utilizado no caso do roteamento *broadcast*: ao
receber um pacote *multicast*, o roteador verifica se este foi recebido
pela porta utilizada para encaminhar pacotes *unicast* para o nó de
origem; em caso afirmativo, o roteador realiza a inundação do pacote
para todas as suas portas de saída, exceto aquela pela qual o pacote foi
recebido; caso contrário, o pacote é descartado.

Repare que a solução de encaminhamento baseado em caminho reverso é
menos eficiente que a baseada na árvore de caminhos mais curtos, no
sentido de que cada roteador pode receber um mesmo pacote múltiplas
vezes --- embora só encaminhe uma única vez. Por outro lado, a solução
baseada nas árvores de caminho mínimo apresenta maior complexidade, dado
que a informação de cada uma das árvores precisa ser disseminada por
toda a rede e armazenada em cada roteador. Além disso, repare que ambas
as soluções exigem a execução conjunta de um protocolo de roteamento
*unicast*.

Por fim, note que ambas as soluções, como descritas até aqui, resultam
em um *broadcast* --- *i.e.*, os pacotes *multicast*, na prática, chegam
a todos os nós da rede. Evitar este tipo de desperdício era justamente o
propósito de estudarmos métodos específicos para o roteamento
*multicast*. Na verdade, a diferença entre estas soluções e suas
equivalentes aplicadas ao roteamento *broadcast* é a possibilidade de
uso de um mecanismo adicional ainda não explicado até aqui: a **poda**.

A poda consiste em cortar das árvores *multicast* ramos que não são
úteis. Por *não úteis*, entenda-se ramos que não contêm nem membros do
grupo *multicast*, nem roteadores necessários para que pacotes alcancem
membros.

Em uma solução distribuída, a poda geralmente funciona da seguinte
forma. Ao receber um pacote destinado a um grupo *multicast*, um
roteador decide por quais portas de saída deve encaminhá-lo. Caso o
roteador decida que **nenhuma das suas portas de saída faz parte da
árvore e que ele próprio não é membro do grupo *multicast***, então ele
não é necessário àquele grupo. Com isso, este roteador envia uma
mensagem de poda para seu pai na árvore. Ao receber esta mensagem, o
roteador pai remove a porta pela qual a mensagem de poda chegou da árvore
*multicast*. Note que isso pode fazer com que este próprio roteador pai
chegue à conclusão de que agora não é mais necessário à árvore e,
portanto, envie uma mensagem de poda para o seu pai. Este processo se
repete até que a mensagem de poda alcance um roteador que ainda seja
necessário à árvore.

## Soluções Baseadas em Árvores Compartilhadas

Nesta família de soluções, nosso objetivo é determinar uma única árvore
compartilhada por todos os membros do grupo *multicast*. Em geral,
existem muitas possíveis árvores interconectando todos os membros de um
grupo *multicast*. É importante, portanto, definir um critério de qual
dessas devemos selecionar.

Assim como o roteamento *unicast* comumente se utiliza de métricas de
roteamento para comparar dois ou mais caminhos, podemos, aqui, assumir
que cada enlace da rede possui um peso --- dado por uma métrica --- o
que possibilita comparar duas árvores *multicast* através da comparação
dos custos totais de cada árvore. Em geral, o custo de uma árvore é dado
pela soma dos pesos dos enlaces que a compõem. Assim, chegamos a um
critério de escolha de uma árvore *multicast* que parece razoável:
dentre as várias disponíveis, optaremos por aquela de menor custo total.

No entanto, dada uma topologia de rede e o conjunto de nós membros do
grupo *multicast*, como podemos determinar esta árvore *multicast* de
custo mínimo? Este é, na verdade, um problema clássico em computação ---
mais especificamente, na área de otimização --- chamado de **Problema da
Árvore de Steiner em Grafos**.

O Problema de Árvore de Steiner em Grafos tem grande aplicabilidade em
diversos domínios, incluindo, por exemplo, o projeto de circuitos
eletrônicos. Além disso, há grande interesse teórico no problema.
Entretanto, foge ao escopo desta disciplina um estudo mais profundo
sobre o problema e os algoritmos existentes para solucioná-lo. Para os
nossos propósitos, é suficiente entendermos que este problema é
classificado como NP-Difícil, o que significa --- entre outras coisas
--- que, ao menos no momento, não são conhecidos algoritmos eficientes
(*i.e.*, de tempo polinomial no tamanho da instância) para a sua
solução. Dada a sua grande relevância, ao longo dos anos várias boas
heurísticas --- algoritmos que encontram soluções "boas", mas não
necessariamente ótimas --- foram criadas para este problema. Mesmo
assim, a aplicabilidade destas heurísticas para instâncias reais de
larga escala tipicamente encontradas na área de roteamento *multicast*
não é considerada prática, por conta de fatores como: a (ainda) alta
complexidade computacional e de troca de mensagens, a necessidade (em
certos métodos) de conhecimento sobre a topologia completa da rede e a
natureza monolítica de várias destas heurísticas (*i.e.*, pequenas
alterações nos participantes do grupo *multicast* demandam a re-execução
completa do algoritmo).

Uma solução mais viável computacionalmente são as chamadas **árvores
baseadas em nó central**. A ideia é simples: elege-se, dentre os membros do grupo *multicast*, um nó
para atuar como nó central; em seguida, cada um dos demais membros do
grupo *multicast* envia uma mensagem *unicast* do tipo *join* endereçada
ao nó central; os enlaces percorridos pelas mensagens de *join* são
adicionados à árvore *multicast* e posteriormente utilizados para o
encaminhamento de pacotes no grupo.
