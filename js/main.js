/* ==========================================================================
   main.js — inicialização, textos da configuração, navegação, progresso,
   contador e revelações ao rolar a página
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const CFG = window.SITE_CONFIG || {};

  /* Executa uma etapa sem deixar um erro derrubar o restante do site */
  function safe(name, fn) {
    try { fn(); } catch (e) { console.error(`[homenagem] Falha em ${name}:`, e); }
  }

  /* --------------------------------------------------------------
     Textos e cores vindos de js/config.js
     -------------------------------------------------------------- */
  function get(path) {
    return path.split(".").reduce((o, k) => (o == null ? o : o[k]), CFG);
  }
  function bindTexts() {
    const nomeCompleto = `${CFG.tratamento ? CFG.tratamento + " " : ""}${CFG.nome}`;
    CFG.tratamentoNome = nomeCompleto;
    $$("[data-bind]").forEach((el) => {
      const v = get(el.dataset.bind);
      if (typeof v === "string" && v.trim()) el.textContent = v;
    });
    document.title = `Feliz Aniversário, ${nomeCompleto}`;
    const root = document.documentElement.style;
    const c = CFG.cores || {};
    if (c.blush) root.setProperty("--blush", c.blush);
    if (c.rosa) root.setProperty("--rosa", c.rosa);
    if (c.vinho) root.setProperty("--vinho", c.vinho);
    if (c.dourado) root.setProperty("--ouro", c.dourado);
    if (c.marfim) root.setProperty("--marfim", c.marfim);
    if (c.texto) root.setProperty("--texto", c.texto);

    if (CFG.hero && CFG.hero.foto) {
      const img = $("#hero-photo");
      img.src = CFG.hero.foto;
      img.alt = CFG.hero.fotoAlt || "";
      img.addEventListener("error", () => { img.closest(".hero__portrait").hidden = true; });
    }
    $("#year").textContent = new Date().getFullYear();

    // Créditos
    const ct = $("#credits-text");
    ct.innerHTML = "";
    (CFG.creditos.paragrafos || []).forEach((t, i) => {
      const p = document.createElement("p");
      p.className = "reveal";
      p.style.setProperty("--d", `${i * 0.15}s`);
      p.textContent = t;
      ct.appendChild(p);
    });
    if (CFG.creditos.logo) {
      const logo = $("#credits-logo");
      logo.src = CFG.creditos.logo;
      logo.alt = CFG.creditos.equipe;
      logo.hidden = false;
      logo.addEventListener("error", () => { logo.hidden = true; });
    }
  }

  /* Idade: só aparece com data confirmada e autorização explícita */
  function showAge() {
    if (!CFG.mostrarIdade || !CFG.dataNascimento) return;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(CFG.dataNascimento);
    if (!m) return;
    const nasc = new Date(+m[1], +m[2] - 1, +m[3]);
    const hoje = new Date();
    let idade = hoje.getFullYear() - nasc.getFullYear();
    if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) idade--;
    if (idade > 0 && idade < 130) {
      const el = $("#hero-age");
      el.textContent = `Celebrando ${idade} anos de uma vida linda.`;
      el.hidden = false;
    }
  }

  /* --------------------------------------------------------------
     Hero: letras do nome e corações ocasionais
     -------------------------------------------------------------- */
  function heroIntro() {
    const hero = $("#inicio");
    hero.classList.remove("is-in");
    void hero.offsetWidth;
    hero.classList.add("is-in");
  }

  const Hearts = {
    timer: 0, box: null,
    start() {
      this.box = $("#hearts");
      if (!this.box || FX.isReduced() || this.timer) return;
      this.timer = setInterval(() => this.spawn(), 2200);
    },
    spawn() {
      if (document.hidden || this.box.childElementCount > 6) return;
      const NS = "http://www.w3.org/2000/svg";
      const s = document.createElementNS(NS, "svg");
      s.setAttribute("class", "heart-float");
      s.setAttribute("viewBox", "0 0 24 22");
      const u = document.createElementNS(NS, "use");
      u.setAttribute("href", "#coracao");
      s.appendChild(u);
      s.style.left = `${FX.rand(4, 96)}%`;
      s.style.setProperty("--drift", `${FX.rand(-40, 40)}px`);
      s.style.setProperty("--rot", `${FX.rand(-25, 25)}deg`);
      const sc = FX.rand(0.7, 1.4);
      s.style.width = `${18 * sc}px`; s.style.height = `${16 * sc}px`;
      s.addEventListener("animationend", () => s.remove());
      this.box.appendChild(s);
    }
  };

  /* --------------------------------------------------------------
     Contador e palavras
     -------------------------------------------------------------- */
  const Counter = {
    done: false, rot: 0,
    init() {
      const list = $("#word-list");
      this.words = CFG.contador.palavras || [];
      list.innerHTML = "";
      this.words.forEach((w) => { const li = document.createElement("li"); li.textContent = w; list.appendChild(li); });
      this.items = $$("li", list);
    },
    run() {
      if (this.done) return;
      this.done = true;
      $$(".stat__num[data-count]").forEach((el, i) => {
        const to = +el.dataset.count;
        const inf = el.hasAttribute("data-infinite");
        setTimeout(() => FX.countUp(el, to, {
          duration: inf ? 2200 : 1600,
          onDone: () => { if (inf) { el.textContent = "∞"; el.classList.add("is-infinite"); el.setAttribute("aria-label", "infinitos"); } }
        }), i * 150);
      });
      this.rotate();
    },
    rotate() {
      const word = $("#rotator-word");
      let i = 0;
      const step = () => {
        const w = this.words[i % this.words.length];
        word.textContent = w;
        word.classList.remove("swap"); void word.offsetWidth; word.classList.add("swap");
        this.items.forEach((li, k) => li.classList.toggle("is-on", k === i % this.words.length));
        i++;
      };
      step();
      if (!FX.isReduced()) this.rot = setInterval(() => { if (!document.hidden) step(); }, 2000);
    }
  };

  /* --------------------------------------------------------------
     Revelação ao rolar (o estado de repouso é sempre visível)
     -------------------------------------------------------------- */
  function observeReveals() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        e.target.classList.add("in");
        io.unobserve(e.target);
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal, .credits__author, .nursing .section__head").forEach((el) => {
      // só anima o que ainda está fora da tela no momento da carga
      const r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { el.classList.add("in-static"); if (el.matches(".credits__author, .section__head")) el.classList.add("in"); return; }
      io.observe(el);
    });

    const counterIO = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) { Counter.run(); counterIO.disconnect(); }
    }, { threshold: 0.35 });
    counterIO.observe($("#celebracao"));
  }

  /* --------------------------------------------------------------
     Navegação: pontos ativos, barra de progresso, voltar ao topo
     -------------------------------------------------------------- */
  function navigation() {
    const links = $$(".dots a");
    const dots = $(".dots");
    const sections = links.map((a) => $(a.getAttribute("href"))).filter(Boolean);
    const bar = $("#progress-bar");
    const toTop = $("#to-top");
    let ticking = false;

    const update = () => {
      ticking = false;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      bar.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      toTop.classList.toggle("is-visible", y > window.innerHeight * 0.8);
      const mid = y + window.innerHeight * 0.45;
      let current = sections[0];
      sections.forEach((s) => { if (s.offsetTop <= mid) current = s; });
      links.forEach((a) => {
        const on = a.getAttribute("href") === `#${current.id}`;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
      });
      dots.classList.toggle("on-dark", current && (current.id === "bolo" || current.id === "creditos"));
    };
    window.addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener("resize", FX.debounce(update, 150));
    update();

    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: FX.isReduced() ? "auto" : "smooth" });
      $("#hero-title").focus({ preventScroll: true });
    });

    // links internos: rolagem suave e foco no destino
    document.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const target = $(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: FX.isReduced() ? "auto" : "smooth", block: "start" });
      const h = target.querySelector("h2");
      if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
    });
  }

  /* --------------------------------------------------------------
     Reiniciar a experiência
     -------------------------------------------------------------- */
  function restart() {
    ["Letter", "Garden", "Cake", "Cards", "Finale"].forEach((k) => safe(`reset ${k}`, () => UI[k].reset()));
    FX.Fx.clear();
    window.scrollTo({ top: 0, behavior: "auto" });
    safe("intro", () => UI.Intro.reset());
  }

  /* --------------------------------------------------------------
     Início
     -------------------------------------------------------------- */
  function boot() {
    if (!window.FX || !window.UI) {
      document.body.classList.remove("is-locked");
      const intro = document.getElementById("intro");
      if (intro) intro.hidden = true;
      return;
    }
    safe("textos", bindTexts);
    safe("idade", showAge);
    safe("efeitos", () => FX.init());
    safe("contador", () => Counter.init());
    ["Letter", "Garden", "Cake", "Cards", "Gallery", "Audio", "Finale"].forEach((k) => safe(k, () => UI[k].init(CFG)));
    safe("intro", () => UI.Intro.init(CFG));
    safe("navegação", navigation);
    safe("revelações", observeReveals);

    document.addEventListener("click", (e) => UI.ripple(e));
    document.addEventListener("intro:done", (e) => {
      safe("hero", heroIntro);
      Hearts.start();
      if (!e.detail.skipped && !FX.isReduced()) setTimeout(() => FX.Fx.confetti({ duration: 1400, density: 0.6 }), 500);
    });
    document.addEventListener("experience:restart", restart);

    // Escape fecha a carta aberta quando o foco está nela
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && UI.Letter.open && document.activeElement && document.activeElement.closest("#letter")) UI.Letter.close();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
