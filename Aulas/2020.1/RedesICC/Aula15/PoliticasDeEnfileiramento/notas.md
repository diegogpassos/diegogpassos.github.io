---
title: Políticas de Enfileiramento
---

Como parte do processo de encaminhamento de um pacote por um roteador, é comum que o pacote precise ser enfileirado até que o enlace de saída se torne disponível para transmissão. De fato, roteadores na Internet estão a todo momento gerenciando as filas de pacotes associadas a cada um dos seus enlaces. Esse gerenciamento contempla duas tarefas básicas:

- **Escalonamento**: quando o enlace se torna ocioso, decidir qual dos pacotes enfileirados será o próximo a ser transmitido.
- **Descarte**: quando a fila está cheia e um novo pacote deve ser encaminhado pelo enlace correspondente, decidir qual pacote será descartado.

Embora haja opções óbvias para como escolher os pacotes em ambos os casos, essas escolhas nem sempre são as melhores possíveis. Além disso, a forma pela qual um roteador gerencia suas filas tem impacto representativo no desempenho e comportamento da rede. Por esses motivos, nesse material cobriremos algumas possíveis políticas --- também chamadas de *disciplinas* --- de enfileiramento (escalonamento e descarte) e discutiremos seus potenciais benefícios e problemas.

## Políticas de Escalonamento

Até aqui, nesta disciplina, sempre assumimos implicitamente uma política
de escalonamento do tipo FIFO (*First-In First-Out*). Em outras palavras,
assumimos que os pacotes entram no final da fila e sempre o primeiro
pacote é escolhido para a próxima transmissão.

A política FIFO é, de fato, a mais comum e popular na Internet. Ela é
simples e tende a dar oportunidades iguais a todos os pacotes, por
respeitar a ordem na qual eles chegam ao roteador. Entretanto, em certas
situações, o emprego de outras políticas de escalonamento pode trazer
benefícios. Se temos, por exemplo, fluxos de melhor esforço (*e.g.*,
fluxos TCP relativos a aplicações de transferência de arquivos)
competindo com fluxos de tempo-real (*e.g.*, uma chamada VoIP), pode ser
do interesse da rede que os pacotes da chamada VoIP "passem à frente" na
fila.

Para implementar este tipo de funcionalidade, é preciso que o roteador
seja capaz de **diferenciar** os pacotes de acordo com seus fluxos ou,
ao menos, em classes de importância. Neste caso, antes de chegar à fila
propriamente dita, o pacote passa por um elemento chamado de
**classificador**. Como um classificador distingue a classe a qual
pertence um pacote está além do escopo desta aula (na verdade, isso só será abordado em outras disciplinas). O fato é que uma vez classificados os pacotes, políticas
de escalonamento cientes de prioridades podem ser utilizadas.

O exemplo mais simples de uma política deste tipo é a *Priority
Queueing*. Esta política aloca *buffers* separados para cada classe.
Quando um pacote chega à fila, portanto, ele é colocado no final do
*buffer* da sua classe específica. Cada classe possui uma prioridade e,
quando o próximo pacote a ser transmitido deve ser escolhido, a
*priority queueing* percorre os *buffers* da classe de maior prioridade
para a de menor prioridade: se houver um pacote no *buffer* da classe de
maior prioridade, este é escolhido para transmissão; caso contrário,
consulta-se o *buffer* da próxima classe com a maior prioridade entre as
restantes.

Nota-se, portanto, que, enquanto houver pacotes nos *buffers* das
classes de maior prioridade, as classes de menor prioridade não serão
servidas. Isso efetivamente atinge o efeito desejado de deixar certos
pacotes "furarem fila". Por outro lado, pacotes de mais baixa prioridade
podem ser preteridos indefinidamente, uma situação chamada de
*starvation* (esfomeação ou inanição em português).

O *starvation* pode ser combatido com outra política de escalonamento: a
*round-robin*. Assim como na política *priority queueing*, pacotes são
divididos em classes e cada classe possui seu próprio *buffer*. Quando o
próximo pacote a ser transmitido precisa ser escolhido, a política
*Round-Robin* percorre as filas em ordem, **a partir da fila logo após
aquela da qual o último pacote transmitido foi tirado**. Em outras
palavras, a cada nova oportunidade de transmissão, a política
*round-robin* dá chance para uma nova classe. Isso significa que todas
as classes receberão serviço, independentemente do que ocorre nas
demais. Embora a política *round-robin* não gere *starvation*, ela também não fornece nenhum tipo de prioridade a uma classe sobre outra --- ao
contrário, ela garante que os recursos dedicados a uma classe não
interferirão com os recursos das demais classes, seja espaço em
*buffer*, seja tempo de transmissão.

Uma política que consegue,
simultaneamente, garantir priorização de classes e evitar *starvation* é
a *Weighted-Fair Queueing* (ou WFQ). A WFQ atribui prioridades numéricas
que são proporcionais à fração do tempo de utilização do enlace que será
dedicada a cada classe. Assim, classes de maior prioridade terão acesso
a uma fração maior do tempo de uso do enlace. Por outro lado, classes de
prioridade mais baixa ainda receberão *alguma* fração não-nula de tempo
para utilizar o enlace, independentemente da ocupação dos *buffers* das
classes de mais alta prioridade.

Uma forma de implementar a WFQ com pesos inteiros positivos e fazer uma ligeira alteração em como a política *round-robin* opera. Assim como na *round-robin*, as filas das várias classes são percorridas ciclicamente à medida que o enlace se torna disponível para transmissão. Entretanto, ao invés de transmitir um único pacote de uma classe e passar para a próxima, o WFQ transmite $w$ pacotes da classe atual antes de passar para a seguinte, onde $w$ é o valor do peso atribuído. Nessa implementação, uma classe $A$ que tenha sido configurada com peso $w_A$ receberá uma fração $\frac{w_A}{W}$, onde $W$ denota o somatório dos pesos de todas as classes.

## Políticas de Descarte de Pacotes

A política de descarte de pacotes mais simples e comum é chamada de
*Drop-tail*. Quando o *buffer* está cheio e um novo pacote chega, a
política *Drop-tail* simplesmente descarta o pacote recém-recebido.

Embora esta abordagem seja intuitiva, a *Drop-tail* pode resultar em
alguns problemas. Um destes problemas é a possibilidade de
**sincronização de fluxos**. Suponha que dois *hosts* conectados a um
mesmo roteador originam um fluxo TCP cada um, compartilhando um enlace
de saída --- e, portanto, sua fila. Como já discutido anteriormente, o
TCP tem por característica a geração de tráfego em rajada. Suponha que
um dos dois *hosts* realiza a transmissão de uma rajada de pacotes do
tamanho do *buffer* disponível na porta de saída do roteador. Em
seguida, o outro *host* transmite a sua rajada de pacotes. Supondo que o
enlace de saída do roteador seja o gargalo, quando os pacotes da rajada
gerada pelo segundo *host* chegam ao *buffer*, este já está totalmente
ocupado por pacotes da rajada do primeiro *host*. Logo, em uma política
do tipo *Drop-tail* os pacotes da rajada do segundo *host* poderiam ser
todos descartados em sequência. Em última análise, este comportamento
causa um compartilhamento injusto dos recursos da rede.

Uma política de descarte alternativa, porém ainda bastante simples, é a
*Drop-head*. Como o nome sugere, quando um novo pacote chega ao *buffer*
e este se encontra cheio, descarta-se o primeiro pacote da fila --- ou
seja, o pacote que está a mais tempo enfileirado. Uma análise
superficial da política *Drop-head* pode sugerir que ela é injusta.
Afinal, estamos descartando um pacote que está no início da fila e,
portanto, muito próximo a ser transmitido.

No entanto, a motivação para esta decisão se torna clara quando
consideramos fluxos TCP. Como já estudado nesta disciplina, o TCP infere
congestionamento através da detecção de segmentos perdidos. Esta
detecção, por sua vez, acontece pelo recebimento de *acks* duplicados
sucessivos ou pelo estouro de temporizador. Em ambos os casos, as
detecções de perda do TCP sempre são realizadas sobre os segmentos mais
antigos atualmente em trânsito. Voltando à política *Drop-head*, em uma
situação de congestionamento, se temos a opção entre descartar um dentre
potencialmente vários segmentos TCP, pode ser interessante descartar o
segmento mais antigo, já que os eventos que indicam perda de pacote para
o TCP tenderão a ocorrer em um futuro mais próximo para o segmento que
foi transmitido há mais tempo que para um segmento mais recente.
Colocando de outra forma, se não descartarmos o segmento que está no
início da fila --- depois de ter sofrido um alto atraso de
enfileiramento no *buffer* do nosso roteador --- corremos o "risco" que
ele chegue ao seu destinatário final e que o *ack* correspondente volte
ao transmissor antes de eventos como *acks* duplicados ou estouro de
temporizador ocorram e indiquem o congestionamento ao transmissor TCP.
Desta forma, descartar o segmento no início do *buffer* pode ter o
efeito desejável de avisar de maneira antecipada ao TCP sobre o
congestionamento.

Note, no entanto, que o problema de sincronização de fluxos que afeta a
política *Drop-tail* também pode se manifestar na política *Drop-head*,
embora de forma invertida. Se repetirmos a análise do cenário com os
dois *hosts* compartilhando um enlace de saída de um roteador e gerando
tráfego em rajadas, concluiremos, novamente, que um dos *hosts* será
consistentemente prejudicando, tendo seus pacotes descartados em
benefício dos pacotes do outro fluxo. Desta vez, no entanto, por
descartamos os pacotes do início da fila, o fluxo prejudicado será o do
primeiro *host* a transmitir: à medida que os pacotes da rajada do
segundo *host* chegam ao roteador e encontram a fila cheia, os pacotes
que já estavam na fila, *i.e.*, os do primeiro *host*, serão descartados
um a um.

A terceira e última política de descarte que estudaremos nesta
disciplina é chamada de RED (do inglês *Random Early Detection* ou
*Random Early Drop*). Esta política se diferencia das duas outras
políticas estudadas nesta aula em vários aspectos. Talvez o aspecto mais
marcante da política RED é o fato de que ela pode determinar o descarte
de pacotes **mesmo se a fila não se encontra totalmente cheia**.

A política RED utiliza uma série de parâmetros para balizar seu
funcionamento. De forma simplificada, estes parâmetros incluem:

1.  **Mínimo**. Determina um limite inferior de ocupação da fila a
    partir do qual pacotes *podem* ser descartados.

2.  **Máximo**. Determina um limite superior de ocupação da fila até o
    qual pacotes *podem* **não** ser descartados.

Quando um novo pacote chega ao *buffer*, a política RED compara a
ocupação atual da fila. Se a fila está atualmente menor que o valor do
parâmetro `Mínimo`, o novo pacote é sempre aceito. Se a fila está
atualmente maior ou igual ao valor do parâmetro `Máximo`, o pacote
recém-recebido é **sempre** descartado. Por outro lado, se a ocupação
atual da fila se encontra entre os valores dos parâmetros `Mínimo` e
`Máximo`, o pacote recém-recebido é descartado com uma probabilidade $p$
que é proporcional a esta ocupação (a probabilidade cresce linearmente
entre 0 e 1 à medida que a ocupação varia entre `Mínimo` e `Máximo`).

A motivação usada pelo RED para descartar pacotes antes do *buffer*
estar completamente cheio é similar à utilizada para explicar os
potenciais benefícios da política *Drop-head*: o objetivo é alertar
antecipadamente as fontes de tráfego sobre a situação de
congestionamento. Lembre-se que os descartes de pacotes são uma
consequência de uma situação **prolongada** --- e extrema --- de
congestionamento. Quando a ocupação do *buffer* de uma porta de saída é
*representativa*, isso já sinaliza que existe congestionamento. Esta
ocupação representativa é determinada no RED através do parâmetro
`Mínimo`. Logo, a partir deste nível de enfileiramento, o RED começa a
descartar pacotes --- ainda que probabilisticamente --- com o intuito de
alertar as fontes que estas devem reduzir suas taxas de transmissão.

De fato, quando configurado de forma correta, o RED permite que o TCP
convirja para a vazão máxima do caminho, mantendo atrasos relativamente
baixos --- em comparação aos obtidos por outras disciplinas de
enfileiramento. Um problema do RED é que nem sempre é fácil encontrar
valores adequados para seus parâmetros de acordo com o cenário em
questão. Isso dificulta uma adoção mais ampla desta técnica.

Um efeito colateral interessante do RED é a solução do problema do
sincronismo. Repare que, embora o RED sempre descarte o pacote
recém-recebido, ele não o faz apenas quando o *buffer* está cheio. Logo,
de certa maneira, o pacote escolhido para descarte no RED pode ser
considerado aleatório, ao contrário do que ocorre nas políticas
*Drop-tail* e *Drop-head*. Esta natureza aleatória do RED faz com que
ele não prejudique consistentemente um mesmo fluxo, distribuindo seus
descartes de maneira homogênea entre os vários fluxos que compartilham o
enlace.
