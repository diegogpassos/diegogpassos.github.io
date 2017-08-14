import java.io.*;
import java.net.*;	// API de sockets.

class UDPClient {

  public static void main(String args[]) throws Exception {

    BufferedReader inFromUser =	new BufferedReader(new InputStreamReader(System.in));
    // Criação de Socket UDP (datagramas)
    DatagramSocket clientSocket = new DatagramSocket();
    // Resolução de nome de host.
    InetAddress IPAddress = InetAddress.getByName("localhost");

    // Alocação de buffers para mensagens transmitida e recebida
    byte[] sendData = new byte[1024];
    byte[] receiveData = new byte[1024];

    // Leitura de dados do usuário
    String sentence = inFromUser.readLine();
    // Formatação da mensagem da aplicação
    sendData = sentence.getBytes();
    // Criação do datagrama e envio. Note a especificação do endereço
    // de destino (IP e porta).
    DatagramPacket sendPacket =	new DatagramPacket(sendData, sendData.length, IPAddress, 9876);
    clientSocket.send(sendPacket);

    // Espera pela resposta. Funções/métodos de recepção são (normalmente) bloqueantes.
    DatagramPacket receivePacket = new DatagramPacket(receiveData, receiveData.length);
    clientSocket.receive(receivePacket);

    // Apresentação do resultado.
    String modifiedSentence = new String(receivePacket.getData());
    System.out.println("FROM SERVER:" + modifiedSentence);

    // Fechamento do socket.
    clientSocket.close();
    }
}
