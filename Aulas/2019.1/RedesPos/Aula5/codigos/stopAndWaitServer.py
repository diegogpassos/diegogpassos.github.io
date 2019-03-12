from socket import *

# Parametros e variaveis de controle
serverPort = 12000

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

while(True):

    if (state == 0):
        # Esperar pacote da rede
        recvpkt, client = serverSocket.recvfrom(1024);
        seqnum = recvpkt.split('_')[0]
        if (seqnum == '0'):
            # Envio do ack 0
            serverSocket.sendto(ack0, client);
            state = 1;
        else:
            # Envio do ack 1
            serverSocket.sendto(ack1, client);
    elif (state == 1):
        # Esperar pacote da rede
        recvpkt, client = serverSocket.recvfrom(1024);
        seqnum = recvpkt.split('_')[0]
        if (seqnum == '1'):
            # Envio do ack 0
            serverSocket.sendto(ack1, client);
            state = 0;
        else:
            # Envio do ack 1
            serverSocket.sendto(ack0, client);

# Fechamento
serverSocket.close()
