/* Ana Perfumes — lógica do site
   Produtos e configurações: js/produtos.js
   Imagem dos frascos: js/graficos.js */

(() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const semMovimento = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

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
  function blocoPreco(v, aPartir = false, grande = false) {
    return `
      <div class="preco ${grande ? "preco--grande" : ""}">
        <span class="preco__cheio">${aPartir ? '<small>A partir de</small> ' : ""}${brl(v)}</span>
        ${CONFIG.descontoPix > 0 ? `<span class="preco__pix">${brl(comPix(v))} no Pix</span>` : ""}
        ${grande && parcelas(v) ? `<span class="preco__parc">${parcelas(v)}</span>` : ""}
      </div>`;
  }
  const linkWhats = (texto) =>
    `https://wa.me/${CONFIG.whatsapp}${texto ? "?text=" + encodeURIComponent(texto) : ""}`;

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
  let destaqueItem = null;
  function adicionar(id, ml, qtd = 1) {
    const ex = sacola.find((i) => i.id === id && i.ml === ml);
    if (ex) ex.qtd += qtd; else sacola.push({ id, ml, qtd });
    gravar("anaperfumes-sacola", sacola);
    destaqueItem = `${id}-${ml}`;
    renderSacola();
    abrirSacola();
  }

  function renderSacola() {
    const qtdTotal = sacola.reduce((s, i) => s + i.qtd, 0);
    $("#sacolaQtd").textContent = qtdTotal;
    $("#sacolaQtd").classList.toggle("tem", qtdTotal > 0);
    $("#sacolaConta").textContent = qtdTotal ? `(${qtdTotal})` : "";

    $("#sacolaItens").innerHTML = sacola.map((i, idx) => {
      const p = porId(i.id);
      return `
        <li class="item ${destaqueItem === `${i.id}-${i.ml}` ? "item--novo" : ""}">
          <div class="item__img">${Graficos.frasco(p)}</div>
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
            <button class="link link--discreto" data-remover="${idx}">Remover</button>
          </div>
        </li>`;
    }).join("");
    destaqueItem = null;

    const total = sacola.reduce((s, i) => s + precoItem(i) * i.qtd, 0);
    $("#sacolaTotal").textContent = brl(total);
    $("#sacolaPix").textContent = CONFIG.descontoPix > 0 && total
      ? `${brl(comPix(total))} no Pix${parcelas(total) ? `, ${parcelas(total)}` : ""}` : "";
    $("#sacolaVazia").hidden = sacola.length > 0;
    $("#sacolaRodape").hidden = sacola.length === 0;

    /* barra de entrega grátis */
    const meta = CONFIG.freteGratisAcima || 0;
    const box = $("#sacolaMeta");
    if (meta && total) {
      const falta = meta - total;
      box.hidden = false;
      box.innerHTML = `
        <p>${falta > 0 ? `Faltam <strong>${brl(falta)}</strong> para a entrega grátis em Parauapebas` : "Você ganhou <strong>entrega grátis</strong> em Parauapebas"}</p>
        <span class="meta"><span style="width:${Math.min(100, (total / meta) * 100)}%"></span></span>`;
    } else box.hidden = true;

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
    if (painel.classList.contains("aberta")) return;
    focoAnterior = document.activeElement;
    fundo.hidden = false;
    requestAnimationFrame(() => { painel.classList.add("aberta"); fundo.classList.add("visivel"); });
    painel.setAttribute("aria-hidden", "false");
    document.body.classList.add("travado");
    setTimeout(() => $("#fecharSacola").focus(), 50);
  }
  function fecharSacola() {
    painel.classList.remove("aberta"); fundo.classList.remove("visivel");
    painel.setAttribute("aria-hidden", "true");
    document.body.classList.remove("travado");
    setTimeout(() => (fundo.hidden = true), 400);
    if (focoAnterior && document.contains(focoAnterior)) focoAnterior.focus();
  }
  $("#abrirSacola").addEventListener("click", abrirSacola);
  $("#fecharSacola").addEventListener("click", fecharSacola);
  fundo.addEventListener("click", fecharSacola);
  $("#sacolaExplorar").addEventListener("click", fecharSacola);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && painel.classList.contains("aberta")) fecharSacola(); });

  /* =========================================================
     CARD DE PRODUTO
     ========================================================= */
  function card(p) {
    const fam = FAMILIAS[p.familia];
    const varios = p.tamanhos.length > 1;
    const selo = p.destaque ? "Mais pedido" : p.novo ? "Novo" : "";
    return `
      <li class="card" style="view-transition-name: c-${p.id}">
        <div class="card__img">
          <button class="card__abrir" data-abrir="${p.id}" aria-label="Ver ${p.nome}">
            ${Graficos.frasco(p)}
          </button>
          ${selo ? `<span class="card__selo">${selo}</span>` : ""}
          <button class="card__fav" data-fav="${p.id}" aria-pressed="${ehFav(p.id)}" aria-label="Favoritar ${p.nome}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>
          </button>
          <button class="card__rapido" data-add="${p.id}">${varios ? "Escolher tamanho" : "Adicionar à sacola"}</button>
        </div>
        <div class="card__info">
          <p class="card__fam"><i style="background:${fam.cor}"></i>${fam.nome}</p>
          <h3><button data-abrir="${p.id}">${p.nome}</button></h3>
          <p class="card__linha">${p.linha}, ${p.tamanhos.map((t) => t.ml).join(" / ")} ml</p>
          ${blocoPreco(menorPreco(p), varios)}
        </div>
      </li>`;
  }

  function cliqueCards(e) {
    const fav = e.target.closest("[data-fav]");
    if (fav) {
      const id = fav.dataset.fav;
      favoritos = ehFav(id) ? favoritos.filter((f) => f !== id) : [...favoritos, id];
      gravar("anaperfumes-favoritos", favoritos);
      $$(`[data-fav="${id}"]`).forEach((b) => b.setAttribute("aria-pressed", ehFav(id)));
      atualizarFavTopo();
      renderAbas();
      if (filtro.favoritos) atualizarGrade();
      return;
    }
    const add = e.target.closest("[data-add]");
    if (add) {
      const p = porId(add.dataset.add);
      if (p.tamanhos.length > 1) abrirModal(p.id);
      else adicionar(p.id, p.tamanhos[0].ml);
      return;
    }
    const abrir = e.target.closest("[data-abrir]");
    if (abrir) abrirModal(abrir.dataset.abrir);
  }
  $("#grade").addEventListener("click", cliqueCards);
  $("#destaques").addEventListener("click", cliqueCards);

  const atualizarFavTopo = () => $("#irFavoritos").classList.toggle("tem", favoritos.length > 0);

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

  function renderGrade() {
    const lista = filtrados();
    $("#grade").innerHTML = lista.map(card).join("");
    $("#vazio").hidden = lista.length > 0;
    $("#vazio p").textContent = filtro.favoritos && !favoritos.length
      ? "Você ainda não tem favoritos. Toque no coração de um perfume para guardar aqui."
      : "Nenhum perfume encontrado com esses filtros.";
    $("#catConta").textContent = `${lista.length} ${lista.length === 1 ? "perfume" : "perfumes"}`;
  }
  const atualizarGrade = () => {
    if (document.startViewTransition && !semMovimento()) document.startViewTransition(renderGrade);
    else renderGrade();
  };

  function renderAbas() {
    const abas = [["", "Todos"], ...Object.entries(FAMILIAS).map(([k, f]) => [k, f.nome])];
    $("#filtroFamilias").innerHTML =
      abas.map(([k, n]) => `<button class="aba" data-fam="${k}" aria-pressed="${!filtro.favoritos && filtro.familia === k}">${n}</button>`).join("") +
      `<button class="aba aba--fav" data-favs aria-pressed="${filtro.favoritos}">Favoritos${favoritos.length ? ` (${favoritos.length})` : ""}</button>`;
  }

  $("#filtroFamilias").addEventListener("click", (e) => {
    if (e.target.closest("[data-favs]")) { filtro.favoritos = !filtro.favoritos; filtro.familia = ""; renderAbas(); atualizarGrade(); return; }
    const b = e.target.closest("[data-fam]"); if (!b) return;
    filtro.familia = b.dataset.fam; filtro.favoritos = false;
    renderAbas(); atualizarGrade();
  });
  let tBusca;
  $("#busca").addEventListener("input", (e) => { filtro.busca = e.target.value; clearTimeout(tBusca); tBusca = setTimeout(atualizarGrade, 160); });
  $("#filtroGenero").addEventListener("change", (e) => { filtro.genero = e.target.value; atualizarGrade(); });
  $("#ordenar").addEventListener("change", (e) => { filtro.ordem = e.target.value; atualizarGrade(); });
  $("#limparFiltros").addEventListener("click", () => {
    Object.assign(filtro, { familia: "", genero: "", busca: "", favoritos: false });
    $("#busca").value = ""; $("#filtroGenero").value = "";
    renderAbas(); atualizarGrade();
  });

  function irParaCatalogo(mudar) {
    mudar(); renderAbas(); renderGrade();
    $("#perfumes").scrollIntoView({ behavior: semMovimento() ? "auto" : "smooth" });
  }

  /* =========================================================
     JANELA DO PRODUTO
     ========================================================= */
  const modal = $("#modal");
  function abrirModal(id) {
    const p = porId(id), fam = FAMILIAS[p.familia];
    let sel = p.tamanhos[p.tamanhos.length > 1 ? 1 : 0].ml, qtd = 1;

    $("#modalCorpo").innerHTML = `
      <div class="pj__img">${Graficos.frasco(p)}</div>
      <div class="pj__info">
        <p class="card__fam"><i style="background:${fam.cor}"></i>${fam.nome}, ${GENERO[p.genero].toLowerCase()}</p>
        <h2 id="modalNome" tabindex="-1">${p.nome}</h2>
        <p class="pj__linha">${p.linha}</p>
        <div id="mPreco" aria-live="polite"></div>

        <fieldset class="tamanhos">
          <legend>Tamanho</legend>
          <div>
            ${p.tamanhos.map((t) => `
              <label class="tamanho">
                <input type="radio" name="tam" value="${t.ml}" ${t.ml === sel ? "checked" : ""} />
                <span>${t.ml} ml</span>
              </label>`).join("")}
          </div>
        </fieldset>

        <div class="pj__compra">
          <div class="qtd qtd--grande" role="group" aria-label="Quantidade">
            <button type="button" data-q="-1" aria-label="Diminuir quantidade">−</button>
            <span id="mQtd">1</span>
            <button type="button" data-q="1" aria-label="Aumentar quantidade">+</button>
          </div>
          <button class="btn btn--escuro" id="mAdd">Adicionar à sacola</button>
          <button class="pj__fav" data-fav-modal aria-pressed="${ehFav(p.id)}" aria-label="Favoritar ${p.nome}">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.2 4.2 0 0 1 12 7.6 4.2 4.2 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>
          </button>
        </div>

        <div class="acordeao">
          <details open>
            <summary>Notas olfativas</summary>
            <dl class="notas">
              <div><dt>Saída</dt><dd>${p.notas.topo.join(", ")}</dd></div>
              <div><dt>Coração</dt><dd>${p.notas.coracao.join(", ")}</dd></div>
              <div><dt>Fundo</dt><dd>${p.notas.fundo.join(", ")}</dd></div>
            </dl>
          </details>
          <details>
            <summary>Descrição</summary>
            <p>${p.descricao}</p>
          </details>
          <details>
            <summary>Entrega e pagamento</summary>
            <p>${CONFIG.freteTexto} Pagamento por Pix${CONFIG.descontoPix ? ` com ${CONFIG.descontoPix}% de desconto` : ""}, cartão${CONFIG.parcelasSemJuros > 1 ? ` em até ${CONFIG.parcelasSemJuros}x sem juros` : ""} ou dinheiro.</p>
          </details>
        </div>
        <a class="link" target="_blank" rel="noopener" href="${linkWhats(`Olá, Ana! Tenho uma dúvida sobre o perfume ${p.nome}.`)}">Tirar dúvida pelo WhatsApp</a>
      </div>`;

    const atualizar = () => {
      const preco = p.tamanhos.find((t) => t.ml === sel).preco;
      $("#mPreco").innerHTML = blocoPreco(preco * qtd, false, true);
      $("#mQtd").textContent = qtd;
    };
    $$('input[name="tam"]', modal).forEach((r) => r.addEventListener("change", () => { sel = +r.value; atualizar(); }));
    $$("[data-q]", modal).forEach((b) => b.addEventListener("click", () => { qtd = Math.max(1, qtd + +b.dataset.q); atualizar(); }));
    $("#mAdd").addEventListener("click", () => { modal.close(); adicionar(p.id, sel, qtd); });
    $("[data-fav-modal]", modal).addEventListener("click", (e) => {
      favoritos = ehFav(p.id) ? favoritos.filter((f) => f !== p.id) : [...favoritos, p.id];
      gravar("anaperfumes-favoritos", favoritos);
      e.currentTarget.setAttribute("aria-pressed", ehFav(p.id));
      $$(`[data-fav="${p.id}"]`).forEach((b) => b.setAttribute("aria-pressed", ehFav(p.id)));
      atualizarFavTopo(); renderAbas();
    });
    atualizar();
    modal.showModal();
    modal.scrollTop = 0;
    $("#modalNome").focus({ preventScroll: true });
  }

  $$("dialog.janela").forEach((d) => d.addEventListener("click", (e) => {
    if (e.target === d || e.target.closest("[data-fechar]")) d.close();
  }));

  /* =========================================================
     QUIZ: DESCOBRIR MEU PERFUME
     ========================================================= */
  const PERGUNTAS = [
    {
      chave: "genero", titulo: "Para quem é o perfume?",
      opcoes: [
        { v: "feminino", t: "Para ela" },
        { v: "masculino", t: "Para ele" },
        { v: "", t: "Tanto faz, incluir unissex" },
      ],
    },
    {
      chave: "momento", titulo: "Quando você vai usar mais?",
      opcoes: [
        { v: "dia", t: "No dia a dia", d: "Trabalho, faculdade, calor", fam: ["citrico", "aquatico", "floral"] },
        { v: "noite", t: "À noite", d: "Encontros, festas, jantares", fam: ["oriental", "gourmand", "amadeirado"] },
        { v: "sempre", t: "Em qualquer momento", d: "Um perfume para tudo", fam: ["floral", "amadeirado", "gourmand"] },
      ],
    },
    {
      chave: "sensacao", titulo: "Que sensação você procura?",
      opcoes: [
        { v: "frescor", t: "Frescor", d: "Limpo, leve, de banho tomado", fam: ["citrico", "aquatico"] },
        { v: "doce", t: "Doce e envolvente", d: "Baunilha, caramelo, cremoso", fam: ["gourmand"] },
        { v: "romantico", t: "Floral e delicado", d: "Flores brancas, pétalas", fam: ["floral"] },
        { v: "marcante", t: "Marcante", d: "Madeiras, especiarias, couro", fam: ["amadeirado", "oriental"] },
      ],
    },
  ];
  const quiz = $("#quiz");
  let resp = {}, passo = 0;

  function renderQuiz() {
    if (passo >= PERGUNTAS.length) { renderResultado(); return; }
    $("#quizBarra").style.width = `${((passo + 1) / (PERGUNTAS.length + 1)) * 100}%`;
    const q = PERGUNTAS[passo];
    $("#quizCorpo").innerHTML = `
      <div class="quiz__passo">
        <p class="quiz__conta">Pergunta ${passo + 1} de ${PERGUNTAS.length}</p>
        <h2 id="quizTitulo" tabindex="-1">${q.titulo}</h2>
        <div class="quiz__opcoes">
          ${q.opcoes.map((o) => `
            <button class="quiz__opcao" data-v="${o.v}">
              <strong>${o.t}</strong>${o.d ? `<span>${o.d}</span>` : ""}
            </button>`).join("")}
        </div>
        ${passo > 0 ? '<button class="link link--discreto quiz__voltar" data-voltar>Voltar</button>' : ""}
      </div>`;
    $("#quizTitulo").focus({ preventScroll: true });
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

    $("#quizBarra").style.width = "100%";
    $("#quizCorpo").innerHTML = `
      <div class="quiz__passo">
        <p class="quiz__conta">Sua seleção</p>
        <h2 id="quizTitulo">Três perfumes para você conhecer</h2>
        <ul class="quiz__resultado">
          ${lista.map((p) => `
            <li>
              <button data-ver="${p.id}">
                <span class="quiz__img">${Graficos.frasco(p)}</span>
                <strong>${p.nome}</strong>
                <span>${FAMILIAS[p.familia].nome}, a partir de ${brl(menorPreco(p))}</span>
              </button>
            </li>`).join("")}
        </ul>
        <button class="link link--discreto quiz__voltar" data-recomecar>Responder de novo</button>
      </div>`;
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
    if (!menu.hidden) alternarMenu(false);
    resp = {}; passo = 0; renderQuiz(); quiz.showModal();
  });

  /* =========================================================
     ABERTURA: cena com três frascos
     ========================================================= */
  const escolhidos = [...PRODUTOS.filter((p) => p.destaque), ...PRODUTOS].filter((p, i, a) => a.indexOf(p) === i);
  const formas = new Set();
  const cena = escolhidos.filter((p) => !formas.has(p.frasco) && formas.add(p.frasco)).slice(0, 3);
  const [principal, esquerda, direita] = cena;
  $("#heroCena").innerHTML = `
    ${esquerda ? `<button class="cena__f cena__f--esq" data-abrir="${esquerda.id}" aria-label="Ver ${esquerda.nome}">${Graficos.frasco(esquerda)}</button>` : ""}
    ${direita ? `<button class="cena__f cena__f--dir" data-abrir="${direita.id}" aria-label="Ver ${direita.nome}">${Graficos.frasco(direita)}</button>` : ""}
    <button class="cena__f cena__f--centro" data-abrir="${principal.id}" aria-label="Ver ${principal.nome}">${Graficos.frasco(principal)}</button>`;
  $("#heroLegenda").innerHTML = `
    <span><strong>${principal.nome}</strong>${principal.linha}<span class="preco-legenda">, a partir de ${brl(menorPreco(principal))}</span></span>
    <button class="link" data-abrir="${principal.id}">Ver perfume</button>`;
  $(".hero").addEventListener("click", (e) => {
    const b = e.target.closest("[data-abrir]"); if (b) abrirModal(b.dataset.abrir);
  });

  /* =========================================================
     MAIS PEDIDOS E FAMÍLIAS
     ========================================================= */
  $("#destaques").innerHTML = escolhidos.slice(0, 4).map(card).join("");

  $("#familiasLista").innerHTML = Object.entries(FAMILIAS).map(([k, f]) => {
    const n = PRODUTOS.filter((p) => p.familia === k).length;
    return `
      <li>
        <button class="familia" data-ir="${k}" style="--cor:${f.cor}" ${n ? "" : "disabled"}>
          <span class="familia__cor" aria-hidden="true"></span>
          <span class="familia__nome">${f.nome}</span>
          <span class="familia__frase">${f.frase}</span>
          <span class="familia__n">${n ? `${n} ${n === 1 ? "perfume" : "perfumes"}` : "Em breve"}</span>
        </button>
      </li>`;
  }).join("");
  $("#familiasLista").addEventListener("click", (e) => {
    const b = e.target.closest("[data-ir]");
    if (b) irParaCatalogo(() => { filtro.familia = b.dataset.ir; filtro.favoritos = false; });
  });

  /* =========================================================
     REVELAR AO ROLAR (discreto, uma vez)
     ========================================================= */
  if ("IntersectionObserver" in window && !semMovimento()) {
    const io = new IntersectionObserver((ents) => ents.forEach((en) => {
      if (en.isIntersecting) { en.target.classList.add("visto"); io.unobserve(en.target); }
    }), { rootMargin: "0px 0px -6% 0px" });
    $$(".secao__cabeca, #destaques .card, .familias li, .passos li, .sobre__texto, .atendimento__inner").forEach((el, i) => {
      el.classList.add("revelar");
      el.style.setProperty("--d", `${(i % 4) * 60}ms`);
      io.observe(el);
    });
  }

  /* =========================================================
     CABEÇALHO, MENU E LINKS
     ========================================================= */
  if (CONFIG.avisoTopo) $("#faixa").textContent = CONFIG.avisoTopo; else $("#faixa").remove();
  if (CONFIG.descontoPix > 0) $("#benefPixTitulo").textContent = `${CONFIG.descontoPix}% de desconto no Pix`;
  if (CONFIG.parcelasSemJuros > 1) $("#benefParcelas").textContent = `Ou até ${CONFIG.parcelasSemJuros}x sem juros no cartão`;
  const whatsOi = linkWhats("Olá, Ana! Vim pelo site.");
  $("#whatsFlutuante").href = $("#rodapeWhats").href = $("#menuWhats").href = whatsOi;
  $("#linkWhatsAtend").href = linkWhats("Olá, Ana! Queria uma sugestão de perfume.");
  $("#linkInsta").href = $("#rodapeInsta").href = `https://instagram.com/${CONFIG.instagram}`;
  $("#rodapeTroca").href = linkWhats("Olá, Ana! Queria saber sobre troca ou devolução.");
  $("#rodapeCidade").textContent = `Perfumaria em ${CONFIG.cidade}. Pedidos pelo WhatsApp e no Instagram @${CONFIG.instagram}.`;
  $("#sacolaFrete").textContent = CONFIG.freteTexto;
  $("#ano").textContent = new Date().getFullYear();

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

  const verFavoritos = () => irParaCatalogo(() => { filtro.favoritos = true; filtro.familia = ""; });
  $("[data-fav-link]").addEventListener("click", (e) => { e.preventDefault(); verFavoritos(); });
  $("#irFavoritos").addEventListener("click", verFavoritos);
  $("#irBusca").addEventListener("click", () => {
    $("#perfumes").scrollIntoView({ behavior: semMovimento() ? "auto" : "smooth" });
    setTimeout(() => $("#busca").focus({ preventScroll: true }), semMovimento() ? 0 : 500);
  });

  /* Cabeçalho: ganha linha ao rolar e se esconde ao descer */
  const topo = $("#topo");
  let ultimoY = scrollY;
  addEventListener("scroll", () => {
    const y = scrollY;
    topo.classList.toggle("rolado", y > 10);
    topo.classList.toggle("escondido", y > ultimoY && y > 500 && !document.body.classList.contains("menu-aberto"));
    ultimoY = y;
  }, { passive: true });

  /* =========================================================
     INÍCIO
     ========================================================= */
  renderAbas(); renderGrade(); renderSacola(); atualizarFavTopo();
})();
