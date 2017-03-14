from socket import *
from struct import *

# Parametros e variaveis de controle
serverPort = 12000;
filename = "/storage/emulated/0/Download/server.out";
#filename = "server.out";

# Estados:
#  * 0: Espera dado da aplicacao (0).
#  * 1: Espera dado da aplicacao (1).
state = 0;

# Criacao do socket
serverSocket = socket(AF_INET, SOCK_DGRAM);
serverSocket.bind(('0.0.0.0', serverPort));

# Criacao do pacote 0
ack0 = "0";

# Criacao do pacote 1
ack1 = "1";

# Criacao do arquivo de saida
f = open(filename, 'wb');

while(True):

    if (state == 0):
        # Esperar pacote da rede
        recvpkt, client = serverSocket.recvfrom(1024);
        seqnum = unpack('B', recvpkt[0])[0];
        if (seqnum == 0):
            # Escrita do conteudo no arquivo
            f.write(recvpkt[1:]);
            # Envio do ack 0
            serverSocket.sendto(ack0, client);
            state = 1;
        else:
            # Envio do ack 1
            serverSocket.sendto(ack1, client);
    elif (state == 1):
        # Esperar pacote da rede
        recvpkt, client = serverSocket.recvfrom(1024);
        seqnum = unpack('B', recvpkt[0])[0];
        if (seqnum == 1):
            # Escrita do conteudo no arquivo
            f.write(recvpkt[1:]);
            # Envio do ack 0
            serverSocket.sendto(ack1, client);
            state = 0;
        else:
            # Envio do ack 1
            serverSocket.sendto(ack0, client);

# Fechamento
serverSocket.close();
f.close();
