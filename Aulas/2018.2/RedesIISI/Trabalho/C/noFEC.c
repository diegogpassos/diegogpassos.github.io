#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <errno.h>
#include <time.h>
#include <math.h>
#include <string.h>

/*********
 * Implementacao um esquema sem qualquer metodo de codificao.
 *
 * Cada byte do pacote original eh mapeado para o mesmo byte no pacote
 * codificado.
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

    return(8 * packetLength);
}

/*
 * Codifica o pacote de entrada, gerando um pacote
 * de saida com bits redundantes.
 */
void codePacket(unsigned char * codedPacket, unsigned char * originalPacket, int packetLength) {

    /*
     * Sem codificacao, basta copiar o pacote original.
     */
    memcpy(codedPacket, originalPacket, 8 * packetLength);
}

/*
 * Executa decodificacao do pacote transmittedPacket, gerando
 * novo pacote decodedPacket. Nota: codedLength eh em bits.
 */
void decodePacket(unsigned char * decodedPacket, unsigned char * transmittedPacket, int codedLength) {

    /*
     * Sem codificacao, basta copiar o conteudo do pacote transmitido.
     */
    memcpy(decodedPacket, transmittedPacket, codedLength);
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
