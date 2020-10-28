---
title: Transmissão Confiável de Dados no TCP

figureTitle: Figura
figPrefix: figura
tableTitle: Tabela
tblPrefix: tabela
secPrefix: seção
---

# Transmissão Confiável de Dados no TCP

Embora o TCP forneça também outros serviços importantes, como o controle de fluxo e o controle de congestionamento, talvez sua característica mais notável seja a confiabilidade na entrega dos dados. Nessas notas de aula, veremos quais são e como o TCP implementa seus mecanismos de confiabilidade.

## Escolhendo Valores para o Temporizador

Como visto em aulas anteriores, temporizadores (ou *timers*) são mecanismos fundamentais para a implementação de um protocolo de transmissão confiável de dados sobre um canal/rede não confiável. Em
particular, temporizadores auxiliam este tipo de protocolo a lidar com a possibilidade de *supressão de pacotes*, *i.e.*, que pacotes sejam perdidos/descartados pela rede: eles provêm um sinal independente da rede que impede que o protocolo (em particular, o transmissor) fique travado aguardando um evento de recepção de pacotes pela rede.

Por este motivo, assim como protocolos estudados em aulas anteriores, o
TCP também emprega temporizadores. Quando o temporizador expira, o TCP
interpreta este evento como um indicativo de perda de pacotes e realiza
a retransmissão de segmentos. Uma questão importante que não foi
discutida até aqui, no entanto, diz respeito ao valor inicial do
temporizador: *i.e.*, quanto tempo devemos esperar até supormos que um
segmento foi perdido e, portanto, deve ser retransmitido?

A resposta para esta pergunta varia bastante. Claramente, o valor deste
temporizador deve ser suficientemente grande para que o segmento saia do
transmissor, chegue ao receptor e o *ack* correspondente volte ao
transmissor. Em outras palavras, o temporizador deve ser ao menos tão
longo quanto o RTT (*Round Trip Time*) entre transmissor e receptor. Do
contrário, o temporizador sempre expirará de forma prematura, resultando
na retransmissão de segmentos que não foram, de fato, perdidos. Por
outro lado, um valor excessivamente alto tornará a detecção de perdas
muito lenta, atrasando o processo de retransmissão e afetando
negativamente o desempenho do protocolo.

Desta forma, para que o TCP escolha um valor adequado para o
temporizador, é fundamental que ele conheça o RTT do caminho entre
transmissor e receptor. Para isso, o TCP realiza amostras do RTT com
base nos tempos de transmissão dos segmentos de dados e de recepção dos
respectivos *acks*: toda vez que um segmento de dados é transmitido, o
TCP armazena o horário atual; ao receber **o primeiro** *ack* relativo a
este segmento de dados, o TCP subtrai os dois tempos, obtendo uma nova
amostra do RTT. Daqui para frente, chamaremos esta amostra de
`SampleRTT`.

Por diversos motivos, o `SampleRTT` de um segmento tende a ser diferente
daquele de segmentos subsequentes. Um dos principais fatores é a simples
variação dos níveis de congestionamento nos roteadores intermediários, o
que, em última análise, causa variação nos atrasos de enfileiramento,
culminando na variação do RTT como um todo. Por isso, se utilizássemos
diretamente os valores de `SampleRTT` como o valor inicial dos
temporizadores, estaríamos susceptíveis a variações muito bruscas. Com o
objetivo de suavizar esta variabilidade, o TCP baseia sua estimativa do
RTT não em uma única amostra, mas sim em uma **média de amostras
anteriores**.

Embora a ideia de computar o RTT médio em uma janela das $n$
últimas amostras pareça simples, do ponto de vista de implementação uma
preocupação é o tamanho desta janela. Em um dispositivo embarcado, por
exemplo, com baixa capacidade computacional, talvez seja indesejável
manter uma grande quantidade de amostras em memória **para cada conexão
TCP**. Uma solução de menor complexidade computacional (particularmente,
em termos de armazenamento) é o uso de uma *Média Móvel Exponencialmente
Ponderada*.

Este tipo de média é definido por uma simples relação de recorrência:
$$\label{eq:estimativaRTT}
    \text{EstimatedRTT} = (1-\alpha)\times\text{EstimatedRTT} + \alpha\times\text{SampleRTT},$$
onde $0 < \alpha < 1$ é um parâmetro ajustável

Cada vez que um novo `SampleRTT` é coletado pelo TCP, a
Equação é computada novamente, utilizando-se o
valor anterior da média (*i.e.*, `EstimatedRTT`) e a amostra atual
(*i.e.*, `SampleRTT`). Nota-se, portanto, que é suficiente que o TCP
armazene apenas o resultado da última aplicação da Equação, sem a
necessidade de manter um histórico potencialmente longo dos últimas
amostras.

Repare o que acontece se aplicarmos sucessivamente a
Equação a um conjunto de amostras (índices foram
incluídos para permitir distinguir entre as várias amostras):

$$\begin{aligned}
  \text{EstimatedRTT}_{t} & = (1-\alpha)\times\text{EstimatedRTT}_{t-1}\nonumber\\
  & + \alpha\times\text{SampleRTT}_{t}\end{aligned}$$ $$\begin{aligned}
  \text{EstimatedRTT}_{t} & = (1 - \alpha)^2\times\text{EstimatedRTT}_{t-2}\nonumber\\
  & + (1 - \alpha)\times\alpha\times\text{SampleRTT}_{t-1}\nonumber\\
  & + \alpha\times\text{SampleRTT}_{t}\end{aligned}$$ $$\begin{aligned}
  \text{EstimatedRTT}_{t} & = (1 - \alpha)^3\times\text{EstimatedRTT}_{t-3}\nonumber\\
  & + (1 - \alpha)^2\times\alpha\times\text{SampleRTT}_{t-2}\nonumber\\
  & + (1 - \alpha)\times\alpha\times\text{SampleRTT}_{t-1}\nonumber\\
  & + \alpha\times\text{SampleRTT}_{t}\\
  & \dots\nonumber\end{aligned}$$

À medida que as amostras se sucedem, as amostras mais antigas são
progressivamente multiplicadas por potências crescentes de $(1-\alpha)$.
Como $0 < (1-\alpha) < 1$, quanto mais alto o expoente, menor o valor da
potência. Em suma, o que acontece é que amostras mais antigas recebem
pesos cada vez menores. Este comportamento --- de "esquecer" o passado
antigo --- é o desejável, já que a situação da rede pode mudar durante o
tempo de vida de uma conexão.

A Figura [1](#fig:EstimativaRTT){reference-type="ref"
reference="fig:EstimativaRTT"} ilustra o efeito da aplicação desta média
móvel a uma sequência de amostras de RTT para um trecho de uma conexão
TCP real. No gráfico, a curva vermelha ilustra a sequência de valores de
`SampleRTT` medidos pelo TCP, enquanto a curva verde mostra a evolução
da média móvel. Embora a curva verde também apresente variabilidade,
repare como esta é menor que a variabilidade de curva vermelha.

![Séries temporais ilustrando as evoluções das amostras de RTT
(`SampleRTT`), da estimativa baseada em uma Média Móvel Exponencialmente
Ponderada (`EstimatedRTT`) e o valor do *timeout* resultante para um
*trace* de uma conexão TCP real. Repare como o RTT amostral oscila em
torno do RTT estimado (*i.e.*, médio), enquanto a soma dos desvios provê
uma margem de segurança geralmente capaz de absorver variações
pontuais.](imagens/EstimativaRTT.svg){#fig:EstimativaRTT
width=".9\\textwidth"}

Outra observação que pode ser feita sobre o gráfico da
Figura [1](#fig:EstimativaRTT){reference-type="ref"
reference="fig:EstimativaRTT"} é que os valores das amostras de RTT
oscilam em torno dos valores da média móvel. Embora isso seja o
comportamento esperado, esta característica faz com que o uso direto do
`EstimatedRTT` como valor para o temporizador seja uma má escolha, já
que uma grande fração de segmentos experimentará um RTT superior à
media, causando retransmissões desnecessárias.

A solução adotada pelo TCP é configurar o valor do temporizador para o
`EstimatedRTT` **acrescido de uma margem de segurança**, capaz de
absorver (ao menos em grande parte) as instâncias em que o RTT amostrado
supera a média. Para determinar esta margem, o TCP mantém uma estimativa
para um segundo parâmetro relacionado ao RTT: o **desvio das amostras em
relação à média**, que daqui para frente será denotado por `DevRTT`. A
cada nova amostra de RTT obtida, o TCP utiliza a seguinte equação para
atualizar sua estimativa deste desvio:

$$\label{eq:estimativaDesvio}
\text{DevRTT} = (1-\beta)\times\text{DevRTT} + \beta\times\| \text{SampleRTT} - \text{EstimatedRTT}\|,$$
onde $\beta$ é um fator de ponderação configurável.

Pode-se notar que a
essa equação é muito similar à
usada para estimar o RTT. Em outras palavras, `DevRTT` é
simplesmente uma Média Móvel Exponencialmente Ponderada das diferenças
--- em valor absoluto --- entre as amostras de RTT e os respectivos
valores de `EstimatedRTT`.

De posse dos valores atuais de `EstimatedRTT` e `DevRTT`, o TCP finalmente
calcula o valor do temporizador --- denotado deste ponto em diante por
`TimeoutInterval` --- segundo a seguinte equação:
$$\label{eq:valorTimeout}
\text{TimeoutInterval} = \text{EstimatedRTT} + 4\times\text{DevRTT}.$$

O termo $4\times\text{DevRTT}$ é, portanto, a margem de segurança à qual
nos referimos anteriormente. Votando à
Figura [-@fig:EstimativaRTT], podemos ver esta margem de segurança em
ação. A curva azul ilustra a evolução do `TimeoutInterval` calculado com
base nas amostras de RTT da conexão. Mesmo com a variabilidade dos
valores de RTT experimentados pelos segmentos, durante o trecho
representado na figura a curva azul se manteve sempre superior à curva
vermelha (*i.e.*, das amostras). Isso significa que durante este trecho
o TCP nunca inferiu erroneamente uma perda de segmento devido a um
**estouro prematuro do temporizador**.

## Transmissão Confiável de Dados no TCP

Neste ponto, já introduzimos as características gerais de cada um dos
mecanismos empregados pelo TCP para garantir a transmissão confiável de
dados, a saber: temporizadores, números de sequência, *acks* e
*pipeline*. Nesta seção, discutiremos como o TCP junta todos estes
mecanismos em uma solução unificada para garantir a confiabilidade na
transmissão dos dados.

Como discutido em aulas anteriores, os *acks* do TCP são cumulativos,
*i.e.*, eles reconhecem todos os dados enviados até um determinado
número de sequência. Em particular, o número de sequência informado em
um *ack* diz respeito ao **próximo byte esperado** pelo receptor[^numeroDeSeq].

[^numeroDeSeq]: Lembre-se que os números de sequência no TCP são contados em bytes, e não em pacotes.

Em relação aos temporizadores, o TCP mantém apenas um,
sempre associado ao segmento em trânsito mais antigo --- ou, dito de outra
forma, o segmento que está na base da janela do transmissor.

Ao contrário de outros protocolos simplificados com os quais trabalhamos
até agora (como o *Go-Back-N* e a *Repetição Seletiva*), o TCP utiliza
dois mecanismos para inferir perdas de segmentos: o estouro de
temporizador (assim como os protocolos estudados anteriormente) e **a
ocorrência de *acks* repetidos**. Este último mecanismo é uma otimização
denominada *Fast Retransmit*, a qual será estudada em detalhes mais à
frente.

Supondo que um transmissor TCP não receba *acks* repetidos, há três
eventos principais que concernem a transmissão confiável de dados:

1.  **Recebimento de novos dados da aplicação**. Assumindo que haja
    espaço suficiente na janela do transmissor --- *i.e.*, números de
    sequência disponíveis --- o TCP aceita os dados, os encapsula em um
    novo segmento com o próximo número de sequência disponível e realiza
    a transmissão. Se não há um temporizador ativo neste momento, o TCP
    inicia um associado ao segmento recém-transmitido. O valor inicial
    deste temporizador é dado pelo valor atual da variável
    `TimeoutInterval`, conforme discutido na seção anterior.

2.  **Estouro de temporizador**. Neste caso, o TCP realiza a
    retransmissão do segmento **associado ao temporizador** --- ou seja,
    sempre do segmento mais antigo em trânsito (ou colocando de outra
    forma: sempre do segmento na base da janela do transmissor). Note
    que, com a retransmissão do segmento, este continua com *ack*
    pendente e na base da janela. Logo, deve-se reiniciar o temporizador
    novamente associado ao segmento em questão.

3.  **Recepção de um *ack***. Lembre-se que, por enquanto, estamos
    assumindo que o transmissor nunca recebe *acks* repetidos. Isso
    significa que os *acks* sempre reconhecem segmentos que o
    transmissor atualmente considera como pendentes. Nesta situação, o
    transmissor marca todos os números de sequência menores que o valor
    informado no *ack* como reconhecidos e anda a janela até este mesmo
    valor. Como o temporizador está sempre associado ao segmento da base
    da janela, devemos pará-lo --- afinal, este segmento acabou de ser
    reconhecido. Ao final deste processo, se ainda constarem segmentos
    em trânsito na janela, o temporizador deve ser reiniciado para
    qualquer que seja o valor atual de `TimeoutInterval`[^InicioDoTimeout].

[^InicioDoTimeout]: Repare, portanto, que o tempo desde a transmissão inicial de um segmento até o sua retransmissão por estouro do temporizador pode ser maior que o valor de `TimeoutInterval`, já que o temporizador pode ser iniciado quando o segmento já foi transmitido há algum tempo.

![Exemplo de retransmissão disparada por estouro de
temporizador.](imagens/RetransmissaoEx1.svg){#fig:RetransmissaoEx1}

Vamos exemplificar a ocorrência destes eventos com algumas situações
simples. Considere inicialmente o cenário mostrado na
Figura [-@fig:RetransmissaoEx1]. O *host* A envia um segmento de dados
com número de sequência 16 e 15 bytes de carga útil. O segmento é
corretamente recebido pelo *host* B, que gera um *ack* correspondente.
Por algum motivo, o pacote que carrega este *ack* é perdido. O *host* A
reage à ocorrência desta perda quando, mais tarde, seu temporizador
expira. Como reação, o *host* A realiza a retransmissão do segmento mais
antigo --- neste caso, há apenas um segmento em trânsito. Quando o
segmento retransmitido alcança o *host* B, este facilmente identifica
que se trata de uma duplicata utilizando o número de sequência. De toda
maneira, o *host* B gera um novo *ack* que finalmente é recebido com
sucesso por A. Embora isso não seja ilustrado na figura, ao receber o
*ack*, A irá marcar todos os números de sequência de 16 a 30 (inclusive)
como reconhecidos, andará com sua janela --- a nova base será agora o
número de sequência 31 --- e **não** reiniciará o temporizador, já que
neste exemplo não há outros segmentos em trânsito neste momento.

Do ponto de vista da escolha do valor do temporizador, a situação
ilustrada na Figura [-@fig:RetransmissaoEx1] representa um sucesso: a expiração do
temporizador corretamente infere a ocorrência de uma perda de pacotes --- embora, no exemplo, trata-se do *ack*, e não do segmento de dados.
Infelizmente, este nem sempre é o caso. Algumas vezes o temporizador
expirará de forma precoce, resultando em uma retransmissão
desnecessária. Este cenário é exemplificado na
Figura [-@fig:RetransmissaoEx2]. Ao invés de transmitir um único
segmento, o *host* A transmite dois segmentos em sequência --- segmentos
16 (de 15 bytes) e 31 (de 20 bytes). Ambos os segmentos são recebidos
com sucesso pelo *host* B, que gera dois *acks*. Ambos os *acks* são
eventualmente recebidos com sucesso pelo *host* A, porém não antes da
expiração do temporizador. Como no TCP o temporizador é sempre
implicitamente associado ao segmento na base da janela do transmissor,
sua expiração tem como consequência a retransmissão apenas do segmento
de número de sequência 16. Logo em seguida, ao receber o *ack* 31, o
*host* A marca todos os números de sequência até o 30 (inclusive) como
reconhecidos. A base da sua janela de transmissão é deslocada até o
próximo número de sequência não reconhecido --- neste caso, o 31. Embora
não mostrado na figura, o temporizador é interrompido (devido ao
reconhecimento do segmento anteriormente na base da janela) e reiniciado
(devido à existência de outros segmentos ainda em trânsito). Antes que
este temporizador possa expirar, no entanto, o *ack* 51 é recebido,
fazendo com que o *host* A marque todos os números de sequência até o 50
(inclusive) como recebidos, ande sua janela até o próximo número de
sequência não reconhecido --- neste ponto, o 51. Adicionalmente, o
temporizador, até então associado ao segmento de número de sequência 31,
é interrompido. Como não há mais segmentos em trânsito, não há
necessidade de reiniciá-lo.

![Exemplo de retransmissão **precoce** disparada por estouro de
temporizador.](imagens/RetransmissaoEx2.svg){#fig:RetransmissaoEx2}

Note que a retransmissão desnecessária do segmento 16 chega com sucesso
no *host* B. Como se trata de uma duplicata --- reconhecida através do
número de sequência do segmento --- o *host* B não entregará seu
conteúdo à aplicação. No entanto, B ainda gera um *ack* como
consequência. Assim como todo *ack* no TCP, o número de sequência
informado é o do próximo byte esperado pelo receptor. Neste caso, por já
ter recebido ambos os segmentos, 16 e 31, o *host* B gera um *ack* 51.
Este *ack* é recebido corretamente pelo *host* A, mas não traz efeitos
práticos, já que se trata de um *ack* duplicado

Como um último exemplo, considere a situação ilustrada na
Figura [-@fig:RetransmissaoEx3]. Neste caso, novamente o *host* A
transmite dois segmentos em sequência -- segmentos 16 e 31. Ambos chegam
com sucesso ao *host* B, disparando a transmissão de dois *acks*: o
*ack* 31, relativo ao segmento 16, e o *ack* 51, relativo ao segmento
31. Infelizmente, o primeiro *ack* é perdido, fazendo com que apenas o
segundo chegue ao *host* A. Repare, no entanto, que como o TCP utiliza
*acks* cumulativos, toda a semântica do primeiro *ack* é incluída no
segundo: quando o *ack* 51 chega à A, este reconhece todos os números de
sequência até o 50 (inclusive) --- o que inclui os números de sequência
16, 17, ..., 30, contidos no primeiro segmento. Isso faz com que o
*host* A possa avançar sua janela de transmissão até o número de
sequência 51 (próximo ainda não reconhecido) e parar seu temporizador,
já que, neste ponto, não há outros segmentos em trânsito.

![Exemplo de um *ack* posterior suprimindo a perda de um *ack* anterior,
graças ao uso de *acks* cumulativos pelo
TCP.](imagens/RetransmissaoEx3.svg){#fig:RetransmissaoEx3}

## Acks Atrasados

Até aqui temos assumido implicitamente que a recepção de um segmento ---
duplicado ou não --- sempre resulta na geração imediata de um *ack* pelo
receptor. Na verdade, as RFCs 1122 e 2581 definem que um receptor TCP
pode, em certos casos, atrasar propositalmente a geração de um *ack* por
**até 500 ms** ao receber um segmento de dados.

Há várias motivações para atrasar um *ack* no TCP, dentre as quais
citaremos duas aqui:

1.  **Suprimir um *ack***. Como *acks* são cumulativos no TCP, ao
    receber múltiplos segmentos em sequência, um receptor poderia, em
    teoria, gerar um único *ack* --- relativo ao último segmento ---
    reconhecendo todos os pacotes recebidos. A vantagem, neste caso,
    está na economia de *overhead* de controle do protocolo: ao invés de
    enviar $n$ *acks* para reconhecer $n$ segmentos de dados,
    bastaria 1. Ao atrasar a geração do *ack* relativo a um segmento
    específico, um receptor possibilitaria a recepção de outros
    segmentos subsequentes, permitindo esta redução de *overhead*.

2.  **Combinar *ack* e dados em um mesmo segmento**. Como segmentos TCP
    podem combinar *ack* e dados --- *i.e.*, um segmento pode,
    simultaneamente, servir de *ack* para um fluxo de bytes em um
    sentido *e* transportar dados do fluxo de bytes no sentido contrário
    ---, ao receber um segmento de dados, um receptor pode atrasar a
    geração do respectivo *ack* para que, talvez, a aplicação local gere
    dados a serem enviados. Neste caso, um único segmento transportará
    tanto o *ack* quanto os dados, reduzindo o número de pacotes
    transmitidos durante a conexão.

Embora o emprego de *acks* atrasados tenha o potencial de reduzir o
número de segmentos enviados em uma conexão, ele também pode trazer
efeitos indesejados. Um destes efeitos é relacionado ao temporizador do
transmissor: o atraso artificial embutido pelo receptor na geração do
*ack* torna mais provável a expiração do temporizador no transmissor,
resultando em retransmissões desnecessárias --- já que, por hipótese, o
segmento foi recebido com sucesso. Há também um efeito negativo na
estimativa do RTT --- e, por consequência, na escolha dos valores dos
temporizadores --- já que este tempo artificial será refletido no
`SampleRTT`.

Por conta disso, o uso de *acks* atrasados pelo TCP é restrito a um caso
específico: quando o segmento é recebido em ordem (*i.e.*, tem
exatamente o número de sequência esperado e não foram recebidos outros
segmentos com número de sequência posteriores) e não há atualmente um
*ack* sendo atrasado para algum dos segmentos anteriores. Em qualquer
outro caso, a chegada de um segmento --- novo ou repetido --- deve
resultar na geração imediata de um *ack*.

Em particular, repare que, ao atrasar o *ack* de um segmento, se um
outro segmento --- novo, em ordem ou não, ou repetido --- chega durante
o período de 500 ms, o receptor imediatamente gera um *ack*. Como
sempre, o *ack* deve informar o próximo byte esperado pelo receptor.

## Fast Retransmit

Na descrição realizada dos eventos básicos pertinentes à transmissão
confiável de dados pelo TCP --- do ponto de vista do transmissor ---
citamos o recebimento de *acks*, mas só nos preocupamos com o caso em
que o *ack* efetivamente reconhece segmentos até então considerados
pendentes. Embora o transmissor pudesse simplesmente ignorar *acks* repetidos ainda assim
garantir a confiabilidade da comunicação, é possível utilizar a recepção
de *acks* repetidos como uma oportunidade de otimização. É exatamente
disso que trata o mecanismo de *Fast Retransmit*.

Para entender a motivação deste mecanismo, considere a situação
ilustrada na
Figura [-@fig:FastRetransmitMotivacao]. Em certo momento, o *host* A
transmite uma **rajada** (*i.e.*, uma sequência de pacotes transmitidos
um após o outro, o mais rápido possível) de cinco segmentos. Quase todos
são entregues com sucesso pela rede para o *host* B, exceto pelo segundo
segmento da rajada, com número de sequência 31. Após o recebimento do
primeiro pacote, o *host* B envia um *ack* reconhecendo o recebimento do
segmento 16 --- informado através de um *ack* 31, já que o segmento 16
tem 15 bytes de dados. Quando os segmentos subsequentes --- 41, 52 e 57
--- chegam ao *host* B, este ainda gera *acks*, mas todos são apenas
repetições do *ack* 31 enviado anteriormente, já que os segmentos
recebidos estão fora de ordem. No cenário hipotético ilustrado na
figura, todos estes 4 *acks* chegam ao *host* A: o *ack* 31 original e
mais três repetições (ou três ***acks* duplicados, no jargão do TCP**).

![Cenário que motiva o emprego do *Fast
Retransmit*.](imagens/FastRetransmitMotivacao.svg){#fig:FastRetransmitMotivacao}

Considerando apenas os mecanismos descritos até aqui, o *host* A ---
transmissor, neste exemplo --- deveria simplesmente ignorar estes *acks*
duplicados. O eventual --- e inevitável, neste caso --- estouro do
temporizador é suficiente para lidar com a perda do segmento 31. Quando
o primeiro *ack* 31 alcança o *host* A, este marca todos os números de
sequência até o 30 (inclusive) como reconhecidos, interrompe o
temporizador e o reinicia porque ainda há segmentos em trânsito. A
partir deste instante, começa a contar o tempo até que o *host* A infira
que o segmento 31 foi perdido e realize sua retransmissão.

Note, no entanto, que o intervalo entre a ocorrência da perda e o
estouro do respectivo temporizador é relativamente longo. Por outro
lado, a perda do segmento 31 associada ao correto recebimento de
segmentos subsequentes pelo *host* B criou um comportamento curioso: a
recepção, pelo *host* A, de várias duplicadas do *ack* 31. Cada uma
destas duplicatas indica que o *host* B recebeu algum segmento de dados,
mas, repetidamente, o segmento **não foi** o de número de sequência 31.

Do ponto de vista do transmissor (que não possui uma visão global do que
está ocorrendo com cada pacote da rede), a recepção destes vários
pacotes duplicados pode significar algumas situações diferentes:

1.  **Reordenação de pacotes**. O segmento 31 pode simplesmente estar
    sendo encaminhado por um caminho mais longo que os segmentos
    posteriores, fazendo com que estes sejam recebidos antes que aquele.

2.  **Perda de pacote**. O segmento 31 pode ter sido efetivamente
    perdido.

Da mesma maneira que o estouro de um temporizador não é uma prova
definitiva de que o segmento correspondente foi perdido, a recepção de
múltiplos *acks* duplicados também pode ser um falso-positivo nesta
tentativa de identificar perdas. No entanto, à medida que mais e mais
*acks* duplicados são recebidos, é cada vez mais provável que, de fato,
o segmento repetidamente solicitado pelo receptor tenha sido perdido.

Com base neste raciocínio, o mecanismo *Fast Retransmit* especifica que
ao receber 3 *acks* repetidos para um mesmo número de sequência, um
transmissor deve realizar imediatamente a retransmissão do segmento
correspondente.

![*Fast Retransmit* em ação: retransmissão do segmento 31 é realizada
antes do estouro do temporizador, motivada pela chegada do terceiro
*ack* repetido solicitando este mesmo número de
sequência.](imagens/FastRetransmitEx.svg){#fig:FastRetransmitEx}

Aplicando-se o *Fast Retransmit* ao cenário da
Figura [-@fig:FastRetransmitMotivacao], obtemos o comportamento
ilustrado na Figura [-@fig:FastRetransmitEx]. Embora haja uma retransmissão do
segmento 31 ocorrendo no final da linha do tempo mostrada na figura,
esta retransmissão é disparada pela recepção do terceiro *ack* duplicado
solicitando o número de sequência 31, e não pelo estouro do temporizador
--- o que ainda demoraria algum tempo.

Como o TCP costumeiramente envia vários segmentos em rajada, a recepção
de *acks* duplicados tende a ocorrer bem antes do estouro do
temporizador em caso de perda. O efeito obtido pelo *Fast Retransmit*,
portanto, é o de acelerar a detecção de segmentos perdidos e sua
consequente recuperação, colaborando para uma melhora de desempenho do
TCP.

Por fim, volte a considerar o mecanismo de *acks* atrasados. A eficácia
do *Fast Retransmit* está diretamente ligada à rapidez com que os *acks*
duplicados voltam do receptor para o transmissor. Se a possibilidade de
atrasar *acks* fosse estendida a pacotes recebidos foram de ordem, por
exemplo, o receptor estaria influenciando negativamente a capacidade do
transmissor de detectar rapidamente perdas de segmentos.
