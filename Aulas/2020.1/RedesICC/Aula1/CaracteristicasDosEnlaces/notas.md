# Enlaces de Comunicação

Os enlaces de comunicação --- ou simplesmente, *links* --- estão no cerne das redes de computadores. Os enlaces são os componentes de uma rede responsáveis por interconectar **dois ou mais** dispositivos computacionais, permitindo a troca de informação entre eles.

É importante, portanto, destacar que nem todo enlace interconecta somente dois dispositivos. De fato, uma possível forma de se classificar diferentes tipos de enlace é justamente essa: entre os enlaces **ponto-a-ponto** e os enlaces **compartilhados**. Enquanto os primeiros interligam exatamente dois dispositivos computacionais, os segundos podem interconectar mais elementos.

Além dessa possível classificação, existem diversas outras características que variam de enlace para enlace. Tais características incluem o tipo de meio físico utilizado, a taxa de transmissão, o tempo de propagação do sinal pelo meio físico, a probabilidade de falhas na transmissão, entre diversas outras. Nesse material, faremos um breve apanhado dessas características, provendo alguns exemplos ao longo do caminho.

## Meio Físico

Enlaces de comunicação são formados por algum tipo de meio físico. É importante ressaltar que, nesse contexto, *meio físico* não se restringe a objetos palpáveis, como cabos. Uma onda eletromagnética, por exemplo, pode constituir --- e, frequentemente, constitui --- o meio físico usado por um enlace. Independentemente do que constitui o meio físico, é ele o responsável por "transportar" os bits do dispositivo transmissor aos dispositivos receptores.

Há uma grande variedade de meios físicos utilizados em enlaces de comunicação práticos, incluindo meios elétricos (*e.g.*, fios de cobre), meios ópticos (*e.g.*, fibras ópticas), meios sem fio (*e.g.*, rádio). Mesmo quando analisamos um desses tipos de meio físico, ainda há variações significativas. Por exemplo, existem meios elétricos baseados em cabos do tipo par-trançado e outros baseados em cabos coaxiais.

De forma geral, transmite-se informação por um enlace manipulando-se alguma *característica mensurável do meio físico*; de forma análoga, a recepção dá-se através da observação dessa mesma característica. Por exemplo, se há um par de fios de cobre conectando o transmissor e o receptor, o primeiro pode manipular a tensão elétrica entre os fios, enquanto o segundo pode medi-la. Nesse caso, podemos mapear valores diferentes de informação (*e.g.*, valores de bits) a valores diferentes de tensão elétrica. Mais genericamente, o transmissor gera um _sinal_ elétrico para codificar alguma informação.

Meios físicos geralmente possuem uma **capacidade**. Aqui, capacidade se refere à quantidade de informação que podemos transmitir --- de forma útil --- por unidade de tempo. O conceito de capacidade de um enlace de comunicação é formalmente definido pelo campo da Teoria da Informação, desenvolvido por Claude Shannon na década de 1948. Esse tópico, entretanto, excede o escopo dessa disciplina. Para nossos propósitos, basta que saibamos que cada meio físico irá impor limitações na capacidade de transmitirmos informação.

## Meios Guiados vs. Não-Guiados

Outra forma de classificar enlaces de comunicação é analisar se o mesmo se baseia em um _meio guiado_ ou em um _meio não-guiado_. Em meios guiados, o sinal se propaga ao longo de um caminho bem definido por um certo material --- por exemplo, ao longo de um fio de cobre. Já em meios não guiados, o sinal não percorre um caminho fixo, tendendo a se espalhar pelo espaço (*e.g.*, um enlace sem fio).

Enlaces baseados em meios não-guiados tendem a encontrar desafios maiores que aqueles baseados em meios guiados. Dentre outras razões, isso ocorre porque:

1. Em meios não-guiados, o sinal transmitido tende a chegar muito *atenuado* --- *i.e.*, com pouca intensidade --- no receptor. Sinais mais atenuados são mais difíceis de se interpretar.
2. Em meios não-guiados, o receptor geralmente recebe maior interferência e ruído junto do sinal desejado. Quanto maior o nível de interferência e ruído, mais difícil é a interpretação do sinal.

## Probabilidade de Falha

Cada tipo de meio de transmissão tem características peculiares que afetam diretamente seu desempenho. Por exemplo, os meios sem fio são, em geral, bastante susceptíveis a falhas na transmissão/recepção de mensagens, enquanto a probabilidade de uma falha dessa natureza em uma fibra óptica é bastante reduzida. A maior susceptibilidade dos enlaces sem fio a falhas de transmissão se deve normalmente a ausência de um meio guiado e seus consequentes problemas.

Tecnologias baseadas em enlaces de com alta probabilidade de falha geralmente precisam incluir mecanismos para mitigar esse tipo de ocorrência. Exemplos incluem métodos de verificação de integridade da informação recebida, mecanismos de retransmissão de dados corrompidos e até mesmo mecanismos que permitem a correção de trechos corrompidos de informação. Mesmo assim, no nosso dia-a-dia é comum lidarmos com enlaces em que 1% a 10% das mensagens transmitidas são perdidas por falhas desse tipo.

## Taxa de Transmissão

Enlaces variam também em termos de taxa de transmissão, *i.e.*, o quão rapidamente um transmissor *insere*[^Inserir] a mensagem no meio físico. Um enlace de comunicação Wi-Fi, por exemplo, pode operar a diversas taxas (*e.g.*, 6 Mb/s, 200 Mb/s). Taxas de transmissão são normalmente medidas em bits por segundo --- ou algum múltiplo disso ---, denotando, portanto, o quão rapidamente o transmissor *insere* cada bit no meio físico. Assim, o tempo total para a transmissão de uma mensagem depende tanto da taxa de transmissão, quanto do tamanho da mensagem.

A taxa de transmissão é também comumente chamada de _capacidade do enlace_, _banda_ e _largura de banda_, embora esses termos não sejam tecnicamente equivalentes. Em particular, note que existe uma diferença conceitual entre a taxa de transmissão de um enlace e a capacidade do meio físico: de forma simplificada, a segunda **limita** a primeira, embora, por uma série de motivos, seja comum utilizarmos taxas de transmissão consideravelmente mais baixa que a capacidade máxima teórica de um meio físico. De toda forma, em determinados contextos, é comum que esses dois termos sejam usados --- de forma imprecisa --- como sinônimos.

[^Inserir]: O termo *inserir* está sendo usado aqui para denotar o ato do transmissor manipular o meio físico para transmitir informação. No exemplo de um enlace baseado em um par de fios de cobre em que o transmissor manipula a tensão elétrica, o *inserir* denota o ato do transmissor alterar a tensão entre os fios para representar a próxima parte (*e.g.*, bit) da mensagem.

## Comprimento do Meio Físico

Outro fator é o comprimento do meio físico ou, mais precisamente, a distância percorrida pelo sinal para deixar o transmissor e alcançar o receptor. No caso de um meio guiado, é fácil definir essa distância, porque o sinal, por definição, se propaga ao longo do meio físico.

No entanto, para meios não-guiados nem sempre é trivial definir essa grandeza. Se não há qualquer obstáculo entre transmissor e receptor, podemos simplesmente considerar a distância entre esses dispositivos. Entretanto, quando existem barreiras entre eles --- *e.g.*, uma parede ---, é possível que o sinal chegue ao receptor por um caminho mais longo.

Em resumo, o que importa aqui é a distância efetivamente percorrida pelo sinal. Essa distância é importante porque, tudo mais constante, ela determina quanto tempo leva a mensagem para sair do transmissor e chegar ao receptor. Esse tempo é chamado de _tempo de propagação_ e depende **apenas do comprimento do meio/distância e da velocidade de propagação do sinal no meio em questão**.

## Velocidade de Propagação

Note que tipos de sinais diferentes se propagam a velocidades diferentes. Por exemplo, um sinal sonoro se propaga a aproximadamente 340 m/s no ar, enquanto a luz se propaga a pouco menos de 300.000 m/s. A velocidade de propagação também depende do tipo do meio: por exemplo, um sinal sonoro se propaga mais rapidamente em meios sólidos. Assim, para calcularmos o tempo de propagação, precisamos de, ambos, o comprimento do meio físico e a velocidade de propagação do sinal naquele meio.

