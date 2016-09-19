; Programa que realiza divisões inteiras
; Assume dividendo na posição 100 e divisor 
; na posição 104. Quociente é guardado em 108.
; Resto em 112.
; Assume que registradores estão zerados.
; Utiliza processo de subtrações sucessivas.

; Carregar um ponteiro com endereço base dos
; operandos.
addi $0, $0, 100

; Ler valores dos operandos
; Durante a execução:
;  - $1 acumula o quociente.
;  - $2 guarda o dividendo.
;  - $3 guarda o divisor.
;  - $4 é usado para comparações.
;  - $5 é usado como 0 para referência.
lw $2, 0($0)
lw $3, 4($0)

TESTE:
; Teste: dividendo é menor que divisor?
slt $4, $2, $3
beq $4, $5, SUBTRACAO

; Fim do algoritmo. Vamos salvar o quociente e o resto.
sw $1, 8($0)
sw $2, 12($0)
FIM:
j FIM ; loop infinito no final do programa

SUBTRACAO:
; Aqui, subtraímos o dividendo do divisor e 
; voltamos para o teste.
sub $2, $2, $3
addi $1, $1, 1
j TESTE
