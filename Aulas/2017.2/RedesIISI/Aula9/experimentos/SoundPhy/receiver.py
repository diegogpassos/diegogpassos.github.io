#!/usr/bin/python

import sys
import audioInput
import time
import math

def readBit(SampleTime, SymbolDuration, threshold, lastBitTime):

	print "lastBitTime = %f\n" % lastBitTime;
	i = time.time()
	n = 0
	end = lastBitTime + SymbolDuration - SampleTime
	freqPwr1 = 0
	freqPwr2 = 0
	while i < end - SampleTime/2.0:

		# Captura
		freqPwr1s, freqPwr2s, avgPwr = ai.searchForTwoFrequencies(freq1, freq2);
		freqPwr1 = freqPwr1 + math.pow(10, freqPwr1s/10);
		freqPwr2 = freqPwr2 + math.pow(10, freqPwr2s/10);

		i = time.time();
		n = n + 1;

	#print "[B]freqPwr1 = %f, freqPwr2 = %f\n" % (freqPwr1, freqPwr2);
	freqPwr1 = 10*(math.log10(freqPwr1) - math.log10(n));
	freqPwr2 = 10*(math.log10(freqPwr2) - math.log10(n));

	#print "freqPwr1 = %f, freqPwr2 = %f\n" % (freqPwr1, freqPwr2);
	
	i = time.time()
	if (i < end):
		time.sleep(end - i);

	if (freqPwr1 < threshold and freqPwr2 > threshold):
		if freqPwr2s < threshold:
			end = end - SampleTime;
		return True, 1, end;
	elif (freqPwr2 < threshold and freqPwr1 > threshold):
		if freqPwr1s < threshold:
			end = end - SampleTime;
		return True, 0, end;
	else:
		return False, 0, end;



# Duracao de um simbolo
SymbolDuration = 4.0

# Frequencias associadas a cada bit
freq1 = 330
freq2 = 440

# Limiar de aceitacao de um simbolo
threshold = -3

# Verificacao das opcoes de linha de comando
if len(sys.argv) > 1:
	if len(sys.argv) > 2:
		print 'Uso: ' + sys.argv[0] + ' [DuracaoSimbolo]'
		sys.exit(1)
	else:
		if sys.argv[1] == '-h':
			print 'Uso: ' + sys.argv[0] + ' [DuracaoSimbolo]'
			sys.exit(1)
		else:
			SymbolDuration = float(sys.argv[1])


# Duracao de cada captura de audio. Usamos sempre a duracao de um simbolo dividido por 8.
SampleTime = SymbolDuration / 16

# Inicializar dispositivo de captura de audio
ai = audioInput.audioInput(SampleTime)

byte = 0
nbits = 0

# Tirar amostra inicial
#freqPwr1, freqPwr2, avgPwr = ai.searchForTwoFrequencies(freq1, freq2)

lastBitTime = 0
while True:
	
	# Tirar nova amostra
	now = time.time();
	freqPwr1, freqPwr2, avgPwr = ai.searchForTwoFrequencies(freq1, freq2)

	if nbits == 8:
		# Temos um byte completo. Imprimir e zerar estado.
		print 'Recebido caractere "' + chr(byte) + '" (ASCII ' + str(byte) + ')'
		nbits = 0
		byte = 0
		lastBitTime = 0

	elif (freqPwr1 >= threshold and freqPwr2 < threshold) or (freqPwr1 < threshold and freqPwr2 >= threshold):
		if lastBitTime == 0:
			lastBitTime = now;
		print 'DEBUG: possivel bit...'
		# Possivel bit 0. Verificar se sinal se mantem por toda a duracao do simbolo
		status, bit, now = readBit(SampleTime, SymbolDuration, threshold, lastBitTime)
		# Bit foi completo?
		if status == True:
			byte = byte / 2 + bit * 128
			nbits = nbits + 1
			lastBitTime = now
			print 'DEBUG: confirmado bit %d!' % bit
		else:
			lastBitTime = 0
			print 'DEBUG: falso positivo!'
	else:
		if lastBitTime < now - SymbolDuration:

			# Se chegamos aqui, houve nao foi lido um bit completo. Zerar estado.
			byte = 0
			nbits = 0
			lastBitTime = 0



