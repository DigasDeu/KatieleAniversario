/* ==========================================================================
   interactions.js — presente, carta, desejos, bolo, cartões, galeria,
   música e celebração final. Exposto como window.UI
   ========================================================================== */
(function () {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const wait = (ms) => new Promise((res) => setTimeout(res, ms));
  const reduced = () => window.FX && FX.isReduced();

  function toast(msg, ms = 3200) {
    const t = $("#toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => t.classList.remove("is-on"), ms);
  }

  /* Efeito de ondulação nos botões */
  function ripple(e) {
    const btn = e.target.closest(".btn");
    if (!btn || reduced()) return;
    const r = btn.getBoundingClientRect();
    const s = document.createElement("span");
    const size = Math.max(r.width, r.height);
    s.className = "ripple";
    s.style.cssText = `width:${size}px;height:${size}px;left:${(e.clientX || r.left + r.width / 2) - r.left - size / 2}px;top:${(e.clientY || r.top + r.height / 2) - r.top - size / 2}px`;
    btn.classList.add("is-ripple");
    btn.appendChild(s);
    setTimeout(() => s.remove(), 650);
  }

  /* ======================================================================
     1. INTRO — o presente
     ====================================================================== */
  const Intro = {
    el: null, opened: false, done: false,
    init(cfg) {
      this.cfg = cfg;
      this.el = $("#intro");
      if (!this.el) return;
      this.gift = $("#gift");
      this.reveal = $("#intro-reveal");
      document.body.classList.add("is-locked");
      this.gift.addEventListener("click", () => this.open());
      $("#gift-btn").addEventListener("click", () => this.open());
      $("#intro-skip").addEventListener("click", () => this.finish(true));
      this.el.addEventListener("keydown", (e) => { if (e.key === "Escape") this.finish(true); });
    },
    async open() {
      if (this.opened || this.done) return;
      this.opened = true;
      this.el.classList.add("is-opened");
      this.gift.classList.add("is-open");
      this.gift.setAttribute("aria-label", "Presente aberto");
      Audio.unlock();
      await wait(reduced() ? 0 : 450);
      const r = this.gift.getBoundingClientRect();
      FX.Fx.burst(r.left + r.width / 2, r.top + r.height * 0.45, {
        count: 90, spread: 11, shapes: ["star", "circle", "star"],
        colors: ["#D7B779", "#F1E0B5", "#FFF4D6", "#EAB9CA", "#FFFFFF"], gravity: 0.05
      });
      await wait(reduced() ? 0 : 500);
      FX.typeReveal(this.reveal, this.cfg.intro.revelacao, 55);
      await wait(reduced() ? 600 : 2600);
      this.finish(false);
    },
    finish(skipped) {
      if (this.done) return;
      this.done = true;
      this.el.classList.add("is-leaving");
      document.body.classList.remove("is-locked");
      setTimeout(() => this.el.classList.add("is-gone"), skipped ? 400 : 1000);
      document.dispatchEvent(new CustomEvent("intro:done", { detail: { skipped } }));
      const title = $("#hero-title");
      if (title) { title.setAttribute("tabindex", "-1"); title.focus({ preventScroll: true }); }
    },
    reset() {
      this.opened = false; this.done = false;
      this.el.classList.remove("is-gone", "is-leaving", "is-opened");
      this.gift.classList.remove("is-open");
      this.gift.setAttribute("aria-label", "Abrir o presente");
      this.reveal.textContent = "";
      document.body.classList.add("is-locked");
      setTimeout(() => $("#gift-btn").focus({ preventScroll: true }), 300);
    }
  };

  /* ======================================================================
     5. CARTA — envelope digital
     ====================================================================== */
  const Letter = {
    open: false, busy: false, timers: [],
    init(cfg) {
      this.env = $("#envelope");
      this.letter = $("#letter");
      if (!this.env) return;
      $("#letter-greet").textContent = cfg.carta.saudacao;
      const body = $("#letter-body");
      body.innerHTML = "";
      cfg.carta.paragrafos.forEach((t) => {
        const p = document.createElement("p");
        p.textContent = t;
        body.appendChild(p);
      });
      $("#letter-sign").textContent = cfg.carta.despedida;
      this.env.addEventListener("click", () => (this.open ? this.close() : this.show()));
      $("#letter-close").addEventListener("click", () => this.close());
    },
    async show() {
      if (this.busy || this.open) return;
      this.busy = true; this.open = true;
      this.env.classList.add("is-open");
      this.env.setAttribute("aria-expanded", "true");
      await wait(reduced() ? 0 : 1100);
      this.letter.hidden = false;
      this.letter.classList.remove("is-closing");
      const parts = [$("#letter-greet"), ...$$("#letter-body p"), $("#letter-sign")];
      parts.forEach((p) => p.classList.remove("is-shown"));
      this.letter.focus({ preventScroll: true });
      this.letter.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" });
      parts.forEach((p, i) => {
        this.timers.push(setTimeout(() => p.classList.add("is-shown"), reduced() ? 0 : 500 + i * 650));
      });
      FX.Fx.petals(this.env, 14);
      this.busy = false;
    },
    async close() {
      if (this.busy || !this.open) return;
      this.busy = true;
      this.timers.forEach(clearTimeout); this.timers = [];
      this.letter.classList.add("is-closing");
      await wait(reduced() ? 0 : 550);
      this.letter.hidden = true;
      this.env.classList.remove("is-open");
      this.env.setAttribute("aria-expanded", "false");
      this.open = false; this.busy = false;
      this.env.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
      this.env.focus({ preventScroll: true });
    },
    reset() {
      this.timers.forEach(clearTimeout); this.timers = [];
      if (!this.letter) return;
      this.letter.hidden = true;
      this.env.classList.remove("is-open");
      this.env.setAttribute("aria-expanded", "false");
      this.open = false; this.busy = false;
    }
  };

  /* ======================================================================
     7. JARDIM DOS DESEJOS
     ====================================================================== */
  const Garden = {
    picked: new Set(),
    // posições das flores na árvore (coordenadas do SVG 320x340)
    spots: [[160, 52], [96, 120], [226, 104], [128, 80], [196, 62], [70, 168], [252, 156], [160, 140]],
    init(cfg) {
      this.grid = $("#wish-grid");
      if (!this.grid) return;
      this.wishes = cfg.desejos;
      $("#wish-total").textContent = this.wishes.length;
      this.buildTree();
      this.grid.innerHTML = "";
      this.wishes.forEach((w, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "wish reveal";
        b.style.setProperty("--d", `${(i % 4) * 0.08}s`);
        b.setAttribute("aria-expanded", "false");
        b.dataset.i = i;
        b.innerHTML = `
          <svg class="wish__icon" aria-hidden="true"><use href="#flor"/></svg>
          <span class="wish__title"></span>
          <span class="wish__msg"><span></span></span>`;
        b.querySelector(".wish__title").textContent = w.titulo;
        b.querySelector(".wish__msg > span").textContent = w.mensagem;
        b.addEventListener("click", () => this.toggle(b, i));
        this.grid.appendChild(b);
      });
      $("#wish-all").addEventListener("click", () => this.revealAll());
    },
    buildTree() {
      const g = $("#tree-blooms");
      if (!g) return;
      const NS = "http://www.w3.org/2000/svg";
      g.innerHTML = "";
      this.blooms = this.wishes.map((_, i) => {
        const [x, y] = this.spots[i % this.spots.length];
        const bud = document.createElementNS(NS, "circle");
        bud.setAttribute("cx", x); bud.setAttribute("cy", y); bud.setAttribute("r", 5);
        bud.setAttribute("class", "tree-bud");
        g.appendChild(bud);
        const u = document.createElementNS(NS, "use");
        u.setAttribute("href", "#flor");
        u.setAttribute("x", x - 17); u.setAttribute("y", y - 17);
        u.setAttribute("width", 34); u.setAttribute("height", 34);
        u.setAttribute("class", "tree-bloom");
        g.appendChild(u);
        return u;
      });
    },
    toggle(btn, i, silent) {
      const open = btn.getAttribute("aria-expanded") === "true";
      btn.setAttribute("aria-expanded", String(!open));
      if (!open && !this.picked.has(i)) {
        this.picked.add(i);
        btn.classList.add("is-picked");
        this.blooms[i] && this.blooms[i].classList.add("is-on");
        if (!silent) FX.Fx.petals(btn, 16);
        this.updateCount();
      }
    },
    async revealAll() {
      const btns = $$(".wish", this.grid);
      const allBtn = $("#wish-all");
      allBtn.disabled = true;
      for (const b of btns) {
        const i = +b.dataset.i;
        if (b.getAttribute("aria-expanded") !== "true") this.toggle(b, i, true);
        FX.Fx.petals(b, 6);
        await wait(reduced() ? 0 : 140);
      }
      const tree = $(".garden__tree");
      if (tree) FX.Fx.fromElement(tree, { count: 50, spread: 8, shapes: ["star", "circle"] });
      allBtn.disabled = false;
      allBtn.textContent = "Todos os desejos foram entregues";
      toast("Todos os desejos agora são seus.");
    },
    updateCount() { $("#wish-count").textContent = this.picked.size; },
    reset() {
      this.picked.clear();
      $$(".wish", this.grid).forEach((b) => { b.setAttribute("aria-expanded", "false"); b.classList.remove("is-picked"); });
      (this.blooms || []).forEach((b) => b.classList.remove("is-on"));
      const allBtn = $("#wish-all");
      if (allBtn) { allBtn.disabled = false; allBtn.textContent = "Receber todos os desejos"; }
      this.updateCount();
    }
  };

  /* ======================================================================
     8. BOLO — pedido, velinhas e sopro opcional pelo microfone
     ====================================================================== */
  const Cake = {
    lit: true, busy: false, mic: null,
    init(cfg) {
      this.cfg = cfg;
      this.cake = $("#cake");
      if (!this.cake) return;
      this.msg = $("#cake-message");
      this.candles = $$(".candle", this.cake);
      $("#cake-wish").addEventListener("click", () => this.wish());
      $("#cake-blow").addEventListener("click", () => this.blow());
      $("#cake-relight").addEventListener("click", () => this.relight());
      const micBtn = $("#cake-mic");
      const canMic = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && (window.AudioContext || window.webkitAudioContext));
      if (!canMic) micBtn.hidden = true;
      micBtn.addEventListener("click", () => (this.mic ? this.stopMic("Microfone desligado.") : this.startMic()));
    },
    say(text) {
      this.msg.textContent = text;
      this.msg.classList.remove("is-new");
      void this.msg.offsetWidth;
      this.msg.classList.add("is-new");
    },
    wish() {
      if (!this.lit) { this.say("As velinhas estão apagadas. Acenda de novo para fazer outro pedido."); return; }
      this.cake.classList.add("is-wishing");
      this.say(this.cfg.bolo.pedido);
      $("#cake-blow").focus({ preventScroll: true });
    },
    async blow() {
      if (!this.lit || this.busy) return;
      this.busy = true;
      this.stopMic();
      $("#cake-blow").disabled = true;
      for (const c of this.candles) {
        c.classList.add("is-out");
        await wait(reduced() ? 0 : 220);
      }
      this.lit = false;
      this.cake.classList.remove("is-wishing");
      this.cake.classList.add("is-dark");
      await wait(reduced() ? 0 : 500);
      FX.Fx.confetti({ duration: 2200 });
      FX.Fx.fromElement(this.cake, { count: 70, spread: 10 });
      this.say(this.cfg.bolo.celebracao);
      $("#cake-relight").hidden = false;
      this.busy = false;
    },
    relight() {
      this.candles.forEach((c) => c.classList.remove("is-out"));
      this.cake.classList.remove("is-dark");
      this.lit = true;
      $("#cake-blow").disabled = false;
      $("#cake-relight").hidden = true;
      this.say("Velinhas acesas. Pode fazer um novo pedido.");
    },
    async startMic() {
      if (!this.lit) this.relight();
      const label = $("#cake-mic-label");
      label.textContent = "Pedindo permissão…";
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } });
        const AC = window.AudioContext || window.webkitAudioContext;
        const ctx = new AC();
        const src = ctx.createMediaStreamSource(stream);
        const an = ctx.createAnalyser();
        an.fftSize = 1024;
        src.connect(an);
        const data = new Uint8Array(an.fftSize);
        const meter = $("#mic-meter");
        const bar = meter.querySelector("span");
        meter.hidden = false;
        label.textContent = "Desligar microfone";
        this.say("Pode soprar! Estou ouvindo.");
        let strong = 0;
        const started = performance.now();
        const loop = () => {
          if (!this.mic) return;
          an.getByteTimeDomainData(data);
          let sum = 0;
          for (let i = 0; i < data.length; i++) { const v = (data[i] - 128) / 128; sum += v * v; }
          const rms = Math.sqrt(sum / data.length);
          bar.style.transform = `scaleX(${Math.min(1, rms * 4)})`;
          strong = rms > 0.16 ? strong + 1 : Math.max(0, strong - 1);
          if (strong > 12) { this.blow(); return; }
          if (performance.now() - started > 20000) { this.stopMic("O microfone foi desligado. Você também pode usar o botão Apagar as velinhas."); return; }
          this.mic.raf = requestAnimationFrame(loop);
        };
        this.mic = { stream, ctx, raf: 0 };
        loop();
      } catch (err) {
        console.warn("Microfone indisponível:", err && err.name);
        this.mic = null;
        label.textContent = "Soprar pelo microfone";
        this.say("Não foi possível usar o microfone. Sem problema: toque em Apagar as velinhas.");
      }
    },
    stopMic(message) {
      if (!this.mic) return;
      cancelAnimationFrame(this.mic.raf);
      try { this.mic.stream.getTracks().forEach((t) => t.stop()); } catch (e) { /* ignorado */ }
      try { this.mic.ctx.close(); } catch (e) { /* ignorado */ }
      this.mic = null;
      $("#mic-meter").hidden = true;
      $("#cake-mic-label").textContent = "Soprar pelo microfone";
      if (message) this.say(message);
    },
    reset() {
      this.stopMic();
      if (!this.cake) return;
      this.candles.forEach((c) => c.classList.remove("is-out"));
      this.cake.classList.remove("is-dark", "is-wishing");
      this.lit = true; this.busy = false;
      $("#cake-blow").disabled = false;
      $("#cake-relight").hidden = true;
      this.msg.textContent = "";
    }
  };

  /* ======================================================================
     9. CARTÕES MISTERIOSOS
     ====================================================================== */
  const Cards = {
    symbols: [
      '<svg viewBox="-10 -10 20 20"><use href="#brilho"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/></svg>',
      '<svg viewBox="-20 -20 40 40"><use href="#flor"/></svg>',
      '<svg viewBox="0 0 24 22" fill="currentColor"><use href="#coracao"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/></svg>',
      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M20 4C11 4 5 10 5 19M20 4c0 8-5 13-13 14M9 15l-5 5"/></svg>'
    ],
    names: ["Brilho", "Lua", "Flor", "Coração", "Sol", "Pena"],
    init(cfg) {
      this.grid = $("#flip-grid");
      if (!this.grid) return;
      this.grid.innerHTML = "";
      cfg.cartoes.forEach((msg, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "flip reveal";
        b.style.setProperty("--d", `${(i % 3) * 0.1}s`);
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", `Cartão ${i + 1}: ${this.names[i % 6]}. Toque para revelar`);
        b.innerHTML = `
          <span class="flip__inner">
            <span class="flip__face flip__front">${this.symbols[i % 6]}<span class="flip__n">Cartão ${i + 1}</span></span>
            <span class="flip__face flip__back"><svg aria-hidden="true"><use href="#brilho"/></svg><p></p></span>
          </span>`;
        b.querySelector(".flip__back p").textContent = msg;
        b._busy = false;
        b._msg = msg;
        b.addEventListener("click", () => this.flip(b, i));
        this.grid.appendChild(b);
      });
    },
    flip(b, i) {
      if (b._busy) return;           // ignora cliques enquanto o giro acontece
      b._busy = true;
      const on = b.getAttribute("aria-pressed") !== "true";
      b.setAttribute("aria-pressed", String(on));
      b.setAttribute("aria-label", on ? `Cartão ${i + 1}: ${b._msg}` : `Cartão ${i + 1}: ${this.names[i % 6]}. Toque para revelar`);
      if (on) setTimeout(() => FX.Fx.fromElement(b, { count: 26, spread: 6, shapes: ["star", "circle"] }), reduced() ? 0 : 380);
      setTimeout(() => { b._busy = false; }, reduced() ? 50 : 900);
    },
    reset() {
      $$(".flip", this.grid).forEach((b, i) => {
        b.setAttribute("aria-pressed", "false");
        b.setAttribute("aria-label", `Cartão ${i + 1}: ${this.names[i % 6]}. Toque para revelar`);
        b._busy = false;
      });
    }
  };

  /* ======================================================================
     10. GALERIA + LIGHTBOX
     ====================================================================== */
  const Gallery = {
    idx: 0, lastFocus: null,
    init(cfg) {
      this.photos = (cfg.fotos || []).filter((f) => f && f.src);
      this.grid = $("#gallery");
      this.box = $("#lightbox");
      if (!this.grid) return;
      if (!this.photos.length) { $("#gallery-empty").hidden = false; this.grid.hidden = true; return; }
      this.grid.innerHTML = "";
      this.photos.forEach((p, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = `g-item g-item--${p.orientacao === "horizontal" ? "h" : "v"} is-loading`;
        b.setAttribute("aria-label", `Ampliar foto: ${p.legenda || p.alt || "memória " + (i + 1)}`);
        const img = document.createElement("img");
        img.loading = "lazy";
        img.decoding = "async";
        img.alt = p.alt || p.legenda || "";
        img.addEventListener("load", () => b.classList.remove("is-loading"));
        img.addEventListener("error", () => { b.remove(); });   // remove fotos que não existem
        img.src = p.src;
        b.appendChild(img);
        if (p.legenda) {
          const cap = document.createElement("figcaption");
          cap.textContent = p.legenda;
          cap.setAttribute("aria-hidden", "true");
          b.appendChild(cap);
        }
        b.addEventListener("click", () => this.open(i));
        this.grid.appendChild(b);
      });

      this.img = $("#lightbox-img");
      this.frame = $(".lightbox__frame");
      $("#lightbox-close").addEventListener("click", () => this.close());
      $("#lightbox-prev").addEventListener("click", () => this.go(-1));
      $("#lightbox-next").addEventListener("click", () => this.go(1));
      $(".lightbox__backdrop", this.box).addEventListener("click", () => this.close());
      this.img.addEventListener("load", () => this.frame.classList.remove("is-loading"));
      this.img.addEventListener("error", () => { this.frame.classList.remove("is-loading"); toast("Não foi possível carregar esta foto."); });
      this.box.addEventListener("keydown", (e) => this.keys(e));

      // gesto de deslizar no celular
      let x0 = null;
      this.box.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
      this.box.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const dx = e.changedTouches[0].clientX - x0;
        if (Math.abs(dx) > 50) this.go(dx < 0 ? 1 : -1);
        x0 = null;
      });
    },
    open(i) {
      this.lastFocus = document.activeElement;
      this.box.hidden = false;
      document.body.classList.add("is-locked");
      this.show(i);
      $("#lightbox-close").focus();
    },
    show(i) {
      const n = this.photos.length;
      this.idx = (i + n) % n;
      const p = this.photos[this.idx];
      this.frame.classList.add("is-loading");
      this.img.alt = p.alt || p.legenda || "";
      this.img.src = p.src;
      if (this.img.complete && this.img.naturalWidth) this.frame.classList.remove("is-loading");
      $("#lightbox-caption").textContent = p.legenda || "";
      $("#lightbox-count").textContent = `${this.idx + 1} / ${n}`;
      // pré-carrega vizinhas
      [1, -1].forEach((d) => { const im = new Image(); im.src = this.photos[(this.idx + d + n) % n].src; });
    },
    go(d) { if (!this.box.hidden) this.show(this.idx + d); },
    close() {
      if (this.box.hidden) return;
      this.box.hidden = true;
      document.body.classList.remove("is-locked");
      this.lastFocus && this.lastFocus.focus && this.lastFocus.focus({ preventScroll: true });
    },
    keys(e) {
      if (e.key === "Escape") { e.preventDefault(); this.close(); }
      else if (e.key === "ArrowRight") this.go(1);
      else if (e.key === "ArrowLeft") this.go(-1);
      else if (e.key === "Tab") {
        const f = $$("button", this.box).filter((b) => !b.hidden);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  };

  /* ======================================================================
     11. TRILHA SONORA — arquivo próprio ou caixinha de música gerada
     ====================================================================== */
  const Audio = {
    playing: false, muted: false, ctx: null, master: null, timer: 0, el: null, mode: "synth",
    init(cfg) {
      this.cfg = cfg.musica || {};
      this.root = $("#audio");
      if (!this.root) return;
      this.btn = $("#audio-play");
      this.muteBtn = $("#audio-mute");
      $("#audio-label").textContent = this.cfg.titulo || "Música";
      const AC = window.AudioContext || window.webkitAudioContext;
      if (this.cfg.arquivo) this.mode = "file";
      else if (!AC) { this.root.hidden = true; return; }
      this.btn.addEventListener("click", () => (this.playing ? this.pause() : this.play()));
      this.muteBtn.addEventListener("click", () => this.toggleMute());
      document.addEventListener("visibilitychange", () => { if (document.hidden && this.playing) this.pause(); });
    },
    unlock() { /* o áudio só começa quando a visitante pede pelo botão */ },
    sync() {
      this.root.classList.toggle("is-playing", this.playing);
      this.root.classList.toggle("is-muted", this.muted);
      this.btn.setAttribute("aria-pressed", String(this.playing));
      this.btn.setAttribute("aria-label", this.playing ? "Pausar música" : "Tocar música");
      this.muteBtn.setAttribute("aria-pressed", String(this.muted));
      this.muteBtn.setAttribute("aria-label", this.muted ? "Ativar som" : "Silenciar");
    },
    async play() {
      try {
        if (this.mode === "file") {
          if (!this.el) {
            this.el = new window.Audio(this.cfg.arquivo);
            this.el.loop = true; this.el.volume = 0.6;
            this.el.addEventListener("error", () => {
              toast("A faixa não carregou. Tocando a caixinha de música.");
              this.mode = "synth"; this.el = null; this.playing = false; this.play();
            });
            this.el.addEventListener("pause", () => { this.playing = false; this.sync(); });
            this.el.addEventListener("play", () => { this.playing = true; this.sync(); });
          }
          this.root.classList.add("is-loading");
          this.el.muted = this.muted;
          await this.el.play();
          this.root.classList.remove("is-loading");
        } else {
          this.ensureSynth();
          if (this.ctx.state === "suspended") await this.ctx.resume();
          this.playing = true;
          if (!this.timer) this.startScheduler();
        }
        this.playing = true;
      } catch (e) {
        console.warn("Áudio indisponível:", e);
        this.root.classList.remove("is-loading");
        this.playing = false;
        toast("Não foi possível tocar a música neste navegador.");
      }
      this.sync();
    },
    pause() {
      if (this.mode === "file" && this.el) this.el.pause();
      if (this.ctx) { clearInterval(this.timer); this.timer = 0; this.ctx.suspend(); }
      this.playing = false;
      this.sync();
    },
    toggleMute() {
      this.muted = !this.muted;
      if (this.el) this.el.muted = this.muted;
      if (this.master) this.master.gain.setTargetAtTime(this.muted ? 0 : 0.5, this.ctx.currentTime, 0.05);
      this.sync();
    },

    /* --- Sintetizador de caixinha de música (composição original) --- */
    ensureSynth() {
      if (this.ctx) return;
      const AC = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AC();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      // eco suave
      const delay = c.createDelay(1);
      delay.delayTime.value = 0.32;
      const fb = c.createGain(); fb.gain.value = 0.28;
      const lp = c.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 2400;
      this.bus = c.createGain();
      this.bus.connect(this.master);
      this.bus.connect(delay);
      delay.connect(lp); lp.connect(fb); fb.connect(delay);
      lp.connect(this.master);
      this.master.connect(c.destination);

      const bpm = 76, eighth = 60 / bpm / 2;
      this.eighth = eighth;
      const arp = (r, third, fifth) => [r, r + third, r + 7, r + 12, r + 12 + third, r + 12, r + 7, r + third].map((n, i) => (i === 3 || i === 4 ? n : n));
      const F = arp(53, 4), Dm = arp(50, 3), Bb = arp(46, 4), C = arp(48, 4), Am = arp(45, 3);
      this.bars = [
        { arp: F,  mel: [[72, 1], [77, 1.5], [76, .5], [77, 1]] },
        { arp: Dm, mel: [[81, 2], [79, 1], [77, 1]] },
        { arp: Bb, mel: [[74, 1.5], [77, .5], [79, 1], [77, 1]] },
        { arp: C,  mel: [[76, 3], [null, 1]] },
        { arp: F,  mel: [[72, 1], [77, 1.5], [76, .5], [77, 1]] },
        { arp: Am, mel: [[84, 2], [81, 1], [79, 1]] },
        { arp: Bb, mel: [[77, 1], [79, 1], [81, 1], [79, 1]] },
        { arp: C,  mel: [[76, 2], [77, 2]] }
      ];
      this.bar = 0;
      this.nextBarTime = 0;
    },
    bell(midi, t, vol, len) {
      const c = this.ctx;
      const f = 440 * Math.pow(2, (midi - 69) / 12);
      const g = c.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, t + len);
      g.connect(this.bus);
      [[1, 1], [2, 0.35], [3.01, 0.12]].forEach(([mult, amp]) => {
        const o = c.createOscillator();
        const og = c.createGain();
        o.type = "sine";
        o.frequency.value = f * mult;
        og.gain.value = amp;
        o.connect(og); og.connect(g);
        o.start(t); o.stop(t + len + 0.05);
      });
    },
    startScheduler() {
      const c = this.ctx;
      if (this.nextBarTime < c.currentTime) this.nextBarTime = c.currentTime + 0.12;
      const schedule = () => {
        while (this.nextBarTime < c.currentTime + 0.6) {
          const b = this.bars[this.bar % this.bars.length];
          const t0 = this.nextBarTime, e = this.eighth;
          b.arp.forEach((n, i) => this.bell(n, t0 + i * e, 0.07, 1.4));
          let beat = 0;
          b.mel.forEach(([n, d]) => {
            if (n) this.bell(n, t0 + beat * 2 * e, 0.16, Math.max(1.2, d * 2 * e + 0.8));
            beat += d;
          });
          this.nextBarTime += e * 8;
          this.bar++;
        }
      };
      schedule();
      this.timer = setInterval(schedule, 120);
    }
  };

  /* ======================================================================
     12. CELEBRAÇÃO FINAL
     ====================================================================== */
  const Finale = {
    busy: false,
    init(cfg) {
      this.cfg = cfg;
      this.btn = $("#celebrate");
      if (!this.btn) return;
      const ul = $("#finale-wishes");
      ul.innerHTML = "";
      (cfg.final.desejosFinais || []).forEach((w, i) => {
        const li = document.createElement("li");
        li.style.setProperty("--i", i);
        li.innerHTML = '<svg aria-hidden="true" viewBox="-10 -10 20 20"><use href="#brilho"/></svg><span></span>';
        li.querySelector("span").textContent = w;
        ul.appendChild(li);
      });
      this.btn.addEventListener("click", () => this.celebrate());
      $("#restart").addEventListener("click", () => document.dispatchEvent(new CustomEvent("experience:restart")));
    },
    async celebrate() {
      if (this.busy) return;
      this.busy = true;
      this.btn.disabled = true;
      FX.Fx.fromElement(this.btn, { count: 80, spread: 12, shapes: ["star", "star", "circle"] });
      FX.Fx.confetti({ duration: 3200, density: 1.2 });
      const res = $("#finale-result");
      // reinicia as animações de entrada a cada celebração
      res.hidden = true; void res.offsetWidth; res.hidden = false;
      await wait(reduced() ? 0 : 3400);
      this.btn.disabled = false;
      this.btn.textContent = "Celebrar mais uma vez";
      this.busy = false;
    },
    reset() {
      if (!this.btn) return;
      $("#finale-result").hidden = true;
      this.btn.textContent = "Celebrar este novo ciclo";
      this.btn.disabled = false;
      this.busy = false;
    }
  };

  window.UI = { Intro, Letter, Garden, Cake, Cards, Gallery, Audio, Finale, toast, ripple };
})();
