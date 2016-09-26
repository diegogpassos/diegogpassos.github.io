#!/usr/bin/python

import numpy
import pyaudio

class audioInput:
	def __init__(self, sampleTotalTime, sampleRate = 16000):
		self.sampleTotalTime = sampleTotalTime
		self.sampleRate = sampleRate

		p = pyaudio.PyAudio()
		self.stream = p.open(format = pyaudio.paFloat32, 
				channels = 1, 
				rate = sampleRate, 
				input = True, 
				frames_per_buffer=int(sampleRate * sampleTotalTime))

	def searchForTwoFrequencies(self, freq1, freq2):
		
		# Leitura do audio.
		frames = self.stream.read(int(self.sampleRate * self.sampleTotalTime))
		decoded = numpy.fromstring(frames, 'Float32')

		# Analise das frequencias
		freqs = numpy.abs(numpy.fft.fft(decoded))**2

		# Estatisticas uteis
		avg = numpy.average(freqs);
		maxf = numpy.max(freqs)

		# Transformacao das frequencias em indices da fft
		freq1Idx = self.sampleTotalTime * freq1
		freq2Idx = self.sampleTotalTime * freq2

		# Transformacao da unidade para dB
		freqPwr1 = 10 * numpy.log10(freqs[freq1Idx] / maxf)
		freqPwr2 = 10 * numpy.log10(freqs[freq2Idx] / maxf)
		avgPwr = 10 * numpy.log10(avg / maxf)

		#print 10 * numpy.log10(freqs[freq1Idx - 1] / maxf)
		#print 10 * numpy.log10(freqs[freq1Idx + 1] / maxf)
		#print 10 * numpy.log10(freqs[freq2Idx - 1] / maxf)
		#print 10 * numpy.log10(freqs[freq2Idx + 1] / maxf)
		return freqPwr1, freqPwr2, avgPwr

