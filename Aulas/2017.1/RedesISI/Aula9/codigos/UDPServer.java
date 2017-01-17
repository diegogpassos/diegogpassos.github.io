import java.io.*;
import java.net.*;

class UDPServer {

  public static void main(String args[]) throws Exception {

    // Criação do socket. Note que especificamos o # de porta na qual esperamos por datagramas.
    DatagramSocket serverSocket = new DatagramSocket(9876);
    byte[] receiveData = new byte[1024]; // Buffer de recepção de dados.
    byte[] sendData = new byte[1024]; // Buffer para envio de dados.

    // Servidores normalmente executam um loop infinito. Cada iteração representa o atendimento
    // a um cliente diferente.
    while(true) {

      // Criação de um datagrama para recepção de mensagem.
      DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);

      // Aguardar recepção de um novo datagrama. Novamente, métodos/funções de recepção são,
      // em geral, bloqueantes.
      serverSocket.receive(receivePacket);

      // Tratamento da mensagem. Aqui, é aplicada a lógica específica da aplicação.
      // No caso, apenas interpretamos os bytes da mensagem como uma string e calculamos
      // uma versão alternativa em caixa alta.
      String sentence = new String(receivePacket.getData());
      String capitalizedSentence = sentence.toUpperCase();

      // Preparação da resposta: é preciso descobrir o endereço do cliente (IP e porta).
      // Ambas as informações constam no datagrama recebido.
      InetAddress IPAddress = receivePacket.getAddress();
      int port = receivePacket.getPort();

      // Criação do datagrama de resposta. Transferimos a string para o buffer de envio e
      // construímos um datagrama a partir dele. Note, novamente, a especificação do
      // endereço de destino.
      sendData = capitalizedSentence.getBytes();
      DatagramPacket sendPacket = new DatagramPacket(sendData, sendData.length,
      IPAddress, port);

      // Envio em si do datagrama.
      serverSocket.send(sendPacket);
    }
  }
}
