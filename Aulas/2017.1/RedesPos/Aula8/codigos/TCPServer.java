import java.io.*;
import java.net.*;
import java.util.*;

class TCPServer {

  private static class clientService implements Runnable {

    Socket connectionSocket;

    public clientService(Socket connectionSocket) {

      this.connectionSocket = connectionSocket;
    }

    public void run() {

      String clientSentence;
      String capitalizedSentence;

      while(true) {

        try {
          BufferedReader inFromClient = new BufferedReader(new
          InputStreamReader(connectionSocket.getInputStream()));
          DataOutputStream  outToClient = new DataOutputStream(connectionSocket.getOutputStream());

          // Aguardamos dados do cliente. Por convenção, dados terminam em uma quebra de linha.
          clientSentence = inFromClient.readLine();

          // Implementação da lógica da aplicação.
          capitalizedSentence = clientSentence.toUpperCase() + '\n';

          // Escrita do resultado no socket.
          outToClient.writeBytes(capitalizedSentence);
        }
        catch(Exception e) {
          System.out.println("Falha na comunicacao!");
          break ;
        }
      }
    }
  }
  public static void main(String argv[]) throws Exception {

    ArrayList clients = new ArrayList();

    // Criação do socket do servidor. Este socket será usado para esperar por novas conexões.
    // Repare que especificamos um # de porta na qual desejamos esperar pelas conexões.
    ServerSocket welcomeSocket = new ServerSocket(6789);

    // Assim como o servidor UDP, servidor TCP também executa um loop infinito permitindo
    // o atendimento de múltiplos clientes.
    while(true) {

      // Função/método accept(): executada sobre socket, diz ao SO para aguardar (e aceitar)
      // novas conexões. Só faz sentindo para sockets orientados a conexão (TCP). Note que
      // o resultado da função/método é um novo socket.
      Socket connectionSocket = welcomeSocket.accept();
      Thread t = new Thread(new clientService(connectionSocket));
      t.start();
      clients.add(t);
    }
  }
}
