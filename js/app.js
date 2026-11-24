/* Ana Perfumes — lógica do site
   Produtos e configurações: js/produtos.js
   Desenhos (frascos e ingredientes): js/graficos.js */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const semMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PLURAL = {
    floral: "florais", amadeirado: "amadeirados", citrico: "cítricos",
    oriental: "orientais", gourmand: "gourmands", aquatico: "aquáticos",
  };
  const GENERO = { feminino: "Feminino", masculino: "Masculino", unissex: "Unissex" };

  /* ---------- Preços ---------- */
  const brl = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const menorPreco = (p) => Math.min(...p.tamanhos.map((t) => t.preco));
  const porId = (id) => PRODUTOS.find((p) => p.id === id);
  const comPix = (v) => v * (1 - (CONFIG.descontoPix || 0) / 100);
  function parcelas(v) {
    const n = Math.min(CONFIG.parcelasSemJuros || 1, Math.floor(v / (CONFIG.parcelaMinima || 1)));
    return n >= 2 ? `ou ${n}x de ${brl(v / n)} sem juros` : "";
  }
  function blocoPreco(v, aPartir = false) {
    return `
      <div class="preco">
        ${aPartir ? '<small class="preco__de">a partir de</small>' : ""}
        <span class="preco__cheio">${brl(v)}</span>
        ${CONFIG.descontoPix > 0 ? `<span class="preco__pix"><strong>${brl(comPix(v))}</strong> no Pix</span>` : ""}
        ${parcelas(v) ? `<small class="preco__parc">${parcelas(v)}</small>` : ""}
      </div>`;
  }
  const linkWhats = (texto) =>
    `https://wa.me/${CONFIG.whatsapp}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;

  /* Re-renderização com transição suave quando o navegador suporta */
  function comTransicao(fn) {
    if (document.startViewTransition && !semMovimento()) document.startViewTransition(fn);
    else fn();
  }

  /* ---------- Armazenamento local ---------- */
  const ler = (k, padrao) => { try { return JSON.parse(localStorage.getItem(k)) ?? padrao; } catch { return padrao; } };
  const gravar = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

  let sacola = ler("anaperfumes-sacola", [])
    .filter((i) => porId(i.id) && porId(i.id).tamanhos.some((t) => t.ml === i.ml));
  let favoritos = ler("anaperfumes-favoritos", []).filter((id) => porId(id));
  const ehFav = (id) => favoritos.includes(id);
  const precoItem = (i) => porId(i.id).tamanhos.find((t) => t.ml === i.ml).preco;

  /* =========================================================
     SACOLA
     ========================================================= */
  function adicionar(id, ml, qtd = 1, origem) {
    const ex = sacola.find((i) => i.id === id && i.ml === ml);
    if (ex) ex.qtd += qtd; else sacola.push({ id, ml, qtd });
    gravar("anaperfumes-sacola", sacola);
    if (origem) voarParaSacola(origem);
    else pulsarSacola();
    renderSacola();
    avisar(`${porId(id).nome} ${ml} ml adicionado à sacola`);
  }

  /* O frasco "voa" até o ícone da sacola */
  function voarParaSacola(origem) {
    const alvo = $("#abrirSacola svg");
    if (!origem || !alvo || semMovimento()) { pulsarSacola(); return; }
    const a = origem.getBoundingClientRect(), b = alvo.getBoundingClientRect();
    /* ids próprios para o clone não depender dos gradientes do original */
    const tmp = document.createElement("div");
    tmp.innerHTML = origem.outerHTML.replace(/\b(g\d+)/g, "v$1");
    const clone = tmp.firstElementChild;
    clone.classList.add("voando");
    Object.assign(clone.style, { left: a.left + "px", top: a.top + "px", width: a.width + "px", height: a.height + "px" });
    document.body.appendChild(clone);
    const dx = b.left + b.width / 2 - (a.left + a.width / 2);
    const dy = b.top + b.height / 2 - (a.top + a.height / 2);
    const anim = clone.animate([
      { transform: "translate(0,0) scale(1) rotate(0)", opacity: 1 },
      { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 80}px) scale(.6) rotate(-12deg)`, opacity: 1, offset: 0.5 },
      { transform: `translate(${dx}px, ${dy}px) scale(.08) rotate(-20deg)`, opacity: 0.3 },
    ], { duration: 750, easing: "cubic-bezier(.5,0,.3,1)" });
    anim.onfinish = () => { clone.remove(); pulsarSacola(); };
  }
  function pulsarSacola() {
    const b = $("#abrirSacola");
    b.classList.remove("pulsa"); void b.offsetWidth; b.classList.add("pulsa");
  }

  function renderSacola() {
    const qtdTotal = sacola.reduce((s, i) => s + i.qtd, 0);
    $("#sacolaQtd").textContent = qtdTotal;
    $("#sacolaQtd").classList.toggle("tem", qtdTotal > 0);

    $("#sacolaItens").innerHTML = sacola.map((i, idx) => {
      const p = porId(i.id);
      return `
        <li class="item">
          <div class="item__frasco" style="--fam:${FAMILIAS[p.familia].cor}">${Graficos.frasco(p)}</div>
          <div class="item__info">
            <strong>${p.nome}</strong>
            <span>${p.linha}, ${i.ml} ml</span>
            <div class="qtd" role="group" aria-label="Quantidade de ${p.nome}">
              <button data-menos="${idx}" aria-label="Diminuir">−</button>
              <span>${i.qtd}</span>
              <button data-mais="${idx}" aria-label="Aumentar">+</button>
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
    $("#sacolaPix").innerHTML = CONFIG.descontoPix > 0 && total
      ? `ou <strong>${brl(comPix(total))}</strong> no Pix${parcelas(total) ? `, ${parcelas(total)}` : ""}` : "";
    $("#sacolaVazia").hidden = sacola.length > 0;
    $("#sacolaRodape").hidden = sacola.length === 0;

    const presente = $("#opPresente").checked;
    const linhas = sacola.map((i) => {
      const p = porId(i.id);
      return `• ${i.qtd}x ${p.nome} (${p.linha}) ${i.ml} ml - ${brl(precoItem(i) * i.qtd)}`;
    });
    const msg = `Olá, Ana! Quero fazer este pedido:\n\n${linhas.join("\n")}\n\n` +
      `Total: ${brl(total)}${CONFIG.descontoPix > 0 ? ` (no Pix: ${brl(comPix(total))})` : ""}` +
      `${presente ? "\nQuero embalagem para presente." : ""}\n\nForma de pagamento:\nMeu nome:\nBairro para entrega:`;
    $("#finalizar").href = linkWhats(msg);
  }

  $("#sacolaItens").addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.mais) sacola[+b.dataset.mais].qtd++;
    if (b.dataset.menos) { const i = sacola[+b.dataset.menos]; i.qtd--; if (i.qtd < 1) sacola.splice(+b.dataset.menos, 1); }
    if (b.dataset.remover) sacola.splice(+b.dataset.remover, 1);
    gravar("anaperfumes-sacola", sacola); renderSacola();
  });
  $("#opPresente").addEventListener("change", renderSacola);

  const painel = $("#sacola"), fundo = $("#sacolaFundo");
  let focoAnterior = null;
  function abrirSacola() {
    focoAnterior = document.activeElement;
    $("#aviso").classList.remove("visivel");
    fundo.hidden = false;
    requestAnimationFrame(() => { painel.classList.add("aberta"); fundo.classList.add("visivel"); });
    painel.setAttribute("aria-hidden", "false");
    document.body.classList.add("travado");
    $("#fecharSacola").focus();
  }
  function fecharSacola() {
    painel.classList.remove("aberta"); fundo.classList.remove("visivel");
    painel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("travado");
    setTimeout(() => (fundo.hidden = true), 350);
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

  /* =========================================================
     CATÁLOGO
     ========================================================= */
  const filtro = { familia: "", genero: "", busca: "", ordem: "destaque", favoritos: false };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  function filtrados() {
    const q = norm(filtro.busca.trim());
    const lista = PRODUTOS.filter((p) =>
      (!filtro.favoritos || ehFav(p.id)) &&
      (!filtro.familia || p.familia === filtro.familia) &&
      (!filtro.genero || p.genero === filtro.genero) &&
      (!q || norm([p.nome, p.linha, p.descricao, FAMILIAS[p.familia].nome, ...p.notas.topo, ...p.notas.coracao, ...p.notas.fundo].join(" ")).includes(q))
    );
    const peso = (p) => (p.destaque ? 2 : p.novo ? 1 : 0);
    const ord = {
      destaque: (a, b) => peso(b) - peso(a),
      menor: (a, b) => menorPreco(a) - menorPreco(b),
      maior: (a, b) => menorPreco(b) - menorPreco(a),
      nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    };
    return lista.sort(ord[filtro.ordem]);
  }

  function cardProduto(p, i) {
    const fam = FAMILIAS[p.familia];
    return `
      <li class="produto" style="--fam:${fam.cor}; --i:${i}; view-transition-name: p-${p.id}">
        <div class="produto__vitrine">
          <button class="produto__abrir" data-abrir="${p.id}" aria-label="Ver detalhes de ${p.nome}">
            ${Graficos.ingrediente(p.familia, "produto__ingrediente")}
            ${p.destaque ? '<span class="selo">Mais pedido</span>' : p.novo ? '<span class="selo selo--novo">Novo</span>' : ""}
            ${Graficos.frasco(p)}
          </button>
          <button class="fav" data-fav="${p.id}" aria-pressed="${ehFav(p.id)}" aria-label="Favoritar ${p.nome}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>
          </button>
        </div>
        <div class="produto__info">
          <p class="produto__fam"><i style="background:${fam.cor}"></i>${fam.nome}, ${GENERO[p.genero].toLowerCase()}</p>
          <h3><button data-abrir="${p.id}">${p.nome}</button></h3>
          <p class="produto__linha">${p.linha}, ${p.tamanhos.map((t) => t.ml).join(" / ")} ml</p>
          <p class="produto__notas">${[...p.notas.topo.slice(0, 1), ...p.notas.coracao.slice(0, 1), ...p.notas.fundo.slice(0, 1)].join(", ")}</p>
          ${blocoPreco(menorPreco(p), p.tamanhos.length > 1)}
          <button class="btn btn--escuro btn--pequeno produto__add" data-add="${p.id}">
            ${p.tamanhos.length > 1 ? "Escolher tamanho" : "Adicionar à sacola"}
          </button>
        </div>
      </li>`;
  }

  function renderGrade() {
    const lista = filtrados();
    $("#grade").innerHTML = lista.map(cardProduto).join("");
    $("#vazio").hidden = lista.length > 0;
    $("#vazio p").textContent = filtro.favoritos && !favoritos.length
      ? "Você ainda não favoritou nenhum perfume. Toque no coração para guardar os que gostar."
      : "Nenhum perfume com esses filtros.";
    $("#catConta").textContent = `${lista.length} ${lista.length === 1 ? "perfume" : "perfumes"}`;
    if (primeiraGrade) { observarRevelar($$("#grade .produto")); primeiraGrade = false; }
  }
  let primeiraGrade = true;
  const atualizarGrade = () => comTransicao(renderGrade);

  function renderChips() {
    const chips = [`<button class="chip" data-fam="" aria-pressed="${!filtro.familia && !filtro.favoritos}">Todas</button>`]
      .concat(Object.entries(FAMILIAS).map(([k, f]) =>
        `<button class="chip" data-fam="${k}" aria-pressed="${filtro.familia === k}" style="--cor:${f.cor}"><i></i>${f.nome}</button>`));
    chips.push(`<button class="chip chip--fav" data-favs aria-pressed="${filtro.favoritos}">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>
      Favoritos <span class="chip__n">${favoritos.length}</span></button>`);
    $("#filtroFamilias").innerHTML = chips.join("");
  }

  $("#filtroFamilias").addEventListener("click", (e) => {
    if (e.target.closest("[data-favs]")) {
      filtro.favoritos = !filtro.favoritos; filtro.familia = "";
      renderChips(); atualizarGrade(); return;
    }
    const b = e.target.closest("[data-fam]"); if (!b) return;
    filtro.familia = b.dataset.fam; filtro.favoritos = false;
    renderChips(); atualizarGrade();
  });
  let tBusca;
  $("#busca").addEventListener("input", (e) => {
    filtro.busca = e.target.value;
    clearTimeout(tBusca); tBusca = setTimeout(atualizarGrade, 160);
  });
  $("#filtroGenero").addEventListener("change", (e) => { filtro.genero = e.target.value; atualizarGrade(); });
  $("#ordenar").addEventListener("change", (e) => { filtro.ordem = e.target.value; atualizarGrade(); });
  $("#limparFiltros").addEventListener("click", () => {
    Object.assign(filtro, { familia: "", genero: "", busca: "", favoritos: false });
    $("#busca").value = ""; $("#filtroGenero").value = "";
    renderChips(); atualizarGrade();
  });

  $("#grade").addEventListener("click", (e) => {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav;
      favoritos = ehFav(id) ? favoritos.filter((f) => f !== id) : [...favoritos, id];
      gravar("anaperfumes-favoritos", favoritos);
      fav.setAttribute("aria-pressed", ehFav(id));
      if (ehFav(id) && !semMovimento()) {
        fav.animate([{ transform: "scale(1)" }, { transform: "scale(1.35)" }, { transform: "scale(1)" }],
          { duration: 420, easing: "cubic-bezier(.3,1.6,.5,1)" });
      }
      renderChips();
      if (filtro.favoritos) atualizarGrade();
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      const p = porId(add.dataset.add);
      if (p.tamanhos.length > 1) { abrirModal(p.id); return; }
      adicionar(p.id, p.tamanhos[0].ml, 1, add.closest(".produto").querySelector(".frasco, .foto"));
      add.textContent = "Adicionado"; add.classList.add("ok");
      setTimeout(() => { add.textContent = "Adicionar à sacola"; add.classList.remove("ok"); }, 1600);
      return;
    }
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) abrirModal(abrir.dataset.abrir);
  });

  function irParaFamilia(k) {
    filtro.familia = k; filtro.favoritos = false;
    renderChips(); renderGrade();
    $("#perfumes").scrollIntoView({ behavior: semMovimento() ? "auto" : "smooth" });
  }

  /* =========================================================
     JANELA DO PRODUTO
     ========================================================= */
  const modal = $("#modal");
  function abrirModal(id) {
    const p = porId(id), fam = FAMILIAS[p.familia];
    let sel = p.tamanhos[p.tamanhos.length > 1 ? 1 : 0].ml, qtd = 1;
    const notas = [["Saída", p.notas.topo, "Os primeiros minutos"], ["Coração", p.notas.coracao, "Depois de meia hora"], ["Fundo", p.notas.fundo, "O que fica na pele"]];

    $("#modalCorpo").innerHTML = `
      <div class="modal__vitrine" style="--fam:${fam.cor}">
        ${Graficos.ingrediente(p.familia, "modal__ing modal__ing--a")}
        ${Graficos.ingrediente(p.familia, "modal__ing modal__ing--b")}
        ${Graficos.frasco(p, { classe: "frasco--grande frasco--onda", rotulo: fam.nome })}
      </div>
      <div class="modal__info">
        <p class="produto__fam"><i style="background:${fam.cor}"></i>${fam.nome}, ${GENERO[p.genero].toLowerCase()}</p>
        <h2 id="modalNome">${p.nome}</h2>
        <p class="modal__linha">${p.linha}</p>
        <p class="modal__desc">${p.descricao}</p>

        <div class="piramide" aria-label="Pirâmide olfativa">
          ${notas.map(([n, l, dica], i) => `
            <div class="piramide__camada" style="--n:${i}">
              <span>${n}<small>${dica}</small></span><p>${l.join(", ")}</p>
            </div>`).join("")}
        </div>

        <div id="mPrecoBloco" aria-live="polite"></div>

        <fieldset class="tamanhos">
          <legend>Tamanho</legend>
          ${p.tamanhos.map((t) => `
            <label class="tamanho">
              <input type="radio" name="tam" value="${t.ml}" ${t.ml === sel ? "checked" : ""} />
              <span><strong>${t.ml} ml</strong>${brl(t.preco)}</span>
            </label>`).join("")}
        </fieldset>

        <a class="link" target="_blank" rel="noopener" href="${linkWhats(`Olá, Ana! Tenho uma dúvida sobre o perfume ${p.nome}.`)}">Tirar dúvida sobre este perfume no WhatsApp</a>
        <div class="modal__compra">
          <div class="qtd qtd--grande" role="group" aria-label="Quantidade">
            <button type="button" data-q="-1" aria-label="Diminuir quantidade">−</button>
            <span id="mQtd">1</span>
            <button type="button" data-q="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="btn btn--escuro" id="mAdd">Adicionar à sacola</button>
        </div>
      </div>`;

    const atualizar = () => {
      const preco = p.tamanhos.find((t) => t.ml === sel).preco;
      $("#mPrecoBloco").innerHTML = blocoPreco(preco * qtd);
      $("#mQtd").textContent = qtd;
    };
    $$('input[name="tam"]', modal).forEach((r) => r.addEventListener("change", () => { sel = +r.value; atualizar(); }));
    $$("[data-q]", modal).forEach((b) => b.addEventListener("click", () => { qtd = Math.max(1, qtd + +b.dataset.q); atualizar(); }));
    $("#mAdd").addEventListener("click", () => {
      const origem = $(".modal__vitrine .frasco, .modal__vitrine .foto", modal);
      const r = origem.getBoundingClientRect();
      const fantasma = origem.cloneNode(true);
      Object.assign(fantasma.style, { position: "fixed", left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px", margin: 0, zIndex: 80 });
      document.body.appendChild(fantasma);
      modal.close();
      adicionar(p.id, sel, qtd, fantasma);
      setTimeout(() => fantasma.remove(), 20);
    });
    atualizar();
    modal.showModal();
    modal.scrollTop = 0;
  }

  $$("dialog.modal").forEach((d) => d.addEventListener("click", (e) => {
    if (e.target === d || e.target.closest("[data-fechar]")) d.close();
  }));

  /* =========================================================
     QUIZ: DESCOBRIR MEU PERFUME
     ========================================================= */
  const PERGUNTAS = [
    {
      chave: "genero", titulo: "Para quem é o perfume?",
      opcoes: [
        { v: "feminino", t: "Para ela", d: "Fragrâncias femininas" },
        { v: "masculino", t: "Para ele", d: "Fragrâncias masculinas" },
        { v: "", t: "Tanto faz", d: "Incluir os unissex" },
      ],
    },
    {
      chave: "momento", titulo: "Quando vai usar mais?",
      opcoes: [
        { v: "dia", t: "No dia a dia", d: "Trabalho, faculdade, calor", fam: ["citrico", "aquatico", "floral"] },
        { v: "noite", t: "À noite", d: "Encontros, festas, jantar", fam: ["oriental", "gourmand", "amadeirado"] },
        { v: "sempre", t: "Em qualquer hora", d: "Um perfume para tudo", fam: ["floral", "amadeirado", "gourmand"] },
      ],
    },
    {
      chave: "sensacao", titulo: "Que sensação você quer?",
      opcoes: [
        { v: "frescor", t: "Frescor", d: "Limpo, leve, banho tomado", fam: ["citrico", "aquatico"], ing: "citrico" },
        { v: "doce", t: "Aconchego doce", d: "Baunilha, cremoso, viciante", fam: ["gourmand"], ing: "gourmand" },
        { v: "romantico", t: "Romântica", d: "Flores, delicadeza", fam: ["floral"], ing: "floral" },
        { v: "marcante", t: "Marcante", d: "Madeiras, especiarias, presença", fam: ["amadeirado", "oriental"], ing: "oriental" },
      ],
    },
  ];
  const quiz = $("#quiz");
  let resp = {}, passo = 0;

  function renderQuiz() {
    const corpo = $("#quizCorpo");
    $("#quizBarra").style.width = `${(passo / PERGUNTAS.length) * 100}%`;
    if (passo >= PERGUNTAS.length) { renderResultado(); return; }
    const q = PERGUNTAS[passo];
    corpo.innerHTML = `
      <div class="quiz__passo">
        <p class="quiz__conta">Pergunta ${passo + 1} de ${PERGUNTAS.length}</p>
        <h2 id="quizTitulo">${q.titulo}</h2>
        <div class="quiz__opcoes ${q.opcoes.length > 3 ? "quiz__opcoes--4" : ""}">
          ${q.opcoes.map((o, i) => `
            <button class="quiz__opcao" data-v="${o.v}" style="--i:${i}">
              ${o.ing ? Graficos.ingrediente(o.ing, "quiz__ing") : ""}
              <strong>${o.t}</strong><span>${o.d}</span>
            </button>`).join("")}
        </div>
        ${passo > 0 ? '<button class="link quiz__voltar" data-voltar>Voltar</button>' : ""}
      </div>`;
    $(".quiz__opcao", corpo).focus();
  }

  function renderResultado() {
    const m = PERGUNTAS[1].opcoes.find((o) => o.v === resp.momento);
    const s = PERGUNTAS[2].opcoes.find((o) => o.v === resp.sensacao);
    const pontos = (p) =>
      (s.fam.includes(p.familia) ? 3 : 0) + (m.fam.includes(p.familia) ? 2 : 0) +
      (resp.genero && p.genero === resp.genero ? 1 : 0) + (p.destaque ? 0.5 : 0);
    const lista = PRODUTOS
      .filter((p) => !resp.genero || p.genero === resp.genero || p.genero === "unissex")
      .sort((a, b) => pontos(b) - pontos(a)).slice(0, 3);

    $("#quizCorpo").innerHTML = `
      <div class="quiz__passo">
        <p class="quiz__conta">Sua seleção</p>
        <h2 id="quizTitulo">A Ana separou estes para você</h2>
        <ul class="quiz__resultado">
          ${lista.map((p, i) => `
            <li style="--fam:${FAMILIAS[p.familia].cor}; --i:${i}">
              <div class="quiz__frasco">${Graficos.frasco(p)}</div>
              <div>
                <p class="produto__fam"><i style="background:${FAMILIAS[p.familia].cor}"></i>${FAMILIAS[p.familia].nome}</p>
                <strong>${p.nome}</strong>
                <span>a partir de ${brl(menorPreco(p))}</span>
              </div>
              <button class="btn btn--linha btn--pequeno" data-ver="${p.id}">Ver perfume</button>
            </li>`).join("")}
        </ul>
        <button class="link quiz__voltar" data-recomecar>Responder de novo</button>
      </div>`;
    $("#quizBarra").style.width = "100%";
  }

  $("#quizCorpo").addEventListener("click", (e) => {
    const op = e.target.closest(".quiz__opcao");
    if (op) { resp[PERGUNTAS[passo].chave] = op.dataset.v; passo++; renderQuiz(); return; }
    if (e.target.closest("[data-voltar]")) { passo--; renderQuiz(); return; }
    if (e.target.closest("[data-recomecar]")) { resp = {}; passo = 0; renderQuiz(); return; }
    const ver = e.target.closest("[data-ver]");
    if (ver) { quiz.close(); abrirModal(ver.dataset.ver); }
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest("[data-quiz]")) return;
    resp = {}; passo = 0; renderQuiz(); quiz.showModal();
  });

  /* =========================================================
     HERO
     ========================================================= */
  const hero = $("#hero");
  const frascoHero = { nome: "Ana", familia: "floral", frasco: "classico", imagem: "" };
  $("#heroFrasco").innerHTML = Graficos.frasco(frascoHero, { cor: "var(--essencia)", classe: "frasco--hero frasco--onda", rotulo: "Floral", semFoto: true });

  /* posições dos ingredientes ao redor do frasco: x, y (%), tamanho (px), rotação, profundidade */
  const ORBITA = [[8, 18, 120, -18, 0.6], [76, 8, 84, 22, 1], [84, 62, 132, 8, 0.4], [4, 70, 92, -30, 0.9], [56, 84, 64, 40, 1.3]];

  function trocarIngredientes(k) {
    const box = $("#heroIngredientes");
    $$(".hero__ing", box).forEach((el) => { el.classList.add("sai"); setTimeout(() => el.remove(), 500); });
    ORBITA.forEach(([x, y, t, r, z], i) => {
      const w = document.createElement("div");
      w.className = "hero__ing";
      w.style.cssText = `left:${x}%; top:${y}%; width:${t}px; --r:${r}deg; --z:${z}; --i:${i}`;
      w.innerHTML = Graficos.ingrediente(k);
      box.appendChild(w);
    });
  }

  function escolherFamiliaHero(k, inicial = false) {
    const f = FAMILIAS[k];
    hero.style.setProperty("--essencia", f.cor);
    $(".frasco--hero .frasco__fam").textContent = f.nome;
    $("#heroFrase").textContent = f.frase;
    const n = PRODUTOS.filter((p) => p.familia === k).length;
    $("#heroVer").textContent = `Ver ${n} ${n === 1 ? "perfume " + f.nome.toLowerCase() : "perfumes " + PLURAL[k]}`;
    $("#heroVer").dataset.fam = k;
    $$("#familiasHero button").forEach((b) => {
      b.setAttribute("aria-checked", b.dataset.fam === k);
      b.tabIndex = b.dataset.fam === k ? 0 : -1;
    });
    trocarIngredientes(k);
    if (!inicial && !semMovimento()) {
      const fr = $(".frasco--hero");
      fr.classList.remove("balanca"); void fr.getBoundingClientRect(); fr.classList.add("balanca");
    }
  }

  $("#familiasHero").innerHTML = Object.entries(FAMILIAS).map(([k, f], i) =>
    `<button role="radio" aria-checked="false" data-fam="${k}" style="--cor:${f.cor}; --i:${i}"><i></i>${f.nome}</button>`).join("");
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

  /* Parallax suave: ingredientes seguem o mouse em profundidades diferentes */
  const palco = $("#heroPalco");
  if (matchMedia("(pointer: fine)").matches) {
    let raf;
    hero.addEventListener("pointermove", (e) => {
      if (semMovimento()) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const r = hero.getBoundingClientRect();
        palco.style.setProperty("--mx", ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
        palco.style.setProperty("--my", ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
      });
    });
    hero.addEventListener("pointerleave", () => { palco.style.setProperty("--mx", 0); palco.style.setProperty("--my", 0); });
  }

  /* =========================================================
     FAMÍLIAS E FAIXA DE NOTAS
     ========================================================= */
  $("#familiasLista").innerHTML = Object.entries(FAMILIAS).map(([k, f], i) => {
    const n = PRODUTOS.filter((p) => p.familia === k).length;
    return `
      <li style="--cor:${f.cor}; --i:${i}" class="revelar">
        <button class="familia" data-ir="${k}" ${n ? "" : "disabled"}>
          <span class="familia__ilustra">${Graficos.ingrediente(k)}</span>
          <span class="familia__texto">
            <strong>${f.nome}</strong>
            <span>${f.frase}</span>
            <em>${n ? `Ver ${PLURAL[k]} (${n})` : "Em breve"}</em>
          </span>
        </button>
      </li>`;
  }).join("");
  $("#familiasLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ir]"); if (b) irParaFamilia(b.dataset.ir);
  });

  const todasNotas = [...new Set(PRODUTOS.flatMap((p) => [...p.notas.topo, ...p.notas.coracao, ...p.notas.fundo]))];
  const faixaNotas = todasNotas.map((n, i) =>
    `<span>${n}</span>${i % 4 === 0 ? Graficos.ingrediente(Object.keys(FAMILIAS)[(i / 4) % 6 | 0], "notas-faixa__ing") : '<i aria-hidden="true"></i>'}`).join("");
  $("#notasFaixa").innerHTML = `<div>${faixaNotas}</div><div>${faixaNotas}</div>`;

  /* =========================================================
     REVELAR AO ROLAR (uma vez por elemento)
     ========================================================= */
  const io = "IntersectionObserver" in window && !semMovimento()
    ? new IntersectionObserver((ents) => ents.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); }
      }), { rootMargin: "0px 0px -8% 0px", threshold: 0.08 })
    : null;
  function observarRevelar(els) {
    els.forEach((el) => {
      el.classList.add("revelar");
      if (io) io.observe(el); else el.classList.add("visto");
    });
  }

  /* =========================================================
     CABEÇALHO, MENU E LINKS
     ========================================================= */
  if (CONFIG.avisoTopo) $("#faixa").textContent = CONFIG.avisoTopo; else $("#faixa").remove();
  if (CONFIG.descontoPix > 0) $("#benefPixTitulo").textContent = `${CONFIG.descontoPix}% de desconto no Pix`;
  if (CONFIG.parcelasSemJuros > 1) $("#benefParcelas").textContent = `Ou em até ${CONFIG.parcelasSemJuros}x sem juros no cartão`;
  const whatsOi = linkWhats("Olá, Ana! Vim pelo site.");
  $("#linkWhatsSobre").href = linkWhats("Olá, Ana! Queria uma sugestão de perfume.");
  $("#whatsFlutuante").href = whatsOi;
  $("#rodapeWhats").href = whatsOi;
  $("#menuWhats").href = whatsOi;
  $("#linkInsta").href = $("#rodapeInsta").href = `https://instagram.com/${CONFIG.instagram}`;
  $("#rodapeTroca").href = linkWhats("Olá, Ana! Queria saber sobre troca ou devolução.");
  $("#rodapeCidade").textContent = `${CONFIG.cidade}. Pedidos pelo WhatsApp e Instagram @${CONFIG.instagram}.`;
  $("#sacolaFrete").textContent = CONFIG.freteTexto;
  $("#ano").textContent = new Date().getFullYear();
  $("[data-fav-link]").addEventListener("click", () => { filtro.favoritos = true; filtro.familia = ""; renderChips(); renderGrade(); });

  $("#irBusca").addEventListener("click", () => {
    $("#perfumes").scrollIntoView({ behavior: semMovimento() ? "auto" : "smooth" });
    setTimeout(() => $("#busca").focus({ preventScroll: true }), semMovimento() ? 0 : 450);
  });

  const menu = $("#menuMobile"), btnMenu = $("#abrirMenu");
  function alternarMenu(abrir) {
    menu.hidden = !abrir;
    btnMenu.setAttribute("aria-expanded", abrir);
    btnMenu.setAttribute("aria-label", abrir ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("menu-aberto", abrir);
  }
  btnMenu.addEventListener("click", () => alternarMenu(menu.hidden));
  menu.addEventListener("click", (e) => { if (e.target.closest("a")) alternarMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !menu.hidden) { alternarMenu(false); btnMenu.focus(); } });

  /* Cabeçalho: fica claro depois do hero e se esconde ao rolar para baixo */
  const topo = $("#topo");
  new IntersectionObserver(([en]) => topo.classList.toggle("claro", !en.isIntersecting),
    { rootMargin: "-110px 0px 0px 0px" }).observe(hero);
  let ultimoY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    const escondido = y > ultimoY && y > innerHeight * 0.9 && !document.body.classList.contains("menu-aberto");
    topo.classList.toggle("escondido", escondido);
    ultimoY = y;
  }, { passive: true });

  /* =========================================================
     INÍCIO
     ========================================================= */
  escolherFamiliaHero("floral", true);
  renderChips(); renderGrade(); renderSacola();
  observarRevelar($$(".beneficios li, .catalogo__cabeca, .familias__intro, #familiasLista li, .passos li, .sobre__texto, .sobre__fatos > div"));
  requestAnimationFrame(() => document.documentElement.classList.add("pronto"));
})();
