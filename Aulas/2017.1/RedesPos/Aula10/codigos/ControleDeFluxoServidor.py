#!/usr/bin/env python

import socket

SERVIDOR = '127.0.0.1'
PORTA = 5006
TAM_LEITURA = 20  # Normally 1024, but we want fast response

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM);
s.bind((SERVIDOR, PORTA));
s.listen(1);

print "Buffer de recepcao do TCP tem %d bytes." % (s.getsockopt(socket.SOCK_STREAM, socket.SO_RCVBUF));
print "Reduzindo para o minimo...";
s.setsockopt(socket.SOCK_STREAM, socket.SO_RCVBUF, 128);
print "Buffer de recepcao do TCP tem agora %d bytes." % (s.getsockopt(socket.SOCK_STREAM, socket.SO_RCVBUF));

conn, addr = s.accept();
print 'Conexao recebida de ', addr;

while 1:
    raw_input("Pressione <enter> para ler do socket...");
    dados = conn.recv(TAM_LEITURA);
    if not dados:
        break
    print "Dados recebidos: \"%s\"" % (dados);

conn.close()
