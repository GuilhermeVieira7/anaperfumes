# Ana Perfumes: sistema visual

Linha de referência: lojas de perfumaria de marca global (Byredo, Aesop, Diptyque, O Boticário). O produto é o protagonista, a interface fica em segundo plano. Os valores ficam como tokens no início de `css/style.css`, no mesmo método dos design systems da Natura (GaYa) e do Grupo Boticário (Flora).

## Princípios

1. **O produto em fundo de estúdio.** Todo frasco aparece sobre o mesmo fundo de pedra clara, com luz do alto e chão levemente mais escuro, como numa foto de catálogo. As fotos reais entram no mesmo lugar.
2. **Uma família tipográfica.** Hanken Grotesk em toda a interface. Títulos em peso 300, grandes e com espaçamento negativo. Interface em 400 e 500.
3. **Cor só onde informa.** Neutros na estrutura; o verde floresta marca o que é vantagem (faixa do topo, preço no Pix, atendimento). As cores das famílias aparecem só no líquido e nas amostras.
4. **Movimento discreto.** A abertura aparece uma vez; o resto do movimento responde ao cliente (sacola deslizando, acordeões, foco nos cards).

## Cores

| Token | Hex | Uso |
|---|---|---|
| `--papel` | #F5F4F1 | Fundo da página |
| `--pedra` / `--estudio` | #E6E2DC | Fundo dos produtos |
| `--tinta` | #171615 | Texto, botões principais, rodapé |
| `--cinza` | #6B6762 | Texto secundário |
| `--linha` | #DCD8D2 | Divisórias e bordas |
| `--floresta` | #1F3A2E | Faixa do topo, Pix, bloco de atendimento |

## Tipografia

| Uso | Tamanho | Peso |
|---|---|---|
| Título da abertura | 44–84 px | 300 |
| Título de seção | 28–40 px | 300 |
| Nome de família / preço grande | 22 px | 400 |
| Texto e botões | 15–16 px | 400–500 |
| Apoio e legendas | 12–13 px | 400 |

## Forma

- Raio de 2 px em botões, campos e imagens. Nada de pílulas.
- Botões retangulares de 52 px: preto (ação principal) e contorno (secundária).
- Divisórias de 1 px no lugar de sombras. Sombra só no botão flutuante do WhatsApp.

## Componentes

- **Card**: imagem 4:5 em fundo de estúdio, favorito, botão "Adicionar" que aparece ao passar o mouse, família, nome, linha, tamanhos, preço e preço no Pix.
- **Página do produto**: imagem grande à esquerda; à direita preço com Pix e parcelas, tamanhos, quantidade, sacola e favoritos, e acordeões (Notas olfativas, Descrição, Entrega e pagamento). No celular, a barra de compra fica fixa.
- **Sacola**: abre ao adicionar, com barra de progresso para entrega grátis, opção de presente e finalização pelo WhatsApp.
- **Quiz**: três perguntas e três sugestões.
