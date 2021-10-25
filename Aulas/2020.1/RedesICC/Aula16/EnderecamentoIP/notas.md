---
title: Endereçamento IPv4
header-includes: |
	<style type="text/css">
		.red{
			color: red;
		}
		.blue{
			color: blue;
		}
		table {
			border-top: 2px double #000;
			border-bottom: 2px double #000;
			border-spacing: 0px 2px;
		}
		thead > tr > th {
			border-bottom: 1px solid #000;
		}
		th {

			padding-left: 5px;
			padding-right: 5px;
		}
	</style>
---

Muitas vezes diz-se informalmente que o endereço IP é o identificador de
um nó na Internet. Na verdade, endereços IP são atribuídos a interfaces
de rede, o que significa que se um dispositivo possui múltiplas
interfaces --- como, por exemplo, um roteador --- ele normalmente
possuirá múltiplos endereços IP.

No IPv4, cada endereço possui 32 bits. Na prática, é comum a utilização
de uma notação em que os 32 bits são quebrados em quatro bytes --- ou
*octetos*, em um jargão comum em Redes de Computadores. Neste caso, o IP é
representado pelos valores decimais dos seus octetos separados por
pontos, *e.g.*, `200.20.15.166`.

Os endereços IPv4, por sua vez, são organizados nas chamadas
**sub-redes**. De uma maneira simplificada --- embora não totalmente
correta --- uma sub-rede diz respeito a um conjunto de interfaces de
redes que podem se comunicar sem o intermédio de um roteador. Um
corolário desta definição é que o papel de um roteador é conectar
sub-redes diferentes, permitindo a comunicação entre dispositivos destas
várias sub-redes.

Em termos de endereçamento, sub-redes correspondem a conjuntos de $2^n$
endereços numericamente subsequentes (considerando-se a representação
binária dos 32 bits dos endereços). Em particular, os bits de um
endereço IP podem ser quebrados em duas partes: **um prefixo de
sub-rede**, denotado pelos bits mais significativos do endereço ---
*i.e.*, mais à esquerda --- e a identificação da interface dentro
daquela sub-rede, denotada pelos bits restantes.

Uma pergunta imediata é: quantos bits devem ser alocados para o prefixo?
Quanto mais bits alocarmos para o prefixo, maior o **número de sub-redes
diferentes**. Por outro lado, estas sub-redes serão **menores, *i.e.*
terão menos endereços disponíveis**. Outro fator a se considerar é que
nem todas as sub-redes precisam ser do mesmo tamanho. Uma sub-rede
utilizada para o endereçamento de dispositivos em uma residência pode
ser bem menor que a sub-rede utilizada para endereçar todos os
computadores de um grande *data-center*. Por esta razão, a Internet
permite a definição de sub-redes com diferentes tamanhos --- o que
resulta em comprimentos distintos para os prefixos utilizados.

## Endereçamento Baseado em Classes

Originalmente, esta alocação de sub-redes na Internet seguia um padrão
de endereçamento chamado de **endereçamento por classes**. A ideia era
definir algumas *classes* de sub-redes padronizadas que fornecessem
alguma flexibilidade de tamanho, com o propósito de servir bem a redes
*pequenas*, *médias* ou *grandes*. Foram justamente estas noções
abstratas de tamanho que guiaram a criação das classes. Em particular,
foram criadas as seguintes cinco classes:

1.  **Classe A**: utilizada para redes *grandes*, usava um prefixo de
    apenas 8 bits, permitindo, portanto, até $2^{24} = 16777216$
    endereços. Todos os prefixos que denotavam sub-redes de Classe A
    eram iniciados pelo bit 0.

2.  **Classe B**: utilizada para redes *médias*, usava um prefixo de 16
    bits, permitindo, portanto, até $2^{16} = 65536$ endereços. Todos os
    prefixos que denotavam sub-redes de Classe A eram iniciados pelos bits 10.

3.  **Classe C**: utilizada para redes *pequenas*, usava um prefixo de
    24 bits, permitindo, portanto, até $2^{8} = 256$ endereços. Todos os
    prefixos que denotavam sub-redes de Classe A eram iniciados pelos bits 110.

4.  **Classes D e E**: reservadas para outros usos mais específicos,
    como comunicação *multicast* --- tópico de aulas futuras --- no caso
    da Classe D.

Eventualmente, percebeu-se que o endereçamento baseado em classes não
fornecia uma granularidade suficiente para atender eficientemente a
demandas típicas na Internet. Para ver isso, considere uma instituição
que precisa conectar 1000 equipamentos à sua sub-rede. Uma sub-rede da
Classe C é pequena demais, mas, ao mesmo tempo, uma sub-rede da classe B
resulta em um desperdício de mais de 64 mil endereços.

## CIDR

Para permitir uma alocação de sub-redes mais justas --- *i.e.*, com
"sobras" menores de endereços --- o ideal é que pudéssemos definir
**arbitrariamente** o comprimento do prefixo da sub-rede. Esta ideia é a
base da solução de endereçamento utilizada atualmente na Internet: o
endereçamento CIDR (*Classless Inter-Domain Routing*).

No CIDR, pode-se utilizar sub-redes com qualquer comprimento de prefixo. Para que
se possa saber o tamanho do prefixo da sub-rede a qual um endereço
pertence, endereços são denotados por `a.b.c.d/x`, onde `x` é o número
de bits no prefixo.

Desta forma, podemos definir sub-redes com qualquer tamanho que seja uma
potência de 2. Por exemplo, uma sub-rede `/23` tem prefixo de 23 bits,
deixando 9 bits para o endereçamento de interfaces, resultando até
$2^{9} = 512$ endereços diferentes. Voltando ao exemplo de uma
instituição com 1000 equipamentos a serem interligados em uma sub-rede,
uma sub-rede `/22` passa a ser a opção mais eficiente, por permitir
$2^{32-22} = 1024$ endereços --- resultando em uma sobra de apenas 24
endereços.

## Endereços de Sub-rede e de *Broadcast*

Outros dois conceitos importantes quando se discutem as convenções de
endereçamento no IP são os de **endereço de sub-rede** e **endereço de
*broadcast***. O endereço de sub-rede é primeiro endereço da faixa
definida pela sub-rede. Em outras palavras, trata-se do endereço IP
formado pelo prefixo da sub-rede complementado por todos os demais bits
iguais a zero. Já o endereço de *broadcast* é o último, formado pelo
prefixo seguido de todos os demais bits iguais a um.

O endereço de *broadcast* é utilizado para permitir o envio de um
datagrama IP para todas as interfaces conectadas à sub-rede em questão.
Embora até aqui nesta disciplina tenhamos focado exclusivamente na
comunicação *unicast* --- *i.e.*, aquela em que um pacote tem exatamente
um destinatário especificado --- comunicação em *broadcast* é
relativamente comum em redes e tem importantes aplicações em uma série
de protocolos que serão estudados mais à frente na disciplina. **Uma
interface, portanto, não pode ser configurada para operar com o endereço
de *broadcast* da sua sub-rede**.

Já o endereço de sub-rede é, como o nome sugere, um endereço IP usado
para identificar a sub-rede em questão. À princípio, uma interface
*poderia* ser configurada para utilizar o endereço de sub-rede da
sub-rede na qual se encontra --- de fato, alguns
equipamentos/plataformas aceitam essa configuração. Entretanto, a RFC
1812 especifica que roteadores devem descartar pacotes endereçados ao
endereço de sub-rede da sub-rede de sua interface ou tratá-los como
pacotes de **broadcast** --- em certo momento da história, o que hoje
chamamos de endereço de sub-rede já foi considerado o identificador do
endereço de *broadcast*. Na prática, portanto, uma interface configurada
para operar com o endereço de sub-rede da sua sub-rede provavelmente não
será bem sucedida ao tentar se comunicar com outras interfaces.

A atribuição de semânticas especiais a estes dois endereços faz com que
o *tamanho útil* de uma sub-rede --- *i.e.*, a quantidade de endereços
que efetivamente podem ser utilizados para endereçar interfaces --- seja
dado por $2^{32-x} - 2$, onde $x$ é o comprimento do prefixo da
sub-rede. Esse fator deve ser considerado ao se escolher o tamanho do
prefixo de uma sub-rede.

## Máscara de Sub-rede

Por fim, é importante citar que há uma notação alternativa ainda
bastante popular para denotar o comprimento de um prefixo no
endereçamento CIDR: a chamada **máscara de sub-rede**. A máscara de
sub-rede de uma determinada sub-rede $X$ é uma sequência de 32 bits tal
que, para qualquer endereço pertencente a $X$, a operação de *and*
bit-a-bit da máscara com este endereço resulte no endereço de sub-rede
de $X$. De uma forma um pouco mais simples e prática, se uma sub-rede
possui um prefixo de comprimento $x$, sua máscara de sub-rede será dada
por uma sequência de $x$ bits um concatenada com uma sequência de $32-x$
bits zero. Por exemplo, uma sub-rede `/22` possui uma máscara de
sub-rede `255.255.252.0`.

## Endereçamento Hierárquico

Nas seções anteriores, discutimos como um *host* pode obter um endereço
válido ao conectar sua interface a uma sub-rede IP. Este termo *endereço
válido* denota justamente um endereço que pertença à faixa de endereços
pertencentes àquela sub-rede. Uma pergunta que não respondemos, no
entanto, é como uma sub-rede obtém seus endereços?

No caso de uma empresa, por exemplo, que contrata o serviço de um ISP
para conectar seus dispositivos à Internet, a resposta pode ser que o
ISP aloca um pedaço da sua própria faixa de endereços IP para a empresa
cliente. Suponha, por exemplo, que o ISP possua uma sub-rede com prefixo
`/20` --- totalizando, portanto, $2^{12} = 4096$ endereços. Suponha que
a empresa precise de uma sub-rede suficientemente grande para endereçar
cerca de 400 interfaces. Logo, a empresa precisa de uma sub-rede de
prefixo `/23`, que provê um total de $2^9 = 512$ endereços.

Repare que a sub-rede do ISP é 8 vezes maior que a sub-rede necessária à
empresa. Em particular, repare que podemos sub-dividir a sub-rede do ISP
--- de prefixo `/20` --- em 8 sub-redes de prefixo `/23`. Uma forma
alternativa de enxergar isso é pensar nos prefixos: como um prefixo
`/23` usa três bits a mais que um prefixo `/20`, há $2^3 = 8$
combinações diferentes de prefixos `/23` compreendidos na sub-rede
original.

Esta capacidade de quebrarmos uma sub-rede maior em sub-redes menores
--- e vice-versa --- recebe o nome de **endereçamento hierárquico** e é
extensivamente utilizada no projeto lógico de redes IP. Um problema
típico desta área é justamente o ilustrado no exemplo anterior: dada uma
determinada sub-rede IP "grande" para atender a uma certa instituição e
demandas de endereços --- possivelmente distintas --- para departamentos
diferentes, como podemos quebrar a sub-rede original em sub-redes
menores alocadas a cada departamento com o menor desperdício possível de
endereços?

Vamos ilustrar isso com um exemplo mais concreto. Suponha que uma empresa seja dividade em três departamentos, **A**, **B** e **C**. Cada departamento possui diversos *hosts* --- *e.g.*, computadores, impressoras, equipamentos de vídeo-conferência --- que necessitam de conexão com a rede. Assuma, por simplicidade, que cada um desses equipamentos possua uma única interface de rede e, portanto, necessite de um único endereço IP. Considere que os departamentos possuam os seguintes números de *hosts*:

|  Departamento  |  Hosts  |
|:--------------:|:-------:|
|        **A**       |    63   |
|        **B**       |   200   |
|        **C**       |   500   |

Desejamos criar uma sub-rede separada para cada um dos departamentos. Suponha os departamentos se interconectem através um único roteador central da empresa: cada departamento está conectado a uma interface específica do roteador. Por fim, considere que o ISP que provê acesso à empresa tenha disponibilizado uma faixa de endereços correspondente à sub-rede `201.17.44.0/22`. A tarefa, portanto, é sub-dividir essa sub-rede em sub-redes menores a serem alocadas a cada departamento, atendendo às suas respectivas demandas de número de endereços IP, ao mesmo tempo em que minimizamos os endereços desperdiçados.

Para começarmos a atacar um problema desse tipo, devemos inicialmente calcular as demandas de cada departamento. Repare que os números providos na tabela acima dizem respeito às quantidades de *hosts* a serem atendidos, não aos tamanhos necessários das sub-redes IP alocadas. Considere, por exemplo, o caso do departamento **A**: ele possui 63 *hosts*, o que poderia nos levar a crer que uma sub-rede `/26` fosse suficiente --- já que $2^{32 - 26} = 64$. Entretanto, devemos nos lembrar que há dois endereços em qualquer sub-rede que não devem ser usados por possuírem uma semântica bem definida: o primeiro (endereço de sub-rede) e o último (endereço de *broadcast*). Além disso, devemos levar em conta que, além dos *hosts*, a sub-rede de cada departamento precisará de um endereço para a porta a qual estará conectada no roteador da empresa. Assim, necessitamos de uma sub-rede que comporte, no mínimo, $63 + 3 = 66$ endereços. A menor potência de 2 maior ou igual a esses 65 endereços é $\lceil\log_2{66}\rceil = 7$. Ou seja, é necessário, ao menos, uma sub-rede com prefixo de $32 - 7 = 25$ bits. Aplicando o mesmo raciocínio para os demais departamentos, chegamos às seguintes demandas:

|  Departamento  |  Hosts  |  Total de Endereços  |  Tamanho do Sufixo  |  Tamanho do Prefixo  |
|:--------------:|:-------:|:--------------------:|:-------------------:|:--------------------:|
|        A       |    63   |          66          |          7          |          25          |
|        B       |   200   |          203         |          8          |          24          |
|        C       |   500   |          503         |          9          |          23          |

Estabelecidas as demandas, podemos agora fazer o processo de divisão da sub-rede original em sub-redes menores que atendam aos requisitos de cada departamento. Para isso, note que a sub-rede original `201.17.44.0/22` pode ser dividida em duas sub-redes `/23`, conforme ilustrado na tabela abaixo:

|                     |  Endereço de sub-rede  |  Primeiro Octeto  |  Segundo Octeto  |  Terceiro Octeto  |  Quarto Octeto  |
|:--------------------|:----------------------:|:-----------------:|:----------------:|:-----------------:|:---------------:|
|  Sub-rede original  |     201.17.44.0/22     |      [11001001]{.red}     |     [00010001]{.red}     |     [001011]{.red}00     |     00000000    |
|   Primeira divisão  |     201.17.44.0/23     |      [11001001]{.red}     |     [00010001]{.red}     |     [001011]{.red}[0]{.blue}0     |     00000000    |
|   Segunda divisão   |     201.17.46.0/23     |      [11001001]{.red}     |     [00010001]{.red}     |     [001011]{.red}[1]{.blue}0     |     00000000    |

As colunas mais à direita da tabela mostram os valores dos octetos dos endereços de cada sub-rede representados em binário. Bits destacados em cor correspondem aos respectivos prefixos. Em particular, os bits marcados em azul são aqueles que se tornaram parte do prefixo nas duas sub-redes resultantes do particionamento da sub-rede original. Repare que esse particionamento consiste basicamente em aumentar o tamanho do prefixo e gerar todas as combinações possíveis com esses bits recém-adicionados ao prefixo. Nesse exemplo em particular, como começamos com uma sub-rede `/22` e a subdividimos em duas sub-redes `/23`, houve a adição de apenas um bit ao prefixo, o que permite apenas duas combinações.

Esse mesmo processo pode ser repetido para subdividir novamente uma das redes `/23` obtidas no passo anterior em duas sub-redes menores `/24`. Por exemplo:

|                     |  Endereço de sub-rede  |   Primeiro Octeto  |   Segundo Octeto   |       Terceiro Octeto       |  Quarto Octeto  |
|:-------------------:|:----------------------:|:------------------:|:------------------:|:---------------------------:|:---------------:|
|  Sub-rede original  |     201.17.46.0/23     |  [11001001]{.red}  |  [00010001]{.red}  |       [0010111]{.red}0      |     00000000    |
|   Primeira divisão  |     201.17.46.0/24     |  [11001001]{.red}  |  [00010001]{.red}  |  [0010111]{.red}[0]{.blue}  |     00000000    |
|   Segunda divisão   |     201.17.47.0/24     |  [11001001]{.red}  |  [00010001]{.red}  |  [0010111]{.red}[1]{.blue}  |     00000000    |

Repare no efeito desse processo de aumento do comprimento do prefixo e geração das combinações de valores dos bits adicionados a ele na representação decimal dos endereços de sub-rede. Em ambas as divisões --- de `/22` para `/23` e de `/23` para `/24` --- uma das sub-redes menores geradas tem exatamente o mesmo endereço de sub-rede da sub-rede original. Isso ocorre porque estamos apenas estendendo o número de bits do prefixo. Já para a segunda sub-rede resultante da divisão, o terceiro octeto foi incrementado em $2^1$ e $2^0$, respectivamente, porque manipulamos o valor do segundo e primeiro bits mais à direita, respectivamente.

Usando esse mesmo raciocínio, podemos facilmente realizar divisões sucessivas de uma sub-rede original:

- `201.17.44.0/22` pode ser dividida em:
	- `201.17.44.0/23`, que pode ser dividida em:
		- `201.17.44.0/24`, que pode ser dividida em:
			- `201.17.44.0/25`, que pode ser dividida em:
				- ...
				- ...
			- `201.17.44.128/25`, que pode ser dividida em:
				- ...
				- ...
		- `201.17.45.0/24`, que pode ser dividida em:
			- `201.17.45.0/25`, que pode ser dividida em:
				- ...
				- ...
			- `201.17.45.128/25`, que pode ser dividida em:
				- ...
				- ...
	- `201.17.46.0/23`, que pode ser dividida em:
		- `201.17.46.0/24`, que pode ser dividida em:
			- `201.17.46.0/25`, que pode ser dividida em:
				- ...
				- ...
			- `201.17.46.128/25`, que pode ser dividida em:
				- ...
				- ...
		- `201.17.47.0/24`, que pode ser dividida em:
			- `201.17.47.0/25`, que pode ser dividida em:
				- ...
				- ...
			- `201.17.47.128/25`, que pode ser dividida em:
				- ...
				- ...

Voltando ao problema original de alocação de sub-redes aos três departamentos, já somos capazes de realizá-la. Para isso, precisamos apenas pegar uma sub-rede `/23` para o departamento **C**, uma `/24` para o departamento **B** e uma `/25` para o departamento **A**. Percorrendo a hierarquia de sub-redes acima, uma possível alocação seria:

|  Departamento  |     Sub-rede     |
|:--------------:|:----------------:|
|        A       |  201.17.44.0/23  |
|        B       |  201.17.46.0/24  |
|        C       |  201.17.47.0/25  |

Utilizando o que foi visto até agora, tente responder às seguintes questões:

1. Volte à hierarquia de sub-redes resultante das sucessivas divisões da sub-rede original `201.17.44.0/22`. Para efeito daquele exemplo, paramos nas sub-redes `/25`. Você consegue subdividir cada sub-rede `/25` nas respectivas sub-redes `/26`?
2. Imagine que a empresa tivesse um quarto departamento **D** ao qual atribuíssemos uma dessas sub-redes `/26` do item anterior, conectada também ao roteador central. Qual o número máximo de ***hosts*** que esse departamento poderia ter?
3. A atribuição de sub-redes mostrada na tabela acima não é a única solução possível. Você consegue pensar em outra atribuição válida?
4. E a atribuição mostrada na tabela abaixo? É válida? Justifique.

|  Departamento  |     Sub-rede     |
|:--------------:|:----------------:|
|        A       |  201.17.44.0/23  |
|        B       |  201.17.45.0/24  |
|        C       |  201.17.47.0/25  |


## Endereçamento Hierárquico e ICANN

Na seção anterior, discutimos como uma sub-rede pode ser quebrada em
sub-redes menores. Exemplificamos isso com a situação comum em que um
ISP quebra sua faixa de endereços IP em sub-redes atribuídas a seus
clientes. No entanto, ainda não está absolutamente claro como os ISPs,
por sua vez, recebem suas faixas de endereço.

Em última instância, quem coordena a atribuição de endereços IP na
Internet é uma entidade denominada ICANN (*Internet Corporation for
Assigned Names and Numbers*). O ICANN --- mais especificamente, um
departamento seu chamado de IANA (*Internet Assigned Numbers Authority*)
--- é responsável pela atribuição e padronização de uma série de
"números" usados na Internet[^2], incluindo, por exemplo, os números de
porta padrão para protocolos de camada de aplicação. Em particular, o
ICANN controla o espaço de endereços IPv4 e distribui grandes blocos
para as chamadas entidades de *Registro Regional da Internet*. Estas
entidades regionais, por sua vez, aplicam políticas próprias para
fragmentar estes grandes blocos em faixas menores --- porém ainda
tipicamente grandes --- e atribui-las a outras entidades mais
localizadas (*e.g.*, como órgãos nacionais de cada país ou diretamente a
ISPs).

Na América latina, por exemplo, a entidade de registro nacional é a
LACNIC (*Latin America and Caribbean Network Information Centre*). O
orgão brasileiro responsável por --- entre outras coisas --- atribuir as
faixas de endereços IP é o CGI.br (Comitê Gestor da Internet no Brasil).
O CGI.br recebe faixas atribuídas pela LACNIC e as redistribui de acordo
com políticas nacionais para órgãos e entidades brasileiras.

[^1]: Por uma série de fatores que fogem ao escopo desta disciplina,
    isso não é estritamente verdadeiro na Internet atual. Para efeito
    desta disciplina, no entanto, assumiremos isso como fato.

[^2]: O ICANN também é a entidade responsável pelo gerenciamento do
    serviço de DNS na Internet, embora isso não seja diretamente
    relevante à discussão desta aula.
