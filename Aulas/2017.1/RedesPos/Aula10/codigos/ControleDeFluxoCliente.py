#!/usr/bin/env python

import socket

SERVIDOR = '127.0.0.1';
PORTA = 5006;
MENSSAGEM = "Hello, World!";

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
s.connect((SERVIDOR, PORTA));

print "Buffer de transmissao do TCP tem %d bytes." % (s.getsockopt(socket.SOCK_STREAM, socket.SO_SNDBUF));
print "Reduzindo para o minimo...";
s.setsockopt(socket.SOCK_STREAM, socket.SO_SNDBUF, 1024);
print "Buffer de transmissao do TCP tem agora %d bytes." % (s.getsockopt(socket.SOCK_STREAM, socket.SO_SNDBUF));

raw_input("Pressione <enter> para iniciar transmissao...")

i = 0;
while(True):
    s.send(MENSSAGEM);
    i = i + 1;
    print "Enviada(s) %d mensagem(ns)." % (i);

s.close()
