/* Ana Perfumes — lógica do site
   Os produtos e configurações ficam em js/produtos.js */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const PLURAL = {
    floral: "florais", amadeirado: "amadeirados", citrico: "cítricos",
    oriental: "orientais", gourmand: "gourmands", aquatico: "aquáticos",
  };
  const GENERO = { feminino: "Feminino", masculino: "Masculino", unissex: "Unissex" };

  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const menorPreco = (p) => Math.min(...p.tamanhos.map((t) => t.preco));
  const porId = (id) => PRODUTOS.find((p) => p.id === id);
  const linkWhats = (texto) =>
    `https://wa.me/${CONFIG.whatsapp}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;

  /* ---------- Frasco desenhado (usado enquanto não há foto) ---------- */
  let uid = 0;
  const FORMAS = {
    classico: {
      tampa: '<rect x="40" y="8" width="40" height="28" rx="3"/>',
      gargalo: '<rect x="50" y="36" width="20" height="12"/>',
      corpo: "M22 60 Q22 48 34 48 H86 Q98 48 98 60 V160 Q98 172 86 172 H34 Q22 172 22 160Z",
      nivel: 78,
    },
    redondo: {
      tampa: '<rect x="44" y="10" width="32" height="32" rx="16"/>',
      gargalo: '<rect x="52" y="42" width="16" height="14"/>',
      corpo: "M60 62 A54 54 0 1 1 59.9 62Z",
      nivel: 86,
    },
    alto: {
      tampa: '<rect x="47" y="2" width="26" height="38" rx="2"/>',
      gargalo: '<rect x="53" y="40" width="14" height="10"/>',
      corpo: "M36 58 Q36 50 44 50 H76 Q84 50 84 58 V166 Q84 176 74 176 H46 Q36 176 36 166Z",
      nivel: 74,
    },
    facetado: {
      tampa: '<path d="M44 10 H76 L82 22 L76 36 H44 L38 22Z"/>',
      gargalo: '<rect x="52" y="36" width="16" height="12"/>',
      corpo: "M60 48 L102 72 V150 L60 176 L18 150 V72Z",
      nivel: 84,
    },
  };

  function frascoSVG(p, extraClasse = "") {
    if (p.imagem) {
      return `<img src="${p.imagem}" alt="${p.nome}" class="frasco-foto ${extraClasse}" loading="lazy" />`;
    }
    const f = FORMAS[p.frasco] || FORMAS.classico;
    const cor = FAMILIAS[p.familia].cor;
    const escura = ["amadeirado", "oriental"].includes(p.familia);
    const id = `fr${++uid}`;
    return `
      <svg class="frasco ${extraClasse}" viewBox="0 0 120 180" role="img" aria-label="Frasco do perfume ${p.nome}">
        <defs>
          <clipPath id="${id}c"><path d="${f.corpo}"/></clipPath>
          <linearGradient id="${id}t" x1="0" x2="1">
            <stop offset="0" stop-color="${escura ? "#2a1726" : "#b27b33"}"/>
            <stop offset=".45" stop-color="${escura ? "#5a3651" : "#ecd08f"}"/>
            <stop offset="1" stop-color="${escura ? "#1d0f1b" : "#9b6a2a"}"/>
          </linearGradient>
          <linearGradient id="${id}v" x1="0" x2="1">
            <stop offset="0" stop-color="#fff" stop-opacity=".45"/>
            <stop offset=".2" stop-color="#fff" stop-opacity=".06"/>
            <stop offset=".85" stop-color="#fff" stop-opacity="0"/>
            <stop offset="1" stop-color="#fff" stop-opacity=".25"/>
          </linearGradient>
        </defs>
        <g fill="url(#${id}t)">${f.tampa}</g>
        <g fill="#e9e1e7" opacity=".9">${f.gargalo}</g>
        <path d="${f.corpo}" fill="#ffffff" fill-opacity=".55" stroke="#ffffff" stroke-opacity=".9" stroke-width="1.2"/>
        <g clip-path="url(#${id}c)">
          <rect x="0" y="${f.nivel}" width="120" height="120" fill="${cor}" opacity=".92"/>
          <rect x="0" y="${f.nivel}" width="120" height="3" fill="#fff" opacity=".35"/>
        </g>
        <path d="${f.corpo}" fill="url(#${id}v)"/>
        <rect x="42" y="${f.nivel + 34}" width="36" height="22" fill="#fbf8fa" opacity=".92"/>
        <text x="60" y="${f.nivel + 49}" text-anchor="middle" class="frasco__ana">Ana</text>
      </svg>`;
  }

  /* ---------- Sacola (salva no aparelho) ---------- */
  const CHAVE = "anaperfumes-sacola";
  let sacola = [];
  try { sacola = JSON.parse(localStorage.getItem(CHAVE)) || []; } catch { sacola = []; }
  sacola = sacola.filter((i) => porId(i.id) && porId(i.id).tamanhos.some((t) => t.ml === i.ml));

  const salvar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(sacola)); } catch {} };
  const precoItem = (i) => porId(i.id).tamanhos.find((t) => t.ml === i.ml).preco;

  function adicionar(id, ml, qtd = 1) {
    const ex = sacola.find((i) => i.id === id && i.ml === ml);
    if (ex) ex.qtd += qtd; else sacola.push({ id, ml, qtd });
    salvar(); renderSacola();
    avisar(`${porId(id).nome} ${ml} ml adicionado à sacola`);
  }

  function renderSacola() {
    const qtdTotal = sacola.reduce((s, i) => s + i.qtd, 0);
    $("#sacolaQtd").textContent = qtdTotal;
    $("#sacolaQtd").classList.toggle("tem", qtdTotal > 0);

    const lista = $("#sacolaItens");
    lista.innerHTML = sacola.map((i, idx) => {
      const p = porId(i.id);
      return `
        <li class="item">
          <div class="item__frasco" style="--fam:${FAMILIAS[p.familia].cor}">${frascoSVG(p)}</div>
          <div class="item__info">
            <strong>${p.nome}</strong>
            <span>${p.linha}, ${i.ml} ml</span>
            <div class="qtd" aria-label="Quantidade">
              <button data-menos="${idx}" aria-label="Diminuir quantidade de ${p.nome}">−</button>
              <span>${i.qtd}</span>
              <button data-mais="${idx}" aria-label="Aumentar quantidade de ${p.nome}">+</button>
            </div>
          </div>
          <div class="item__preco">
            <span>${brl(precoItem(i) * i.qtd)}</span>
            <button class="link link--pequeno" data-remover="${idx}">Remover</button>
          </div>
        </li>`;
    }).join("");

    const total = sacola.reduce((s, i) => s + precoItem(i) * i.qtd, 0);
    $("#sacolaTotal").textContent = brl(total);
    $("#sacolaVazia").hidden = sacola.length > 0;
    $("#sacolaRodape").hidden = sacola.length === 0;

    const linhas = sacola.map((i) => {
      const p = porId(i.id);
      return `• ${i.qtd}x ${p.nome} (${p.linha}) ${i.ml} ml - ${brl(precoItem(i) * i.qtd)}`;
    });
    const msg = `Olá, Ana! Quero fazer este pedido:\n\n${linhas.join("\n")}\n\nTotal: ${brl(total)}\n\nMeu nome:\nBairro para entrega:`;
    $("#finalizar").href = linkWhats(msg);
  }

  $("#sacolaItens").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mais) sacola[+b.dataset.mais].qtd++;
    if (b.dataset.menos) { const i = sacola[+b.dataset.menos]; i.qtd--; if (i.qtd < 1) sacola.splice(+b.dataset.menos, 1); }
    if (b.dataset.remover) sacola.splice(+b.dataset.remover, 1);
    salvar(); renderSacola();
  });

  const painel = $("#sacola"), fundo = $("#sacolaFundo");
  let focoAnterior = null;
  function abrirSacola() {
    focoAnterior = document.activeElement;
    fundo.hidden = false;
    requestAnimationFrame(() => { painel.classList.add("aberta"); fundo.classList.add("visivel"); });
    painel.setAttribute("aria-hidden", "false");
    $("#fecharSacola").focus();
  }
  function fecharSacola() {
    painel.classList.remove("aberta"); fundo.classList.remove("visivel");
    painel.setAttribute("aria-hidden", "true");
    setTimeout(() => (fundo.hidden = true), 300);
    if (focoAnterior) focoAnterior.focus();
  }
  $("#abrirSacola").addEventListener("click", abrirSacola);
  $("#fecharSacola").addEventListener("click", fecharSacola);
  fundo.addEventListener("click", fecharSacola);
  $("#sacolaExplorar").addEventListener("click", fecharSacola);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && painel.classList.contains("aberta")) fecharSacola(); });

  /* ---------- Aviso ---------- */
  let tAviso;
  function avisar(txt) {
    const a = $("#aviso");
    a.innerHTML = `<span>${txt}</span><button class="link link--claro" type="button">Ver sacola</button>`;
    a.classList.add("visivel");
    $("button", a).onclick = () => { a.classList.remove("visivel"); abrirSacola(); };
    clearTimeout(tAviso);
    tAviso = setTimeout(() => a.classList.remove("visivel"), 3500);
  }

  /* ---------- Catálogo ---------- */
  const filtro = { familia: "", genero: "", busca: "", ordem: "destaque" };

  function filtrados() {
    const q = filtro.busca.trim().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    let lista = PRODUTOS.filter((p) =>
      (!filtro.familia || p.familia === filtro.familia) &&
      (!filtro.genero || p.genero === filtro.genero) &&
      (!q || norm([p.nome, p.linha, p.descricao, ...p.notas.topo, ...p.notas.coracao, ...p.notas.fundo].join(" ")).includes(q))
    );
    const ord = {
      destaque: (a, b) => (b.destaque ? 1 : 0) - (a.destaque ? 1 : 0),
      menor: (a, b) => menorPreco(a) - menorPreco(b),
      maior: (a, b) => menorPreco(b) - menorPreco(a),
      nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    };
    return lista.sort(ord[filtro.ordem]);
  }

  function renderGrade() {
    const lista = filtrados();
    $("#grade").innerHTML = lista.map((p) => {
      const fam = FAMILIAS[p.familia];
      const varios = p.tamanhos.length > 1;
      return `
        <li class="produto" style="--fam:${fam.cor}">
          <button class="produto__vitrine" data-abrir="${p.id}" aria-label="Ver detalhes de ${p.nome}">
            ${p.destaque ? '<span class="selo">Mais pedido</span>' : ""}
            ${frascoSVG(p)}
          </button>
          <div class="produto__info">
            <p class="produto__fam"><i style="background:${fam.cor}"></i>${fam.nome}, ${GENERO[p.genero].toLowerCase()}</p>
            <h3><button data-abrir="${p.id}">${p.nome}</button></h3>
            <p class="produto__linha">${p.linha}</p>
            <div class="produto__compra">
              <p class="produto__preco">${varios ? "<small>a partir de</small>" : ""}${brl(menorPreco(p))}</p>
              <button class="btn btn--linha btn--pequeno" data-add="${p.id}">Adicionar</button>
            </div>
          </div>
        </li>`;
    }).join("");
    $("#vazio").hidden = lista.length > 0;
    $("#catConta").textContent = `${lista.length} ${lista.length === 1 ? "perfume" : "perfumes"}`;
  }

  function renderChips() {
    const chips = [`<button class="chip" data-fam="" aria-pressed="${!filtro.familia}">Todas</button>`]
      .concat(Object.entries(FAMILIAS).map(([k, f]) =>
        `<button class="chip" data-fam="${k}" aria-pressed="${filtro.familia === k}" style="--cor:${f.cor}"><i></i>${f.nome}</button>`));
    $("#filtroFamilias").innerHTML = chips.join("");
  }

  $("#filtroFamilias").addEventListener("click", (e) => {
    const b = e.target.closest("[data-fam]"); if (!b) return;
    filtro.familia = b.dataset.fam; renderChips(); renderGrade();
  });
  $("#busca").addEventListener("input", (e) => { filtro.busca = e.target.value; renderGrade(); });
  $("#filtroGenero").addEventListener("change", (e) => { filtro.genero = e.target.value; renderGrade(); });
  $("#ordenar").addEventListener("change", (e) => { filtro.ordem = e.target.value; renderGrade(); });
  $("#limparFiltros").addEventListener("click", () => {
    Object.assign(filtro, { familia: "", genero: "", busca: "" });
    $("#busca").value = ""; $("#filtroGenero").value = "";
    renderChips(); renderGrade();
  });

  $("#grade").addEventListener("click", (e) => {
    const abrir = e.target.closest("[data-abrir]");
    const add = e.target.closest("[data-add]");
    if (add) { const p = porId(add.dataset.add); adicionar(p.id, p.tamanhos[0].ml); }
    else if (abrir) abrirModal(abrir.dataset.abrir);
  });

  function irParaFamilia(k) {
    filtro.familia = k; renderChips(); renderGrade();
    $("#perfumes").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  /* ---------- Modal do produto ---------- */
  const modal = $("#modal");
  function abrirModal(id) {
    const p = porId(id), fam = FAMILIAS[p.familia];
    let sel = p.tamanhos[0].ml, qtd = 1;
    const notas = [["Saída", p.notas.topo], ["Coração", p.notas.coracao], ["Fundo", p.notas.fundo]];

    $("#modalCorpo").innerHTML = `
      <div class="modal__vitrine" style="--fam:${fam.cor}">${frascoSVG(p, "frasco--grande")}</div>
      <div class="modal__info">
        <p class="produto__fam"><i style="background:${fam.cor}"></i>${fam.nome}, ${GENERO[p.genero].toLowerCase()}</p>
        <h2 id="modalNome">${p.nome}</h2>
        <p class="modal__linha">${p.linha}</p>
        <p class="modal__desc">${p.descricao}</p>

        <div class="piramide" aria-label="Pirâmide olfativa">
          ${notas.map(([n, l], i) => `
            <div class="piramide__camada" style="--n:${i}">
              <span>${n}</span><p>${l.join(", ")}</p>
            </div>`).join("")}
        </div>

        <fieldset class="tamanhos">
          <legend>Tamanho</legend>
          ${p.tamanhos.map((t, i) => `
            <label class="tamanho">
              <input type="radio" name="tam" value="${t.ml}" ${i === 0 ? "checked" : ""} />
              <span><strong>${t.ml} ml</strong>${brl(t.preco)}</span>
            </label>`).join("")}
        </fieldset>

        <div class="modal__compra">
          <div class="qtd qtd--grande" aria-label="Quantidade">
            <button type="button" data-q="-1" aria-label="Diminuir quantidade">−</button>
            <span id="mQtd">1</span>
            <button type="button" data-q="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="btn btn--escuro" id="mAdd">Adicionar à sacola, <span id="mPreco"></span></button>
        </div>
        <a class="link" target="_blank" rel="noopener" href="${linkWhats(`Olá, Ana! Tenho uma dúvida sobre o perfume ${p.nome}.`)}">Tirar dúvida sobre este perfume no WhatsApp</a>
      </div>`;

    const atualizar = () => {
      const preco = p.tamanhos.find((t) => t.ml === sel).preco;
      $("#mPreco").textContent = brl(preco * qtd);
      $("#mQtd").textContent = qtd;
    };
    $$('input[name="tam"]', modal).forEach((r) => r.addEventListener("change", () => { sel = +r.value; atualizar(); }));
    $$("[data-q]", modal).forEach((b) => b.addEventListener("click", () => { qtd = Math.max(1, qtd + +b.dataset.q); atualizar(); }));
    $("#mAdd").addEventListener("click", () => { adicionar(p.id, sel, qtd); modal.close(); });
    atualizar();
    modal.showModal();
  }
  modal.addEventListener("click", (e) => { if (e.target === modal || e.target.closest("[data-fechar]")) modal.close(); });

  /* ---------- Hero ---------- */
  const hero = $("#hero");
  function escolherFamiliaHero(k) {
    const f = FAMILIAS[k];
    hero.style.setProperty("--essencia", f.cor);
    $("#heroRotulo").textContent = f.nome;
    $("#heroFrase").textContent = f.frase;
    const n = PRODUTOS.filter((p) => p.familia === k).length;
    $("#heroVer").textContent = `Ver ${n} ${n === 1 ? "perfume " + f.nome.toLowerCase() : "perfumes " + PLURAL[k]}`;
    $("#heroVer").dataset.fam = k;
    $$("#familiasHero button").forEach((b) => b.setAttribute("aria-checked", b.dataset.fam === k));
  }
  $("#familiasHero").innerHTML = Object.entries(FAMILIAS).map(([k, f]) =>
    `<button role="radio" aria-checked="false" data-fam="${k}" style="--cor:${f.cor}"><i></i>${f.nome}</button>`).join("");
  $("#familiasHero").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (b) escolherFamiliaHero(b.dataset.fam);
  });
  $("#familiasHero").addEventListener("keydown", (e) => {
    if (!["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(e.key)) return;
    e.preventDefault();
    const bs = $$("#familiasHero button");
    const i = bs.indexOf(document.activeElement);
    const prox = bs[(i + (["ArrowRight", "ArrowDown"].includes(e.key) ? 1 : -1) + bs.length) % bs.length];
    prox.focus(); escolherFamiliaHero(prox.dataset.fam);
  });
  $("#heroVer").addEventListener("click", (e) => { e.preventDefault(); irParaFamilia(e.currentTarget.dataset.fam); });

  /* ---------- Seção famílias ---------- */
  $("#familiasLista").innerHTML = Object.entries(FAMILIAS).map(([k, f]) => {
    const n = PRODUTOS.filter((p) => p.familia === k).length;
    return `
      <li style="--cor:${f.cor}">
        <span class="gota" aria-hidden="true"></span>
        <h3>${f.nome}</h3>
        <p>${f.frase}</p>
        <button class="link" data-ir="${k}" ${n ? "" : "disabled"}>${n ? `Ver ${PLURAL[k]} (${n})` : "Em breve"}</button>
      </li>`;
  }).join("");
  $("#familiasLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ir]"); if (b) irParaFamilia(b.dataset.ir);
  });

  /* ---------- Links e textos fixos ---------- */
  $("#linkWhatsSobre").href = linkWhats("Olá, Ana! Queria uma sugestão de perfume.");
  $("#whatsFlutuante").href = linkWhats("Olá, Ana! Vim pelo site.");
  $("#linkInsta").href = `https://instagram.com/${CONFIG.instagram}`;
  $("#rodapeCidade").textContent = `${CONFIG.cidade}. Pedidos pelo WhatsApp e Instagram @${CONFIG.instagram}.`;
  $("#sacolaFrete").textContent = CONFIG.freteTexto;
  $("#ano").textContent = new Date().getFullYear();

  /* Cabeçalho muda de cor depois do hero */
  const topo = $("#topo");
  new IntersectionObserver(([en]) => topo.classList.toggle("claro", !en.isIntersecting), { rootMargin: "-100px 0px 0px 0px" }).observe(hero);

  /* ---------- Início ---------- */
  escolherFamiliaHero("floral");
  renderChips(); renderGrade(); renderSacola();
})();
