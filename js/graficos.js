/* Ana Perfumes — elementos gráficos
   Frascos em estilo foto de estúdio e ilustrações de ingredientes.
   Quando um produto tiver "imagem" em produtos.js, a foto é usada no lugar do desenho. */

const Graficos = (() => {
  let uid = 0;

  /* Formatos de frasco, desenhados numa área de 120 × 180 */
  const FORMAS = {
    classico: {
      tampa: '<rect x="40" y="6" width="40" height="30" rx="3"/>',
      tampaBrilho: '<rect x="45" y="9" width="4" height="24" rx="2"/>',
      gargalo: '<rect x="50" y="36" width="20" height="13"/>',
      corpo: "M22 60 Q22 48 34 48 H86 Q98 48 98 60 V160 Q98 172 86 172 H34 Q22 172 22 160Z",
      nivel: 76,
      brilho: '<rect x="29" y="58" width="6" height="104" rx="3"/><rect x="89" y="66" width="2.5" height="80" rx="1.2"/>',
      rotulo: { x: 40, y: 106, w: 40, h: 30 },
      sombra: 46,
    },
    redondo: {
      tampa: '<rect x="44" y="8" width="32" height="34" rx="16"/>',
      tampaBrilho: '<rect x="50" y="13" width="4" height="22" rx="2"/>',
      gargalo: '<rect x="52" y="42" width="16" height="20"/>',
      corpo: "M60 62 A54 54 0 1 1 59.9 62Z",
      nivel: 84,
      brilho: '<path d="M24 98 Q22 120 30 140" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/><circle cx="42" cy="82" r="4"/>',
      rotulo: { x: 40, y: 104, w: 40, h: 28 },
      sombra: 48,
    },
    alto: {
      tampa: '<rect x="47" y="0" width="26" height="40" rx="2"/>',
      tampaBrilho: '<rect x="51" y="3" width="3" height="34" rx="1.5"/>',
      gargalo: '<rect x="53" y="40" width="14" height="11"/>',
      corpo: "M36 58 Q36 50 44 50 H76 Q84 50 84 58 V166 Q84 176 74 176 H46 Q36 176 36 166Z",
      nivel: 72,
      brilho: '<rect x="41" y="60" width="5" height="108" rx="2.5"/><rect x="78" y="70" width="2" height="80" rx="1"/>',
      rotulo: { x: 42, y: 112, w: 36, h: 30 },
      sombra: 34,
    },
    facetado: {
      tampa: '<path d="M44 8 H76 L83 22 L76 36 H44 L37 22Z"/>',
      tampaBrilho: '<path d="M44 11 L39 22 L44 33 H48 L44 22 L48 11Z"/>',
      gargalo: '<rect x="52" y="36" width="16" height="13"/>',
      corpo: "M60 48 L102 72 V150 L60 176 L18 150 V72Z",
      nivel: 82,
      brilho: '<path d="M18 72 L60 48 V176 L18 150Z" opacity=".22"/><rect x="24" y="80" width="5" height="64" rx="2.5"/>',
      rotulo: { x: 40, y: 108, w: 40, h: 30 },
      sombra: 46,
    },
  };

  /* Superfície do líquido com ondas (comprimento de onda de 60) */
  function onda(nivel) {
    let d = `M-120 ${nivel}`;
    for (let i = 0; i < 12; i++) d += " q15 -3.2 30 0 t30 0";
    return `${d} V200 H-120Z`;
  }

  /**
   * Desenha um frasco.
   * op.cor     cor do líquido (padrão: cor da família)
   * op.classe  classes extras
   * op.rotulo  texto pequeno do rótulo (padrão: nenhum)
   */
  function frasco(p, op = {}) {
    if (p.imagem && !op.semFoto) {
      return `
        <span class="foto ${op.classe || ""}">
          <img src="${p.imagem}" alt="${p.nome}" loading="lazy" decoding="async" />
        </span>`;
    }
    const f = FORMAS[p.frasco] || FORMAS.classico;
    const cor = op.cor || FAMILIAS[p.familia].cor;
    const escura = ["amadeirado", "oriental"].includes(p.familia) && !op.cor;
    const id = `g${++uid}`;
    const r = f.rotulo;
    const metal = escura
      ? ["#1c0e1a", "#4d2c46", "#2a1726", "#6b4561", "#1d0f1b"]
      : ["#8f5f22", "#e8cb8a", "#b8843d", "#f6e3b4", "#9b6a2a"];

    return `
      <svg class="frasco ${op.classe || ""}" viewBox="0 0 140 200" style="--liq:${cor}" role="img" aria-label="Frasco do perfume ${p.nome}">
        <defs>
          <clipPath id="${id}c"><path d="${f.corpo}"/></clipPath>
          <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" style="stop-color:color-mix(in srgb, var(--liq) 72%, #fff)"/>
            <stop offset=".55" style="stop-color:var(--liq)"/>
            <stop offset="1" style="stop-color:color-mix(in srgb, var(--liq) 68%, #000)"/>
          </linearGradient>
          <linearGradient id="${id}s" x1="0" x2="1">
            <stop offset="0" stop-color="#000" stop-opacity=".3"/>
            <stop offset=".22" stop-color="#000" stop-opacity="0"/>
            <stop offset=".72" stop-color="#fff" stop-opacity=".1"/>
            <stop offset="1" stop-color="#000" stop-opacity=".34"/>
          </linearGradient>
          <linearGradient id="${id}t" x1="0" x2="1">
            ${metal.map((c, i) => `<stop offset="${i / (metal.length - 1)}" stop-color="${c}"/>`).join("")}
          </linearGradient>
          <radialGradient id="${id}h">
            <stop offset="0" stop-color="#21131F" stop-opacity=".38"/>
            <stop offset="1" stop-color="#21131F" stop-opacity="0"/>
          </radialGradient>
          <filter id="${id}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="1.4"/></filter>
        </defs>

        <ellipse class="frasco__sombra" cx="70" cy="188" rx="${f.sombra}" ry="7" fill="url(#${id}h)"/>

        <g transform="translate(10 4)">
          <path d="${f.corpo}" fill="#fff" fill-opacity=".42"/>
          <g clip-path="url(#${id}c)">
            <g class="frasco__liq">
              <path class="frasco__onda" d="${onda(f.nivel)}" fill="url(#${id}l)"/>
              <rect x="0" y="${f.nivel + 1}" width="120" height="3" fill="#fff" opacity=".28"/>
            </g>
            <rect width="120" height="180" fill="url(#${id}s)"/>
            <path d="${f.corpo}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="8"/>
            <g fill="#fff" opacity=".75" filter="url(#${id}b)">${f.brilho}</g>
          </g>
          <path d="${f.corpo}" fill="none" stroke="#fff" stroke-opacity=".95" stroke-width="1.1"/>

          <g fill="#efe6ec" stroke="#fff" stroke-width=".8">${f.gargalo}</g>
          <g fill="url(#${id}t)">${f.tampa}</g>
          <g fill="#fff" opacity=".45">${f.tampaBrilho}</g>

          <g class="frasco__rotulo">
            <rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" fill="#fbf8fa" opacity=".95"/>
            <rect x="${r.x + 2}" y="${r.y + 2}" width="${r.w - 4}" height="${r.h - 4}" fill="none" stroke="#34182F" stroke-opacity=".25" stroke-width=".5"/>
            <text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + (op.rotulo ? 1 : 3.5)}" text-anchor="middle" class="frasco__ana">Ana</text>
            ${op.rotulo ? `<text x="${r.x + r.w / 2}" y="${r.y + r.h - 5}" text-anchor="middle" class="frasco__fam">${op.rotulo}</text>` : ""}
          </g>
        </g>
      </svg>`;
  }

  /* Ilustrações de ingredientes (área 100 × 100) */
  const pet = (n, rx, ry, cy, extra = "") =>
    Array.from({ length: n }, (_, i) =>
      `<ellipse cx="50" cy="${cy}" rx="${rx}" ry="${ry}" transform="rotate(${(360 / n) * i} 50 50)" ${extra}/>`).join("");

  const INGREDIENTES = {
    floral: () => `
      <g fill="#F2B6CA">${pet(5, 14, 24, 27)}</g>
      <g fill="#E58FAE" opacity=".55">${pet(5, 6, 14, 30)}</g>
      <circle cx="50" cy="50" r="9" fill="#E9C46A"/>
      <g fill="#C99A3A">${pet(8, 1.4, 1.4, 44)}</g>`,
    citrico: () => `
      <circle cx="50" cy="50" r="42" fill="#E9C84B"/>
      <circle cx="50" cy="50" r="37" fill="#FBF3C9"/>
      <circle cx="50" cy="50" r="34" fill="#F5DB6A"/>
      <g stroke="#FBF3C9" stroke-width="2.4" stroke-linecap="round">
        ${Array.from({ length: 10 }, (_, i) => `<line x1="50" y1="50" x2="50" y2="17" transform="rotate(${i * 36} 50 50)"/>`).join("")}
      </g>
      <circle cx="50" cy="50" r="4" fill="#FBF3C9"/>`,
    amadeirado: () => `
      <path d="M50 96 C18 72 16 30 50 4 C84 30 82 72 50 96Z" fill="#7C8A4C"/>
      <path d="M50 96 C18 72 16 30 50 4Z" fill="#93A160"/>
      <path d="M50 10 V94" stroke="#5E6B35" stroke-width="2"/>
      <g stroke="#5E6B35" stroke-width="1.4" fill="none">
        <path d="M50 34 L34 24M50 50 L30 38M50 66 L32 56M50 34 L66 24M50 50 L70 38M50 66 L68 56"/>
      </g>`,
    oriental: () => `
      <g fill="#8B3A2C">${pet(8, 8, 19, 28)}</g>
      <g fill="#A9513C">${pet(8, 4, 12, 30)}</g>
      <g fill="#E0A96D">${pet(8, 2.6, 3.6, 30)}</g>
      <circle cx="50" cy="50" r="6" fill="#6E2A20"/>`,
    gourmand: () => `
      <path d="M18 88 C34 58 52 34 84 12" stroke="#3E2416" stroke-width="7" stroke-linecap="round" fill="none"/>
      <path d="M28 92 C42 64 60 42 88 22" stroke="#5A3622" stroke-width="5" stroke-linecap="round" fill="none"/>
      <g transform="translate(14 8) scale(.42)">
        <g fill="#F6EBD3">${pet(5, 13, 24, 27)}</g>
        <circle cx="50" cy="50" r="9" fill="#E6C56E"/>
      </g>`,
    aquatico: () => `
      <path d="M38 8 C38 8 14 38 14 54 A24 24 0 0 0 62 54 C62 38 38 8 38 8Z" fill="#8FC5D6"/>
      <path d="M26 50 A12 12 0 0 0 34 66" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/>
      <path d="M74 44 C74 44 60 62 60 72 A14 14 0 0 0 88 72 C88 62 74 44 74 44Z" fill="#B7DCE7"/>
      <circle cx="56" cy="90" r="5" fill="#8FC5D6"/>`,
  };

  function ingrediente(familia, classe = "") {
    const desenho = INGREDIENTES[familia];
    if (!desenho) return "";
    return `<svg class="ingrediente ${classe}" viewBox="0 0 100 100" aria-hidden="true">${desenho()}</svg>`;
  }

  return { frasco, ingrediente };
})();
