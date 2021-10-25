---
title: Redes de Circuitos Virtuais
---

O termo *datagrama*, usado para denotar os pacotes na camada de rede na
Internet, implica algumas características básicas do funcionamento desta
rede, a saber:

-   **Datagramas processados de maneira independente**. Na Internet (ao
    menos idealmente), roteadores não guardam estado sobre fluxos de
    pacotes ativos. O processamento de um datagrama em um roteador
    intermediário, portanto, é realizado de forma completamente
    independente de outros pacotes anteriores encaminhados pelo mesmo
    roteador.

-   **Serviço não-orientado a conexão**. Dado que roteadores não guardam
    estado sobre fluxos de dados ativos, não existe o conceito de
    conexão, do ponto de vista da camada de rede.

Diz-se, portanto, que a Internet é uma **Rede de Datagramas**.

Uma alternativa a este paradigma são as redes baseadas em **Circuitos
Virtuais**. Em oposição às redes de datagramas, as redes baseadas em
circuitos virtuais proveem um serviço orientado a conexão, em que cada
pacote é encaminhado por um comutador de acordo com regras que podem ser
específicas ao fluxo de dados ao qual este pertence.

É importante não confundir: **redes baseadas em circuitos virtuais não
são a mesma coisa que redes de comutação de circuitos.** Assim como as
redes de datagramas, uma rede baseada em circuitos virtuais **utiliza o
paradigma da comutação de pacotes**. O circuito, ao qual se refere o nome,
diz respeito simplesmente ao estabelecimento de uma conexão entre os
dispositivos de origem e destino de cada fluxo.

De certa forma, a oposição entre as redes de datagramas e de circuitos
virtuais é análoga à oposição entre UDP e TCP na camada de transporte
--- um protocolo provê um serviço orientado à conexão, enquanto o outro
não. No entanto, como estamos falando da camada de rede, as aplicações
não têm escolha: a rede provê um ou outro serviço, e os *hosts* são
obrigados a utilizá-lo.

Voltando aos circuitos virtuais, a ideia é que eles emulem o
funcionamento de um circuito (como na comutação de circuitos), mas
utilizando a comutação de pacotes. O primeiro passo é o estabelecimento
do circuito. Durante esta fase, recursos relativos ao circuito são
alocados em cada roteador pelo qual o fluxo de dados passará. Embora
isso não seja obrigatório, muitas vezes estes recursos podem incluir
*buffers* nos roteadores e tempo reservado de transmissão em certos
enlaces, fornecendo, assim, uma previsibilidade do desempenho que o
fluxo receberá.

Independentemente da reserva ou não de *buffers* ou banda, um circuito
virtual deve consistir minimamente de:

1.  **Um caminho entre origem e destino**. Isto é, uma sequência de
    roteadores intermediários pelos quais **todos os pacotes do fluxo
    passarão**. Isso significa que não há a possibilidade de pacotes
    diferentes de um mesmo fluxo seguirem caminhos distintos.

2.  **Números de identificação**. Também chamado de *número do circuito
    virtual*, este valor é inserido no cabeçalho de cada pacote de um
    fluxo e permite a cada roteador identificar facilmente a qual
    circuito virtual aquele pacote pertence. Note que um circuito
    virtual pode ser identificado por vários valores diferentes ao longo
    do caminho: um para cada enlace. Em outras palavras, o identificador
    do circuito virtual pode mudar a cada salto, embora ainda se refira a um mesmo circuito.

3.  **Entradas nas tabelas de roteamento**. Cada roteador precisa
    armazenar na sua tabela de roteamento uma associação entre cada
    circuito virtual que passa por ele e a ação adequada ao
    encaminhamento do pacote, *e.g.*, a porta pela qual os pacotes
    daquele circuito virtual devem ser encaminhados.

Todos estes três elementos são alocados/escolhidos no momento do
estabelecimento do circuito virtual (*i.e.*, a abertura da conexão). Da
mesma maneira, cada roteador precisa manter as informações da sua tabela
de roteamento enquanto perdurar a conexão. Isso significa que, **em
redes baseadas em circuitos virtuais, roteadores precisam armazenar
estado dos fluxos ativos**.

O estabelecimento de um circuito virtual demanda um protocolo
específico, geralmente denominado **Protocolo de Sinalização**. Estes
protocolos iniciam o processo de estabelecimento do circuito a partir do
dispositivo de origem, que envia uma requisição de estabelecimento para
o roteador ao qual está conectado, informando o destinatário desejado
--- e, possivelmente, requisitos de desempenho do fluxo. O núcleo da
rede, então, se encarrega de escolher um caminho e alocar os recursos
necessários ao longo do circuito --- *e.g.*, números de circuito
virtual, entradas nas tabelas de roteamento, espaço em *buffer*, tempo
de uso dos enlaces. Repare que neste tipo de rede é possível que, no
momento da abertura de uma conexão, não haja recursos suficientes
disponíveis. Neste caso, os protocolos de sinalização geralmente incluem
suporte para que o núcleo da rede avise ao dispositivo de origem sobre
esta situação --- o análogo a um sinal de ocupado em uma ligação
telefônica.

## Circuitos Virtuais *vs.* Datagramas

Uma vez definidos os princípios básicos de funcionamento das redes de
circuitos virtuais e das de datagramas, podemos fazer uma comparação das
duas abordagens.

Como em praticamente todos os casos de abordagens alternativas estudas
nesta disciplina, não existe um "vencedor" definitivo entre estes dois
paradigmas. Ao contrário, existe um conjunto de compromissos que, uma
vez considerados em um cenário específico, ajudam a decidir qual
paradigma é mais adequado àquela situação.

As redes de circuitos virtuais têm maior capacidade de oferecer modelos
de serviço mais sofisticados, já que o processo de estabelecimento do
circuito virtual permite a reserva de recursos ao longo do caminho
escolhido. Além disso, por alocar um circuito virtual (e, portanto, um
caminho fim-a-fim) estático ao longo da duração do fluxo de dados, estas
redes impedem problemas como a reordenação de pacotes. Todas estas
características permitem que as redes de circuitos virtuais sejam boas
alternativas para aplicações que demandam desempenho previsível e/ou
garantido.

Já as redes de datagramas não fazem, a princípio, qualquer reserva de
recursos. Em condições normais, nem mesmo pode-se garantir que o mesmo
caminho será usado por todos os datagramas de um fluxo. Isso torna a
previsibilidade do desempenho bem mais baixa. Para os chamados
**serviços elásticos** (como a transferência de um arquivo), isso não é
problema: eles se adaptam ao que a rede puder entregar de desempenho
naquele momento. Dado que mecanismos de transferência confiável de
dados, como os fornecidos pelo TCP, sejam utilizados, estas aplicações
funcionam.

Embora possam dar garantias de desempenho, as redes de circuitos
virtuais acabam gerando uma maior complexidade no núcleo. Roteadores
precisam armazenar estado e dar suporte a reserva de recursos e
protocolos de sinalização. Neste sentido, as redes de datagramas são bem
mais simples, delegando a maior complexidade às bordas (*i.e.*, sistemas
finais). Esta simplicidade do núcleo também permite uma escalabilidade
maior, o que é fundamental em uma rede com a escala da Internet.

Além da simplificação do núcleo --- e, talvez, uma razão até mais forte
para isso ---, a Internet adotou o paradigma de datagramas por conta do
seu objetivo histórico de interligar redes diferentes. O termo
*diferentes*, aqui, pode assumir vários significados, incluindo a
existência de tecnologias bastante variadas de enlaces. Dada esta
heterogeneidade de enlaces, seria muito difícil prover as garantias que
as redes baseadas em circuitos virtuais geralmente proveem. Colocando de
outra forma, é fácil emular um serviço de melhor esforço sobre uma rede
com garantias de desempenho, mas o inverso não é verdade. Neste sentido,
uma Internet baseada em circuitos virtuais demandaria uma série de
requisitos mínimos das tecnologias dos enlaces que a compõem. Assim, uma
rede de datagramas permitiu uma Internet mais "democrática", abrangendo
uma gama enorme de tecnologias distintas.
