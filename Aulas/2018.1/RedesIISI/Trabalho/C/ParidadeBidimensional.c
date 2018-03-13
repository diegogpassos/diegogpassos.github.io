#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <math.h>
#include <string.h>

/*********
 * Implementacao simplificada de um esquema de paridade bidimensional 2x4
 * (paridade par).
 *
 * Cada byte do pacote (2x4 = 8 bits) eh mapeado para uma matrix 2x4:
 * d0 d1 d2 d3 d4 d5 d6 d7 => --           --
 *                            | d0 d1 d2 d3 |
 *                            | d4 d5 d6 d7 |
 *                            --           --
 * Cada coluna 0 <= i <= 3 da origem a uma paridade pc_i.
 * Cada linha 0 <= i <= 1 da origem a uma paridade pl_i.
 *
 * No pacote codificado, os bits sao organizados na forma:
 * d0 d1 d2 d3 d4 d5 d6 d7 pc0 pc1 pc2 pc3 pl0 pl1
 *
 * Isso se repete para cada byte do pacote original.
 */

/***
 **
 * Funcoes a serem alteradas!
 **
 ***/

/*
 * Retorna o tamanho (em bits) de um pacote codificado com base no
 * tamanho do pacote original (em bytes).
 */
int getCodedLength(int packetLength) {

    return(14 * packetLength);
}

/*
 * Codifica o pacote de entrada, gerando um pacote
 * de saida com bits redundantes.
 */
void codePacket(unsigned char * codedPacket, unsigned char * originalPacket, int packetLength) {

    unsigned char parityMatrix[2][4];
    int i, j, k;

    /*
     * Itera por cada byte do pacote original.
     */
    for (i = 0; i < packetLength; i++) {

        /*
         * Bits do i-esimo byte sao dispostos na matriz.
         */
        for (j = 0; j < 2; j++) {

            for (k = 0; k < 4; k++) {

                parityMatrix[j][k] = originalPacket[i * 8 + 4 * j + k];
            }
        }

        /*
         * Replicacao dos bits de dados no pacote codificado.
         */
        for (j = 0; j < 8; j++) {

            codedPacket[i * 14 + j] = originalPacket[i * 8 + j];
        }

        /*
         * Calculo dos bits de paridade, que sao colocados
         * no pacote codificado: paridade das colunas.
         */
        for (j = 0; j < 4; j++) {

            if ((parityMatrix[0][j] + parityMatrix[1][j]) % 2 == 0)
                codedPacket[i * 14 + 8 + j] = 0;
            else
                codedPacket[i * 14 + 8 + j] = 1;
        }

        /*
         * Calculo dos bits de paridade, que sao colocados
         * no pacote codificado: paridade das linhas.
         */
        for (j = 0; j < 2; j++) {

            if ((parityMatrix[j][0] +
                 parityMatrix[j][1] +
                 parityMatrix[j][2] +
                 parityMatrix[j][3]) % 2 == 0)
                codedPacket[i * 14 + 12 + j] = 0;
            else
                codedPacket[i * 14 + 12 + j] = 1;
        }

    }
}

/*
 * Executa decodificacao do pacote transmittedPacket, gerando
 * novo pacote decodedPacket. Nota: codedLength eh em bits.
 */
void decodePacket(unsigned char * decodedPacket, unsigned char * transmittedPacket, int codedLength) {

    unsigned char parityMatrix[2][4];
    unsigned char parityColumns[4];
    unsigned char parityRows[2];
    int errorInColumn, errorInRow;
    int i, j, k;
    int n = 0; // Contador de bytes no pacote decodificado.

    /*
     * Itera por cada sequencia de 14 bits (8 de dados + 6 de paridade).
     */
    for (i = 0; i < codedLength; i += 14) {

        /*
         * Bits do i-esimo conjunto sao dispostos na matriz.
         */
        for (j = 0; j < 2; j++) {

            for (k = 0; k < 4; k++) {

                parityMatrix[j][k] = transmittedPacket[i + 4 * j + k];
            }
        }

        /*
         * Bits de paridade das colunas.
         */
        for (j = 0; j < 4; j++) {

            parityColumns[j] = transmittedPacket[i + 8 + j];
        }

        /*
         * Bits de paridade das linhas.
         */
        for (j = 0; j < 2; j++) {

            parityRows[j] = transmittedPacket[i + 12 + j];
        }

        /*
         * Verificacao dos bits de paridade: colunas.
         * Note que paramos no primeiro erro, ja que se houver mais
         * erros, o metodo eh incapaz de corrigi-los de qualquer
         * forma.
         */
        errorInColumn = -1;
        for (j = 0; j < 4; j++) {

            if ((parityMatrix[0][j] + parityMatrix[1][j]) % 2 != parityColumns[j]) {

                errorInColumn = j;
                break ;
            }
        }

        /*
         * Verificacao dos bits de paridade: linhas.
         * Note que paramos no primeiro erro, ja que se houver mais
         * erros, o metodo eh incapaz de corrigi-los de qualquer
         * forma.
         */
        errorInRow = -1;
        for (j = 0; j < 2; j++) {

            if ((parityMatrix[j][0] +
                 parityMatrix[j][1] +
                 parityMatrix[j][2] +
                 parityMatrix[j][3]
             ) % 2 != parityRows[j]) {

                errorInRow = j;
                break ;
            }
        }

        /*
         * Se algum erro foi encontrado, corrigir.
         */
        if (errorInRow > -1 && errorInColumn > -1) {

            if (parityMatrix[errorInRow][errorInColumn] == 1)
                parityMatrix[errorInRow][errorInColumn] = 0;
            else
                parityMatrix[errorInRow][errorInColumn] = 1;
        }

        /*
         * Colocar bits (possivelmente corrigidos) na saida.
         */
         for (j = 0; j < 2; j++) {

             for (k = 0; k < 4; k++) {

                 decodedPacket[8 * n + 4 * j + k] = parityMatrix[j][k];
             }
         }

         /*
          * Incrementar numero de bytes na saida.
          */
         n++;
    }
}

/***
 **
 * Outras funcoes.
 **
 ***/

/*
 * Gera conteudo aleatorio no pacote passado como
 * parâmetro. Pacote eh representado por um vetor de
 * bytes, em que cada posicao representa um bit.
 * Comprimento do pacote (em bytes) também deve ser
 * especificado.
 */
void generateRandomPacket(unsigned char * packet, int length) {

    int i;

    for (i = 0; i < length * 8; i++) {

        packet[i] = rand() % 2;
    }
}

/*
 * Gera um numero pseudo-aleatorio com distribuicao geometrica.
 */
int geomRand(double p) {

    double uRand = ((double) rand() + 1) / ((double) RAND_MAX + 1);

    return((int) floor(log(uRand) / log(1 - p)));
}

/*
 * Insere erros aleatorios no pacote, gerando uma nova versao.
 * Cada bit tem seu erro alterado com probabilidade errorProb,
 * e de forma independente dos demais bits.
 * Retorna o numero de erros inseridos no pacote.
 */
int insertErrors(unsigned char * transmittedPacket, unsigned char * codedPacket, int codedLength, double errorProb) {

    int i = -1;
    int n = 0; // Numero de erros inseridos no pacote.
    int r;

    /*
     * Copia o conteúdo do pacote codificado para o novo pacote.
     */
    memcpy(transmittedPacket, codedPacket, codedLength);

    while (1) {

        /*
         * Sorteia a proxima posicao em que um erro sera inserido.
         */
        r = geomRand(errorProb);
        i = i + 1 + r;

        if (i >= codedLength) break ;

        /*
         * Altera o valor do bit.
         */
        if (transmittedPacket[i] == 1)
            transmittedPacket[i] = 0;
        else
            transmittedPacket[i] = 1;

        n++;
    }

    return(n);
}

/*
 * Conta o numero de bits errados no pacote
 * decodificado usando como referencia
 * o pacote original. O parametro packetLength especifica o
 * tamanho dos dois pacotes em bytes.
 */
int countErrors(unsigned char * originalPacket, unsigned char * decodedPacket, int packetLength) {

    int i;
    int errors = 0;

    for (i = 0; i < packetLength * 8; i++) {

        if (originalPacket[i] != decodedPacket[i])
            errors++;
    }

    return(errors);
}

/*
 * Exibe modo de uso e aborta execucao.
 */
void help(char * self) {

    fprintf(stderr, "Simulador de metodos de FEC/codificacao.\n\n");
    fprintf(stderr, "Modo de uso:\n\n");
    fprintf(stderr, "\t%s <tam_pacote> <reps> <prob. erro>\n\n", self);
    fprintf(stderr, "Onde:\n");
    fprintf(stderr, "\t- <tam_pacote>: tamanho do pacote usado nas simulacoes (em bytes).\n");
    fprintf(stderr, "\t- <reps>: numero de repeticoes da simulacao.\n");
    fprintf(stderr, "\t- <prob. erro>: probabilidade de erro de bits (i.e., probabilidade\n"
                    "de que um dado bit tenha seu valor alterado pelo canal.)\n\n");

    exit(1);
}

/*
 * Programa principal:
 *  - le parametros de entrada;
 *  - gera pacote aleatorio;
 *  - gera bits de redundancia do pacote
 *  - executa o numero pedido de simulacoes:
 *      + Introduz erro
 *  - imprime estatisticas.
 */
int main(int argc, char ** argv) {

    /*
     * Parametros de entrada.
     */
    int packetLength, reps;
    double errorProb;

    /*
     * Pacotes manipulados.
     */
    unsigned char * originalPacket;
    unsigned char * codedPacket;
    unsigned char * decodedPacket;
    unsigned char * transmittedPacket;

    /*
     * Variáveis auxiliares.
     */
    int i;
    unsigned long bitErrorCount;
    unsigned long totalBitErrorCount = 0;
    unsigned long totalPacketErrorCount = 0;
    unsigned long totalInsertedErrorCount = 0;
    int codedLength;

    /*
     * Leitura dos argumentos de linha de comando.
     */
    if (argc != 4)
        help(argv[0]);

    packetLength = atoi(argv[1]);
    reps = atoi(argv[2]);
    errorProb = atof(argv[3]);

    if (packetLength <= 0 || reps <= 0 || errorProb < 0 || errorProb > 1)
        help(argv[0]);

    /*
     * Inicializacao da semente do gerador de numeros
     * pseudo-aleatorios.
     */
    srand(time(NULL));

    /*
     * Geracao do pacote original aleatorio.
     */
    codedLength = getCodedLength(packetLength);
    originalPacket = malloc(packetLength * 8);
    decodedPacket = malloc(packetLength * 8);
    codedPacket = malloc(codedLength);
    transmittedPacket = malloc(codedLength);

    generateRandomPacket(originalPacket, packetLength);
    codePacket(codedPacket, originalPacket, packetLength);

    /*
     * Loop de repeticoes da simulacao.
     */
    for (i = 0; i < reps; i++) {

        /*
         * Gerar nova versao do pacote com erros aleatorios.
         */
        totalInsertedErrorCount += insertErrors(transmittedPacket, codedPacket, codedLength, errorProb);

        /*
         * Gerar versao decodificada do pacote.
         */
        decodePacket(decodedPacket, transmittedPacket, codedLength);

        /*
         * Contar erros.
         */
        bitErrorCount = countErrors(originalPacket, decodedPacket, packetLength);

        if (bitErrorCount) {

            totalBitErrorCount += bitErrorCount;
            totalPacketErrorCount++;
        }
    }

    printf("Numero de transmissoes simuladas: %d\n\n", reps);
    printf("Numero de bits transmitidos: %d\n", reps * packetLength * 8);
    printf("Numero de bits errados inseridos: %lu\n", totalInsertedErrorCount);
    printf("Taxa de erro de bits (antes da decodificacao): %.2f%%\n\n", (double) totalInsertedErrorCount / (double) (reps * codedLength) * 100.0);
    printf("Numero de bits corrompidos apos decodificacao: %lu\n", totalBitErrorCount);
    printf("Taxa de erro de bits (apos decodificacao): %.2f%%\n\n", (double) totalBitErrorCount / (double) (reps * packetLength * 8) * 100.0);
    printf("Numero de pacotes corrompidos: %lu\n", totalPacketErrorCount);
    printf("Taxa de erro de pacotes: %.2f%%\n", (double) totalPacketErrorCount / (double) reps * 100.0);

    return(0);
}
