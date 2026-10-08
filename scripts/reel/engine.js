/**
 * Mystic Digits — reel animation engine. Runs inside the headless page that
 * scripts/render-reel.ts drives.
 *
 * Every pixel is a pure function of time: the renderer calls __seek(t) for each
 * frame and screenshots the result, so there are no CSS animations or timers
 * and a render is identical every run, at any speed the machine manages.
 *
 * Scene types (see reels/README.md for the spec format):
 *   hook   — the first frame. Fully legible at t=0 (it doubles as the cover)
 *   text   — headline revealed word by word, optional sub line
 *   point  — a numbered beat ("2 / 3") for list reels, which hold viewers to the end
 *   big    — one giant number with a burst, then a caption
 *   calc   — digits adding up on screen: 28 → 2 + 8 → 10 → 1
 *   rapid  — items flash too fast to read, so viewers pause and replay
 *   image  — a real report page with a slow push-in
 *   end    — logo + call to action
 */
(() => {
  const spec = window.__SPEC;
  const FPS = 30;

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeBack = (p) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  };
  const prog = (t, start, dur) => clamp((t - start) / dur);
  const words = (s) => (s || "").replace(/\*/g, "").split(/\s+/).filter(Boolean).length;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  /**
   * "Born on the *7th*.\nOf July" → one span per word (the unit that animates),
   * *…* highlighted gold, \n a line break. A word keeps any punctuation glued to
   * a highlight ("*7th*." stays "7th." and never wraps apart).
   */
  function rich(text) {
    return String(text || "")
      .split("\n")
      .map((line) => {
        let hl = false;
        const chars = [];
        for (const ch of line) {
          if (ch === "*") hl = !hl;
          else chars.push({ ch, hl });
        }
        const out = [];
        let word = [];
        const flush = () => {
          if (!word.length) return;
          let html = "";
          for (let i = 0; i < word.length; ) {
            let j = i;
            while (j < word.length && word[j].hl === word[i].hl) j++;
            const part = esc(word.slice(i, j).map((c) => c.ch).join(""));
            html += word[i].hl ? `<span class="hl">${part}</span>` : part;
            i = j;
          }
          out.push(`<span class="w">${html}</span>`);
          word = [];
        };
        for (const c of chars) {
          if (c.ch === " " || c.ch === "\t") flush(); // a non-breaking space keeps words together
          else word.push(c);
        }
        flush();
        return out.join(" ");
      })
      .join("<br>");
  }

  function el(tag, cls, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  // ---- primitive animations -------------------------------------------------

  function setT(e, opacity, y = 0, scale = 1) {
    e.style.opacity = String(opacity);
    e.style.transform = `translateY(${y}px) scale(${scale})`;
  }
  function rise(e, lt, start, d = 0.32, dist = 46) {
    if (!e) return;
    const p = easeOut(prog(lt, start, d));
    setT(e, p, (1 - p) * dist);
  }
  function pop(e, lt, start, d = 0.42, from = 0.55) {
    if (!e) return;
    const raw = prog(lt, start, d);
    const p = easeBack(raw);
    setT(e, clamp(raw * 2.2), 0, from + (1 - from) * p);
  }
  /** Word-by-word reveal; returns the time the last word lands. */
  function wordsIn(container, lt, start, stagger) {
    if (!container) return start;
    const ws = container.querySelectorAll(".w");
    const n = ws.length;
    const st = stagger ?? Math.min(0.1, 0.75 / Math.max(1, n - 1));
    ws.forEach((w, i) => {
      const p = easeOut(prog(lt, start + i * st, 0.22));
      setT(w, p, (1 - p) * 34, 0.9 + 0.1 * p);
    });
    return start + (n - 1) * st + 0.22;
  }
  function burst(ring, lt, start) {
    if (!ring) return;
    const p = prog(lt, start, 0.75);
    ring.style.opacity = p <= 0 || p >= 1 ? "0" : String(0.85 * (1 - p));
    ring.style.transform = `scale(${0.35 + 1.5 * easeOut(p)})`;
  }

  /** Shrink font-size until the element fits its box and no single word overflows. */
  function fit(e, maxPx, minPx, maxW, maxH) {
    if (!e) return;
    let size = maxPx;
    e.style.fontSize = size + "px";
    const fits = () => {
      if (e.scrollHeight > maxH || e.scrollWidth > maxW + 1) return false;
      for (const w of e.querySelectorAll(".w")) if (w.offsetWidth > maxW) return false;
      return true;
    };
    while (size > minPx && !fits()) {
      size -= 3;
      e.style.fontSize = size + "px";
    }
  }

  // ---- scene builders -------------------------------------------------------
  // Each returns { root, dur, update(lt) }. lt = seconds since the scene began.

  function frame(type) {
    const root = el("div", `scene scene-${type}`);
    const cam = el("div", "cam");
    const content = el("div", "content");
    cam.appendChild(content);
    root.appendChild(cam);
    return { root, cam, content };
  }

  const builders = {
    hook(s) {
      const f = frame("hook");
      const kicker = s.kicker ? el("div", "kicker", rich(s.kicker)) : null;
      const head = el("div", "headline", rich(s.text));
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      [kicker, head, sub].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.4 + words(s.text) * 0.15 + words(s.sub) * 0.16, 2.0, 3.2);
      return {
        ...f, dur,
        layout() { fit(head, s.size ?? 132, 70, 900, sub ? 560 : 760); },
        update(lt) {
          // Legible on frame 0 — this is the frame that stops the scroll.
          const p = easeOut(prog(lt, 0, 0.35));
          setT(head, 1, 0, 1.1 - 0.1 * p);
          if (kicker) setT(kicker, 1, 0, 1);
          if (sub) wordsIn(sub, lt, 0.45);
        },
      };
    },

    text(s) {
      const f = frame("text");
      const kicker = s.kicker ? el("div", "kicker", rich(s.kicker)) : null;
      const head = el("div", "text", rich(s.text));
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      [kicker, head, sub].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(0.8 + words(s.text) * 0.22 + words(s.sub) * 0.17, 1.6, 4.2);
      return {
        ...f, dur,
        layout() { fit(head, s.size ?? 104, 60, 900, sub ? 560 : 760); },
        update(lt) {
          rise(kicker, lt, 0);
          const end = wordsIn(head, lt, kicker ? 0.12 : 0);
          if (sub) wordsIn(sub, lt, end + 0.1);
        },
      };
    },

    point(s) {
      const f = frame("point");
      const counter = el("div", "counter", `${s.n} / ${s.of}`);
      const head = el("div", "text", rich(s.text));
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      [counter, head, sub].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.0 + words(s.text) * 0.22 + words(s.sub) * 0.17, 1.8, 4.2);
      return {
        ...f, dur,
        layout() { fit(head, s.size ?? 100, 60, 900, sub ? 520 : 700); },
        update(lt) {
          pop(counter, lt, 0, 0.35, 0.6);
          const end = wordsIn(head, lt, 0.15);
          if (sub) wordsIn(sub, lt, end + 0.1);
        },
      };
    },

    big(s) {
      const f = frame("big");
      const wrap = el("div", "");
      wrap.style.position = "relative";
      const kicker = s.kicker ? el("div", "kicker", rich(s.kicker)) : null;
      const num = el("div", "bignum", esc(s.value));
      num.style.fontSize = (s.size ?? 560) + "px";
      const ring = el("div", "ring");
      wrap.append(ring, num);
      const cap = s.caption ? el("div", "text", rich(s.caption)) : null;
      if (cap) cap.style.marginTop = "30px";
      [kicker, wrap, cap].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.5 + words(s.caption) * 0.22, 2.0, 3.8);
      return {
        ...f, dur,
        layout() { if (cap) fit(cap, s.captionSize ?? 88, 54, 900, 380); },
        update(lt) {
          rise(kicker, lt, 0);
          pop(num, lt, 0.05, 0.5, 0.4);
          burst(ring, lt, 0.12);
          if (cap) wordsIn(cap, lt, 0.55);
        },
      };
    },

    calc(s) {
      const f = frame("calc");
      const label = s.label ? el("div", "text calc-label", rich(s.label)) : null;
      const stageEl = el("div", "calc-stage");
      const ring = el("div", "ring");
      stageEl.appendChild(ring);
      const steps = s.steps.map((txt, i) => {
        const final = i === s.steps.length - 1;
        const html = esc(txt).replace(/([+=→×])/g, '<span class="op">$1</span>');
        const e = el("div", `calc-step${final ? " final bignum" : ""}`, html);
        stageEl.appendChild(e);
        return e;
      });
      const cap = s.caption ? el("div", "text", rich(s.caption)) : null;
      [label, stageEl, cap].forEach((x) => x && f.content.appendChild(x));
      const stepDur = s.stepDur ?? 0.55;
      const t0 = label ? 0.55 : 0.1;
      const finalAt = t0 + (steps.length - 1) * stepDur;
      const dur = s.dur ?? finalAt + 0.85 + words(s.caption) * 0.2;
      return {
        ...f, dur,
        layout() {
          if (label) fit(label, s.labelSize ?? 84, 54, 900, 260);
          if (cap) fit(cap, s.captionSize ?? 80, 50, 900, 300);
          steps.forEach((e, i) => {
            if (i < steps.length - 1) fit(e, 230, 110, 900, 470);
          });
        },
        update(lt) {
          if (label) wordsIn(label, lt, 0);
          steps.forEach((e, i) => {
            const start = t0 + i * stepDur;
            const end = i === steps.length - 1 ? Infinity : start + stepDur;
            if (lt < start - 0.001) { setT(e, 0); return; }
            if (i === steps.length - 1) { pop(e, lt, start, 0.5, 0.5); return; }
            const pin = easeOut(prog(lt, start, 0.16));
            const pout = easeOut(prog(lt, end - 0.12, 0.12));
            setT(e, pin * (1 - pout), (1 - pin) * 70 - pout * 70);
          });
          burst(ring, lt, finalAt + 0.05);
          if (cap) wordsIn(cap, lt, finalAt + 0.45);
        },
      };
    },

    rapid(s) {
      const f = frame("rapid");
      const pause = el("div", "pause", "<b></b><b></b>&nbsp;" + esc(s.pauseLabel ?? "PAUSE"));
      const title = el("div", "text rapid-title", rich(s.title));
      const stageEl = el("div", "rapid-stage");
      const items = s.items.map((it) => {
        const e = el("div", "rapid-item");
        // Optional per-item tint (e.g. each number's lucky colour).
        const tint = it.color
          ? ` style="background-image:linear-gradient(180deg,#ffffff 0%,${it.color} 50%,${it.color} 100%);filter:drop-shadow(0 0 40px ${it.color}88)"`
          : "";
        e.innerHTML =
          `<div class="bignum"${tint}>${esc(it.n)}</div>` +
          `<div class="rapid-text">${rich(it.text)}</div>` +
          (it.small ? `<div class="rapid-small">${rich(it.small)}</div>` : "");
        stageEl.appendChild(e);
        return e;
      });
      const dots = el("div", "dots", s.items.map((it) => `<span>${esc(it.n)}</span>`).join(""));
      [pause, title, stageEl, dots].forEach((x) => f.content.appendChild(x));
      const per = s.per ?? 0.6;
      const t0 = s.lead ?? 0.7;
      const dur = s.dur ?? t0 + s.items.length * per + 0.25;
      return {
        ...f, dur,
        layout() {
          fit(title, s.titleSize ?? 76, 50, 900, 200);
          items.forEach((e) => fit(e.querySelector(".rapid-text"), s.itemSize ?? 74, 44, 900, 250));
        },
        update(lt) {
          rise(pause, lt, 0, 0.25);
          wordsIn(title, lt, 0, 0.06);
          const idx = lt < t0 ? -1 : Math.min(items.length - 1, Math.floor((lt - t0) / per));
          items.forEach((e, i) => {
            e.style.opacity = i === idx ? "1" : "0";
            if (i === idx) {
              const p = easeOut(prog(lt, t0 + i * per, 0.1));
              setT(e, 1, 0, 0.94 + 0.06 * p);
            }
          });
          dots.querySelectorAll("span").forEach((d, i) => d.classList.toggle("on", i === idx));
          // Blink the pause cue while the items run — it's the instruction.
          if (lt >= t0) pause.style.opacity = String(0.55 + 0.45 * Math.abs(Math.cos((lt - t0) * Math.PI * 1.6)));
        },
      };
    },

    image(s) {
      const f = frame("image");
      const head = s.text ? el("div", "text", rich(s.text)) : null;
      const card = el("div", "img-card");
      const h = s.height ?? 820;
      card.style.height = h + "px";
      card.style.width = Math.round(h * (s.aspect ?? 1191 / 1685)) + "px";
      const img = el("img");
      img.src = s.src;
      if (s.focus) img.style.transformOrigin = s.focus;
      card.appendChild(img);
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      if (sub) sub.style.marginTop = "34px";
      [head, card, sub].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.6 + words(s.text) * 0.2 + words(s.sub) * 0.15, 2.4, 4.0);
      return {
        ...f, dur,
        layout() { if (head) fit(head, s.size ?? 80, 50, 900, 250); },
        update(lt) {
          const end = head ? wordsIn(head, lt, 0) : 0;
          rise(card, lt, 0.1, 0.4, 120);
          img.style.transform = `scale(${1 + (s.zoom ?? 0.22) * easeOut(prog(lt, 0.1, dur))})`;
          if (sub) wordsIn(sub, lt, end + 0.2);
        },
      };
    },

    end(s) {
      const f = frame("end");
      const logo = el("img", "logo");
      logo.src = window.__LOGO;
      const head = el("div", "text", rich(s.text));
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      const url = s.url === false ? null : el("div", "url", esc(s.url ?? "mysticdigits.in"));
      [logo, head, sub, url].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.4 + words(s.text) * 0.2 + words(s.sub) * 0.15, 2.4, 3.4);
      return {
        ...f, dur,
        layout() { fit(head, s.size ?? 96, 56, 900, 420); },
        update(lt) {
          pop(logo, lt, 0, 0.45, 0.7);
          const end = wordsIn(head, lt, 0.15);
          if (sub) wordsIn(sub, lt, end + 0.05);
          if (url) {
            rise(url, lt, end + 0.25);
            if (lt > end + 0.6) url.style.transform = `scale(${1 + 0.035 * Math.sin((lt - end) * 5)})`;
          }
        },
      };
    },
  };

  // ---- background -----------------------------------------------------------

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const seedOf = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

  const canvas = document.getElementById("stars");
  const ctx = canvas.getContext("2d");
  const rand = rng(seedOf(spec.slug));
  const stars = Array.from({ length: 240 }, () => ({
    x: rand() * 1080, y: rand() * 1920,
    r: 0.6 + rand() * 1.9,
    a: 0.25 + rand() * 0.6,
    f: 0.6 + rand() * 2.2, ph: rand() * 6.28,
    v: 4 + rand() * 16,
  }));
  const dust = Array.from({ length: 16 }, () => ({
    x: rand() * 1080, y: rand() * 1920,
    r: 2.5 + rand() * 4.5, a: 0.18 + rand() * 0.3,
    v: 14 + rand() * 26, sway: 10 + rand() * 30, ph: rand() * 6.28,
  }));

  function drawSky(t) {
    ctx.clearRect(0, 0, 1080, 1920);
    for (const s of stars) {
      const y = (((s.y - t * s.v) % 1920) + 1920) % 1920;
      const tw = 0.55 + 0.45 * Math.sin(t * s.f + s.ph);
      ctx.globalAlpha = s.a * tw;
      ctx.fillStyle = "#e8e8f0";
      ctx.beginPath();
      ctx.arc(s.x, y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.fillStyle = "#ecc96a";
    for (const d of dust) {
      const y = (((d.y - t * d.v) % 1920) + 1920) % 1920;
      const x = d.x + Math.sin(t * 0.8 + d.ph) * d.sway;
      ctx.globalAlpha = d.a * (0.6 + 0.4 * Math.sin(t * 1.3 + d.ph));
      ctx.shadowColor = "#ecc96a";
      ctx.shadowBlur = 18;
      ctx.beginPath();
      ctx.arc(x, y, d.r, 0, 6.283);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  // ---- timeline -------------------------------------------------------------

  const scenesHost = document.getElementById("scenes");
  const scenes = spec.scenes.map((s) => {
    const b = builders[s.type];
    if (!b) throw new Error(`Unknown scene type "${s.type}" in ${spec.slug}`);
    const sc = b(s);
    scenesHost.appendChild(sc.root);
    return sc;
  });
  let acc = 0;
  for (const sc of scenes) {
    sc.start = acc;
    acc += sc.dur;
  }
  const DURATION = Math.round(acc * FPS) / FPS;

  const mandala = document.getElementById("mandala");
  const glow = document.getElementById("glow");
  const flash = document.getElementById("flash");
  const EXIT = 0.16;

  window.__init = () => {
    for (const sc of scenes) {
      sc.root.style.display = "block";
      sc.layout && sc.layout();
      sc.root.style.display = "none";
    }
    return {
      duration: DURATION,
      scenes: scenes.map((sc, i) => ({ type: spec.scenes[i].type, start: sc.start, dur: sc.dur })),
    };
  };

  window.__seek = (t) => {
    drawSky(t);
    mandala.style.transform = `rotate(${t * 4}deg) scale(${1 + 0.03 * Math.sin(t * 0.5)})`;
    glow.style.opacity = String(0.18 + 0.06 * Math.sin(t * 1.7));
    glow.style.transform = `scale(${1 + 0.05 * Math.sin(t * 1.1)})`;

    let active = scenes.length - 1;
    for (let i = 0; i < scenes.length; i++) {
      if (t < scenes[i].start + scenes[i].dur) { active = i; break; }
    }
    scenes.forEach((sc, i) => {
      // display, not visibility: a child with visibility:visible would show
      // through a hidden parent.
      if (i !== active) { sc.root.style.display = "none"; return; }
      const lt = t - sc.start;
      sc.root.style.display = "block";
      sc.update(lt);
      sc.cam.style.transform = `scale(${1 + 0.035 * clamp(lt / sc.dur)})`;
      const last = i === scenes.length - 1;
      const pe = last ? 0 : easeOut(prog(lt, sc.dur - EXIT, EXIT));
      sc.root.style.opacity = String(1 - pe);
      sc.root.style.transform = `translateY(${-26 * pe}px)`;
      flash.style.opacity = i === 0 ? "0" : String(0.11 * (1 - prog(lt, 0, 0.24)));
    });
  };
})();
