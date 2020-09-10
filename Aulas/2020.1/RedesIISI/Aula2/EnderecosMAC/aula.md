# Endereçamento na Camada de Enlace

Várias tecnologias de camada de enlace proveem um esquema de endereçamento próprio, completamente independente do endereçamento utilizado na camada de rede. Os chamados endereços MAC diferem dos endereços IP, em particular, tanto em formato quanto em utilização.

Enquanto endereços da camada de rede são utilizados no encaminhamento de pacotes ao longo de um caminho completo fim-a-fim, o uso dos endereços MAC se restringe à comunicação local, entre dispositivos diretamente conectados por uma rede em nível 2 --- muitas vezes, isso corresponde a nós que estão em uma mesma sub-rede IP, embora isso não seja necessariamente verdade[^1].

## Formato e Atribuição

Em diversas tecnologias, o endereço MAC é composto por 6 octetos (48 bits). Esse formato de endereço é conhecido como EUI-48 ou MAC-48. É comum que endereços MAC sejam escritos como a sequência dos valores hexadecimais dos seus octetos separados por dois pontos ou hífen. Por exemplo: `10:63:c8:fc:c3:57`.

Ao contrário do que ocorre com os endereços IP, por exemplo, que são determinados pela sub-rede à qual a interface está conectada, os endereços MAC são pré-programados[^2] no *hardware* da interface de rede.

A pré-programação do endereço MAC nas interfaces de rede é fundamental para o bom funcionamento das redes de computadores. Um dos objetivos do endereçamento MAC é a portabilidade, ou seja, a capacidade de uma interface ser movida entre redes diferentes sem a necessidade de mudança no endereço. Como os vários usos de endereços pressupõem unicidade, é
preciso garantir que cada interface em operação no mundo tenha um endereço próprio, diferente das demais.

Repare como esse objetivo --- portabilidade --- difere daquele do endereço IP, por exemplo. No IP, endereços não são portáveis porque é necessário respeitar a hierarquia definida pelas sub-redes. Por sua vez, essa hierarquia é importante por conferir melhor escalabilidade ao roteamento da Internet. Na camada de enlace, no entanto, como a comunicação está confinada à rede local --- com uma escala, portanto, muito menor que a da Internet como um todo ---, escalabilidade não é uma preocupação tão grande, viabilizando a utilização de um **endereçamento plano**.

Mas como garantir essa unicidade dos endereços MAC? A resposta, em primeira análise, é que os fabricantes atribuem endereços únicos a cada interface produzida. É claro que para isso funcionar é necessário que haja alguma coordenação entre fabricantes para que marcas diferentes não produzam interfaces com o mesmo endereço MAC. Nesse ponto entra o IEEE: a entidade controla a atribuição de endereços, determinando faixas de endereços (identificadas por prefixos de três octetos) que podem ser usadas por cada fabricante. Um efeito colateral interessante disso é que é possível identificar o fabricante de um certo equipamento ou interface de rede através prefixo do seu endereço MAC. Vários *softwares* e *sites* na Internet usam e disponibilizam bases de dados com essa associação.

## Convenções dos Endereços EUI-48

Assim como ocorre com o endereçamento IP, os endereços MAC possuem algumas convenções próprias. Nos endereços EUI-48, por exemplo, o endereço `FF:FF:FF:FF:FF:FF` --- ou seja, todos os bits com valor 1 --- é reservado ao endereço de *broadcast*. De forma mais geral, endereços cujo bit menos significativo do primeiro octeto seja 1 (em outras palavras, o primeiro octeto é ímpar) são considerados endereços *multicast* (*e.g.*, `01:80:C2:00:00:00`), enquanto os demais são considerados *unicast* (*e.g.*, `18:A6:F7:71:10:C6`).

Há, ainda, a distinção entre endereços *universalmente administrados* ou *localmente administrados*. Endereços universalmente administrados são obrigatoriamente únicos e atribuídos de acordo com o processo explicado anteriormente. Já os localmente administrados são atribuídos por administradores de redes locais de forma independente, havendo, portanto, a possibilidade de duplicidade. A separação de um conjunto de endereços localmente administrados permite que o endereço MAC pré-programado de uma interface seja substituído por outro, de acordo com necessidades específicas do administrador do equipamento. Ademais, esses endereços têm sido muito utilizados atualmente para a atribuição de endereços MAC a interfaces de rede de máquinas virtuais. Numericamente, a distinção entre os endereços universalmente e localmente administrados se dá pelo valor do segundo bit menos significativo do primeiro octeto do endereço MAC: o valor 0 indica um endereço universalmente administrado, enquanto o valor 1 denota um endereço localmente administrado.

Em resumo, o formato de um endereço MAC tradicional --- EUI-48 --- é:

$$bbbbbblm\quad bbbbbbbb\quad bbbbbbbb\quad bbbbbbbb\quad bbbbbbbb\quad bbbbbbbb,$$
onde $l$ determina se o endereço é local e $m$ determina se o endereço é de *multicast*.

[^1]: Em aulas posteriores, discutiremos os conceitos de *domínio de colisão* e *domínio de broadcast* que serviram para uma definição mais precisa do que seria essa *comunicação local*. Nessa aula, por simplicidade, continuaremos usando o termo *rede/comunicação local*.

[^2]: Algumas vezes, diz-se que o endereço MAC é fixo, ou até mesmo *hardcoded* em uma memória ROM. Em dispositivos modernos, no entanto, é muito comum a possibilidade de alteração do MAC via *software* para possibilitar a chamada *clonagem de endereço MAC*. Essa funcionalidade encontra algumas aplicações legítimas que podem ser úteis no dia-a-dia.
