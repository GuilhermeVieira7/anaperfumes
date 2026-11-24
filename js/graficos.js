/* Ana Perfumes — imagem dos produtos
   Enquanto um produto não tem foto (campo "imagem" em produtos.js),
   o site desenha o frasco como uma foto de estúdio: vidro, líquido, tampa e sombra. */

const Graficos = (() => {
  let uid = 0;

  /* Formatos de frasco, desenhados numa área de 120 × 180 */
  const FORMAS = {
    classico: {
      tampa: { x: 38, y: 4, w: 44, h: 34, r: 1.5 },
      gargalo: { x: 50, y: 38, w: 20, h: 11 },
      corpo: "M22 58 Q22 49 31 49 H89 Q98 49 98 58 V164 Q98 174 88 174 H32 Q22 174 22 164Z",
      base: 160, nivel: 70, rotulo: { x: 37, y: 100, w: 46, h: 40 }, sombra: 44,
      brilho: "M28 60 V160", brilho2: "M92 64 V150",
    },
    redondo: {
      tampa: { x: 43, y: 8, w: 34, h: 32, r: 2 },
      gargalo: { x: 52, y: 40, w: 16, h: 20 },
      corpo: "M60 60 A56 56 0 1 1 59.9 60Z",
      base: 166, nivel: 82, rotulo: { x: 38, y: 102, w: 44, h: 34 }, sombra: 46,
      brilho: "M18 100 Q16 122 24 144", brilho2: "M100 98 Q104 112 101 128",
    },
    alto: {
      tampa: { x: 46, y: 0, w: 28, h: 42, r: 1 },
      gargalo: { x: 53, y: 42, w: 14, h: 9 },
      corpo: "M36 58 Q36 51 43 51 H77 Q84 51 84 58 V168 Q84 176 76 176 H44 Q36 176 36 168Z",
      base: 164, nivel: 68, rotulo: { x: 41, y: 104, w: 38, h: 40 }, sombra: 32,
      brilho: "M41 62 V166", brilho2: "M79 66 V150",
    },
    facetado: {
      tampa: { x: 42, y: 6, w: 36, h: 32, r: 1 },
      gargalo: { x: 51, y: 38, w: 18, h: 11 },
      corpo: "M28 49 H92 L104 64 V160 L92 175 H28 L16 160 V64Z",
      base: 162, nivel: 72, rotulo: { x: 37, y: 102, w: 46, h: 40 }, sombra: 46,
      brilho: "M22 68 V156", brilho2: "M98 68 V156",
      facetas: '<path d="M16 64 L28 49 H34 L22 64 V160 L34 175 H28 L16 160Z" fill="#fff" opacity=".22"/><path d="M104 64 L92 49 H86 L98 64 V160 L86 175 H92 L104 160Z" fill="#000" opacity=".1"/>',
    },
  };

  const TAMPAS = {
    preta:   ["#0c0c0c", "#2f2f2f", "#141414", "#3c3c3c", "#0a0a0a"],
    prata:   ["#7b7e82", "#d9dcdf", "#9a9da1", "#eef0f1", "#73767a"],
    ouro:    ["#8c6a32", "#d9bd85", "#a8823f", "#ecd9ad", "#7f6030"],
    madeira: ["#4a3020", "#7b5539", "#5d3d29", "#8a6447", "#43291b"],
  };
  const TAMPA_PADRAO = { floral: "prata", amadeirado: "madeira", citrico: "prata", oriental: "preta", gourmand: "ouro", aquatico: "prata" };

  /**
   * p: produto. op.classe: classes extras. op.semFoto: força o desenho.
   */
  function frasco(p, op = {}) {
    if (p.imagem && !op.semFoto) {
      return `<span class="foto ${op.classe || ""}"><img src="${p.imagem}" alt="${p.nome}" loading="lazy" decoding="async" /></span>`;
    }
    const f = FORMAS[p.frasco] || FORMAS.classico;
    const cor = FAMILIAS[p.familia]?.cor || "#d8c7a8";
    const metal = TAMPAS[p.tampa] || TAMPAS[TAMPA_PADRAO[p.familia]] || TAMPAS.preta;
    const id = `g${++uid}`;
    const r = f.rotulo, t = f.tampa, g = f.gargalo;
    const nome = (p.nome || "").toUpperCase();
    const linha = (p.linha || "").toUpperCase();
    const fonteNome = nome.length > 14 ? 3.1 : nome.length > 10 ? 3.6 : 4.2;

    return `
      <svg class="frasco ${op.classe || ""}" viewBox="0 0 140 200" role="img" aria-label="Frasco do perfume ${p.nome}">
        <defs>
          <clipPath id="${id}c"><path d="${f.corpo}"/></clipPath>
          <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stop-color="${cor}" stop-opacity=".72"/>
            <stop offset="1" stop-color="${cor}" stop-opacity=".95"/>
          </linearGradient>
          <linearGradient id="${id}s" x1="0" x2="1">
            <stop offset="0" stop-color="#000" stop-opacity=".22"/>
            <stop offset=".18" stop-color="#000" stop-opacity="0"/>
            <stop offset=".62" stop-color="#fff" stop-opacity=".06"/>
            <stop offset=".86" stop-color="#000" stop-opacity=".04"/>
            <stop offset="1" stop-color="#000" stop-opacity=".26"/>
          </linearGradient>
          <linearGradient id="${id}t" x1="0" x2="1">
            ${metal.map((c, i) => `<stop offset="${i / (metal.length - 1)}" stop-color="${c}"/>`).join("")}
          </linearGradient>
          <radialGradient id="${id}h" cx=".5" cy=".5" r=".5">
            <stop offset="0" stop-color="#1a1714" stop-opacity=".42"/>
            <stop offset=".6" stop-color="#1a1714" stop-opacity=".12"/>
            <stop offset="1" stop-color="#1a1714" stop-opacity="0"/>
          </radialGradient>
          <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.6"/></filter>
          <filter id="${id}sb" x="-50%" y="-200%" width="200%" height="500%"><feGaussianBlur stdDeviation="3.5"/></filter>
        </defs>

        <!-- sombras: luz vinda da esquerda -->
        <ellipse cx="${80}" cy="181" rx="${f.sombra + 10}" ry="6" fill="url(#${id}h)" filter="url(#${id}sb)"/>
        <ellipse cx="70" cy="179.5" rx="${f.sombra - 6}" ry="2.2" fill="#1a1714" opacity=".38" filter="url(#${id}b)"/>

        <g transform="translate(10 4)">
          <!-- vidro (fundo) -->
          <path d="${f.corpo}" fill="#fff" fill-opacity=".28"/>
          <g clip-path="url(#${id}c)">
            <!-- líquido -->
            <rect x="0" y="${f.nivel}" width="120" height="${180 - f.nivel}" fill="url(#${id}l)"/>
            <rect x="0" y="${f.nivel}" width="120" height="1.2" fill="#fff" opacity=".55"/>
            <!-- fundo espesso do vidro -->
            <rect x="0" y="${f.base}" width="120" height="20" fill="#fff" opacity=".35"/>
            <rect x="0" y="${f.base}" width="120" height=".8" fill="#fff" opacity=".7"/>
            <!-- volume e espessura das paredes -->
            <rect width="120" height="180" fill="url(#${id}s)"/>
            <path d="${f.corpo}" fill="none" stroke="#fff" stroke-opacity=".42" stroke-width="7"/>
            ${f.facetas || ""}
            <!-- reflexos de estúdio -->
            <path d="${f.brilho}" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".85" filter="url(#${id}b)" fill="none"/>
            <path d="${f.brilho2}" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".7" fill="none"/>
          </g>
          <path d="${f.corpo}" fill="none" stroke="#fff" stroke-opacity=".9" stroke-width=".8"/>
          <path d="${f.corpo}" fill="none" stroke="#000" stroke-opacity=".08" stroke-width=".4" transform="translate(.6 .6)"/>

          <!-- rótulo -->
          <g>
            <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#f7f5f1"/>
            <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="url(#${id}s)" opacity=".5"/>
            <text x="${r.x + r.w / 2}" y="${r.y + 11}" text-anchor="middle" class="frasco__marca">ANA</text>
            <line x1="${r.x + r.w / 2 - 5}" x2="${r.x + r.w / 2 + 5}" y1="${r.y + 15}" y2="${r.y + 15}" stroke="#171615" stroke-width=".25"/>
            <text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 5}" text-anchor="middle" class="frasco__nome" style="font-size:${fonteNome}px">${nome}</text>
            <text x="${r.x + r.w / 2}" y="${r.y + r.h - 5}" text-anchor="middle" class="frasco__linha">${linha}</text>
          </g>

          <!-- gargalo e tampa -->
          <rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="#d9d6d1"/>
          <rect x="${g.x}" y="${g.y}" width="${g.w}" height="${g.h}" fill="url(#${id}s)"/>
          <rect x="${t.x}" y="${t.y}" width="${t.w}" height="${t.h}" rx="${t.r}" fill="url(#${id}t)"/>
          <rect x="${t.x}" y="${t.y + t.h - 1.2}" width="${t.w}" height="1.2" fill="#000" opacity=".25"/>
        </g>
      </svg>`;
  }

  return { frasco };
})();
