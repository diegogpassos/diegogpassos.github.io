#!/usr/bin/python

import sys
import audioInput
import time

def readBit(SampleTime, SymbolDuration, bit, threshold, lastBitTime):

	i = time.time()
	end = lastBitTime + SymbolDuration - SampleTime
	while i < end:

		# Captura
		freqPwr1, freqPwr2, avgPwr = ai.searchForTwoFrequencies(freq1, freq2);

		if bit == 0:
			if freqPwr1 < threshold:
				break
		else:
			if freqPwr2 < threshold:
				break

		i = time.time()

	if i >= end - SampleTime:
		# Bit completo
		return True, end
	else:
		return False, end


# Duracao de um simbolo
SymbolDuration = 4.0

# Frequencias associadas a cada bit
freq1 = 330
freq2 = 440

# Limiar de aceitacao de um simbolo
threshold = -20

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
SampleTime = SymbolDuration / 8

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

	if freqPwr1 >= threshold and freqPwr2 < threshold:
		if lastBitTime == 0:
			lastBitTime = now;
		print 'DEBUG: possivel bit 0...'
		# Possivel bit 0. Verificar se sinal se mantem por toda a duracao do simbolo
		status, now = readBit(SampleTime, SymbolDuration, 0, threshold, lastBitTime)
		# Bit foi completo?
		if status == True:
			byte = byte / 2
			nbits = nbits + 1
			lastBitTime = now
			print 'DEBUG: confirmado!'
			continue
	elif freqPwr1 < threshold and freqPwr2 >= threshold:
		if lastBitTime == 0:
			lastBitTime = now;
		print 'DEBUG: possivel bit 1...'
		# Possivel bit 1. Verificar se sinal se mantem por toda a duracao do simbolo
		status, now = readBit(SampleTime, SymbolDuration, 1, threshold, lastBitTime)
		# Bit foi completo?
		if status == True:
			byte = byte / 2 + 128
			nbits = nbits + 1
			lastBitTime = now
			print 'DEBUG: confirmado!'
			continue
	else:
		if lastBitTime < now - SymbolDuration:

			# Se chegamos aqui, houve nao foi lido um bit completo. Zerar estado.
			byte = 0
			nbits = 0
			lastBitTime = 0



