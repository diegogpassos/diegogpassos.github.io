from socket import *

# Parametros e variaveis de controle
serverPort = 12000

# Criacao do socket
serverSocket = socket(AF_INET, SOCK_DGRAM);
serverSocket.bind(('0.0.0.0', serverPort));

while(True):

    # Esperar pacote da rede
    recvpkt, client = serverSocket.recvfrom(1024);
    seqnum = recvpkt.split('_')[0]
    # Envio do ack
    serverSocket.sendto(seqnum, client);

# Fechamento
serverSocket.close()
