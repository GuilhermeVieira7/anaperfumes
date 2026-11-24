# Ana Perfumes: sistema visual

Guia curto para manter o site consistente quando ele crescer. Segue a mesma lógica dos design systems de grandes marcas de beleza (GaYa, da Natura, e Flora, do Grupo Boticário): decisões visuais viram **tokens** com nome e são reaproveitadas em todos os componentes. Os tokens ficam no início de `css/style.css`.

## Cores

| Token | Hex | Uso |
|---|---|---|
| `--ameixa` | #34182F | Marca, botões principais, hero, rodapé |
| `--ameixa-2` | #4A2343 | Hover dos botões principais |
| `--ambar` | #C98A3D | Destaques: faixa do topo, selo "Novo", contador da sacola |
| `--nevoa` | #F1EAF0 | Superfícies secundárias (pirâmide olfativa, "Como comprar") |
| `--vidro` | #FBF8FA | Fundo da página |
| `--tinta` | #21131F | Texto |
| `--suave` | #6E5A69 | Texto secundário (contraste 6:1 sobre o fundo) |
| `--cor-pix` | #2F7A55 | Preço no Pix e confirmação "Adicionado" |

As cores das **famílias olfativas** ficam em `js/produtos.js` e tingem o líquido do frasco, o fundo da vitrine e as bolinhas dos filtros.

## Tipografia

- **Bodoni Moda**: títulos, nomes de perfume e marca. Remete às casas de perfumaria clássicas.
- **Figtree**: textos, preços, botões.
- Escala 1.333: 14 / 16 / 21 / 28 / 38 px e título do hero fluido (42 a 74 px).
- Preços usam algarismos tabulares para alinhar.

## Espaçamento, raios e sombra

- Espaçamento em grade de 4/8 px: `--e-1` (4px) até `--e-9` (88px).
- Raios com hierarquia: botões e chips são pílulas (`--pilula`), campos e vitrines quase retos (`--borda`, 3px), janelas flutuantes com `--borda-m` (8px).
- Sombra só no que flutua sobre a página (botão do WhatsApp, frasco do hero). Cards não têm sombra.

## Componentes

- **Card de produto**: vitrine tingida pela família, favorito, selo (Mais pedido / Novo), preço cheio, preço no Pix, parcelamento e botão de compra. Se o perfume tem mais de um tamanho, o botão abre a escolha de tamanho.
- **Janela do produto**: pirâmide olfativa (saída, coração, fundo), tamanhos e quantidade. No celular, a barra de compra fica fixa no rodapé.
- **Sacola**: lateral, salva no aparelho, com opção de presente e envio pelo WhatsApp.

## Acessibilidade

Foco visível em âmbar, alvos de toque de 44px no mínimo, menu e sacola fecham com Esc, animações desligadas para quem ativou "reduzir movimento".
