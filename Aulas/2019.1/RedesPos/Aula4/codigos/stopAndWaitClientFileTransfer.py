from socket import *
from threading import Thread
from time import sleep
import random
import string
import select
from time import time
import sys
from struct import *

# Parametros e variaveis de controle

filename = sys.argv[1];
if (len(sys.argv) > 2):
    serverName = sys.argv[2];
else:
    serverName = 'localhost';
serverPort = 12000;
runningTime = 10.0;
retransmitTimeout = 0.1;

# Estados:
#  * 0: Espera dado da aplicacao (0).
#  * 1: Espera ack 0.
#  * 2: Espera dado da aplicacao (1).
#  * 3: Espera ack 1.
state = 0;

# Criacao do socket
clientSocket = socket(AF_INET, SOCK_DGRAM)

# Para calculo de estatisticas
deliveredPkts = 0;
retransmitedPkts = 0;

# Arquivo a ser enviado
f = open(filename, 'rb');

while(True):
    if (state == 0):
        # Ler proximo pedaco do arquivo.
        inputBuffer = f.read(1000);
        if (inputBuffer == ""):
            break;
        pkt0 = pack('B', 0) + inputBuffer;
        # Envio do pacote 0
        clientSocket.sendto(pkt0, (serverName, serverPort));
        # Guardar hora do envio
        sentAt = time();
        # Passamos para o estado 1.
        state = 1;
    elif (state == 1):
        # Esperar receber ACK
        timeout = sentAt + retransmitTimeout - time();
        if (timeout > 0 and select.select([clientSocket], [], [], timeout)[0]):
            recvpkt = clientSocket.recv(1024);
            if (recvpkt == '0'):
                state = 2;
                deliveredPkts = deliveredPkts + 1;
        else:
            # Envio do pacote 0
            clientSocket.sendto(pkt0, (serverName, serverPort));
            sentAt = time();
            retransmitedPkts = retransmitedPkts + 1;
    elif (state == 2):
        # Ler proximo pedaco do arquivo.
        inputBuffer = f.read(1000);
        if (inputBuffer == ""):
            break;
        pkt1 = pack('B', 1) + inputBuffer;
        # Envio do pacote 1
        clientSocket.sendto(pkt1, (serverName, serverPort));
        # Guardar hora do envio
        sentAt = time();
        # Passamos para o estado 1.
        state = 3;
    elif (state == 3):
        # Esperar receber ACK
        timeout = sentAt + retransmitTimeout - time();
        if (timeout > 0 and select.select([clientSocket], [], [], sentAt + retransmitTimeout - time())[0]):
            recvpkt = clientSocket.recv(1024);
            if (recvpkt == '1'):
                state = 0;
                deliveredPkts = deliveredPkts + 1;
        else:
            # Envio do pacote 1
            clientSocket.sendto(pkt1, (serverName, serverPort));
            sentAt = time();
            retransmitedPkts = retransmitedPkts + 1;

# Fechamento
clientSocket.close();
f.close();

# Aqui termina a execucao. Exibir algumas estatisticas.
print "Estatisticas:"
print "\t- Pacotes entregues: %d" % (deliveredPkts);
print "\t- Retransmissoes: %d" % (retransmitedPkts);
print "\t- Vazao: %.2f Mb/s" % ((deliveredPkts * 8000.0) / runningTime / 1e6);
