# SMTP

O protocolo SMTP é parte fundamental da aplicação de e-mail na Internet. Ele é responsável pela **transmissão** de mensagens de e-mail --- em oposição à **leitura** dos e-mails por parte do receptor, que é viabilizada por outros protocolos.

Assim como no HTTP, o SMTP é baseado em mensagens texto. Isso traz os mesmos benefícios e problemas que no caso do HTTP: maior legibilidade e facilidade de implementação e depuração das aplicações, ao custo de uma menor eficiência na representação das informações trocadas --- em termos de tamanho. Nesse material, exploraremos essa característica do SMTP para estudar em mais detalhes esse protocolo. Em particular, veremos alguns exemplos e experimentos com interações entre cliente e servidor SMTP.

## Um Exemplo de Interação SMTP

Começaremos esse aprofundamento com a análise de uma interação SMTP hipotética. Na seção seguinte, veremos uma demonstração utilizando um servidor SMTP real.

Nesse exemplo, adaptado do material do livro-texto usado na disciplina, assumiremos que uma pessoa chamada Alice deseja enviar um e-mail para outra pessoa chamada Bob. O e-mail da Alice é `alice@crepes.fr`, enquanto Bob tem o endereço de e-mail `bob@hamburger.edu`.

O processo começa com a composição da mensagem de e-mail por parte de Alice. Muito provavelmente isso será feito através de algum cliente de e-mail --- seja um serviço de *webmail*, seja um software executado localmente no computador de Alice. Mais formalmente, esse *software* cliente é chamado de *user agent*.

Em todo caso, quando a mensagem está pronta para envio, o *user agent* da Alice abrirá uma conexão TCP destinada ao servidor de e-mail da própria Alice --- o servidor responsável pelo serviço de e-mail do domínio `crepes.fr` ---, muito provavelmente na porta 25, que é a porta padronizada para o SMTP. Nesse ponto, o *user agent* da Alice fará a comunicação com o servidor usando as mensagens previstas no protocolo SMTP. Assumindo que não haja nenhum problema nessa iteração --- discutiremos alguns possíveis problemas ao final desse material ---, o servidor de e-mail da Alice passará a ficar responsável pelo envio da mensagem até o servidor de Bob.

Em algum momento no futuro[^SMTPFila], o servidor de e-mail da Alice tentará contactar o servidor de e-mail de Bob para transferir a mensagem. Para isso, o servidor de Alice abre uma conexão TCP com destino ao servidor de e-mail de Bob, provavelmente na porta 25, e inicia uma nova interação SMTP. Observe, portanto, que o envio de um único e-mail pode incluir --- e normalmente inclui --- múltiplas interações SMTP. Além disso, é interessante notar que, na primeira interação, o servidor de e-mail da Alice atuava efetivamente como servidor. Por outro lado, nessa segunda interação, ele atua como um cliente.

[^SMTPFila]: Servidores de e-mail contém uma fila das mensagens recebidas para encaminhamento. Quando exatamente a mensagem desse exemplo seria processada depende, entre outros fatores, do tamanho dessa fila.

Na listagem abaixo, vemos um exemplo hipotético de como essa interação SMTP ocorre. As linhas prefixadas de `S: ` denotam mensagens enviadas do servidor para o cliente. Já as linhas prefixadas por `C: ` denotam mensagens no sentido oposto.

```
S: 220 hamburger.edu
C: HELO crepes.fr
S: 250 Hello crepes.fr, pleased to meet you
C: MAIL FROM: <alice@crepes.fr>
S: 250 alice@crepes.fr... Sender ok
C: RCPT TO: <bob@hamburger.edu>
S: 250 bob@hamburger.edu ... Recipient ok
C: DATA
S: 354 Enter mail, end with ".". on a line by itself
C: Do you like ketchup?
C: How about pickles?
C: .
S: 250 Message accepted for delivery
C: QUIT
S: 221 hamburger.edu closing connection
```

Uma primeira diferença clara entre SMTP e HTTP está na quantidade e tamanho das mensagens trocadas. Toda essa iteração mostrada acima diz respeito à transferência de uma única mensagem de e-mail. Entretanto, ao contrário do que ocorre no HTTP, que utiliza um único par requisição-resposta para transferir cada objeto, no SMTP há a troca de várias mensagens. Cada mensagem, por outro lado, é relativamente pequena: a título de ilustração, a mensagem mais longa desse exemplo não chega a 50 caracteres ASCII.

Outro aspecto que pode ser observado é que as mensagens do SMTP são bastante *human-readable*: não só o protocolo é baseado em mensagens texto, como há várias frases com sentido completo em inglês (*e.g.*, "*pleased to meet you*", "*Enter mail, end with ".". on a line by itself*"). Repare, por outro lado, que todas as mensagens enviadas pelo servidor são prefixadas de um código numérico. De forma análoga, com exceção do conteúdo da mensagem em si, todas as mensagens do cliente são iniciadas com algum tipo de identificador (*e.g.*, `DATA`, `QUIT`, `MAIL FROM`). Isso indica que o objetivo das porções mais descritivas das mensagens, escritas em linguagem natural, não é a interpretação pelos programas cliente e servidor. Ao contrário, essa interpretação do significado de cada mensagem é baseada nos códigos numéricos e nos identificadores de tipo.

Começando pela primeira mensagem enviada na interação, notamos que ela é enviada do servidor para o cliente. Trata-se apenas de uma mensagem de boas-vindas, em que o servidor se apresenta como o servidor de e-mail responsável pelo domínio fictício `hamburger.edu`. Igualmente, na mensagem subsequente o cliente também se apresenta enviando o comando `HELO` seguido do seu nome de domínio. Na mensagem seguinte, o servidor confirma que recebeu a mensagem de identificação anterior utilizando o código de resposta 250 [^SMTPCodigoDeResposta]. 

[^SMTPCodigoDeResposta]: De maneira análoga ao que ocorre no HTTP, as respostas do servidor SMTP sempre contém um código numérico de *status*. Números entre de 200 a 299 indicam códigos de sucesso. Há outras faixas para denotar outras situações como, por exemplo, códigos de erro. Nesse material, não detalharemos os vários possíveis códigos retornados.

Após essa fase inicial de apresentações, a interação passa para uma fase na qual o cliente pode transferir uma ou mais mensagens de e-mail para o servidor. No exemplo acima, há a transferência de uma única mensagem e isso ocorre da linha 4 à linha 13 (inclusive). Essa fase começa com a especificação do remetente por parte do cliente. Isso é feito com o comando `MAIL FROM`, no qual o cliente especifica o endereço de e-mail do remetente. Nesse ponto, o servidor pode realizar algum tipo de verificação desse remetente e, estando de acordo, ele envia uma resposta com código 250. Em seguida, o cliente utiliza o comando `RCPT TO` para identificar o endereço de e-mail do destinatário. Mais uma vez, o servidor realiza verificações --- *e.g.*, esse usuário existe? --- e, nesse exemplo, envia uma nova resposta de sucesso.

Nesse ponto, o cliente utiliza o comando `DATA` para sinalizar que deseja começar a enviar o conteúdo da mensagem. Embora o código retornado na pelo servidor não esteja na faixa de 200 a 299, esse código em particular não representa um erro. Na verdade, o código 354 indica apenas que o servidor está de acordo com o início da transferência do conteúdo da mensagem e solicita que o cliente prossiga.

Nas duas linhas subsequentes, o cliente faz justamente isso: as *strings* `Do you like ketchup?` e `How about pickles?` correspondem ao conteúdo do e-mail transferido, e não a mensagens do protocolo SMTP. Repare que o servidor não confirma o recebimento de cada linha da mensagem. Ao contrário, ele simplesmente espera que o cliente conclua o envio de todo o conteúdo.

Mas como o servidor sabe quando a mensagem termina? A resposta para essa pergunta está na própria mensagem descritiva provida na resposta do servidor ao comando DATA. Essa mensagem diz ao cliente que ele deve marcar o final da mensagem com uma linha contendo apenas um caractere "`.`" sozinho[^PontoSozinho].

[^PontoSozinho]: E se, por acaso, a mensagem contiver um único ponto sozinho em uma linha? A RFC 5321 provê a solução na Seção 4.5.2. De forma simplificada, a RFC especifica que o cliente deverá verificar o conteúdo da mensagem criada pelo usuário e, se detectar uma linha começando pelo caractere "`.`", deverá adicionar outro ponto ao início da linha; o servidor, por sua vez, ao perceber uma linha iniciada por dois caracteres "`.`" consecutivos, deverá remover um deles.

Após o cliente enviar esse marcador de fim da mensagem, o servidor responde com o código 250, indicando que aceitou a mensagem para envio --- em certas situações, o servidor pode rejeitar uma mensagem. Nesse ponto, se o cliente possui mais mensagens a serem enviadas por aquele servidor, ele deve repetir o mesmo processo, desde o comando `MAIL FROM`. Um número arbitrário de mensagens podem ser transferidas em uma mesma interação SMTP.

Nesse exemplo em particular, o cliente não deseja enviar transferir outras mensagens. Por isso, após receber a resposta de aceite da mensagem por parte do servidor, o cliente envia o comando `QUIT`, indicando que deseja encerrar a interação. O servidor, por sua vez, confirma o encerramento enviando uma resposta com código 221. Nesse ponto, a conexão TCP pode ser encerrada.

## Experimentando com o SMTP

Agora que estamos familiarizados com os tipos de mensagens utilizadas em uma interação SMTP típica, podemos fazer alguns experimentos. Em particular, tentaremos realizar uma conexão a um servidor de e-mail real e tentaremos enviar um e-mail para uma conta de um usuário existente. Para isso, assim como no material referente a requisições HTTP, utilizaremos o programa `telnet`, que nos permitirá digitar os comandos a serem enviados ao servidor e visualizar as respostas correspondentes de forma interativa.

Nesse exemplo, enviaremos um e-mail de teste para um usuário de um serviço de e-mail popular. A interação pode ser vista no vídeo abaixo:

![](videos/DemoSMTPLowerRes.mov){}

Repare que a demonstração acima começa com o estabelecimento da conexão com o servidor de e-mail do destinatário:

```
telnet mta6.am0.yahoodns.net 25
```

Foge ao escopo desse material entender como o nome do servidor foi obtido. Isso ficará mais claro ao estudarmos o funcionamento do DNS. 

De toda forma, o servidor aceita a conexão e se apresenta. Em seguida, o cliente também se apresenta, especificando um nome de domínio fictício. Mesmo assim, o servidor responde de forma positiva e a interação prossegue.

O cliente, então, começa a enviar as informações sobre a mensagem a ser transferida, começando pelos endereços do destinatário e do remetente. Nesse exemplo, o destinatário corresponde a uma conta de e-mail real desse servidor, mas o remetente é, novamente, fictício.

Desse ponto em diante, a interação entre cliente e servidor nessa demonstração se torna bastante similar àquela apresentada no exemplo da seção anterior. No final da interação, o servidor aceita a mensagem e o cliente envia o comando QUIT, encerrando a conexão.

Nesse ponto do vídeo, mostra-se o *webmail* do destinatário da mensagem. Em particular, o vídeo mostra que a mensagem foi, de fato, recebida pelo usuário --- embora tenha sido colocada na pasta de *spam*. 

Outra observação interessante é que, no corpo do e-mail exibido pelo webmail a linha imediatamente subsequente à frase "Abaixo, uma linha com apenas um ponto:" contém um único ponto, ao invés de dois como ocorre no conteúdo bruto enviado para o servidor. Isso mostra justamente a necessidade de codificação especial, quando desejamos incluir no e-mail uma linha com um único ponto --- que, de outra forma, denotaria o final da mensagem.

## Formato de uma Mensagem de E-mail

Na demonstração do vídeo da seção anterior, é interessante notar que metadados, como o assunto da mensagem, são exibidos de corretamente pelo webmail. Mas de onde o webmail tirou essa informação de assunto? Se compararmos o conteúdo da mensagem enviado nesse exemplo com o conteúdo da mensagem do primeiro exemplo, podemos notar algumas linhas peculiares:

```
To: Fernanda <nandagooliveira@yahoo.com.br>
From: Teste <teste@teste>
Subject: E-mail de teste
```

Assim como uma requisição HTTP, uma **mensagem** de e-mail pode conter cabeçalhos, que especificam metadados relativos a como essa mensagem é interpretada pelos *user agents*. Note que esses cabeçalhos **não são do SMTP, mas sim do e-mail em si**. Em particular, a RFC 5322 define o formato de uma mensagem de e-mail, incluindo a previsão para esses e outros cabeçalhos[^OutrosCabecalhos].

[^OutrosCabecalhos]: Na parte final do vídeo, solicita-se que o *webmail* exiba a versão bruta da mensagem. Note como há outros cabeçalhos, além daqueles enviados pelo cliente. Servidores de e-mail geralmente adicionam vários outros cabeçalhos com informações sobre quando e como aquela mensagem foi recebida.

Note ainda que os campos de cabeçalho `To` e `From` da mensagem são independentes dos comandos `MAIL FROM` e `RCPT TO` do SMTP. Isso significa que poderíamos ter especificado outros valores quaisquer para os campos `To` e `From` na mensagem em si, e essa ainda seria entregue ao usuário identificado pelo endereço de e-mail no comando `RCPT TO`. A diferença estaria apenas nas informações exibidas pelo webmail para esses campos.

Ainda de forma análoga ao que ocorre em uma mensagem HTTP, os cabeçalhos de uma mensagem de e-mail devem ser terminados por uma linha em branco. Após essa linha em branco, começa o corpo da mensagem. 

Um detalhe importante aqui é que o SMTP só suporta mensagens que usam caracteres ASCII. A tabela ASCII só contém 128 caracteres --- correspondendo aos bytes de valor 0 a 127, inclusive. Em particular, não existem caracteres acentuados na tabela ASCII. Dessa forma, duas perguntas importantes surgem:

1. Como podemos incluir caracteres acentuados em uma mensagem de e-mail?
2. Como podemos incluir conteúdos binários (*e.g.*, um arquivo PDF) em um e-mail?

De forma geral, a resposta para ambas as perguntas é a mesma: utilizamos algum esquema de codificação utilizando apenas caracteres ASCII para representar os caracteres acentuados e os conteúdos binários. Mais concretamente, podemos ver abaixo um trecho da versão bruta do corpo de uma mensagem de e-mail que contém ambos os elementos --- caracteres acentuados e um arquivo binário anexado:

```
--0000000000008262cf05af604081
Content-Type: text/plain; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

Esse =C3=A9 um teste de e-mail com a finalidade de ilustrar como caracteres
acentuados e dados bin=C3=A1rios s=C3=A3o representados em uma mensagem de =
e-mail,
dado que o SMTP s=C3=B3 consegue trabalhar com mensagens contendo caractere=
s
ASCII de 7 bits.

Repare o arquivo anexado.

--0000000000008262cf05af604081
Content-Type: text/html; charset="UTF-8"
Content-Transfer-Encoding: quoted-printable

<div dir=3D"ltr"><div>Esse =C3=A9 um teste de e-mail com a finalidade de il=
ustrar como caracteres acentuados e dados bin=C3=A1rios s=C3=A3o representa=
dos em uma mensagem de e-mail, dado que o SMTP s=C3=B3 consegue trabalhar c=
om mensagens contendo caracteres ASCII de 7 bits.</div><div><br></div><div>=
Repare o arquivo anexado.</div></div>

--0000000000008262cf05af604081--
--0000000000008262d105af604083
Content-Type: application/pdf; name="Aula5.pdf"
Content-Disposition: attachment; filename="Aula5.pdf"
Content-Transfer-Encoding: base64
Content-ID: <f_kf4ffk4b0>
X-Attachment-Id: f_kf4ffk4b0

JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFu
Zyhlbi1HQikgL1N0cnVjdFRyZWVSb290IDc2IDAgUi9NYXJrSW5mbzw8L01hcmtlZCB0cnVlPj4v
TWV0YWRhdGEgMTE0MSAwIFIvVmlld2VyUHJlZmVyZW5jZXMgMTE0MiAwIFI+Pg0KZW5kb2JqDQoy
IDAgb2JqDQo8PC9UeXBlL1BhZ2VzL0NvdW50IDE3L0tpZHNbIDMgMCBSIDExIDAgUiAxMyAwIFIg
MjQgMCBSIDI2IDAgUiAzMCAwIFIgNDQgMCBSIDQ2IDAgUiA1MCAwIFIgNTIgMCBSIDU0IDAgUiA2
MCAwIFIgNjIgMCBSIDY2IDAgUiA3MCAwIFIgNzIgMCBSIDc0IDAgUl0gPj4NCmVuZG9iag0KMyAw
...
```

As primeiras três linhas --- assim como outras linhas similares ao longo da mensagem --- foram introduzidas pelo *user agent* do *software* usado para compor a mensagem. Elas marcam o início de uma *parte* da mensagem. Esse conceito de partes permite, entre outras coisas, a inclusão de anexos em uma mensagem de e-mail. Basicamente, o corpo da mensagem é dividido em várias partes (*e.g.*, texto principal, uma parte para cada anexo), cada uma delimitada por um certo marcador. No exemplo acima, o *user agent* definiu o marcador `0000000000008262cf05af604081` como o delimitador do texto principal da mensagem. Já o arquivo anexado é delimitado pelo marcador `0000000000008262d105af604083`.

Além do marcador, o início de uma parte sempre especifica metadados que nos dizem como interpretar o seu conteúdo. No exemplo acima, o texto principal do corpo do e-mail foi enviado em duas versões diferentes: uma em texto plano e outra em HTML. Isso é informado nas linhas:

```
Content-Type: text/plain; charset="UTF-8"
```

e

```
Content-Type: text/html; charset="UTF-8"
```

Vamos nos concentrar no momento na versão de texto plano. Repare como as linhas acima especificam um *charset*, ou seja, uma codificação de caracteres. Em particular, nesse exemplo, utiliza-se a codificação UTF-8, que suporta caracteres acentuados. No entanto, caracteres UTF-8 podem conter bytes com valor acima de 127, o que não é permitido pelo SMTP. Para resolver esse problema, o *user agent* informa na linha subsequente que a mensagem utiliza um `Content-Transfer-Encoding` do tipo `quoted-printable`. Na prática, isso significa que bytes com valor acima de 127 são codificados usando apenas caracteres ASCII. Um exemplo pode ser visto logo na primeira linha do conteúdo em si:

```
Esse =C3=A9 um teste de e-mail com a finalidade de ilustrar como caracteres
```

A *string* `=C3=A9` na verdade denota o caractere "é" na codificação UTF-8. Mais especificamente, essa *string* indica que o próximo trecho do texto deve ser tratado como um caractere correspondente ao valor hexadecimal `C3A9`. Consultado uma tabela UTF-8, podemos ver que se trata justamente do caractere "é". Outro exemplo pode ser visto no trecho `e dados bin=C3=A1rios`: aqui, a *string* `=C3=A1` indica que devemos tratar esse trecho como o caractere UTF-8 correspondente ao valor hexadecimal `C3A1`. Uma rápida consulta a uma tabela UTF-8 revela que se trata do caractere "á", o que implica que esse trecho corresponde, na realidade, à *string* "e dados binários".

Por fim, repare agora na parte da mensagem delimitada pelo marcador `0000000000008262d105af604083`. Os metadados dessa parte são:

```
Content-Type: application/pdf; name="Aula5.pdf"
Content-Disposition: attachment; filename="Aula5.pdf"
Content-Transfer-Encoding: base64
Content-ID: <f_kf4ffk4b0>
X-Attachment-Id: f_kf4ffk4b0
```

Eles indicam que o conteúdo dessa parte é um PDF chamado "Aula5.pdf" (`Content-Type: application/pdf; name="Aula5.pdf"`), inserido no e-mail na forma de um anexo (`Content-Disposition: attachment`). A terceira linha de metadados especifica que esse conteúdo será representado utilizando uma codificação chamada de "base64".

Não faz parte do escopo desse material detalhar o funcionamento dessa codificação. No entanto, apenas para entendermos o exemplo, basta sabermos que a base64 representa cada sequência de 6 bits do conteúdo como um caractere ASCII dentro de um conjunto de 64 caracteres distintos --- letras maiúsculas, minúsculas, algarismos, além dos caracteres "+" e "/". Esses são justamente os caracteres vistos na representação do arquivo PDF em questão:

```
JVBERi0xLjcNCiW1tbW1DQoxIDAgb2JqDQo8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFIvTGFu
Zyhlbi1HQikgL1N0cnVjdFRyZWVSb290IDc2IDAgUi9NYXJrSW5mbzw8L01hcmtlZCB0cnVlPj4v
TWV0YWRhdGEgMTE0MSAwIFIvVmlld2VyUHJlZmVyZW5jZXMgMTE0MiAwIFI+Pg0KZW5kb2JqDQoy
IDAgb2JqDQo8PC9UeXBlL1BhZ2VzL0NvdW50IDE3L0tpZHNbIDMgMCBSIDExIDAgUiAxMyAwIFIg
MjQgMCBSIDI2IDAgUiAzMCAwIFIgNDQgMCBSIDQ2IDAgUiA1MCAwIFIgNTIgMCBSIDU0IDAgUiA2
MCAwIFIgNjIgMCBSIDY2IDAgUiA3MCAwIFIgNzIgMCBSIDc0IDAgUl0gPj4NCmVuZG9iag0KMyAw
...
```

## Spams e Restrições dos Servidores SMTP Modernos

No contexto do serviço de e-mail, um spam é definido genericamente como uma mensagem indesejada/não solicitada. Spammers geralmente enviam esse tipo de mensagem em grandes volumes. Além de constituir um inconveniente para os usuários do serviço de e-mail, o grande volume de spams gerados hoje na Internet causa problemas ao consumir recursos da rede e dos servidores de e-mail. Com isso, a prevenção de spams é hoje um desafio bastante relevante e grandes serviços de e-mail constantemente buscam novas formas de detectar e coibir esse tipo de mensagem.

De forma simplificada, podemos dividir os esforços para combater spams em duas fases: 

1. A análise de características da conexão para decidir se o servidor deve ou não aceitá-las *durante* a interação do SMTP.
2. A análise das mensagens para decidir como classificá-las --- spam ou não --- depois que a mensagem é aceita na interação do SMTP.

Um aspecto curioso no vídeo de demonstração acima é que a mensagem enviada, embora aceita pelo servidor durante a conexão SMTP, foi direcionada para a pasta de spams do usuário destinatário. Servidores de e-mail modernos são tipicamente configurados para passar todas as mensagens recebidas via SMTP por um software anti-spam que analisa características da mensagem para classificá-la. Essas características geralmente incluem metadados adicionados pelo próprio servidor SMTP, como o horário em que a mensagem foi recebida e o endereço IP ou nome do *host* que a enviou.

Há uma grande gama de abordagens para essa análise. Há, por exemplo, *softwares* que contém grandes bases de regras que descrevem elementos que geralmente são encontrados em mensagens de spam. Há também abordagens mais sofisticadas baseadas em inteligência artificial que são capazes de aprender ao longo do tempo o que constitui ou não um spam. Em geral, grandes serviços de e-mail utilizam essa segunda abordagem.

No vídeo de demonstração, em particular, havia vários elementos suspeitos na mensagem enviada. Por exemplo, o domínio fornecido tanto no endereço de e-mail do remetente, quanto no comando `HELO` do SMTP eram forjados, algo facilmente verificável por um *software* anti-spam.

Entretanto, é comum que servidores rejeitem mensagens suspeitas já durante a conexão SMTP. Por exemplo, certos servidores possuem restrições quando ao *host* do cliente: se o endereço do *host* não casa com o domínio informado no comando `HELO`, o servidor rejeita a mensagem. Alguns servidores podem ir um passo além e verificar se o *host* cliente corresponde ao servidor de e-mail daquele domínio --- uma informação que pode ser obtida via DNS. É comum também o uso de *blacklists* mantidas por diversos serviços na Internet que identificam a catalogam *hosts* com um histórico de enviar mensagens de spam.

Todos esses fatores dificultam uma execução bem-sucedida de um experimento como o mostrado no vídeo acima, principalmente quando o destinatário escolhido é usuário de um grande serviço de e-mail.