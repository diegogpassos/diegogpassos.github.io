# Requisições HTTP

O HTTP tem sido, há vários anos, o protocolo de aplicação responsável pela maior parcela do tráfego total da Internet. O intuito original desse protocolo era dar suporte à aplicação *web*, mas devido a sua funcionalidade básica de transferência de objetos entre dois *hosts*, o HTTP é hoje usado em aplicações mais sofisticadas, como o *streaming* de de vídeo e áudio.

O objetivo desse material é aprofundar o estudo do funcionamento do HTTP. Em particular, nesse material veremos exemplos práticos de requisições e respostas HTTP. Ao longo desses exemplos, destacaremos alguns detalhes relevantes de como esse protocolo funciona e de como ele evoluiu através dos anos.

## Mensagens em Formato Texto

Uma característica interessante do HTTP é o emprego de mensagens em formato texto. Ao contrário de vários outros protocolos que utilizam formatos de pacotes/mensagens binárias, o HTTP representa suas informações como *strings* de caracteres textuais.

Formatos binários são mais eficientes, entre outros motivos por reduzirem a quantidade de bits necessários para representar determinada informação. Por exemplo, suponha que desejemos enviar o número inteiro 10 em uma mensagem transmitida entre dois *hosts* na Internet. Um protocolo que trabalha com mensagens binárias poderia representar esse número em base 2 com 4 bits: `1010`. Já um protocolo baseado em mensagens texto, como o HTTP, precisaria de dois caracteres textuais para a mesma informação. Usando a codificação ASCII, por exemplo, cada um desses caracteres ocuparia ao menos 7 bits[^7bits], totalizando pelo menos 14 bits --- 3,5 vezes mais que no caso binário. 

[^7bits]: Na prática, na Internet, cada caractere ASCII normalmente ocupa 1 byte completo, agravando ainda mais a situação.

Por outro lado, o uso de mensagens texto também traz uma série de vantagens. Uma delas é a facilidade de implementação e depuração do protocolo. A manipulação de *strings* é uma funcionalidade básica encontrada na enorme maioria das linguagens de programação. Por outro lado, nem toda linguagem tem suporte à manipulação de baixo nível de dados --- *i.e.*, no nível dos bits individuais. Além disso, se queremos saber se nossa implementação está gerando corretamente os pacotes de um protocolo baseado em mensagens texto, podemos simplesmente imprimi-las e inspecioná-las em um terminal. O mesmo não é tão trivial quando manipulamos mensagens binárias.

No âmbito de uma disciplina sobre Redes de Computadores, o uso de mensagens texto por parte do HTTP traz a vantagem adicional de nos permitir uma interação bem direta com o protocolo. Como veremos nas seções a seguir, podemos usar programas comumente instalados por padrão em sistemas operacionais para emular manualmente o funcionamento de um cliente HTTP --- *i.e.*, um *browser*.

Em particular, no restante desse material utilizaremos um programa chamado de `telnet` para executar uma série de demonstrações acerca do HTTP. À rigor, o `telnet` é um cliente de um outro protocolo de camada de aplicação homônimo. Esse protocolo era bastante popular há muitos anos atrás para a aplicação de *shell* remoto --- ou seja, a habilidade de interagir remotamente com um *prompt* de comando de um servidor via rede[^telnet]. No entanto, o telnet em si é um protocolo muito simples que basicamente se restringe a enviar cada caractere digitado pelo usuário no teclado para o *host* de destino e imprimir cada caractere recebido do *host* de destino. Essa funcionalidade permite que o programa `telnet` possa ser usado para interagir com implementações de outros protocolos baseados em mensagens de texto.

[^telnet]: Hoje, o telnet ainda é usado para esse propósito, mas sua aplicação é normalmente restrita a alguns nichos, como a interação com dispositivos locais que não possuem teclado e monitor. Um exemplo relativamente comum é a configuração de um comutador. Já a aplicação de *shell* remoto com servidores através da Internet pública é hoje muito mais comum através de um outro protocolo denominado SSH. A maior popularidade do SSH se dá por este incluir uma série de medidas de segurança ausentes no telnet.

Implementações do `telnet` são comumente encontradas instaladas por padrão na maior parte dos sistemas operacionais populares hoje em dia.

## Uma Requisição HTTP Simples

Como um primeiro experimento, faremos uma simples requisição de um objeto identificado pela URL `http://www.midiacom.uff.br/~diego/`. Essa URL pode ser quebrada nas seguintes porções:

- **Esquema** (`http://`): indica que o protocolo usado é o http.
- **Identificação do *host*** (`www.midiacom.uff.br`): indica que o objeto está armazenado por um servidor chamado `www.midiacom.uff.br`.
- **Camihno** (`/~diego/`): indica que, internamente ao servidor, o objeto está armazenado no caminho `/~diego/`.

O primeiro passo para executarmos essa requisição é estabelecermos uma conexão com o servidor. Para isso, usamos duas das três componentes da URL: o identificador do *host* nos diz a qual servidor devemos nos conectar; por outro lado, o esquema --- mais especificamente o fato do protocolo ser o HTTP --- nos diz implicitamente a porta do servidor a qual devemos nos conectar (a porta padrão do protocolo HTTP é a 80). Assim, podemos realizar a conexão com o servidor utilizando o seguinte comando:

```
telnet www.midiacom.uff.br 80
```

Se tudo deu certo, o `telnet` deve imprimir uma mensagem indicando que a conexão foi estabelecida. Algo como:

```
Trying 200.20.10.93...
Connected to mesbla.midiacom.uff.br.
Escape character is '^]'.
```

Após a conexão, no entanto, nada mais acontece. Na verdade, no HTTP, uma vez que cliente e servidor estão conectados, a iniciativa deve ser do cliente: ele deve formatar e enviar uma requisição. Do ponto de vista do `telnet`, no entanto, ele simplesmente passa a esperar que o usuário digite alguma coisa para ser enviada ao servidor[^Timeout].

[^Timeout]: Se você esperar bastante tempo --- *i.e.*, alguns minutos ---, em algum momento a conexão será encerrada por inatividade pelo servidor.

Assim, nesse ponto, precisamos redigir uma requisição HTTP. Lembre-se que requeremos que o servidor nos envie o conteúdo do objeto localizado em `/~diego/`. Para esse fim, uma requisição web mínima seria:

```
GET /~diego/ HTTP/1.1
Host: www.midiacom.uff.br


```

A primeira linha da requisição indica *o que queremos* do servidor. O `GET` indica o método desejado (*i.e.*, queremos obter o conteúdo do objeto). A especificação do método é seguida do caminho do objeto requisitado no servidor (nesse caso, `/~diego/`). Por fim, a primeira linha termina com a especificação da versão do protocolo HTTP que estamos utilizando. Essa especificação é importante porque um dos dois lados da comunicação pode, eventualmente, implementar uma versão mais recente do protocolo não suportada pelo outro lado. Assim, ao especificarmos a versão que estamos usando, evitamos que o servidor interprete de maneira incorreta determinada parte da mensagem se ele não suportá-la.

A partir da segunda linha, a requisição HTTP contém um número arbitrário de *linhas de cabeçalho*. As linhas de cabeçalho servem para modificar a maneira pela qual o servidor trata ou interpreta a requisição. Essas linhas sempre seguem o formato `chave: valor`, onde `chave` indica um identificador do cabeçalho e `valor` indica o valor que queremos atribuir. Nesse exemplo simples, usamos uma única linha de cabeçalho (a `Host`) que simplesmente indica ao servidor a qual *site* nossa requisição corresponde. Essa especificação é importante porque um mesmo servidor web pode servir múltiplos sites diferentes. Cada site define uma estrutura de diretórios diferente a partir da qual o objeto requisitado será buscado.

Por fim, note que há uma linha em branco ao final da requisição. Essa linha é **fundamental**: o protocolo HTTP indica que a seção de cabeçalhos da requisição deve sempre terminar com uma linha em branco. Isso possibilita ao servidor diferenciar o fim da requisição de uma situação em que a próxima linha de cabeçalho simplesmente demora um pouco para ser recebida. No `telnet`, criamos essa linha em branco simplesmente pressionando `<enter>` duas vezes ao final da segunda linha da requisição.

Ao enviarmos essa requisição para o servidor, a resposta recebida deve ser algo como:

```
HTTP/1.1 200 OK
Date: Thu, 03 Sep 2020 14:24:04 GMT
Server: Apache/2.4.6 (CentOS) PHP/5.6.40
Last-Modified: Thu, 09 Aug 2018 03:02:54 GMT
ETag: "59-572f7dd10cad0"
Accept-Ranges: bytes
Content-Length: 89
Vary: Accept-Encoding
Content-Type: text/html; charset=UTF-8
X-Cache: MISS from localhost
X-Cache-Lookup: MISS from localhost:3128
Via: 1.1 localhost (squid)
Connection: keep-alive

<META http-equiv="refresh" content="1;URL=https://sites.google.com/ic.uff.br/dpassos/">
```

Assim como fizemos para a requisição, vamos analisar cada parte dessa resposta:

1. A primeira linha informa o *status*, *i.e.*, ela indica se a requisição foi bem sucedida e, caso contrário, provê algum tipo de informação sobre o motivo da falha. Nesse caso, em particular, a requisição foi bem sucedida, o que é indicado pelo código de *status* 200. Repare que o servidor provê, ainda, uma descrição textual desse código de *status*: o código 200 corresponde ao *status* `OK`. Por fim, note que o servidor também especifica a versão do HTTP usada na sua resposta.
2. Assim como ocorre nas requisições, a linha de *status* é seguida de um número arbitrário de linhas de cabeçalho. O propósito é o mesmo: prover meta-informações que ajudem ou indiquem ao cliente como aquela resposta deve ser interpretada. Na prática, servidores web reais tendem a incluir um número grande de linhas de cabeçalho nas suas respostas. Aqui, destacaremos apenas algumas mais básicas:
	- `Last-Modified`: indica a data da última modificação do conteúdo do objeto no servidor.
	- `Content-Length`: indica o tamanho total da resposta em bytes.
	- `Content-Type`: indica o tipo de conteúdo do objeto retornado (nesse exemplo, trata-se de um arquivo texto, correspondendo a um código HTML, na codificação de caracteres UTF-8).
3. Como em toda mensagem HTTP, é obrigatório terminar as linhas de cabeçalho por uma linha em branco.
4. Ao contrário do que ocorreu na requisição, essa mensagem de resposta possui um **corpo**. O corpo da mensagem carrega os dados em si. No caso dessa resposta, isso corresponde ao conteúdo do objeto requisitado[^redirHTML]. Note que, em certos casos, requisições também podem conter dados enviados do cliente para o servidor --- *e.g.*, quando anexamos um arquivo a um e-mail em um serviço de *webmail*.

[^redirHTML]: O código HTML referente ao objeto requisitado é bastante simples: ele simplesmente sugere um redirecionamento para outra página. No entanto, isso não é relevante para os propósitos desse material.

Veja agora um pequeno vídeo desse mesmo exemplo:

![Exemplo de Requisição HTTP Simples](videos/RequisicaoSimples.mp4){}

## Persistência de Conexão

Nas versões iniciais do HTTP, um cliente necessitava abrir uma nova conexão para cada nova requisição que ele quisesse realizar para um mesmo servidor. Como o HTTP foi criado para aplicações web, isso se torna pouco prático e afetava negativamente o desempenho. Isso ocorre porque, em geral, um *browser* requisita o objeto relativo ao código HTML base de uma página que, por sua vez, faz referência a diversos outros objetos --- *e.g.*, imagens, *scripts*, arquivos CSS --- possivelmente hospedados no mesmo servidor. Ao invés de reaproveitar a mesma conexão para requisitar esses outros objetos, o cliente era obrigado a iniciar novas conexões, adicionando tempo à comunicação.

Para ilustrar isso, vamos refazer o experimento da seção anterior, com uma pequena modificação: ao invés de especificarmos a versão 1.1 do HTTP, vamos usar a versão 1.0 do protocolo. Para isso, basta mudarmos um caractere na requisição:

```
GET /~diego/ HTTP/1.0
Host: www.midiacom.uff.br


```

Tente enviar essa requisição a partir do seu computador ou veja no vídeo abaixo o que ocorre:

![Exemplo de Requisição com HTTP 1.0](videos/Requisicao_1.0.mp4){}

Repare que, imediatamente após o recebimento resposta, o `telnet` termina sua execução. A última linha impressa pelo `telnet` explica o motivo: *Connection closed by foreign host* (ou, em Português, *a conexão foi fechada pelo outro host*). Em outras palavras, o próprio servidor web que estamos acessando proativamente fechou a conexão antes que tivéssemos a chance de enviar qualquer outra requisição.

Isso acontece justamente por especificarmos a versão 1.0 do HTTP na nossa requisição original. Essa versão do HTTP usava conexões **não-persistentes** por padrão[^HTTP1.0Persistente], ou seja, as conexões eram encerradas após a resposta da requisição. Repare, ainda, que o servidor especifica na sua resposta o cabeçalho `Connection` com valor `close`. Essa é uma outra forma --- particularmente relevante ao HTTP 1.1 --- de alertar o cliente sobre a não-persistência da conexão.

[^HTTP1.0Persistente]: Mais especificamente, o HTTP 1.0 não especificava o suporte a conexões persistentes, embora algumas implementações de clientes e servidores a suportassem.

Agora contraste esse comportamento com o que ocorreu no experimento anterior. Lembre-se --- ou veja novamente no vídeo --- que o `telnet` não encerrou sua execução logo após a recepção da resposta. Ao contrário, o cliente `telnet` continuou aguardando novos conteúdos digitados pelo usuário. Isso indica que o servidor, por sua vez, não fechou a conexão e, portanto, estava ainda disposto a utilizá-la para novas requisições subsequentes. Observe, ainda, que na resposta do experimento anterior o cabeçalho `Connection` tinha o valor `keep-alive`. Esse valor indica que o servidor pretende manter a conexão "viva" após a resposta, permitindo outras requisições.

É interessante destacar mais uma vez que a única diferença entre as duas requisições foi a versão especificada do HTTP. Isso indica que o HTTP 1.0 usava conexões não-persistentes, mas também que conexões persistentes são **o comportamento padrão no HTTP 1.1**.

Mas seria possível usar o HTTP 1.1 com conexões não-persistentes[^PqHTTPNaoPersistente]? Sim. Para isso, basta fazermos uma pequena alteração na nossa requisição. 

[^PqHTTPNaoPersistente]: Há algumas possíveis razões para se utilizar conexões não-persistentes mesmo no HTTP 1.1. Algumas delas têm relação com desempenho, que pode justificar o uso de múltiplas conexões para obter vários objetos, em oposição a utilizar uma única conexão para todos os objetos. No entanto, uma explicação mais detalhada sobre isso está fora do escopo dessa parte da matéria.


```
GET /~diego/ HTTP/1.1
Host: www.midiacom.uff.br
Connection: close

```

Essa requisição, apesar de utilizar a versão 1.1 do HTTP, usa uma linha de cabeçalho --- `Connection: close` --- para indicar que o cliente deseja uma conexão não-persistente. Envie essa requisição do seu computador ou veja o resultado no vídeo abaixo:

![Exemplo de requisição não-persistente com HTTP 1.0](videos/Requisicao_1.1_NaoPersistente.mp4){}

Apesar do comportamento padrão do HTTP 1.1, o servidor respeita o que foi pedido pelo cliente na requisição e fecha a conexão imediatamente após a resposta.

## Outros Códigos de Status

Até esse ponto, todas as requisições que fizemos resultaram em respostas com *status* 200 --- sucesso. No entanto, existe um grande número de códigos de *status* previstos no HTTP. Alguns exemplos:

- `200 OK` --- Requisição bem sucedida, objeto se encontra no corpo da mensagem.
- `301 Moved Permanently` --- Objeto requistado foi movido, nova localização se encontra no corpo da mensagem.
- `400 Bad Request` --- Servidor não entendeu a requisição.
- `404 Not Found` --- Objeto requisitado não foi encontrado no servidor.
- `505 HTTP Version Not Supported` --- Versão do HTTP especificada na requisição do cliente não é suportada pelo servidor.

Os valores numéricos atribuídos a cada código de *status* tem relação com seu tipo. Por exemplo, valores na faixa de 100 a 199 são usados para respostas meramente informativas (*e.g.*, o *status* 102 indica que o servidor está processando a última requisição, mas que a resposta ainda não está pronta). Valores de 200 a 299 indicam situações de sucesso. Valores de 300 a 399 indicam redirecionamentos (*e.g.*, um objeto ficava nesse local, mas foi movido). Valores de 400 a 499 indicam erros na requisição. Finalmente, valores de 500 a 599 indicam erros no lado do servidor.

A lista completa de todos os possíveis códigos de *status* do HTTP pode ser consultada nas suas RFCs --- por exemplo, a RFC 7231, para a versão 1.1. A lista é extensa e inclui diversos códigos que estão apenas reservados para uso futuro --- *e.g.*, o código `402 Payment Required` é previsto na RFC provavelmente para dar suporte a algum tipo de serviço web pago, mas sua implementação não é especificada na RFC. Além disso, mesmo alguns *status* que estão, de fato, presentes nas versões atuais do protocolo raramente são encontradas na prática --- *e.g.*, `413 Payload Too Large`.

Por outro lado, há certos códigos que são frequentemente encontrados. Talvez o código de erro mais comum seja o `404 Not Found`, que indica que o servidor não foi capaz de encontrar o objeto requisitado no caminho especificado na requisição. Para a maioria dos servidores, é fácil provocar essa resposta, bastando encontrar um caminho que não exista no servidor. Por exemplo:

```
GET /~diego/aaaaa HTTP/1.1
Host: www.midiacom.uff.br

```

Como não há nenhum objeto associado ao caminho `/~dpassos/aaaaa`, o servidor retorna um erro `404`:

```
HTTP/1.1 404 Not Found
Date: Thu, 03 Sep 2020 18:14:28 GMT
Server: Apache/2.4.6 (CentOS) PHP/5.6.40
Content-Length: 210
Content-Type: text/html; charset=iso-8859-1
X-Cache: MISS from localhost
X-Cache-Lookup: MISS from localhost:3128
Via: 1.1 localhost (squid)
Connection: keep-alive

<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>
<title>404 Not Found</title>
</head><body>
<h1>Not Found</h1>
<p>The requested URL /~diego/aaaaa was not found on this server.</p>
</body></html>
```

É interessante notar que mesmo uma resposta de erro pode conter --- e muitas vezes contem --- dados no seu corpo. Esse conteúdo geralmente é um código HTML que os *browsers* usam para apresentar uma mensagem de erro potencialmente explicativa para o usuário.

Outro exemplo de erro facilmente "provocável" é o `505 HTTP Version Not Supported`. Ele é retornado por um servidor quando esse não suporta a versão *major* especificada pelo cliente em uma requisição. Por exemplo, a seguinte requisição deve gerar esse código de *status*:

```
GET /~diego/ HTTP/5.1
Host: www.midiacom.uff.br


```

Exemplo de resposta:

```
HTTP/1.1 505 HTTP Version not supported
Server: squid
Mime-Version: 1.0
Date: Thu, 03 Sep 2020 18:24:10 GMT
Content-Type: text/html
Content-Length: 2896
X-Squid-Error: ERR_UNSUP_HTTPVERSION 0
Vary: Accept-Language
Content-Language: az
X-Cache: MISS from localhost
X-Cache-Lookup: NONE from localhost:3128
Via: 1.1 localhost (squid)
Connection: close


<html><head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
...
```

Considerando o que você viu até aqui e realizando outros experimentos, responda às seguintes perguntas:

1. Você consegue pensar em alguma requisição que geraria o código de *status* `400 Bad Request`?
2. Considere novamente a requisição acima que resultou no código de *status* `505 HTTP Version Not Supported`. Substitua o número de versão 5.1 por 1.5 --- uma versão que, igualmente, não existe. O servidor retorna algum erro? Você consegue explicar a razão?

## Outros Métodos

O método `GET` é mais comumente utilizado no HTTP e, certamente, o de mais simples compreensão. Entretanto, ele não é o único. No HTTP 1.1, alguns exemplos de métodos previstos incluem:

- `GET`: solicita o conteúdo atual do objeto especificado.
- `HEAD`: exatamente a mesma semântica do `GET`, mas o servidor não inclui o conteúdo do objeto na resposta --- *i.e.*, apenas as linhas de *status* e cabeçalhos são enviadas.
- `POST`: usado para que o cliente envie determinado conteúdo para processamento pelo servidor.
- `PUT`: cliente solicita que o conteúdo do objeto especificado seja substituído pelo conteúdo enviado no corpo da requisição.
- `DELETE`: cliente solicita que o objeto especificado seja removido do servidor.

Os métodos `PUT` e `DELETE` não são frequentemente usados por servidores web --- uma exceção notável que tem se popularizado nos últimos anos são as chamadas API RESTful, nas quais o HTTP é usado como protocolo para viabilizar a troca de mensagens entre um cliente que solicita serviços mais gerais de um servidor. Os métodos `HEAD` e `POST`, por outro lado, são frequentemente empregados na Internet.

O propósito do método `HEAD` é permitir que o cliente obtenha metadados acerca de um objeto que ele pode solicitar no futuro próximo. Um exemplo simples é um *browser* que abre um diálogo mostrando informações básicas sobre um arquivo referente a um *link* clicado pelo usuário: antes de começar de fato o *download*, o *browser* pede uma confirmação do usuário. Para obter informações como o tipo e tamanho do arquivo, o *browser* pode gerar uma requisição do tipo `HEAD`, evitando gastar recursos em uma operação que pode não se concretizar.

Outro uso comum do método `HEAD` é para dar suporte ao *cache* de objetos. *Browsers* modernos tendem a usar estratégias agressivas de *cache* para reduzir o uso de banda e o tempo de resposta no carregamento de páginas. A dificuldade de implementação de *cache* nesse cenário está na manutenção da consistência da informação. De forma mais concreta, o problema é como um *browser* determina que a versão de um objeto que possui atualmente em sua cache local ainda é valida. Normalmente, servidores web incluem nas suas respostas uma linha de cabeçalho informando a data da última alteração do objeto. Através de uma requisição do tipo `HEAD`, o *browser* pode obter essa informação sem pagar o custo associado ao *download* do conteúdo. Para objetos pequenos, fazer essa "consulta" não vale a pena, mas para conteúdos a partir de um determinado tamanho --- *e.g.*, grandes imagens, áudios e vídeos --- esse procedimento pode trazer ganhos representativos.

Já o método `POST` encontra três grandes aplicações: o envio de arquivos do cliente para o servidor --- *e.g.*, anexar arquivos a um e-mail, fazer *upload* de arquivos em um sistema de arquivos na nuvem ---, o envio de dados de formulários web e a passagem de parâmetros para aplicações web[^PassagemDeParametros] --- *e.g.*, dados de *login* para autenticação de usuários. Nesse caso, assim como na resposta de um servidor a uma requisição do tipo `GET`, o cliente inclui o conteúdo no corpo da requisição e metadados (*e.g.*, tipo, tamanho do conteúdo) nas linhas de cabeçalho. Note que uma requisição do tipo `POST` ainda enseja uma resposta por parte do servidor. Essa resposta, inclusive, comumente carrega algum tipo de conteúdo (*e.g.*, uma página HTML a ser exibida para o usuário como resultado do envio das informações). 

[^PassagemDeParametros]: Embora o método `POST` possa ser usado para esse fim, muitas vezes aplicações utilizam um método mais simples baseado na passagem de parâmetros codificados na própria URL. Por exemplo, a URL `http://www.midiacom.uff.br/~diego/app?par1&par2&par4=2` passa os parâmetros `par1`, `par2` e `par4=2` para o objeto `http://www.midiacom.uff.br/~diego/app`. Nesse caso, o método `GET` pode ser usado ao invés do `POST`.

Utilizando as informações vistas até aqui, tente fazer uma requisição do tipo `HEAD` para algum objeto de um servidor web na Internet. Observe a resposta do servidor.
