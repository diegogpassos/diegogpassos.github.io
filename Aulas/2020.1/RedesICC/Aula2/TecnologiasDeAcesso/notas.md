# Tecnologias de Redes de Acesso

Utiliza-se o termo *rede de acesso* para denotar uma infraestrutura de comunicação utilizada para interconectar um usuário final ao seu ISP. Assim, as redes de acesso são parte integrante da borda da rede na Internet.

Hoje, existem muitas tecnologias diferentes empregadas em redes de acesso na Internet. Isso se deve a inúmeros fatores, incluindo:

- Evoluções tecnológicas, fazendo com que tecnologias mais novas e mais antigas coexistam.
- Fatores logísticos, fazendo com que nem toda tecnologia seja viável --- técnica ou economicamente --- em toda região.
- Infraestrutura pré-existente, fazendo com que certas tecnologias requeiram menor investimento inicial.

Ao longo desse material, faremos um breve apanhado de algumas tecnologias de acesso populares, contrastando suas características.

## Tecnologias WAN

A sigla WAN (*Wide Area Network*) denota uma tecnologia de comunicação que se estende por grandes áreas geográficas --- embora o que exatamente signifique "grande" seja discutível. Tecnologias de comunicação WAN geralmente interconectam uma rede local --- *e.g.*, uma rede doméstica ou de uma empresa --- à rede de um ISP de acesso.

### DSL

Um exemplo de tecnologia bastante utilizada para conectar redes de acesso a ISPs é o DSL (*Digital Subscriber Line*). Essa tecnologia --- ou família de tecnologias --- permite a transmissão de dados digitais em banda larga (*i.e.*, com altas taxas de transmissão) através da infraestrutura física de telefonia fixa.

O uso da infraestrutura de telefonia fixa para transmissão de dados precede o DSL e começou com o uso de *modems* de linha discada. Na tecnologia de linha discada, o dispositivo cliente fazia uma chamada telefônica tradicional para um número do provedor de acesso e os dispositivos computacionais utilizavam-se sinais sonoros para transmitir dados. Além do inconveniente de ocupar a linha telefônica, essa estratégia esbarrava em uma série de limitações físicas que impediam taxas de transmissão mais elevadas de serem utilizadas.

No DSL, ao contrário, os dados são transmitidos em uma outra _faixa de frequência_. Por isso, embora utilizem o mesmo meio físico, dados e voz podem ser separados, permitindo o uso da linha tanto para chamadas telefônicas quanto para conexão de dados simultaneamente. Além disso, o uso de outra faixa de frequência permite ao DSL evitar as restrições inerentes da faixa usada para a transmissão de voz, fazendo com que essa tecnologia possa atingir taxas de transmissão bem mais altas, comumente de vários Mb/s. Na sua vertente mais comum, denominada ADSL (*Asymmetric Digital Subscriber Line*), são usadas taxas diferentes para o *upstream* -- transmissão do cliente para o ISP --- e para o *downstream* --- transmissão do ISP para o cliente.

### HFC

O fato do DSL utilizar a mesma infraestrutura física da telefonia fixa --- amplamente implantada em todo o mundo --- fez com que essa tecnologia se popularizasse rapidamente. Embora em grau menor, o mesmo ocorreu com o HFC (*Hybrid Fiber-Coaxial*). Como o nome sugere, redes HFC combinam o uso de enlaces de fibra óptica com enlaces baseados em cabos coaxiais. Esse tipo de cabeamento é amplamente utilizado para a distribuição de sinal de TV, incluindo por empresas do ramo de TV por assinatura, e possui boas características para a transmissão de dados. Isso fez com que muitas empresas que atuavam exclusivamente nesse ramo passassem a oferecer também serviço de acesso à Internet, já que não havia investimento necessário para levar o cabeamento ao endereço do cliente.

Da mesma forma que o meio físico é compartilhado entre ligações telefônicas e dados no DSL, no HFC os dados são transmitidos em paralelo com os sinais dos canais de televisão. Uma diferença, no entanto, é que o cabeamento de telefone é exclusivo de um certo usuário, enquanto o de TV é tipicamente compartilhado por vários: por exemplo, um único cabo chega a um edifício e, através de divisores de potência, são criados "ramos" para cada um dos apartamentos. Isso faz com que o cabo coaxial em uma rede HFC seja um enlace compartilhado por vários usuários, levando também a uma divisão dos recursos físicos disponíveis. Esse cabeamento coaxial compartilhado conecta os clientes a uma central do ISP, a qual se conecta ao resto da Internet através de fibras ópticas.

### Celular

Nas duas últimas décadas, outra família de tecnologias de acesso que vem ganhando muita popularidade é a das tecnologias de comunicação de dados por redes celular. As terceira, quarta e quinta gerações da telefonia celular suportam nativamente a transmissão de dados e proveem um nível de flexibilidade ao usuário impossível nas tecnologias cabeadas. Há também a facilidade de disseminação do serviço, dado que não é necessária a instalação de cabeamento até o endereço do cliente.

## Tecnologias LAN

Se as tecnologias WAN se preocupam com a comunicação em longas distâncias, as tecnologias LAN (*Local Area Network*) são voltadas para redes de abrangência menor. É o caso das redes que interligam equipamentos dentro de uma residência ou em uma instituição de pequeno a médio porte. Em uma rede doméstica, por exemplo, é comum hoje o emprego do Wi-Fi, uma tecnologia sem fio para comunicações de algumas dezenas de metros com taxas de transmissão típicas na casa das dezenas ou centenas de Mb/s (embora "versões" mais recentes permitam taxas na casa dos Gb/s). Em ambientes institucionais, como empresas e universidades, é comum a utilização do Ethernet, uma tecnologia cabeada que atualmente suporta taxas de vários Gb/s.

## PANs, BANs, RANs, MANs, ...

Além de WAN e LAN, há outras nomenclaturas para classificar tecnologias de comunicação de acordo com a sua abrangência. Por exemplo, uma PAN (*Personal Area Network*) é uma rede composta por dispositivos pessoais de um usuário, como um *smartphone*, um fone de ouvido ou um *smartwatch*. Tecnologias de comunicação para esse tipo de rede, como o Bluetooth, geralmente envolvem enlaces de curto alcance. Já as BANs (*Body Area Network*) são redes de abrangência corporal, tipicamente empregadas para a comunicação de dispositivos médicos acoplados ao corpo, como sensores e atuadores. Nesse caso, as distâncias típicas dos enlaces são ainda mais curtas. Do outro lado do espectro, existem as redes de abrangência metropolitana (MAN) e regional (RAN), com enlaces bem mais longos.