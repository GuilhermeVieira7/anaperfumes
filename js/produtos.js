/* =========================================================
   ANA PERFUMES — CATÁLOGO E CONFIGURAÇÕES
   Edite este arquivo para trocar os perfumes de demonstração
   pelos que você tem disponíveis.
   ========================================================= */

const CONFIG = {
  // Número do WhatsApp que recebe os pedidos (só números, com DDI 55 + DDD)
  whatsapp: "5594999999999",
  instagram: "anaperfumes",
  cidade: "Parauapebas, PA",
  // Texto do frete exibido na sacola
  freteTexto: "Entrega combinada pelo WhatsApp. Retirada grátis em Parauapebas.",
  // Faixa fina no topo do site. Deixe "" para esconder.
  avisoTopo: "Entrega grátis em Parauapebas acima de R$ 199",
  // Desconto para pagamento no Pix, em %. Use 0 para não mostrar.
  descontoPix: 5,
  // Parcelamento sem juros no cartão
  parcelasSemJuros: 3,
  parcelaMinima: 30, // valor mínimo de cada parcela, em R$
};

/* Famílias olfativas
   cor = cor do "líquido" do frasco e das etiquetas */
const FAMILIAS = {
  floral:     { nome: "Floral",     cor: "#E59AB4", frase: "Pétalas, pele limpa e delicadeza que dura o dia todo." },
  amadeirado: { nome: "Amadeirado", cor: "#9A6A44", frase: "Madeiras, raízes e terra molhada. Presença sem esforço." },
  citrico:    { nome: "Cítrico",    cor: "#E6C84B", frase: "Frescor de casca de fruta. Para calor, manhã e movimento." },
  oriental:   { nome: "Oriental",   cor: "#A9334C", frase: "Especiarias, resinas e calor. Feito para a noite." },
  gourmand:   { nome: "Gourmand",   cor: "#C98A3D", frase: "Baunilha, cacau e doçura que dá vontade de chegar perto." },
  aquatico:   { nome: "Aquático",   cor: "#7DB6C8", frase: "Brisa, rio e chuva. Leve como uma pele recém-saída do banho." },
};

/* Produtos
   - id: único, sem espaços
   - familia: uma das chaves de FAMILIAS
   - genero: "feminino" | "masculino" | "unissex"
   - frasco: "classico" | "redondo" | "alto" | "facetado"  (desenho usado quando não há foto)
   - imagem: caminho da foto (ex.: "img/produtos/meu-perfume.png"). Deixe "" para usar o frasco desenhado.
   - tamanhos: lista de { ml, preco }
   - destaque: true para aparecer com o selo "Mais pedido"
   - novo: true para aparecer com o selo "Novo" (opcional)
*/
const PRODUTOS = [
  {
    id: "priprioca",
    nome: "Priprioca",
    linha: "Eau de Parfum",
    familia: "amadeirado",
    genero: "unissex",
    frasco: "classico",
    imagem: "",
    descricao: "A raiz perfumada da Amazônia encontra vetiver e cedro. Seco, terroso e elegante, com uma fumaça suave no fundo.",
    notas: { topo: ["Bergamota", "Pimenta-rosa"], coracao: ["Priprioca", "Vetiver"], fundo: ["Cedro", "Âmbar", "Musgo"] },
    tamanhos: [{ ml: 30, preco: 129.9 }, { ml: 50, preco: 189.9 }, { ml: 100, preco: 279.9 }],
    destaque: true,
  },
  {
    id: "chuva-de-belem",
    nome: "Chuva de Belém",
    linha: "Eau de Toilette",
    familia: "citrico",
    genero: "unissex",
    frasco: "alto",
    imagem: "",
    descricao: "A chuva das duas da tarde batendo no asfalto quente. Limão, gengibre e folhas verdes numa abertura que acorda.",
    notas: { topo: ["Limão-taiti", "Gengibre"], coracao: ["Folhas verdes", "Chá-mate"], fundo: ["Almíscar branco", "Vetiver"] },
    tamanhos: [{ ml: 50, preco: 139.9 }, { ml: 100, preco: 199.9 }],
    destaque: false,
  },
  {
    id: "vitoria-regia",
    nome: "Vitória-Régia",
    linha: "Eau de Parfum",
    familia: "floral",
    genero: "feminino",
    frasco: "redondo",
    imagem: "",
    descricao: "Um floral aquático luminoso, com lírio d'água e peônia sobre um fundo cremoso de sândalo.",
    notas: { topo: ["Pera", "Flor de lótus"], coracao: ["Peônia", "Lírio d'água"], fundo: ["Sândalo", "Almíscar"] },
    tamanhos: [{ ml: 30, preco: 119.9 }, { ml: 50, preco: 179.9 }, { ml: 100, preco: 259.9 }],
    destaque: true,
  },
  {
    id: "cupuacu-dourado",
    nome: "Cupuaçu Dourado",
    linha: "Eau de Parfum",
    familia: "gourmand",
    genero: "feminino",
    frasco: "facetado",
    imagem: "",
    descricao: "Cremoso e viciante: cupuaçu, baunilha e caramelo salgado. Fica na roupa até o dia seguinte.",
    notas: { topo: ["Cupuaçu", "Tangerina"], coracao: ["Caramelo", "Flor de laranjeira"], fundo: ["Baunilha", "Fava tonka"] },
    tamanhos: [{ ml: 30, preco: 134.9 }, { ml: 50, preco: 194.9 }, { ml: 100, preco: 289.9 }],
    destaque: true,
  },
  {
    id: "noite-no-ver-o-peso",
    nome: "Noite no Ver-o-Peso",
    linha: "Extrait de Parfum",
    familia: "oriental",
    genero: "unissex",
    frasco: "classico",
    imagem: "",
    descricao: "Cravo, canela e resinas que lembram as barracas de ervas à noite. Intenso, quente e marcante.",
    notas: { topo: ["Cravo", "Cardamomo"], coracao: ["Canela", "Rosa vermelha"], fundo: ["Breu-branco", "Oud", "Benjoim"] },
    tamanhos: [{ ml: 50, preco: 249.9 }, { ml: 100, preco: 369.9 }],
    destaque: false,
  },
  {
    id: "rio-tapajos",
    nome: "Rio Tapajós",
    linha: "Eau de Toilette",
    familia: "aquatico",
    genero: "masculino",
    frasco: "alto",
    imagem: "",
    descricao: "Areia branca, água doce e brisa. Um aquático limpo e masculino, sem exagero.",
    notas: { topo: ["Notas aquáticas", "Hortelã"], coracao: ["Sálvia", "Lavanda"], fundo: ["Madeira flutuante", "Âmbar-cinza"] },
    tamanhos: [{ ml: 50, preco: 129.9 }, { ml: 100, preco: 189.9 }],
    destaque: false,
  },
  {
    id: "jasmim-do-quintal",
    nome: "Jasmim do Quintal",
    linha: "Eau de Parfum",
    familia: "floral",
    genero: "feminino",
    frasco: "facetado",
    imagem: "",
    descricao: "O jasmim que abre no fim da tarde, misturado com flor de laranjeira e um toque de mel.",
    notas: { topo: ["Neroli", "Mandarina"], coracao: ["Jasmim sambac", "Flor de laranjeira"], fundo: ["Mel", "Almíscar"] },
    tamanhos: [{ ml: 30, preco: 109.9 }, { ml: 50, preco: 169.9 }],
    destaque: false,
  },
  {
    id: "castanha-e-baunilha",
    nome: "Castanha & Baunilha",
    linha: "Body Splash",
    familia: "gourmand",
    genero: "unissex",
    frasco: "redondo",
    imagem: "",
    descricao: "Leve para o dia a dia: castanha-do-pará tostada e baunilha suave. Bom para usar sem pensar.",
    notas: { topo: ["Pera"], coracao: ["Castanha-do-pará", "Leite"], fundo: ["Baunilha", "Açúcar mascavo"] },
    tamanhos: [{ ml: 200, preco: 69.9 }],
    destaque: false,
  },
  {
    id: "cedro-negro",
    nome: "Cedro Negro",
    linha: "Eau de Parfum",
    familia: "amadeirado",
    genero: "masculino",
    frasco: "facetado",
    imagem: "",
    descricao: "Couro, cedro defumado e pimenta-preta. Sério, adulto e com boa projeção.",
    notas: { topo: ["Pimenta-preta", "Toranja"], coracao: ["Couro", "Íris"], fundo: ["Cedro defumado", "Patchouli"] },
    tamanhos: [{ ml: 50, preco: 199.9 }, { ml: 100, preco: 299.9 }],
    destaque: true,
  },
  {
    id: "acai-e-rosa",
    nome: "Açaí & Rosa",
    linha: "Eau de Parfum",
    familia: "oriental",
    genero: "feminino",
    frasco: "redondo",
    imagem: "",
    descricao: "Rosa escura com frutas roxas e um fundo ambarado. Sensual sem ser pesado.",
    notas: { topo: ["Açaí", "Cassis"], coracao: ["Rosa turca", "Açafrão"], fundo: ["Âmbar", "Baunilha", "Patchouli"] },
    tamanhos: [{ ml: 30, preco: 139.9 }, { ml: 50, preco: 199.9 }, { ml: 100, preco: 289.9 }],
    destaque: false,
    novo: true,
  },
  {
    id: "folha-de-caju",
    nome: "Folha de Caju",
    linha: "Eau de Toilette",
    familia: "citrico",
    genero: "masculino",
    frasco: "classico",
    imagem: "",
    descricao: "Caju verde, limão-siciliano e manjericão. Fresco, verde e perfeito para o calor do Pará.",
    notas: { topo: ["Limão-siciliano", "Caju"], coracao: ["Manjericão", "Folha de figo"], fundo: ["Cedro", "Almíscar"] },
    tamanhos: [{ ml: 50, preco: 119.9 }, { ml: 100, preco: 169.9 }],
    destaque: false,
  },
  {
    id: "brisa-de-alter",
    nome: "Brisa de Alter",
    linha: "Body Splash",
    familia: "aquatico",
    genero: "feminino",
    frasco: "alto",
    imagem: "",
    descricao: "Água de coco, flor branca e sal. Uma brisa de praia de rio para borrifar o dia todo.",
    notas: { topo: ["Água de coco", "Sal marinho"], coracao: ["Flor de tiaré"], fundo: ["Almíscar", "Madeira clara"] },
    tamanhos: [{ ml: 200, preco: 64.9 }],
    destaque: false,
  },
];
