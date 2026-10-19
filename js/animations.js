/* ==========================================================================
   animations.js — partículas, confetes, pétalas e efeitos de texto
   Exposto globalmente como window.FX
   ========================================================================== */
(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const isReduced = () => reduceMotion.matches;
  const DPR = () => Math.min(window.devicePixelRatio || 1, 2);
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (arr) => arr[(Math.random() * arr.length) | 0];

  const PALETA = ["#D7B779", "#F1E0B5", "#EAB9CA", "#F4DDE4", "#783F55", "#C98AA2", "#FFFFFF"];

  /* ---------------------------------------------------------------
     Ajuste de canvas ao tamanho da janela (com densidade de pixels)
     --------------------------------------------------------------- */
  function fitCanvas(canvas) {
    const dpr = DPR();
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  }

  /* ---------------------------------------------------------------
     1) Partículas ambientes: pontos dourados que flutuam lentamente
     --------------------------------------------------------------- */
  const Ambient = {
    canvas: null, ctx: null, w: 0, h: 0, dots: [], raf: 0, running: false,

    init() {
      this.canvas = document.getElementById("ambient-canvas");
      if (!this.canvas || !this.canvas.getContext) return;
      this.resize();
      window.addEventListener("resize", debounce(() => this.resize(), 200));
      document.addEventListener("visibilitychange", () => (document.hidden ? this.stop() : this.start()));
      reduceMotion.addEventListener?.("change", () => { this.stop(); this.start(); });
      this.start();
    },
    resize() {
      const r = fitCanvas(this.canvas);
      this.ctx = r.ctx; this.w = r.w; this.h = r.h;
      const count = Math.round(Math.min(46, Math.max(18, (r.w * r.h) / 30000)));
      this.dots = Array.from({ length: count }, () => this.makeDot(true));
      if (isReduced()) this.drawStatic();
    },
    makeDot(anywhere) {
      return {
        x: rand(0, this.w),
        y: anywhere ? rand(0, this.h) : this.h + 10,
        r: rand(0.8, 2.6),
        vy: rand(0.08, 0.35),
        phase: rand(0, Math.PI * 2),
        amp: rand(0.2, 0.8),
        hue: Math.random() < 0.7 ? "215,183,121" : "234,185,202",
        tw: rand(0.004, 0.012)
      };
    },
    drawDot(d, alpha) {
      const c = this.ctx;
      const g = c.createRadialGradient(d.x, d.y, 0, d.x, d.y, d.r * 4);
      g.addColorStop(0, `rgba(${d.hue},${alpha})`);
      g.addColorStop(1, `rgba(${d.hue},0)`);
      c.fillStyle = g;
      c.beginPath(); c.arc(d.x, d.y, d.r * 4, 0, Math.PI * 2); c.fill();
    },
    drawStatic() {
      this.ctx.clearRect(0, 0, this.w, this.h);
      this.dots.forEach((d) => this.drawDot(d, 0.45));
    },
    tick() {
      const c = this.ctx;
      c.clearRect(0, 0, this.w, this.h);
      for (const d of this.dots) {
        d.phase += d.tw;
        d.y -= d.vy;
        d.x += Math.sin(d.phase) * d.amp * 0.3;
        if (d.y < -20) Object.assign(d, this.makeDot(false));
        this.drawDot(d, 0.25 + (Math.sin(d.phase * 2) + 1) * 0.25);
      }
      this.raf = requestAnimationFrame(() => this.tick());
    },
    start() {
      if (!this.ctx || this.running) return;
      if (isReduced()) { this.drawStatic(); return; }
      this.running = true;
      this.tick();
    },
    stop() { this.running = false; cancelAnimationFrame(this.raf); }
  };

  /* ---------------------------------------------------------------
     2) Camada de efeitos: confetes, explosões de brilho e pétalas.
        O loop só roda enquanto há partículas vivas e tem limite de
        quantidade para preservar o desempenho.
     --------------------------------------------------------------- */
  const Fx = {
    canvas: null, ctx: null, w: 0, h: 0, parts: [], raf: 0, running: false, MAX: 420,

    init() {
      this.canvas = document.getElementById("fx-canvas");
      if (!this.canvas || !this.canvas.getContext) return;
      this.resize();
      window.addEventListener("resize", debounce(() => this.resize(), 200));
    },
    resize() {
      const r = fitCanvas(this.canvas);
      this.ctx = r.ctx; this.w = r.w; this.h = r.h;
    },
    add(p) {
      if (this.parts.length >= this.MAX) this.parts.shift();
      this.parts.push(p);
    },
    run() {
      if (this.running || !this.ctx) return;
      this.running = true;
      let last = performance.now();
      const loop = (now) => {
        const dt = Math.min(2.5, (now - last) / 16.67);
        last = now;
        const c = this.ctx;
        c.clearRect(0, 0, this.w, this.h);
        for (let i = this.parts.length - 1; i >= 0; i--) {
          const p = this.parts[i];
          p.life -= dt;
          if (p.life <= 0 || p.y > this.h + 40) { this.parts.splice(i, 1); continue; }
          p.vx *= p.drag; p.vy = p.vy * p.drag + p.g * dt;
          p.x += p.vx * dt; p.y += p.vy * dt;
          p.rot += p.vr * dt;
          p.wob += 0.1 * dt;
          const a = Math.min(1, p.life / 30) * p.alpha;
          c.save();
          c.globalAlpha = a;
          c.translate(p.x + Math.sin(p.wob) * p.sway, p.y);
          c.rotate(p.rot);
          this.draw(c, p);
          c.restore();
        }
        if (this.parts.length) this.raf = requestAnimationFrame(loop);
        else { this.running = false; c.clearRect(0, 0, this.w, this.h); }
      };
      this.raf = requestAnimationFrame(loop);
    },
    draw(c, p) {
      c.fillStyle = p.color;
      switch (p.shape) {
        case "rect":
          c.scale(1, Math.cos(p.wob * 1.6));
          c.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
          break;
        case "circle":
          c.beginPath(); c.arc(0, 0, p.size / 2, 0, Math.PI * 2); c.fill();
          break;
        case "star": {
          const s = p.size * 0.75, k = s * 0.15;
          c.beginPath();
          c.moveTo(0, -s);
          c.quadraticCurveTo(k, -k, s, 0);
          c.quadraticCurveTo(k, k, 0, s);
          c.quadraticCurveTo(-k, k, -s, 0);
          c.quadraticCurveTo(-k, -k, 0, -s);
          c.fill();
          break;
        }
        case "petal":
          c.beginPath();
          c.ellipse(0, 0, p.size * 0.38, p.size * 0.7, 0, 0, Math.PI * 2);
          c.fill();
          c.fillStyle = "rgba(255,255,255,.35)";
          c.beginPath(); c.ellipse(-p.size * 0.1, -p.size * 0.2, p.size * 0.1, p.size * 0.3, 0, 0, Math.PI * 2); c.fill();
          break;
        case "heart": {
          const s = p.size / 22;
          c.scale(s, s); c.translate(-12, -11);
          c.beginPath();
          c.moveTo(12, 21);
          c.bezierCurveTo(5, 15, 1, 11.5, 1, 7);
          c.bezierCurveTo(1, 3.5, 3.6, 1, 6.8, 1);
          c.bezierCurveTo(9, 1, 10.8, 2.2, 12, 4);
          c.bezierCurveTo(13.2, 2.2, 15, 1, 17.2, 1);
          c.bezierCurveTo(20.4, 1, 23, 3.5, 23, 7);
          c.bezierCurveTo(23, 11.5, 19, 15, 12, 21);
          c.fill();
          break;
        }
      }
    },

    /* Chuva de confetes vinda do topo (limitada no tempo) */
    confetti({ duration = 2600, density = 1 } = {}) {
      if (isReduced()) { this.burst(this.w / 2, this.h / 2, { count: 24, spread: 6 }); return; }
      const end = performance.now() + duration;
      const per = Math.round((this.w > 700 ? 9 : 5) * density);
      const emit = () => {
        for (let i = 0; i < per; i++) {
          this.add({
            x: rand(0, this.w), y: rand(-40, -10),
            vx: rand(-1.2, 1.2), vy: rand(1.5, 4),
            g: 0.05, drag: 0.995, rot: rand(0, 6.28), vr: rand(-0.12, 0.12),
            wob: rand(0, 6), sway: rand(0.5, 2.2),
            size: rand(7, 13), color: pick(PALETA),
            shape: Math.random() < 0.7 ? "rect" : (Math.random() < 0.5 ? "circle" : "star"),
            life: rand(160, 260), alpha: 1
          });
        }
        this.run();
        if (performance.now() < end) setTimeout(emit, 60);
      };
      emit();
    },

    /* Explosão radial de brilhos a partir de um ponto */
    burst(x, y, { count = 60, spread = 9, shapes = ["star", "circle", "rect"], colors = PALETA, gravity = 0.08 } = {}) {
      const n = isReduced() ? Math.min(14, count) : count;
      for (let i = 0; i < n; i++) {
        const ang = rand(0, Math.PI * 2);
        const sp = rand(spread * 0.3, spread);
        this.add({
          x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 2,
          g: gravity, drag: 0.94, rot: rand(0, 6.28), vr: rand(-0.2, 0.2),
          wob: rand(0, 6), sway: rand(0, 1),
          size: rand(6, 12), color: pick(colors), shape: pick(shapes),
          life: rand(60, 110), alpha: 1
        });
      }
      this.run();
    },

    /* Pétalas suaves saindo de um elemento */
    petals(el, count = 18) {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      const n = isReduced() ? 6 : count;
      for (let i = 0; i < n; i++) {
        const ang = rand(-Math.PI, 0);
        const sp = rand(2, 6);
        this.add({
          x: cx + rand(-r.width / 3, r.width / 3), y: cy,
          vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp,
          g: 0.06, drag: 0.96, rot: rand(0, 6.28), vr: rand(-0.06, 0.06),
          wob: rand(0, 6), sway: rand(0.6, 1.6),
          size: rand(9, 15), color: pick(["#EAB9CA", "#F4DDE4", "#D98EA8", "#F1E0B5"]),
          shape: Math.random() < 0.8 ? "petal" : "heart",
          life: rand(90, 140), alpha: 0.95
        });
      }
      this.run();
    },

    fromElement(el, opts) {
      const r = el.getBoundingClientRect();
      this.burst(r.left + r.width / 2, r.top + r.height / 2, opts);
    },

    clear() { this.parts.length = 0; }
  };

  /* ---------------------------------------------------------------
     3) Texto: divisão em letras e revelação progressiva
     --------------------------------------------------------------- */
  function splitChars(el) {
    const text = el.textContent;
    el.setAttribute("aria-label", text);
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.setProperty("--i", i);
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    });
  }

  function typeReveal(el, text, step = 45) {
    el.textContent = "";
    el.setAttribute("aria-label", text);
    if (isReduced()) { el.textContent = text; return; }
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ch";
      s.setAttribute("aria-hidden", "true");
      s.style.animationDelay = `${i * step}ms`;
      s.textContent = ch === " " ? " " : ch;
      el.appendChild(s);
    });
  }

  /* Contador numérico animado */
  function countUp(el, to, { duration = 1800, onDone } = {}) {
    if (isReduced()) { el.textContent = to.toLocaleString("pt-BR"); onDone && onDone(); return; }
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const t = Math.min(1, (now - start) / duration);
      el.textContent = Math.round(to * ease(t)).toLocaleString("pt-BR");
      if (t < 1) requestAnimationFrame(step);
      else onDone && onDone();
    };
    requestAnimationFrame(step);
  }

  function debounce(fn, ms) {
    let t;
    return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
  }

  window.FX = {
    Ambient, Fx, splitChars, typeReveal, countUp, debounce, rand,
    isReduced,
    init() {
      try { Ambient.init(); } catch (e) { console.warn("Partículas indisponíveis:", e); }
      try { Fx.init(); } catch (e) { console.warn("Efeitos indisponíveis:", e); }
    }
  };
})();
