from socket import *
from threading import Thread
from threading import Timer
from threading import Lock
from time import sleep
import random
import string
import select
from time import time
import sys
from struct import *

# Parametros e variaveis de controle

if (len(sys.argv) > 1):
    serverName = sys.argv[1];
else:
    serverName = 'localhost';
serverPort = 12000;
runningTime = 10.0;
retransmitTimeout = 0.1;
windowSize = 200;

# Criacao do socket
clientSocket = socket(AF_INET, SOCK_DGRAM)

# Criacao de um payload de 1000 bytes
payload = ''.join(random.SystemRandom().choice(string.ascii_uppercase + string.digits) for _ in range(1000))

# Criacao da janela. Ha multiplas listas
# para armazenar informacoes diferentes.
#  * wndSeqNum armazena os numeros sequencia disponiveis.
#  * wndStatus diz o status de cada numero de sequencia:
#     + 0: ainda nao usado.
#     + 1: Usado, ack pendente.
#     + 2: usado, ja reconhecido.
wndSeqNum = range(windowSize);
wndStatus = [0] * windowSize;

# Ponteiro para o proximo # de sequencia disponivel.
nextAvailSeqNum = 0;

# Temporizador (inicializado pelo transmissor).
timer = None;

# Para calculo de estatisticas
deliveredPkts = 0;
retransmitedPkts = 0;

# Alguns locks para sincronizacao
moreSeqNumbers = Lock();
moreSeqNumbers.acquire();
timerLock = Lock();
windowLock = Lock();
transmitterWaiting = False;

def timeout():
    global timer;
    global clientSocket;
    global timerLock;
    global windowLock;
    global retransmitedPkts;
    global wndSeqNum;
    global nextAvailSeqNum;

    timerLock.acquire();
    windowLock.acquire();

    for i in range(nextAvailSeqNum):
        pkt = str(wndSeqNum[i]) + "_" + payload;
        clientSocket.sendto(pkt, (serverName, serverPort));

    retransmitedPkts = retransmitedPkts + nextAvailSeqNum;

    windowLock.release();

    timer = Timer(retransmitTimeout, timeout);
    timer.start();

    timerLock.release();

def transmitterThread():

    global wndSeqNum;
    global wndStatus;
    global timer;
    global clientSocket;
    global nextAvailSeqNum;
    global moreSeqNumbers;
    global transmitterWaiting;

    while(True):

        windowLock.acquire();

        if (nextAvailSeqNum < windowSize):

            #print "Sent seq # %d (%d)" % (wndSeqNum[nextAvailSeqNum], nextAvailSeqNum);
            pkt = str(wndSeqNum[nextAvailSeqNum]) + "_" + payload;
            wndStatus[nextAvailSeqNum] = 1;
            nextAvailSeqNum = nextAvailSeqNum + 1;

            windowLock.release();

            clientSocket.sendto(pkt, (serverName, serverPort));

            timerLock.acquire();

            if (timer is None):
                timer = Timer(retransmitTimeout, timeout);
                timer.start();

            timerLock.release();

        else:

            transmitterWaiting = True;
            windowLock.release();
            #print "Waiting for more seq #s..."
            moreSeqNumbers.acquire();
            #print "Acquired more seq #s"

    # Fechamento
    clientSocket.close()

def receiverThread():

    global wndSeqNum;
    global wndStatus;
    global clientSocket;
    global deliveredPkts;
    global nextAvailSeqNum;
    global timer;
    global moreSeqNumbers;
    global timerLock;
    global windowLock;
    global transmitterWaiting;

    while(True):

        ackSeqNum = int(clientSocket.recv(1024));
        #print ackSeqNum;
        if (ackSeqNum >= wndSeqNum[0] and ackSeqNum <= wndSeqNum[-1]):

            timerLock.acquire();

            if (not timer is None):
                timer.cancel();
                timer = None;

            timerLock.release();

            maxIdx = ackSeqNum - wndSeqNum[0];

            windowLock.acquire();

            for i in range(maxIdx + 1):
                lastSeqNum = wndSeqNum[-1];
                wndSeqNum.pop(0);
                wndStatus.pop(0);
                wndSeqNum.append(lastSeqNum + 1);
                wndStatus.append(0);

            #print "nextAvailSeqNum = %d" % (nextAvailSeqNum);
            if (transmitterWaiting == True):
                moreSeqNumbers.release();
                transmitterWaiting = False;

            nextAvailSeqNum = nextAvailSeqNum - (maxIdx + 1);

            windowLock.release();

            deliveredPkts = deliveredPkts + maxIdx + 1;

# Criar uma thread especifica para a transmissao de dados
t = Thread(target=transmitterThread);
t.daemon = True;
t.start();

# Criar uma thread especifica para a recepcao de acks.
r = Thread(target=receiverThread);
r.daemon = True;
r.start();

# Esperar 10 segundos.
sleep(runningTime);

# Aqui termina a execucao. Exibir algumas estatisticas.
print "Estatisticas:"
print "\t- Pacotes entregues: %d" % (deliveredPkts);
print "\t- Retransmissoes: %d" % (retransmitedPkts);
print "\t- Vazao: %.2f Mb/s" % ((deliveredPkts * 8000.0) / runningTime / 1e6);
