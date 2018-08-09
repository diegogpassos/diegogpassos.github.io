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
windowSize = 5;

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
timer = [None] * windowSize;

# Para calculo de estatisticas
deliveredPkts = 0;
retransmitedPkts = 0;

# Alguns locks para sincronizacao
moreSeqNumbers = Lock();
moreSeqNumbers.acquire();
timerLock = Lock();
windowLock = Lock();
transmitterWaiting = False;

def timeout(timerIdx):
    global timer;
    global clientSocket;
    global timerLock;
    global windowLock;
    global retransmitedPkts;
    global wndSeqNum;
    global nextAvailSeqNum;

    timerLock.acquire();
    windowLock.acquire();

    pkt = str(wndSeqNum[timerIdx]) + "_" + payload;
    clientSocket.sendto(pkt, (serverName, serverPort));
    retransmitedPkts = retransmitedPkts + 1;

    windowLock.release();

    timer[timerIdx] = Timer(retransmitTimeout, timeout, args=[timerIdx]);
    timer[timerIdx].start();

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
            idx = nextAvailSeqNum;
            pkt = str(wndSeqNum[idx]) + "_" + payload;
            wndStatus[idx] = 1;
            nextAvailSeqNum = nextAvailSeqNum + 1;

            windowLock.release();

            clientSocket.sendto(pkt, (serverName, serverPort));

            timerLock.acquire();

            if (timer[idx] is None):
                timer[idx] = Timer(retransmitTimeout, timeout, args=[idx]);
                timer[idx].start();

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

            idx = ackSeqNum - wndSeqNum[0];

            timerLock.acquire();

            if (not timer[idx] is None):
                timer[idx].cancel();
                timer[idx] = None;

            timerLock.release();

            windowLock.acquire();

            wndStatus[idx] = 2;
            addedSeqNums = 0;
            for i in range(nextAvailSeqNum):
                if (wndStatus[i] == 2):
                    lastSeqNum = wndSeqNum[-1];
                    wndSeqNum.pop(0);
                    wndStatus.pop(0);
                    wndSeqNum.append(lastSeqNum + 1);
                    wndStatus.append(0);
                    addedSeqNums = addedSeqNums + 1;
                else:
                    break ;

            #print "nextAvailSeqNum = %d" % (nextAvailSeqNum);
            if (transmitterWaiting == True):
                moreSeqNumbers.release();
                transmitterWaiting = False;

            nextAvailSeqNum = nextAvailSeqNum - addedSeqNums;

            windowLock.release();

            deliveredPkts = deliveredPkts + 1;

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
