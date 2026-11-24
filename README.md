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
   - `imagem`: caminho da foto, ex. `"img/produtos/priprioca.png"`. Enquanto estiver vazio, o site desenha um frasco na cor da família.
     Dica: use fotos em PNG com fundo transparente, quadradas (por volta de 800×800).
3. **`FAMILIAS`**: se quiser, ajuste as cores e as frases de cada família.

## Como funciona a compra

O cliente monta a sacola (fica salva no aparelho dele) e toca em **Enviar pedido pelo WhatsApp**. A mensagem já sai com os itens, os tamanhos e o total.

## Estrutura

```
index.html
css/style.css
js/produtos.js   ← catálogo e configurações
js/app.js        ← lógica do site
img/             ← favicon e fotos dos produtos
```
