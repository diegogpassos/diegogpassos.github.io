---
title: Algoritmo de Dijkstra
header-includes: |
        <style type="text/css">
                .algoritmo table {
                        border-top: 2px double #000;
                        border-bottom: 2px double #000;
                        border-spacing: 0px 2px;
                }
                .algoritmo thead > tr > th {
                        border-bottom: 1px solid #000;
                }
                .algoritmo th {

                        padding-left: 5px;
                        padding-right: 5px;
                }
                .algoritmo tr {

                        height: 25px;
                }
                .algoritmo tr > td:last-child {
                        color: gray;
                }
        </style>
---

O Algoritmo de Dijkstra é um algoritmo clássico para o problema de caminho de custo mínimo em grafos. Ele recebe como entrada um grafo ponderado --- um conjunto de nós interconectados através de arestas associadas a pesos específicos --- e um nó de origem. Os pesos de cada aresta devem ser não-negativos. Como saída, o Algoritmo de Dijkstra gera uma lista dos caminhos de custo mínimo interligando o nó de origem a cada um dos demais nós do grafo. Aqui, **custo** denota o somatório dos pesos das arestas que compõem cada caminho.

O Algoritmo de Dijkstra foi criado por Edsger Dijkstra em 1956 e até hoje é amplamente adotado por protocolos de roteamento baseados em Estado de Enlace --- o algoritmo também encontra diversos outros usos em diferentes domínios. Embora tenha mais de seis décadas, ele permanece como o algoritmo de menor complexidade assintótica conhecido para resolver o problema de caminho de menor custo a partir de um único nó de origem em grafos arbitrários. Essa grande eficiência é um dos principais pontos que justificam o emprego desse algoritmo em protocolos de roteamento práticos que, muitas vezes, lidam com redes --- e, portanto, grafos --- muito grandes.

Nesse roteiro, faremos uma rápida revisão do funcionamento do Algoritmo de Dijkstra. Veremos também algumas propriedades e limitações desse algoritmo, além de alguns exemplos para fixação do seu funcionamento.

## O Algoritmo

O Algoritmo de Dijkstra é baseado em uma observação acerca da composição dos melhores caminhos em redes: se o melhor caminho de um nó de origem $u$ para um determinado destinatário $v$ passa por um nó intermediário $w$, então esse melhor caminho de $u$ para $v$ deve ser composto pelo melhor caminho de $u$ para $w$ concatenado com o melhor caminho de $w$ para $v$.

O algoritmo opera de forma iterativa, progressivamente encontrando o melhor caminho para cada um dos demais nós da rede. Mais especificamente, a cada iteração do seu *loop* principal, o algoritmo determina, com certeza, o melhor caminho até um novo destinatário. Assim, para uma rede com $n$ nós --- incluindo o nó de origem ---, o Algoritmo de Dijkstra precisará de $n-1$ iterações até sua finalização.

A cada iteração, quando o algoritmo determina definitivamente o melhor caminho para um certo destinatário $w$, ele percorre a lista dos vizinhos de $w$ montando novos caminhos candidatos. Esses caminhos candidatos são formados pela concatenação entre o melhor caminho da origem até $w$ e a aresta/enlace entre $w$ e seu vizinho. Se esse caminho candidato for melhor que o melhor caminho conhecido até esse momento para o vizinho de $w$, o algoritmo atualiza seu conhecimento.

Mais concretamente, o funcionamento do Algoritmo de Dijkstra pode ser resumido no pseudocódigo a seguir:


|                                                                                                                                |
|:-------------------------------------------------------------------------------------------------------------------------------|
| **Entrada:** grafo $G =  (N, E)$, nó de origem $u\in N$ e função $c(x, y)$ associando os custos de cada aresta $(x, y)\in E$  |
|**Saída:** vetor $D(v)$ das melhores distâncias da origem $u$ até cada destinatário $v$.                    |


:::{.algoritmo}

|      |                                                                    |                                      |
|:-----|:-------------------------------------------------------------------|:-------------------------------------|
|   1  |                     $N^\prime \leftarrow \{u\}$                    |   // Caminho para origem é trivial   |
|   2  |                         $D(u) \leftarrow 0$                        |              // Custo 0.             |
|   3  |                          $\forall v\in N$                          |         // Para os demais nós        |
|   4  |                    $\quad$ **se** $(u,v)\in E$                    |        // É vizinho da origem?       |
|   5  |           $\quad\quad$ **então** $D(v)\leftarrow c(u,v)$           |       // Conhecemos um caminho       |
|   6  |               $\quad\quad$ **senão** $D(v) = \infty$               |         // Ainda sem caminho         |
|   7  |                                                                    |                                      |
|   8  |                             **Repita**                             |           // Loop principal          |
|   9  |  $\quad$ Encontre $w \not\in N^\prime$ tal que $D(w)$ seja mínimo  |     // Melhor caminho provisório     |
|  10  |          $\quad$ $N^\prime \leftarrow N^\prime \cup \{w\}$         |        // Se torna definitivo        |
|  11  |   $\quad$ $\forall v$ tal que $v\not\in N^\prime\land (w,v)\in E$  |  // Vizinhos de w ainda provisórios  |
|  12  |        $\quad\quad$ $D(v)\leftarrow min(D(v),D(w) + c(w,v))$       |    // Anterior ou passando por w?    |
|  13  |                     **Até que** $N^\prime = N$                     |     // Até adição de todos os nós    |
:::

As seis primeiras linhas simplesmente fazem uma inicialização das estruturas de dados usadas pelo algoritmo. Basicamente, o algoritmo mantém um conjunto $N^\prime$ dos **nós definitivos** --- isto é, aqueles para os quais já conhecemos, com certeza, o melhor caminho possível a partir da origem $u$ --- e um vetor $D(v)$ dos custos dos melhores caminhos conhecidos até agora para cada destinatário $v$ --- definitivos ou não. Em um primeiro momento (linhas 1 e 2), o algoritmo simplesmente declara que o nó $u$ --- a própria origem --- é definitivo, porque a melhor distância de qualquer nó para ele mesmo será trivialmente zero. Em seguida (linhas 3 a 6), o algoritmo varre os vizinhos de $u$ encontrando caminhos triviais de um salto e inicializando $D(v)$ de acordo. Note que esses caminhos não são --- ainda, ao menos --- definitivos e poderão ser melhorados mais à frente na execução.

A partir da oitava linha, o algoritmo entra em seu *loop* principal. A cada iteração, um novo destinatário $w$ é adicionado ao conjunto $N^\prime$ dos nós definitivos (linhas 9 e 10). Em seguida (linhas 11 e 12), cada vizinho $v$ de $w$ é varrido e avalia-se o caminho candidato formado pela concatenação do melhor caminho  de $u$ para $w$ (recém-declarado como definitivo) com a aresta/enlace de $w$ para $v$. Se esse caminho candidato é melhor que o melhor caminho conhecido até esse momento para $v$, o algoritmo atualiza $D(v)$.

Mas como, em uma dada iteração, o Algoritmo de Dijkstra tem certeza de que o melhor caminho conhecido até agora para $w$ é, de fato, o melhor caminho possível? Em outras palavras, como sabemos que em iterações futuras não encontraríamos um outro caminho até então desconhecido para $w$ que tivesse custo ainda menor que o atual?

A resposta para isso está na condição adotada na linha 9: selecionamos $w$ como sendo o nó para o qual conhecemos o caminho de menor custo, dentre aqueles que ainda não estão no conjunto de definitivos. Suponha, por absurdo, que houvesse um outro caminho melhor de $u$ para $w$ diferente daquele conhecido agora. Vamos chamar o antecessor de $w$ nesse caminho --- *i.e.*, o nó que vem imediatamente antes de $w$ no caminho --- de $x$. Por hipótese, ainda não conhecemos esse caminho, o que quer dizer que $x$ ainda não foi marcado como definitivo --- *i.e.*, adicionado a $N^\prime$. Além disso, como os pesos das arestas/enlaces são todos não-negativos, o caminho de menor custo de $u$ para $x$ deve ter custo menor que o caminho de menor custo de $u$ para $w$, porque $x$ é antecessor de $w$. Nesse caso, no entanto, $w$ não pode ser o nó para o qual conhecemos o caminho de menor custo, dentre aqueles que ainda não estão no conjunto de definitivos: esse nó deveria ser $x$ ou algum de seus antecessores no menor caminho de $u$ para $x$.

## Predecessores e Caminhos

Embora isso não esteja denotado explicitamente no pseudocódigo apresentado, em geral queremos obter também a composição dos caminhos mais curtos encontrados pelo Algoritmo de Dijkstra, e não apenas seus respectivos custos. Para isso, implementações desse algoritmo normalmente guardam um **vetor de predecessores**. Esse vetor associa cada destinatário $v$ da rede a um outro nó $w$ que é seu predecessor imediato no caminho de menor custo. Esse vetor é atualizado toda vez que o código atualiza (com algum valor finito) o vetor $D(v)$: na  linha 5, o predecessor é $u$; na linha 12, se houve mudança, o predecessor é $w$.

Ao final do algoritmo, é possível reconstruir o caminho até um determinado destinatário $v$ percorrendo a lista de predecessores de trás para frente: começa-se determinando o predecessor $w$ de $v$; depois, determina-se o predecessor $x$ de $w$; o processo continua, até chegarmos em $u$.

## Limitações

Na introdução desse roteiro, destacamos que o Algoritmo de Dijkstra recebe como entrada um grafo ponderado cujos pesos sejam, necessariamente, não-negativos. Essa ressalva é importante porque, se o grafo contiver alguma aresta de peso negativo, o algoritmo deixa de garantir que irá encontrar os caminhos de menor custo. Isso não costuma ser um grande empecilho ao uso desse algoritmo de protocolos de roteamento, porque, em geral, as **métricas de roteamento** --- *i.e.*, as funções que avaliam a qualidade dos enlaces e lhes atribuem pesos --- normalmente geram pesos positivos apenas[^PesosNegativos]. Por exemplo, métricas típicas incluem estimativas do atraso de transmissão e níveis de enfileiramento de cada interface. Mesmo assim, é importante ter em mente essa restrição quando projetamos como avaliar os enlaces para fins de escolha de rotas.

[^PesosNegativos]: De fato, pesos negativos podem ser bastante problemáticos. Por exemplo, se a rede/grafo possui um ciclo negativo, então não há como definir um caminho de menor custo, porque sempre podemos passar mais uma vez pelas arestas do ciclo reduzindo o custo do "melhor" caminho atualmente conhecido.

## Exemplos

Ao final dessa página, há uma pequena aplicação `javascript` que ilustra o funcionamento do Algoritmo de Dijkstra. A aplicação permite que se altere a topologia, adicionando ou removendo nós e enlaces. Os custos dos enlaces também podem ser livremente alterados. Para os nós, é possível alterar o identificador. Note que também é possível selecionar o nó de origem --- destacado em verde.

Cada alteração realizada automaticamente dispara um recálculo do algoritmo. Os caminhos resultantes são destacados em vermelho na topologia. Além disso, a aplicação exibe um passo-a-passo da execução na tabela imediatamente abaixo da figura. Esse passo-a-passo mostra o conteúdo de cada variável interna mantida pelo algoritmo, incluindo:

- $N^\prime$: conjunto dos nós definitivos.
- $D(v)$: custo do menor caminho conhecido até esse ponto para o nó $v$.
- $p(v)$: predecessor (imediato) do nó $v$ no melhor caminho conhecido até esse ponto para o nó $v$.

A cada iteração, mostra-se também o nó selecionado para adição no conjunto de definitivos --- o custo/predecessor é circulado em vermelho.

Note, ainda, que o resultado final da execução é exibido na tabela à direita da imagem da topologia na forma de uma tabela de roteamento --- *i.e.*, destinatário, próximo salto e distância/custo.

Utilize essa aplicação modificando a topologia para tentar responder as questões ou executar as experiências sugeridas abaixo:

1. Considere a topologia carregada por padrão na aplicação e sua respectiva execução. Observe, em particular, o passo 1: há um empate entre os nós `A` e `B`, ambos com caminhos conhecidos naquele ponto com custo 4. Por qualquer motivo, o algoritmo optou por adicionar `A` ao conjunto de definitivos, ao invés de `B`. Essa opção faz alguma diferença? O resultado do algoritmo poderia ser alterado de alguma forma se `B` fosse escolhido? Caso sua resposta seja não, você consegue pensar em alguma topologia para a qual faria alguma diferença?
2. Repare que tabelas de roteamento associam o próximo salto no melhor caminho escolhido até um determinado destinatário, e não seu predecessor, como armazenado pelo Dijkstra. Como a informação dos predecessores pode ser traduzida para a informação dos próximos saltos?
3. Ainda com base no grafo carregado por padrão, remova as arestas/enlaces de `F` para `E` e de `F` para `B`. O que acontece nesse caso? Como o Dijkstra lida com isso?

<iframe src="Dijkstra.html" onload="this.style.height=(this.contentWindow.document.body.scrollHeight+40)+ 'px';" style="width: 100%;"/>