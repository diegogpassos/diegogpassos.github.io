---
title: ICMP e *traceroute*
---

Quando falamos de protocolos de comunicação, muitas vezes nos referimos
aos chamados *pacotes de controle*. Isto é, pacotes que não transportam
dados do usuário, sendo utilizados para a troca de informações
importantes para o funcionamento do protocolo. Por exemplo, os segmentos
SYN e SYNACK do TCP podem ser compreendidos como pacotes de controle.

O IP, no entanto, não define pacotes de controle. Ao invés disso, para a
transmissão de informações de controle no nível da camada de rede,
utiliza-se um protocolo específico: o ICMP (do inglês, *Internet Control
Message Protocol*).

Tanto *hosts* quanto roteadores podem gerar e receber mensagens ICMP.
Estas mensagens são usadas primariamente para informar outros elementos
da rede sobre condições de erro, mas há também mensagens do ICMP
utilizadas com o objetivo principal de dar suporte a certas ferramentas
de teste e diagnóstico da rede, como o `ping`.

Embora o ICMP seja um protocolo de camada de rede, suas mensagens são
transmitidas em datagramas IPv4, da mesma maneira que TCP e UDP têm seus
segmentos encapsulados. Isso pode levar à conclusão errônea de que o
ICMP seria um protocolo de camada de transporte, o que não é verdade por
conta da sua utilização estar diretamente atrelada a funcionalidades da
camada de rede.

## Mensagens ICMP

Não entraremos em detalhes nesta disciplina sobre o formato de cabeçalho
do ICMP. Para os nossos propósitos, é suficiente saber que cada mensagem
ICMP tem um *tipo* que pode ser mais especificado na forma de um
*código*. O par tipo-código, portanto, identifica a semântica de uma
mensagem ICMP.

Um exemplo de mensagem ICMP é a de tipo 3, código 1, que em termos mais
simples significa *Host de destino inalcançável*. Esta mensagem é
normalmente gerada pelo roteador de borda de uma sub-rede ao receber um
datagrama que deve ser encaminhado a um endereço IP daquela sub-rede,
mas que não parece estar associado a nenhum *host* conectado à rede
naquele momento. Esta mensagem ICMP é enviada, então, de volta ao *host*
que originou o datagrama que causou o erro. Há também mensagens
similares para os casos de *Rede inalcançável* --- *i.e.*, o roteador
não sabe como encaminhar o pacote para sub-rede a qual o endereço de
destino do datagrama pertence --- e *Porta inalcançável* --- o *host* de
destino não encontrou nenhum *socket* aberto na porta especificada.

Outras duas mensagens ICMP comumente utilizadas na Internet são a *echo
request* e a *echo reply*. Ao contrário dos exemplos anteriores, estas
mensagens não são geradas em caso de erro. Na verdade, elas dão suporte
à ferramenta de diagnóstico de rede `ping`. O `ping` gera uma mensagem
do tipo *echo request* endereçada ao *host* especificado pelo usuário.
Ao receber um *echo request*, um *host* gera como resposta um *echo
reply*. Ao receber o *echo reply*, o `ping` imprime uma mensagem na
tela, mostrando --- entre outras estatísticas --- que *host*
especificado pelo usuário está acessível.

Há, também, uma mensagem ICMP destinada a avisar à origem que um de seus
datagramas foi descartado pela rede por conta de um TTL expirado. Neste
caso, o roteador que realizou o descarte se encarrega de gerar a
mensagem ICMP de erro.

Existem, ainda, mensagens ICMP previstas para que roteadores possam
disseminar informações de roteamento para outros roteadores. No entanto,
como veremos em aulas posteriores, protocolos de roteamento atualmente
populares na Internet raramente utilizam o ICMP para este tipo de
propósito.

Outra mensagem ICMP prevista, mas raramente utilizada na prática, é a
*source quench*. Seu propósito é avisar proativamente à origem de um
fluxo de dados sobre uma situação de congestionamento na rede. Como vimos durante o estudo do TCP, a abordagem de controle de congestionamento amplamente adotada na Internet infere congestionamento apenas com base no comportamento da rede diretamente observável pelo *host* de origem --- *e.g.*, perdas de segmentos.

## *Traceroute*

Em aulas anteriores, o utilitário `traceroute` foi utilizado em
demonstrações para exibir a rota utilizada para encaminhar pacotes entre
dois *hosts*. O vídeo abaixo mostra um exemplo de execução desse programa descobrindo a rota utilizada entre um servidor localizado na UFF e o servidor `www.uerj.br`:

![](videos/TracerouteExBasico.mp4){style="max-width: 100%"}

O parâmetro `-n` foi especificado apenas para que o `traceroute` não se desse ao trabalho de tentar resolver os IPs dos dispositivos descobertos ao longo do caminho em *hostnames*. Isso poupa algum tempo de execução, principalmente porque, muitas vezes, roteadores intermediários não terão nomes associados a seus IPs. Por ora, vamos ignorar o significado e uso do parâmetro `-T` nesse exemplo: o `traceroute` *pode* funcionar sem ele, e discutiremos mais à frente qual o seu propósito no exemplo acima.

De toda maneira, a saída do `traceroute` é composta por várias linhas, cada uma correspondendo a um salto no caminho entre origem e destino. Assumindo que o `traceroute` tenha sido bem sucedido em identificar um certo salto, o programa imprime algumas informações, como o endereço IP (ou *hostname*) do dispositivo intermediário e estatísticas de RTT (*Round Trip Time*) entre a origem e aquele salto.

Algumas vezes, no entanto, como ilustrado no vídeo acima, o *traceroute* não é capaz de identificar certos saltos no caminho. Nesse caso, o utilitário simplesmente imprime asteriscos na linha correspondente. Ao final desse material, discutiremos algumas possíveis razões para esse tipo de falha.

### *Traceroute* e ICMP

Assim como a ferramenta `ping`, o `traceroute` utiliza o
ICMP para obter informações que auxiliem no diagnóstico da rede ---
neste caso, da rota utilizada. Ao *contrário* do `ping`, no entanto, a
funcionalidade do `traceroute` não têm suporte nativo no ICMP. O **que o
`traceroute` faz é provocar situações de erro na rede** que forcem a
geração de pacotes ICMP e permitam à ferramenta obter as informações que
deseja.

Em geral, o `traceroute` funciona da seguinte maneira[^FuncionamentoTR]. O programa abre um *socket*
UDP e envia vários datagramas destinados ao *host* de destino
especificado pelo usuário. Como porta de destino, o `traceroute` utiliza
uma porta que *provavelmente* não estará associada a nenhum *socket*
no destinatário[^PortaTR]. Antes de enviar os três primeiros datagramas, o
`traceroute` configura o *socket* UDP para que um TTL inicial de 1 seja
utilizado. A cada três datagramas enviados, o `traceroute` incrementa o
valor do TTL em uma unidade. Isso prossegue até que a execução se
encerre.

[^FuncionamentoTR]: Conforme discutiremos mais à frente, implementações práticas do `traceroute` muitas vezes suportam opções que permitem alterar ligeiramente esse funcionamento. O processo básico, entretanto, é o mesmo descrito aqui.
[^PortaTR]: Escolhe-se um número de porta "alto". Protocolos clássicos da Internet tendem a usar portas no intervalo 0-1023, também chamadas de *portas bem conhecidas*. Além disso, a IANA também usa o intervalo de portas 1024-49151 para atribuir portas padronizadas a outros protocolos. Assim, as portas no intervalo 49152-65535, chamadas de *dinâmicas* ou *efêmeras*, têm menor probabilidade de estarem associadas a um *socket* no *host* de destino em um dado instante de tempo. Mais detalhes sobre essa semântica dos números de porta podem ser encontrados na RFC 6335. Note que a divisão dos intervalos proposta nessa RFC nem sempre são usadas exatamente dessa maneira pelos sistemas operacionais.

Ao configurar o valor do TTL inicial dos três primeiros datagramas para
1, o `traceroute` faz com que estes datagramas sejam necessariamente
descartados no roteador de primeiro salto do caminho até o destinatário --- lembre-se que o TTL é decrementado a cada salto e, quando expira (*i.e.*, quando chega a zero), o pacote e descartado. Embora o propósito desse tipo de descarte seja mitigar os efeitos de *loops* de roteamento, ele é interessante para o `traceroute` porque estará atrelado ao envio, pelo roteador de primeiro salto, de uma mensagem ICMP
reportando o problema. Ao receber a mensagem ICMP de erro, o
`traceroute` extrai o endereço IP do roteador e o exibe na tela.
Aumentando gradativamente o TTL dos datagramas e repetindo o processo, o
`traceroute` causa descartes propositais nos demais roteadores do caminho e obtém os endereços de todos os saltos intermediários até o destinatário.

Mas como o `traceroute` sabe quando parar? Repare que quando o TTL é
suficientemente alto para que o datagrama chegue ao destinatário, não
haverá descarte por TTL expirado e, portanto, a mensagem ICMP de erro
correspondente também não será gerada. Por isso, é necessário algum
outro critério de parada. Lembre-se que os datagramas enviados pelo
`traceroute` são direcionados a uma porta UDP a qual provavelmente não
haverá *socket* associado no destinatário. Se isso é verdade, ao receber
o datagrama, o *host* de destino ainda gerará uma mensagem ICMP de erro,
mas agora para reportar que a *porta de destino é inalcançável*. Ao
receber esta mensagem de erro, o `traceroute` sabe que o destinatário
foi alcançado e que o caminho completo foi traçado.

### Demonstração do *Traceroute* em Ação

Podemos visualizar a metodologia utilizada pelo `traceroute` através de um experimento envolvendo uma captura de tráfego com um *sniffer* de pacotes como o `wireshark`, por exemplo. Isso é exatamente o que é ilustrado no vídeo abaixo:

![](videos/TracerouteUDPFuncionamento.mp4){style="max-width: 100%"}

Nesse vídeo, podemos ver uma janela de terminal e uma janela do `wireshark` já em execução. Na barra superior do `wireshark`, podemos ver a aplicação de um filtro: `udp || icmp`. O efeito desse filtro é exibir apenas os pacotes capturados que contenham datagramas UDP ou mensagens ICMP.

Logo no início do vídeo, o comando `traceroute -n www.uff.br` é executado no terminal de linha de comando, resultando na impressão dos endereços dos vários dispositivos intermediários no caminho entre o *host* local e o *host* `www.uff.br`. As informações mais interessantes do vídeo, entretanto, podem ser vistas na janela do `wireshark`, que imediatamente começa a reportar vários pacotes capturados.

Os primeiros pacotes capturados --- números 5 e 6, conforme a coluna mais à esquerda na lista de pacotes --- correspondem a uma requisição e uma resposta DNS. Esses pacotes aparecem na captura porque o alvo do `traceroute` foi especificado na forma de um *hostname* --- `www.uff.br` ---, ensejando, portanto, uma resolução DNS (nesse caso, encapsulados em datagramas UDP).

Em seguida, vemos uma grande sequência de pacotes identificados pelo `wireshark` apenas como datagramas UDP (*i.e.*, sem a identificação do protocolo de camada de aplicação). Esses pacotes são endereçados ao IP `200.20.0.21`, que é o endereço associado ao *hostname* `www.uff.br`. São, portanto, pacotes gerados pelo `traceroute` para tentar descobrir o caminho até o *host* de destino.

Em 00:11, o primeiro pacote dessa sequência é inspecionado no `wireshark`. Em particular, observe o campo `Time To Live` destacado em 00:19: ele contém o valor 1 para esse primeiro pacote. Observe também o número de porta de destino no cabeçalho UDP, que contém o valor 33434: um número de porta "alto", "improvável".

Em seguida, cada um dos demais pacotes da sequência é selecionado para inspeção. Observe, à medida que novos pacotes são selecionados, como os valores de TTL variam a cada conjunto de três pacotes (*i.e.*, os três primeiros têm TTL 1, os três próximos têm TTL 2 e assim sucessivamente). Esses conjuntos de três pacotes constituem três medições realizadas pelo `traceroute` para cada salto no caminho. 

Observe, ainda, que cada novo pacote contém um número de porta de destino diferente, incrementados sequencialmente a partir do número de porta inicial. Isso reduz a probabilidade de selecionarmos um número de porta "ruim", que, por algum motivo (vide discussão abaixo) faça com que os dispositivos no caminho não gerem respostas: como novos números de porta são gerados a cada novo pacote e como o `traceroute` faz três medições por salto, aumentamos a possibilidade de receber ao menos uma resposta.

Em 00:49 que um pacote ICMP é selecionado (o pacote de número 23 na captura). Observe no quadro de inspeção dos cabeçalhos que o endereço IP de origem desse datagrama é o `192.168.0.1`, enquanto o de destino é o `192.168.0.132`. Nesse experimento, o *host* que executa o `traceroute` é justamente o `192.168.0.132`. Por outro lado, observe em 00:58 que `192.168.0.1` foi justamente o endereço IP do primeiro salto reportado pelo `traceroute`. Isso não é uma coincidência. Note em 01:06 o conteúdo da mensagem ICMP recebida pelo *host* local: ela tem tipo 11, indicando um erro do tipo *Time-to-live exceeded*. Em outras palavras, trata-se de uma mensagem de erro gerada por `192.168.0.1` para avisar o *host* `192.168.0.132` que um datagrama originado por esse *host* teve seu TTL expirado naquele roteador.

Uma pergunta importante nesse ponto é: como o `traceroute` tem certeza de que esse erro em particular diz respeito ao seu primeiro pacote enviado, e não a qualquer outro --- inclusive, de outras aplicações rodando ao mesmo tempo no *host*? Uma característica interessante das mensagens de erro do ICMP é que elas incluem uma parte do datagrama que gerou o problema. Assim, ao receber a mensagem de erro, o `traceroute` pode comparar os cabeçalhos do datagrama que causou o erro com as informações dos pacotes de prova que transmitiu anteriormente.

Repare que, posteriormente, é selecionado um outro pacote ICMP, dessa vez originado em `100.64.128.1`. A mesma análise feita para o pacote anterior vale para esse. Em particular, a partir do trecho do datagrama informado na mensagem ICMP, o `traceroute` é capaz de identificar qual dos seus pacotes transmitidos corresponde a esse erro. Como se trata de um erro do tipo *Time-to-live exceeded*, o programa sabe que se trata de um dispositivo intermediário, e não do destinatário final. Repare como esse é justamente o IP reportado pelo `traceroute` como segundo salto do caminho. De forma análoga, outros saltos são identificados (embora isso não seja detalhado no vídeo).

Lembre-se que no exemplo inicial do uso do `traceroute` foi utilizada a opção `-T`, cujo significado não foi explicado naquele momento. Note, ainda, que essa opção não foi especificada no exemplo do vídeo anterior. Para que, afinal, ela serve?

Certas implementações do `traceroute` pode optar por utilizar outros tipos de pacote --- diferentes de datagramas UDP --- para tentar provocar os erros de TTL expirado. Em particular, algumas implementações são baseadas em segmentos TCP, ao invés de datagramas UDP. Claramente, isso não é o caso da implementação utilizada no vídeo do exemplo anterior, conforme podemos verificar nas capturas do `wireshark`. Entretanto, essa implementação permite que o usuário solicite o uso do TCP ao invés do UDP justamente através da opção `-T`. Nesse caso, os pacotes de prova usados pelo `traceroute` serão segmentos TCP do tipo SYN --- aqueles usados para solicitar o estabelecimento de uma conexão.

Isso é exemplificado no vídeo abaixo:

![](videos/TracerouteTCPFuncionamento.mp4){style="max-width: 100%"}

Repare que o comando do `traceroute` utilizado é praticamente idêntico àquele do vídeo anterior, exceto pela especificação da opção `-T`. Entretanto, o comportamento é bastante diferente, tanto em termos do que é capturado pelo `wireshark`, quanto em termos da saída impressa pelo `traceroute`.

Na janela do `wireshark`, observa-se inicialmente que a utilização de um filtro diferente daquele usado na demonstração anterior: `(tcp && ip.dst == 200.20.0.21) || icmp`. Esse filtro faz com que o `wireshark` exiba apenas pacotes TCP que têm como endereço IP de destino o endereço `200.20.0.21` --- lembre-se, esse é o IP associado ao *hostname* `www.uff.br` --- ou pacotes ICMP. O propósito desse filtro é focarmos apenas em pacotes pertinentes a essa demonstração. Um efeito colateral é que não visualizamos os pacotes relativos à resolução DNS do nome `www.uff.br` --- encapsulados em datagramas UDP.

Assim, os primeiros pacotes listados são todos segmentos TCP do tipo SYN (repare a *flag* SYN ativa, conforme mostrado pelo `wireshark` na coluna *info*). Embora isso possa parecer muito diferente do que o comportamento do `traceroute` no exemplo anterior, repare que o princípio básico de funcionamento é o mesmo, conforme fica evidenciado quando inspecionamos um desses segmentos mais de perto. Em particular, note que o primeiro segmento da lista contém seu campo TTL igual a 1, o que provoca uma expiração do TTL logo no primeiro salto. De forma análoga, ao percorrermos os demais segmentos TCP, notamos que, a partir do terceiro, o TTL é incrementado para 2. A partir do sétimo, o TTL passa a 3. E assim sucessivamente.

Repare que no instante 00:31, seleciona-se um pacote ICMP. Da mesma forma que no exemplo do vídeo anterior, esse pacote foi gerado no dispositivo de endereço IP `192.168.0.1` e reporta um erro de TTL excedido, permitindo ao `traceroute` que identifique esse primeiro salto. De forma similar, outros saltos são identificados através do mesmo expediente. 

Além da diferença óbvia do protocolo de transporte utilizado, há ainda outro detalhe curioso que separa essa execução do `traceroute` daquela baseada em UDP. Observe a parte inicial da coluna *info* dos segmentos TCP SYN gerados pelo `traceroute`: a porta de origem parece variar aleatoriamente, mas a porta de destino é sempre a 80. Não só mantêm-se a mesma porta nesse caso --- em oposição a mudança a cada novo pacote que ocorria no caso do UDP ---, como também essa porta tem um número baixo e, por padrão, associado a um protocolo clássico da Internet (o HTTP). 

Mas por que essa diferença? A resposta para essa pergunta tem duas partes. Em primeiro lugar, lembre-se da motivação para o uso de uma porta "improvável": queremos provocar a geração de uma mensagem ICMP do tipo *port unreachable* por parte do *host* de destino para identificarmos o final do caminho encontrado. No caso do UDP, é importante que isso ocorra porque, caso haja um *socket* associado aquele número de porta no *host* de destino, corremos o risco do processo associado receber a mensagem silenciosamente --- *i.e.*, sem gerar nenhum tipo de resposta ao *host* de origem. De fato, o comportamento do receptor nesse caso depende da aplicação específica sendo executada no receptor. Assim, nada garante que essa aplicação de fato vá gerar algum tipo de resposta. Desta maneira, tentar enviar o datagrama para uma porta que provavelmente não está sendo usada é, provavelmente, a melhor chance que temos de receber algum retorno do *host* de destino.

Já no TCP, isso não é **necessário**: caso um segmento do tipo TCP SYN chegue ao *host* de destino e haja um *socket* aberto esperando por conexões nessa porta, o próprio TCP retornará um segmento SYNACK como parte do processo de *threewa handshake* usado para o estabelecimento de uma conexão. Dessa forma, mesmo nesse caso, receberíamos algum tipo de manifestação do *host* de destino, cumprindo o propósito desejado.

Esse argumento, no entanto, não explica o **porquê** do `traceroute` utilizar uma porta bem conhecida, apenas explicar a razão pela qual ele **pode** utilizá-la. A motivação do `traceroute` em usar a porta 80 é que utilizá-la **maximiza a probabilidade de recebermos uma resposta do *host* de destino na Internet atual**. Isso ocorre porque hoje é comum que *host*/sub-redes possuam *firewalls* bastante restritivos para prevenção de ataques. Embora o conceito de *firewall* vá além do escopo da nossa disciplina, basta sabermos que se trata de uma espécie de **filtro de pacotes**. Os pacotes que chegam/passam por um *host*/roteador são submetidos a esse filtro que contém regras que permitem ou não os seus recebimentos/encaminhamentos. Atualmente, é comum a utilização de políticas que bloqueiem todo tipo de tráfego por padrão, abrindo exceções de acordo com os tipos de fluxo previstos para cada dispositivo/rede. Um critério bastante utilizado é análise dos números de porta que permite, até certo ponto, a identificação das aplicações associadas a cada pacote.

Voltando ao `traceroute`, se usarmos uma porta TCP aleatória, corremos um risco grande de que o segmento de prova seja bloqueado por algum *firewall* no caminho. Por outro lado, se usarmos a porta 80 --- uma porta relativa a uma aplicação bastante comum na Internet --- essa chance é reduzida. É claro que o destinatário do *traceroute* pode não ser um servidor *web* e, nesse caso, é possível que um *firewall* bloqueie tentativas de acesso à porta 80. No entanto, nesse caso, provavelmente haveria também bloqueios para tentativas de conexão à maioria --- senão todas --- das portas de numeração alta. Assim, em ausência de mais informações sobre o destinatário, usar a porta 80 é provavelmente uma das melhores apostas.

### Possíveis Falhas do *Traceroute*

No final da seção anterior, discutimos como *firewalls* podem prejudicar o funcionamento do *traceroute*. Fecharemos esse material discutindo brevemente outros aspectos que podem levar esse utilitário a falhar (ao menos, parcialmente).

Além da questão particular do número de porta, *firewalls* podem eventualmente bloquear pacotes com base no protocolo de transporte utilizado. Em particular, devido à menor popularidade do UDP em comparação ao TCP quando analisamos o tráfego típico da Internet atual, é comum que datagramas UDP sejam sujeitos a políticas bastante restritivas de *firewall*. Isso pode fazer com que o `traceroute` baseado em datagramas UDP falhe mais frequentemente em identificar o caminho (ou parte dele) que o baseado em TCP.

Outro potencial ponto de falha está nas próprias mensagens ICMP de erro a partir das quais o `traceroute` infere os saltos do caminho. Embora o ICMP seja um protocolo padronizado e importante na Internet, não é raro que dispositivos sejam configurados com restrições em relação à geração e encaminhamento desse tipo de mensagem. Em particular, administradores de roteadores e *hosts* podem configurar seus dispositivos para limitar o número de mensagens ICMP de um certo tipo geradas por intervalo de tempo ou mesmo para aboli-las. Há duas motivações aqui: de segurança --- ligada ao fato de que o ICMP é explorado em alguns tipos clássicos de ataque na Internet --- e de redução no uso de recursos da rede/equipamento --- já que enviar as respostas ICMP gasta tempo, espaço de *buffer*, processamento, etc. Hoje, é comum nos depararmos com saltos não identificados no `traceroute`, muitas vezes causados simplesmente por uma recusa do dispositivo intermediário em enviar a mensagem ICMP de erro associada à expiração do TTL.

Por fim, note que o *traceroute* também pode falhar simplesmente por perda dos pacotes das mensagens ICMP de erro geradas pelos dispositivos ao longo do caminho. Tais mensagens são datagramas IP como outros quaisquer e, portanto, estão susceptíveis a problemas como descartes por *buffer* cheio e por erros de transmissão no meio físico. Esse tipo de falha, no entanto, é, em geral, mitigado pelo uso de três pacotes de prova para cada salto no `traceroute`.




