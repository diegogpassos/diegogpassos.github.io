import pyaudio
import numpy
import math

class audioOutput:
	def __init__(self, symbolDuration, freq1, freq2, sampleRate = 16000):

		# Parametros dos sons gerados.
		self.sampleRate = sampleRate
		self.symbolDuration = symbolDuration
		self.numberOfFrames = symbolDuration * sampleRate

		# Pre-computar simbolos
		t = numpy.r_[0:symbolDuration:(1.0/sampleRate)]
		self.symbol1 = numpy.float32(numpy.sin(freq1 * 2.0 * math.pi * t))
		self.symbol2 = numpy.float32(numpy.sin(freq2 * 2.0 * math.pi * t))

		# Preparar dispositivo de audio
		p = pyaudio.PyAudio()
		self.stream = p.open(format = pyaudio.paFloat32, 
							channels = 1, 
							rate = sampleRate, 
							output = True)

	def playFreq1(self):
		if self.stream.is_stopped():
			   self.stream.start_stream()

		self.stream.write(self.symbol1, int(self.numberOfFrames))
		self.stream.stop_stream()

	def playFreq2(self):
		if self.stream.is_stopped():
			   self.stream.start_stream()

		self.stream.write(self.symbol2, int(self.numberOfFrames))
		self.stream.stop_stream()


