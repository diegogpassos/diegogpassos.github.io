# DNS

O DNS é um serviço essencial para o bom funcionamento da Internet atual. Sem ele, usuários seriam obrigados a, de alguma forma, conhecer os *hosts* com os quais desejam se comunicar pelos seus endereços IP, algo bem mais difícil de se decorar que os nomes de *host* sugestivos que geralmente são atribuídos na Internet.

A importância do DNS, no entanto, excede esse simples mapeamento de nomes e endereços IP. Na prática, o serviço de DNS viabiliza funcionalidades importantes, como o balanceamento de carga entre servidores de um mesmo serviço e a determinação de qual *host* é responsável por determinados serviços de um domínio.

Ao longo desse material, veremos várias demonstrações que ilustram essas e outras propriedades do DNS.

## Balanceamento de Carga

Com a popularização da Internet, o balanceamento de carga passou a ser uma estratégia importante adotada por vários serviços e aplicações. A ideia é manter vários servidores físicos capazes de servir uma mesma aplicação. À medida que novos clientes tentam acessar o sistema, eles são, de alguma forma, distribuídos automaticamente pelos vários servidores. É comum, ainda, que esses mecanismos identifiquem a posição geográfica aproximada do cliente e atribuam-no a um servidor que seja próximo. 

Há várias estratégias utilizadas na Internet para a implementação desse tipo de balanceamento --- muitas vezes, diversas estratégias são combinadas, provendo múltiplos níveis de balanceamento. Uma dessas possibilidades utiliza o DNS. Nesse caso, todos os servidores disponíveis --- *hosts* diferentes, cada um com seu endereço IP --- são associados a um mesmo nome de *host*. Quando um cliente realiza uma consulta ao DNS para resolver esse nome de *host* em um endereço IP, o próprio servidor DNS pode responder com o endereço IP do servidor mais *adequado* --- *e.g.*, com menor carga ou mais próximo geograficamente do cliente.

No vídeo abaixo, vemos um exemplo disso na prática:

![](videos/balanceamento.mp4){}

Nessa demonstração, vemos dois terminais de linha de comando. Enquanto o terminal da esquerda é executado no computador local, o da direita corresponde a uma sessão de *shell* remoto em outro *host*. Em um primeiro momento, no terminal da esquerda, executa-se um comando `ping` especificando-se como destino o *host* `www.google.com`. Antes de efetivamente enviar seus pacotes, o `ping` precisa resolver esse nome no endereço IP associado. A saída do comando mostra o resultado desse processo de resolução: o IP `172.217.30.4`.

Na sequência da demonstração, o mesmo comando é repetido no terminal da direita --- *i.e.*, aquele executado no servidor. Embora o resultado seja similar --- o *ping* é bem-sucedido ---, é interessante observar que essa segunda execução obtém um endereço diferente como resultado da resolução DNS: `172.217.29.100`. Essa diferença é justamente uma manifestação do balanceamento de carga, nesse caso auxiliado pelo DNS.

## Aliases

Na seção anterior, vimos um exemplo de um mesmo nome associado à diversos IPs diferentes. O DNS também dá suporte à situação oposta: um mesmo IP associado a múltiplos nomes. Mais especificamente, um *host* possui um **nome canônico** --- algo como um nome "oficial" --- e, possivelmente, vários apelidos (ou *aliases*, em inglês).

O vídeo abaixo mostra um exemplo:

![](videos/aliases.mp4){}

Nele, vemos duas execuções do comando `ping`: uma destinada ao *host* `mesbla.midiacom.uff.br` e outra destinada ao *host* `www.midiacom.uff.br`. O ponto mais importante a se observar aqui são os endereços IP reportados pelo `ping` resultantes do processo de resolução DNS: o mesmo IP é retornado em ambas as execuções, ilustrando que ambos os nomes estão associados a um mesmo *host*.

Apelidos são bastante usados para prover nomes potencialmente significativos para os vários contextos em que um determinado *host* pode ser referenciado. No exemplo acima, o *host* `mesbla.midiacom.uff.br` hospeda o *site* principal do domínio `midiacom.uff.br`. Historicamente, servidores *web* costumam receber o nome `www`. Assim, os administradores desse domínio optaram por criar um *alias* `www` apontando para o *host* `mesbla`. Uma vantagem de se fazer isso é que, se em determinado momento, o servidor *web* for migrado para outro *host*, o *alias* será removido --- ou, mais precisamente, atribuído ao outro *host* ---, mas a máquina antiga manterá seu nome canônico. Além disso, se um mesmo *host* é servidor de várias aplicações diferentes --- *web* e e-mail, por exemplo --- podemos atribuir *aliases* diferentes para essa mesma máquina associados a cada serviço particular --- *e.g.*, `www.midiacom.uff.br` e `mail.midiacom.uff.br`. Além de mais descritivos, esses apelidos podem ser alterados independentemente caso um ou mais serviços sejam migrados para um novo *host*.

## TLD

Nomes de *host* na Internet são estruturados em níveis associados à estrutura de domínios e sub-domínios. No nível mais alto dessa hierarquia, estão os *Top-Level Domains*, ou TLDs. Até alguns anos atrás, a lista de TLDs da Internet era relativamente restrita. Em 2008, o ICANN[^ICANN] iniciou um processo para a introdução de novos gTLDs (*generic TLDs*): domínios TLD de propósito geral, em oposição aos utilizados para denotar países ou classes específicas (*e.g.*, `.mil`, `.edu`). Em quatro anos, o ICANN recebeu cerca de 2000 pedidos de registros de gTLDs, vários dos quais foram efetivamente aceitos e implementados. Atualmente, há cerca de 1500 TLDs registrados na base da IANA.

[^ICANN]: O ICANN (*Internet Corporation for Assigned Names and Numbers*) é uma entidade responsável pela manutenção de uma série de bases de numerações e nomes utilizadas na Internet. Mais especificamente, a criação e gerência de TLDs e outros aspectos dos níveis mais altos do DNS são efetuados pela *Internet Assigned Numbers Authority* (IANA), uma organização sob a administração do ICANN.

A partir desse processo de introdução dos novos gTLDs, grandes empresas de diversos setores, como Google, Apple, Itau e Bradesco, conseguiram registrar um ou mais TLDs. Dessa forma, essas empresas tem autonomia para atribuir nomes como `internetbanking.itau` ou `about.google`, por exemplo, embora o uso desse tipo de nome ainda seja relativamente raro.

Mesmo assim, é possível identificar ocorrências desses novos gTLDs na Internet. O vídeo abaixo, por exemplo, ilustra o uso de três TLDs pela Google: o `.com`, o `.gle` e o `.google`:

![](videos/TLD.mp4){}

No início do vídeo, vemos uma tentativa de acessar a URL `http://goo.gle/`. Essa URL é digitada na barra de endereços de um *browser* que, em seguida, abre a página inicial da ferramenta de busca da Google. Note que quando a página é renderizada a URL na barra de endereços muda: ela deixa de ser `http://goo.gle/` e passa a ser `https://www.google.com/`.

Repare, no entanto, que essa alteração não foi feita de maneira autônoma pelo *browser* --- *i.e.*, o *browser* não assumiu que o usuário cometeu um erro de digitação ao tentar digitar `google`. Isso pode ser observado por volta de 0:28: o *browser* efetivamente fez uma requisição do tipo `GET` para um *host* denominado `goo.gle`, mas recebeu como resposta um código de *status* `301`. Através desse código, o servidor em `goo.gle` indica ao *browser* que o conteúdo requisitado foi movido permanentemente para outra URL. Conforme mostrado em 0:33, essa URL é informada nos cabeçalhos da resposta: `https://www.google.com/`. É esse pedido de redireção que faz com que o *browser* altere a URL na barra de endereços. De posse dessa nova localização para o objeto requisitado, o *browser* gera uma série de requisições para obter todos os elementos necessários à renderização da página. 

Uma outra forma de vermos que o TLD `.gle` existe --- e, em particular, que ele contém um *host* chamado `goo` --- é mostrada logo a seguir no vídeo. Usando o comando `host`, executa-se uma consulta ao DNS relativa ao *hostname* `goo.gle`. Essa consulta é bem-sucedida, retornando dois endereços IP associados a esse nome. Para efeito de comparação, o vídeo mostra também o mesmo tipo de consulta, mas agora para o *hostname* `www.google.com`. Note que essa segunda consulta também é bem-sucedida, mas retorna outro endereço IP, sugerindo que provavelmente se trata de *hosts* diferentes.

Como um último experimento, o vídeo mostra ainda uma tentativa de comunicação --- através do comando `ping` --- com um *host* denominado `about.google`. Repare que o *ping* funciona: o comando consegue resolver o nome no endereço IP `216.239.32.29` e obtém respostas desse *host*. Além disso, o vídeo mostra o resultado de uma consulta DNS a esse *hostname* utilizando o comando `host` que, novamente, confirma a existência desse nome.

De fato, os domínios `.gle` e `.google` são TLDs registrados pela IANA. Seus registros foram solicitados pela Google no âmbito do processo de expansão dos gTLDs iniciado em 2008. O TLD `.gle` é usado pela Google para gerar versões pequenas URLs. Para isso, a Google registrou um *host* denominado `goo` dentro desse domínio. Já o TLD `.google` contém alguns *hostnames* relativos, principalmente, a sites com informações institucionais da empresa.
 
## Registrando um Domínio

A criação de novos domínios é uma atividade relativamente comum na Internet, principalmente nos níveis mais baixos da hierarquia. Por exemplo, quando uma determinada entidade é criada, ela pode ter o interesse em criar um site e/ou outros serviços institucionais que sejam hospedados sob um domínio próprio, como forma de reforçar a marca.

Para que um novo domínio seja criado, o primeiro passo é contactar a entidade responsável pelo gerenciamento do domínio dentro do qual se deseja criar o novo sub-domínio. Por exemplo, no Brasil, o domínio `.com.br` é gerido pelo *Registro.br*. Além dos aspectos burocráticos associados ao registro de um sub-domínio --- *e.g.*, valores pagos, documentos comprobatórios --- , é necessário fornecer uma série de dados técnicos para que o registro seja bem sucedido. Nessa seção, veremos quais são as principais informações necessárias, utilizando como exemplo o domínio `uff.br`.

Para ilustrar esses conceitos, utilizaremos a pequena demonstração vista no vídeo abaixo:

![](videos/RegistroDeDominio.mp4){}

O vídeo utiliza uma ferramenta de linha de comando denominada `dig` capaz de realizar vários tipos de consultas ao DNS. A primeira consulta realizada busca registros do tipo `NS` associados ao nome `uff.br`. A saída impressa pelo `dig` é um pouco verbosa, mas o trecho importante são as três linhas da *ANSWER SECTION* (a seção de resposta). Elas mostram três registros encontrados: cada um corresponde ao ***hostname* de um servidor DNS autoritativo para o domínio `uff.br`**.

Esse é justamente o primeiro passo para o registro de um novo domínio: cadastram-se um ou mais servidores DNS autoritativos para o novo domínio. Esses registros são armazenados no servidor DNS autoritativo do domínio imediatamente acima na hierarquia --- no exemplo do vídeo, o TLD `.br`. Esse tipo de informação é armazenada em um registro do tipo `NS`. É importante notar que o valor armazenado em um registro `NS` é o **nome** do *host* que atua como servidore autoritativo do domínio em questão, e não seu endereço IP.

Por esse motivo, o próximo passo para o registro do novo domínio é criar registros do tipo `A` mapeando os nomes de cada servidor de DNS registrado no passo anterior ao seu respectivo IP. No vídeo acima, isso é ilustrado a partir do instante 0:19, quando uma segunda consulta é realizada, agora buscando-se um registro do tipo `A` associado ao nome `server.uff.br`. Essa consulta retorna o endereço IP `200.20.0.18`. Note que esse registro é armazenado também pelo servidor do domínio imediatamente acima na hierarquia (no exemplo do vídeo, o `.br`).

A partir desse ponto, já é possível a adição de *hostnames*, sub-domínios ou outros tipos de registro no âmbito do domínio recém-criado. No entanto, a criação desses elementos é feita diretamente nos servidores de DNS autoritativos do novo domínio, não necessitando mais de inclusões de registros nos servidores DNS do domínio imediatamente acima.

## DNS e E-mail

Há uma funcionalidade interessante e essencial do DNS que, por vezes, passa despercebida: o mapeamento de servidores de e-mail. Dentre os vários tipos de registro suportados pelo DNS, está o tipo `MX`. Registros do tipo `MX` associam um **nome de domínio** ao **nome de um servidor** responsável pelo serviço de e-mail daquele domínio. É comum a existência de diversos servidores redundantes de e-mail em um mesmo domínio. Nesse caso, serão encontradas múltiplas entradas do tipo `MX` para aquele domínio.

Conforme ilustrado no vídeo abaixo, isso é útil para descobrirmos qual é o servidor de e-mail do destinatário de uma mensagem para o posterior estabelecimento de uma conexão SMTP. Suponha, por exemplo, que o servidor de e-mail de um determinado remetente precisa enviar uma mensagem destinada ao endereço `dpassos@ic.uff.br`. Isolando o domínio `ic.uff.br` do resto do endereço, podemos fazer uma consulta a esse nome filtrando por domínios do tipo `MX`.

![](videos/MX.mp4){}

Conforme mostrado no vídeo, essa consulta retorna vários resultados, os nomes de 7 servidores alternativos. Podemos selecionar um desses nomes e realizar uma consulta do tipo `A`, obtendo, assim, o endereço IP do servidor desejado.

Apenas a título de ilustração, no vídeo acima, utiliza-se o comando `telnet` para abrir uma conexão TCP para a porta 25 do *host* associado ao endereço IP obtido. Quando a conexão é estabelecida, o servidor imediatamente envia uma mensagem de apresentação, comprovando que se trata de fato de um servidor SMTP.

É interessante notar no exemplo do vídeo que os nomes dos servidores de e-mail do domínio `ic.uff.br` estão todos no domínio `googlemail.com`. De fato, atualmente o IC terceiriza o seu serviço de e-mail que é efetivamente implementado pela Google. Isso é uma alternativa cada vez mais comum e ilustra uma propriedade interessante dos registros MX: o servidor de e-mail de certo domínio não precisa possuir um *hostname* daquele domínio.


## Respostas Autoritativas e Não-Autoritativas

Finalizando esse material, nessa seção discutiremos os conceitos de respostas *autoritativas* e *não-autoritativas*.

Uma das características marcantes do DNS é sua natureza distribuída: trata-se de uma grande base de dados na qual porções das informações armazenadas são divididas pelos vários servidores existentes na Internet. Em um primeiro nível, a maneira como esses dados são distribuídos está intimamente ligada à hierarquia de domínios e sub-domínios. Em particular cada (sub-)domínio contém um ou mais servidores DNS **autoritativos** responsáveis por armazenar entradas pertinentes àquele domínio específico.

Entretanto, como forma de evitar repetidas consultas aos servidores autoritativos, é comum que servidores de DNS façam *cache* de registros de outros domínios. Assim, se um cliente deseja resolver um determinado nome, é possível que um servidor DNS da sua rede local seja capaz de responder, ao invés de necessariamente ser obrigado a consultar o servidor autoritativo do domínio associado ao *host*.

A existência dessas *caches* distribuídas pelos vários servidores de DNS da Internet é, certamente, benéfica em geral, mas também traz alguns inconvenientes. O maior problema é a possibilidade de inconsistências nas informações armazenadas por diferentes servidores. Isso pode ocorrer quando uma entrada é alterada no servidor autoritativo de um domínio --- por exemplo, para mapear o nome `www` para um *host* diferente quando da alteração de um servidor *web*. Quando isso ocorre, é possível que o mapeamento antigo ainda esteja armazenado em *caches* de servidores DNS espalhados pelo mundo, que, durante algum tempo[^cacheValidade], entregarão respostas incorretas quando consultados.

[^cacheValidade]: Quando um servidor DNS armazena uma entrada em *cache*, um tempo de validade é especificado. Após esse tempo, a informação é expurgada e, se necessário, o mapeamento é novamente consultado a partir de outro servidor.

Isso afeta particularmente os vários serviços de *nome de host dinâmico* na Internet atualmente. Esses serviços permitem que *hosts* que possuam endereço IP dinâmico --- *i.e.*, que não mantém um mesmo endereço permanente, algo comum para usuários residenciais, por exemplo --- sejam conhecidos por um *hostname* fixo na Internet. Assim, independentemente do seu endereço IP atual, esse *host* pode ser "encontrado" por outros *hosts* da Internet através de uma simples consulta DNS.

Esses serviços fornecem ao usuário um pequeno programa que monitora permanentemente o endereço (dinâmico) do *host*. Toda vez que o programa detecta uma mudança no endereço, ele contacta o servidor do serviço e comunica a alteração. Isso dispara uma alteração no registro que faz o mapeamento entre aquele nome de *host* e o seu IP atual no servidor DNS autoritativo do domínio mantido pelo serviço. Por alguns minutos --- ou mesmo horas, a depender da agressividade da política de cache utilizada nos vários servidores de DNS do mundo --- é possível que a versão anterior desse mapeamento permaneça na *cache* desses outros servidores, impossibilitando acesso ao *host*.

É nesse contexto que surge a importância do conceito de **resposta autoritativa**. Uma resposta autoritativa é aquela gerada pelo servidor autoritativo do domínio referente à consulta realizada. O vídeo abaixo ilustra esse conceito:

![](videos/RespAutoritativa.mp4){}

No início do vídeo, utiliza-se o comando `dig` para fazer uma consulta por um registro do tipo `A` referente ao nome `www.uff.br`. O `dig` retorna uma resposta contendo o mapeamento entre esse nome e o endereço IP `200.20.0.18`. Entretanto, consultando os cabeçalhos da resposta recebida, vemos que o servidor especificou o campo `authority` com valor 0. Isso significa que o servidor que está respondendo --- nesse caso, um servidor DNS local usado apenas para intermediar os processos de resolução do *host* utilizado no vídeo --- está declarando que ele **não é o** servidor autoritativo do domínio `uff.br`. Dessa forma, é *possível* que a resposta recebido esteja defesada --- *i.e.*, que o mapeamento tenha sido recentemente alterado no servidor autoritativo.

É possível verificar essa resposta com o próprio servidor autoritativo. Para isso, basta enviarmos a requisição diretamente para esse servidor, ao invés de enviarmos para o servidor local. Isso é feito na sequência do vídeo, quando uma nova execução do comando `dig` é feita utilizando o parâmetro `@200.20.0.18`. Esse IP especificado após o caractere `@` é o IP de um dos servidores autoritativos do domínio `uff.br` --- você consegue lembrar como podemos obter essa informação? --- e vemos que o resultado do comando é, novamente, a obtenção de um mapeamento entre o nome `www.uff.br` e o IP `200.20.0.18`. No entanto, agora temos certeza de que esse mapeamento é o correto atualmente, porque essa resposta é autoritativa.