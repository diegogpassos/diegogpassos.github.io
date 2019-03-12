from socket import *
from threading import Thread
from time import sleep
import random
import string
import select
from time import time
import sys

# Parametros e variaveis de controle

if (len(sys.argv) > 1):
    serverName = sys.argv[1];
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

# Criacao de um payload de 1000 bytes
payload = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(1000))

# Criacao do pacote 0
pkt0 = "0_" + payload;

# Criacao do pacote 1
pkt1 = "1_" + payload;

# Para calculo de estatisticas
deliveredPkts = 0;
retransmitedPkts = 0;

def transmitterThread():

    global state;
    global clientSocket;
    global deliveredPkts;
    global retransmitedPkts;

    while(True):
        if (state == 0):
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
                # Guardar hora do envio
                sentAt = time();
                retransmitedPkts = retransmitedPkts + 1;
        elif (state == 2):
            # Envio do pacote 0
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
                # Guardar hora do envio
                sentAt = time();
                retransmitedPkts = retransmitedPkts + 1;
    # Fechamento
    clientSocket.close()

# Criar uma thread especifica para a transmissao de dados
t = Thread(target=transmitterThread);
t.daemon = True;
t.start();

# Esperar 10 segundos.
sleep(runningTime);

# Aqui termina a execucao. Exibir algumas estatisticas.
print "Estatisticas:"
print "\t- Pacotes entregues: %d" % (deliveredPkts);
print "\t- Retransmissoes: %d" % (retransmitedPkts);
print "\t- Vazao: %.2f Mb/s" % ((deliveredPkts * 8000.0) / runningTime / 1e6);
