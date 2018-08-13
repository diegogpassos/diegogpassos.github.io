import os
import sys
import time
import random

##
# Funcoes uteis
##

# Limpa a tela.
def limpaTela():
    
    os.system('cls' if os.name == 'nt' else 'clear')

##
# Funcoes de manipulacao do tabuleiro
##

# Imprime estado atual do tabuleiro
def imprimeTabuleiro(tabuleiro):

    # Limpa a tela
    limpaTela()

    # Imprime coordenadas horizontais
    dim = len(tabuleiro)
    sys.stdout.write("     ")
    for i in range(0, dim):
        sys.stdout.write("{0:2d} ".format(i))

    sys.stdout.write("\n")

    # Imprime separador horizontal
    sys.stdout.write("-----")
    for i in range(0, dim):
        sys.stdout.write("---")

    sys.stdout.write("\n")

    for i in range(0, dim):

        # Imprime coordenadas verticais
        sys.stdout.write("{0:2d} | ".format(i))

        # Imprime conteudo da linha 'i'
        for j in range(0, dim):

            # Peca ja foi removida?
            if tabuleiro[i][j] == '-':

                # Sim.
                sys.stdout.write(" - ")

            # Peca esta levantada?
            elif tabuleiro[i][j] >= 0:

                # Sim, imprime valor.
                sys.stdout.write("{0:2d} ".format(tabuleiro[i][j]))
            else:

                # Nao, imprime '?'
                sys.stdout.write(" ? ")

        sys.stdout.write("\n")

# Cria um novo tabuleiro com pecas aleatorias. 
# 'dim' eh a dimensao do tabuleiro, necessariamente
# par.
def novoTabuleiro(dim):

    # Cria um tabuleiro vazio.
    tabuleiro = []
    for i in range(0, dim):

        linha = []
        for j in range(0, dim):

            linha.append(0)

        tabuleiro.append(linha)

    # Cria uma lista de todas as posicoes do tabuleiro. Util para
    # sortearmos posicoes aleatoriamente para as pecas.
    posicoesDisponiveis = []
    for i in range(0, dim):

        for j in range(0, dim):

            posicoesDisponiveis.append((i, j))

    # Varre todas as pecas que serao colocadas no 
    # tabuleiro e posiciona cada par de pecas iguais
    # em posicoes aleatorias.
    for j in range(0, dim / 2):
        for i in range(1, dim + 1):

            # Sorteio da posicao da segunda peca com valor 'i'
            maximo = len(posicoesDisponiveis)
            indiceAleatorio = random.randint(0, maximo - 1)
            rI, rJ = posicoesDisponiveis.pop(indiceAleatorio)

            tabuleiro[rI][rJ] = -i

            # Sorteio da posicao da segunda peca com valor 'i'
            maximo = len(posicoesDisponiveis)
            indiceAleatorio = random.randint(0, maximo - 1)
            rI, rJ = posicoesDisponiveis.pop(indiceAleatorio)

            tabuleiro[rI][rJ] = -i

    return tabuleiro

# Abre (revela) peca na posicao (i, j). Se posicao ja esta
# aberta ou se ja foi removida, retorna False. Retorna True
# caso contrario.
def abrePeca(tabuleiro, i, j):

    if tabuleiro[i][j] == '-':
        return False
    elif tabuleiro[i][j] < 0:
        tabuleiro[i][j] = -tabuleiro[i][j]
        return True

    return False

# Fecha peca na posicao (i, j). Se posicao ja esta
# fechada ou se ja foi removida, retorna False. Retorna True
# caso contrario.
def fechaPeca(tabuleiro, i, j):

    if tabuleiro[i][j] == '-':
        return False
    elif tabuleiro[i][j] > 0:
        tabuleiro[i][j] = -tabuleiro[i][j]
        return True

    return False

# Remove peca na posicao (i, j). Se posicao ja esta
# removida, retorna False. Retorna True
# caso contrario.
def removePeca(tabuleiro, i, j):

    if tabuleiro[i][j] == '-':
        return False
    else:
        tabuleiro[i][j] = "-"
        return True

## 
# Funcoes de manipulacao do placar
##

# Cria um novo placar zerado.
def novoPlacar(nJogadores):

    return [0] * nJogadores

# Adiciona um ponto no placar para o jogador especificado.
def incrementaPlacar(placar, jogador):

    placar[jogador] = placar[jogador] + 1

# Imprime o placar atual.
def imprimePlacar(placar):

    nJogadores = len(placar)

    print "Placar:"
    print "---------------------"
    for i in range(0, nJogadores):
        print "Jogador {0}: {1:2d}".format(i + 1, placar[i])

##
# Funcoes de interacao com o usuario
#

# Imprime informacoes basicas sobre o estado atual da partida.
def imprimeStatus(tabuleiro, placar, vez):

        imprimeTabuleiro(tabuleiro)
        sys.stdout.write('\n')

        imprimePlacar(placar)
        sys.stdout.write('\n')
        sys.stdout.write('\n')

        print "Vez do Jogador {0}.\n".format(vez + 1)

# Le um coordenadas de uma peca. Retorna uma tupla do tipo (i, j)
# em caso de sucesso, ou False em caso de erro.
def leCoordenada(dim):

    input = raw_input("Especifique uma peca: ")

    try:
        i = int(input.split(' ')[0])
        j = int(input.split(' ')[1])
    except ValueError:
        print "Coordenadas invalidas! Use o formato \"i j\" (sem aspas),"
        print "onde i e j sao inteiros maiores ou iguais a 0 e menores que {0}".format(dim)
        raw_input("Pressione <enter> para continuar...")
        return False

    if i < 0 or i >= dim:

        print "Coordenada i deve ser maior ou igual a zero e menor que {0}".format(dim)
        raw_input("Pressione <enter> para continuar...")
        return False

    if j < 0 or j >= dim:

        print "Coordenada j deve ser maior ou igual a zero e menor que {0}".format(dim)
        raw_input("Pressione <enter> para continuar...")
        return False

    return (i, j)

##
# Parametros da partida
##

# Tamanho (da lateral) do tabuleiro. NECESSARIAMENTE PAR E MENOR QUE 10!
dim = 4

# Numero de jogadores
nJogadores = 2

# Numero total de pares de pecas
totalDePares = dim**2 / 2

##
# Programa principal
##

# Cria um novo tabuleiro para a partida
tabuleiro = novoTabuleiro(dim)

# Cria um novo placar zerado
placar = novoPlacar(nJogadores)

# Partida continua enquanto ainda ha pares de pecas a 
# casar.
paresEncontrados = 0
vez = 0
while paresEncontrados < totalDePares:

    # Requisita primeira peca do proximo jogador
    while True:

        # Imprime status do jogo
        imprimeStatus(tabuleiro, placar, vez)

        # Solicita coordenadas da primeira peca.
        coordenadas = leCoordenada(dim)
        if coordenadas == False:
            continue

        i1, j1 = coordenadas

        # Testa se peca ja esta aberta (ou removida)
        if abrePeca(tabuleiro, i1, j1) == False:

            print "Escolha uma peca ainda fechada!"
            raw_input("Pressione <enter> para continuar...")
            continue

        break 

    # Requisita segunda peca do proximo jogador
    while True:

        # Imprime status do jogo
        imprimeStatus(tabuleiro, placar, vez)

        # Solicita coordenadas da segunda peca.
        coordenadas = leCoordenada(dim)
        if coordenadas == False:
            continue

        i2, j2 = coordenadas

        # Testa se peca ja esta aberta (ou removida)
        if abrePeca(tabuleiro, i2, j2) == False:

            print "Escolha uma peca ainda fechada!"
            raw_input("Pressione <enter> para continuar...")
            continue

        break 

    # Imprime status do jogo
    imprimeStatus(tabuleiro, placar, vez)

    print "Pecas escolhidas --> ({0}, {1}) e ({2}, {3})\n".format(i1, j1, i2, j2)

    # Pecas escolhidas sao iguais?
    if tabuleiro[i1][j1] == tabuleiro[i2][j2]:

        print "Pecas casam! Ponto para o jogador {0}.".format(vez + 1)
        
        incrementaPlacar(placar, vez)
        paresEncontrados = paresEncontrados + 1
        removePeca(tabuleiro, i1, j1)
        removePeca(tabuleiro, i2, j2)

        time.sleep(5)
    else:

        print "Pecas nao casam!"
        
        time.sleep(3)

        fechaPeca(tabuleiro, i1, j1)
        fechaPeca(tabuleiro, i2, j2)
        vez = (vez + 1) % nJogadores

# Verificar o vencedor e imprimir
pontuacaoMaxima = max(placar)
vencedores = []
for i in range(0, nJogadores):

    if placar[i] == pontuacaoMaxima:
        vencedores.append(i)

if len(vencedores) > 1:

    sys.stdout.write("Houve empate entre os jogadores ")
    for i in vencedores:
        sys.stdout.write(str(i + 1) + ' ')

    sys.stdout.write("\n")

else:

    print "Jogador {0} foi o vencedor!".format(vencedores[0] + 1)


