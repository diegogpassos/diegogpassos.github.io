#!/usr/bin/python

import audioOutput
import sys
import fileinput
import time

symbolDuration = 4.0

if len(sys.argv) > 1:
	if len(sys.argv) == 2:
	   	if sys.argv[1] == '-h':
			   print 'Uso: ' + sys.argv[0] + ' [duracaoSimbolo]'
			   sys.exit(1)
		else:
			   symbolDuration = float(sys.argv[1])
	else:
		print 'Uso: ' + sys.argv[0] + ' [duracaoSimbolo]'
		sys.exit(1)

# Preparar dispositivo de audio para transmissao
ao = audioOutput.audioOutput(symbolDuration, 330, 440)

# Iterar por cada linha da entrada
while True:
	line = sys.stdin.readline()

	# Iterar por cada caractere da linha
	for ch in line:

		if ch == '\n':
			break

		byte = ord(ch)
		print 'Transmitindo o caractere "' + ch + '" (ASCII = ' + str(byte) + ')'
		
		# Iterar por cada bit do caractere
		for i in range(0, 8):
			if (byte & (1 << i)) == 0:
				bit = 0
			else:
				bit = 1

			print ' --- Transmitindo bit ' + str(bit);

			if bit == 1:
				ao.playFreq2()
			else:
				ao.playFreq1()

		time.sleep(symbolDuration / 2)

