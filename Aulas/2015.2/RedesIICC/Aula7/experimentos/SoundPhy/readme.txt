## Aviso Importante!

Não execute o programa transmissor enquanto estiver utilizando fones de ouvido! Os sons gerados podem ser 
bastante altos. Cuide da sua audição!

## Sobre

Este diretório contém implementações altamente simplificadas de um transmissor e um receptor
para comunicação digital de dados via ondas sonoras. O transmissor gera sinais de áudio para
o alto-falante/fone de ouvido conectado ao computador, enquanto o receptor captura áudio a 
partir do microfone.

O transmissor codifica cada bit da mensagem a ser transmitida como um símbolo consistindo de um 
tom na frequência de 330 Hz (para bit 0) ou 440 Hz (para bit 1). A duração de cada símbolo (bit) 
é configurável como um parâmetro da linha de comando (se um valor não é especificado, utiliza-se 
4 segundos). A resolução deste parâmetro provavelmente varia de computador para computador (por conta 
dos overheads do processamento feito antes de cada transmissão efetiva), mas valores acima de 0,5s 
são provavelmente razoáveis. Entre dois bytes consecutivos, o transmissor inclui um período de 
silêncio igual à metade da duração de um símbolo. Entre dois bits consecutivos (dentro de um byte) 
não há intervalos de silêncio.

O receptor, por sua vez, também recebe como parâmetro a duração de um símbolo (o valor padrão é 4s).
Ele realiza amostras do microfone com duração de 1/8 da duração de um símbolo. Quando o receptor
identifica sinais com amplitude representativa em uma das frequências usadas (determinado por um 
limiar definido no código-fonte), ele inicia o processo de recepção de um bit. Se 8 bits são recebidos
de forma consecutiva, o byte completo é exibido na tela. Se o receptor não percebe sinal com amplitude
representativa durante 1/2 da duração de um símbolo, byte é descartado.

## Uso

Ambos os programas podem receber como argumento da linha de comando a duração dos símbolos em segundos.
Os valores passados podem ser não-inteiros (e.g., 0.5, representando meio segundo). Caso o argumento 
não seja fornecido, o valor padrão de 4 segundos é usado.

Quando o transmissor é executado, ele espera por dados para transmissão através da entrada padrão (e.g.,
teclado). Ao final de cada linha da entrada padrão (i.e., depois de um <enter>), o transmissor começa a
transmitir, caracter por caracter, o conteúdo da linha (exceto pelo caracter de quebra de linha).

O receptor, por outro lado, não possui interação com o usuário. Ele apenas realiza a amostragem periódica 
do áudio e imprime mensagens relativas ao seu estado. Toda vez que o receptor identifica a possível 
transmissão de um bit, uma mensagem é impressa. Se a recepção do bit é bem sucedida, uma mensagem de 
confirmação também é exibida. Se um byte completo é recebido com sucesso*, o caracter correspondente ao 
valor ASCII é impresso na tela.

Ambos os programas são executados até que seus processos sejam terminados explicitamente pelo usuário (e.g.,
através de um <ctrl+C>).

* Note que uma recepção "com sucesso" por parte do receptor não significa que o byte recebido é exatamente
o que foi transmitido pelo transmissor. Ao contrário, isso apenas quer dizer que o receptor *acredita* ter
realizado uma recepção completa.

## Aviso Importante!

Não execute o programa transmissor enquanto estiver utilizando fones de ouvido! Os sons gerados podem ser 
bastante altos. Cuide da sua audição!




