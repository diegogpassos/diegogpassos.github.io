import java.io.*;
import java.net.*;

class TCPClient {

  public static void main(String argv[]) throws Exception {

  	String sentence;
    String modifiedSentence;

    BufferedReader inFromUser = new BufferedReader(new InputStreamReader(System.in));

    // Criação do socket TCP. Note que aqui, diferentemente da versão UDP, já especificamos
    // o endereço do servidor (nome do host/ip e porta).
    Socket clientSocket = new Socket("localhost", 6789);

    // Do ponto de vista do programador, um socket TCP pode ser manipulado de forma similar
    // a um arquivo, com escrita e leitura de um fluxo de bytes.
    DataOutputStream outToServer = new DataOutputStream(clientSocket.getOutputStream());
    BufferedReader inFromServer =  new BufferedReader(new InputStreamReader(
                                                      clientSocket.getInputStream()));

    while(true) {

      // Leitura da entrada do usuário.
      sentence = inFromUser.readLine();

      // String é simplesmente "escrita" no socket. Notem que adicionamos uma quebra de linha
      // ao final da string (caractere '\n'). Isso demarcará ao servidor onde termina a mensagem
      // a ser processada.
      outToServer.writeBytes(sentence + '\n');

      // Aguardamos uma resposta do servidor. Note mais uma vez a manipulação do socket como
      // se fosse um arquivo. Aqui também uma quebra de linha denota fim da mensagem. Por fim,
      // assim como no cliente UDP, leituras são (geralmente) bloqueantes.
      modifiedSentence = inFromServer.readLine();

      // Impressão do resultado da tela.
      System.out.println("FROM SERVER: " + modifiedSentence);
    }
  }
}
