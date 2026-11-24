# Ana Perfumes

Site de vendas de perfumes da Ana Perfumes. HTML, CSS e JavaScript puros: não precisa de build, é só publicar a pasta (Vercel, Netlify ou GitHub Pages).

## Como trocar os perfumes

Tudo fica em **`js/produtos.js`**:

1. **`CONFIG`**: número do WhatsApp que recebe os pedidos (`55` + DDD + número), Instagram, cidade e o texto do frete.
2. **`PRODUTOS`**: apague os perfumes de demonstração e cadastre os seus. Cada perfume tem:
   - `nome`, `linha` (Eau de Parfum, Body Splash…), `descricao`
   - `familia`: `floral`, `amadeirado`, `citrico`, `oriental`, `gourmand` ou `aquatico`
   - `genero`: `feminino`, `masculino` ou `unissex`
   - `notas`: notas de saída (`topo`), `coracao` e `fundo`
   - `tamanhos`: lista de `{ ml, preco }`
   - `destaque: true` mostra o selo "Mais pedido"
   - `imagem`: caminho da foto, ex. `"img/produtos/priprioca.png"`. Enquanto estiver vazio, o site desenha um frasco em estilo de estúdio na cor da família.
     **Fotos:** use PNG ou WebP com **fundo transparente**, quadradas (800×800 ou 1000×1000), com o frasco centralizado e de pé. O site aplica sombra e a ilustração do ingrediente automaticamente. Para tirar o fundo de uma foto de celular, dá para usar o remove.bg ou o Canva.
3. **`FAMILIAS`**: se quiser, ajuste as cores e as frases de cada família.

## Como funciona a compra

O cliente monta a sacola (fica salva no aparelho dele) e toca em **Enviar pedido pelo WhatsApp**. A mensagem já sai com os itens, os tamanhos e o total.

## Descobrir meu perfume

O quiz de três perguntas (para quem, quando usa, que sensação) recomenda os três perfumes do catálogo que mais combinam. Ele usa a família e o gênero de cada produto, então funciona sozinho quando você cadastrar os seus.

## Estrutura

```
index.html
css/style.css
js/produtos.js   ← catálogo e configurações
js/graficos.js   ← desenho dos frascos e das ilustrações de ingredientes
js/app.js        ← lógica do site (catálogo, sacola, quiz, animações)
img/             ← favicon e fotos dos produtos
```
