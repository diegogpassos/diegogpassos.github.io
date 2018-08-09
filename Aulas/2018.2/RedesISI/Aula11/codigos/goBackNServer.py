from socket import *

# Parametros e variaveis de controle
serverPort = 12000

# Numero de sequencia esperado
expectedSeqNum = 0;

# Criacao do socket
serverSocket = socket(AF_INET, SOCK_DGRAM);
serverSocket.bind(('0.0.0.0', serverPort));

while(True):

    # Esperar pacote da rede
    recvpkt, client = serverSocket.recvfrom(1024);
    seqnum = int(recvpkt.split('_')[0])
    if (seqnum == expectedSeqNum):
        # Envio do ack
        serverSocket.sendto(str(expectedSeqNum), client);
        expectedSeqNum = expectedSeqNum + 1;

# Fechamento
serverSocket.close()
