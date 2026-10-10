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
 *   chat   — a whole conversation: typing dots, bubbles popping in, auto-scroll
 *   end    — logo + call to action
 *
 * Styles (spec.style) change the look, not the script: night (gold on a
 * starfield), paper (panchang almanac page), notebook (handwriting on ruled
 * paper), bold (full-screen colour blocks), planet (a ruling planet's horizon)
 * and chat (a messaging thread). See THEMES below and reel.css.
 */
(() => {
  const spec = window.__SPEC;
  const FPS = 30;
  const STYLE = spec.style || "night";

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const easeOut = (p) => 1 - Math.pow(1 - p, 3);
  const easeBack = (p) => {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2);
  };
  const prog = (t, start, dur) => clamp((t - start) / dur);
  const words = (s) => (s || "").replace(/[*~]/g, "").split(/\s+/).filter(Boolean).length;
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  // ---- themes ---------------------------------------------------------------
  // word:   how a word arrives — rise (float up), ink (settle), write (drawn left
  //         to right), slam (punch in from large)
  // ring:   what marks a reveal — burst (expanding ring), circle (hand-drawn
  //         red circle that stays), none
  // panels: every scene is a full-screen colour block that wipes over the last
  // tint:   recolour the logo for light backgrounds
  const THEMES = {
    night: { word: "rise", ring: "burst", flash: 0.11 },
    paper: { word: "ink", ring: "burst", flash: 0.08, tint: "#7d1a0f" },
    notebook: { word: "write", ring: "circle", flash: 0, tint: "#1f3b8f", scribble: true },
    bold: { word: "slam", ring: "none", flash: 0, panels: true, size: 1.2 },
    planet: { word: "rise", ring: "burst", flash: 0.09 },
    chat: { word: "rise", ring: "burst", flash: 0 },
  };
  const THEME = THEMES[STYLE];
  if (!THEME) throw new Error(`Unknown style "${STYLE}" in ${spec.slug}`);

  // Bold: each scene takes the next colour block; fg/hl are chosen for contrast.
  const PALETTE = [
    { bg: "#1d0f5c", fg: "#ffffff", hl: "#ffd23f" },
    { bg: "#ff5a1f", fg: "#170b2e", hl: "#ffffff" },
    { bg: "#ffd23f", fg: "#170b2e", hl: "#d6175d" },
    { bg: "#0b6e4f", fg: "#ffffff", hl: "#ffd23f" },
    { bg: "#d6175d", fg: "#ffffff", hl: "#ffd23f" },
    { bg: "#0e0e12", fg: "#ffffff", hl: "#ff5a1f" },
  ];
  function contrastFor(hex) {
    const n = parseInt(hex.slice(1), 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6 ? { fg: "#170b2e", hl: "#170b2e" } : { fg: "#ffffff", hl: "#ffffff" };
  }

  /**
   * "Born on the *7th*.\nOf July" → one span per word (the unit that animates).
   * *…* highlights, ~…~ strikes through, \n breaks the line. A word keeps any
   * punctuation glued to a highlight ("*7th*." stays "7th." and never wraps
   * apart); a non-breaking space keeps two words together.
   */
  function rich(text) {
    return String(text || "")
      .split("\n")
      .map((line) => {
        let hl = false, st = false;
        const chars = [];
        for (const ch of line) {
          if (ch === "*") hl = !hl;
          else if (ch === "~") st = !st;
          else chars.push({ ch, k: (hl ? 1 : 0) + (st ? 2 : 0) });
        }
        const out = [];
        let word = [];
        const flush = () => {
          if (!word.length) return;
          let html = "";
          for (let i = 0; i < word.length; ) {
            let j = i;
            while (j < word.length && word[j].k === word[i].k) j++;
            const part = esc(word.slice(i, j).map((c) => c.ch).join(""));
            const k = word[i].k;
            const cls = [k & 1 ? "hl" : "", k & 2 ? "st" : ""].filter(Boolean).join(" ");
            html += cls ? `<span class="${cls}">${part}</span>` : part;
            i = j;
          }
          out.push(`<span class="w">${html}</span>`);
          word = [];
        };
        for (const c of chars) {
          if (c.ch === " " || c.ch === "\t") flush();
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

  /** Highlight marker, red-pen underline and strike-through draw in after their word. */
  function decorate(w, lt, at) {
    const p = easeOut(prog(lt, at, 0.32));
    for (const h of w.querySelectorAll(".hl")) h.style.setProperty("--m", p.toFixed(3));
    for (const path of w.querySelectorAll(".scribble path")) path.style.strokeDashoffset = String(1 - p);
    const s = easeOut(prog(lt, at + 0.1, 0.25));
    for (const h of w.querySelectorAll(".st")) h.style.setProperty("--s", s.toFixed(3));
  }
  function decorateAll(container, lt, start, stagger = 0.08) {
    if (!container) return;
    container.querySelectorAll(".w").forEach((w, i) => decorate(w, lt, start + i * stagger));
  }

  /** Word-by-word reveal in the theme's manner; returns the time the last word lands. */
  function wordsIn(container, lt, start, stagger) {
    if (!container) return start;
    const ws = container.querySelectorAll(".w");
    const n = ws.length;
    const kind = THEME.word;
    const base = kind === "write" ? 0.11 : 0.1;
    const st = stagger ?? Math.min(base, 0.75 / Math.max(1, n - 1));
    const d = kind === "write" ? 0.26 : kind === "slam" ? 0.14 : 0.22;
    ws.forEach((w, i) => {
      const raw = prog(lt, start + i * st, d);
      const p = easeOut(raw);
      if (kind === "write") {
        w.style.opacity = raw > 0 ? "1" : "0";
        w.style.clipPath = `inset(-40% ${((1 - p) * 104).toFixed(1)}% -40% -6%)`;
        w.style.transform = "none";
      } else if (kind === "slam") {
        setT(w, clamp(raw * 3), 0, 1 + 0.65 * (1 - p));
      } else if (kind === "ink") {
        setT(w, p, (1 - p) * 18, 1.05 - 0.05 * p);
      } else {
        setT(w, p, (1 - p) * 34, 0.9 + 0.1 * p);
      }
      decorate(w, lt, start + i * st + d * 0.8);
    });
    return start + (n - 1) * st + d;
  }

  /** The ring that marks a number landing, in the theme's manner. */
  function makeRing() {
    const ring = el("div", "ring");
    if (THEME.ring === "circle") {
      ring.innerHTML =
        '<svg viewBox="0 0 100 100" preserveAspectRatio="none"><path pathLength="1" ' +
        'd="M52 7 C80 6 97 28 95 52 C93 79 70 95 46 93 C20 91 4 70 6 45 C8 22 28 7 58 9"/></svg>';
    }
    return ring;
  }
  function burst(ring, lt, start) {
    if (!ring) return;
    if (THEME.ring === "none") { ring.style.opacity = "0"; return; }
    if (THEME.ring === "circle") {
      ring.style.opacity = lt >= start ? "1" : "0";
      ring.querySelector("path").style.strokeDashoffset = String(1 - easeOut(prog(lt, start, 0.5)));
      return;
    }
    const p = prog(lt, start, 0.75);
    ring.style.opacity = p <= 0 || p >= 1 ? "0" : String(0.85 * (1 - p));
    ring.style.transform = `scale(${0.35 + 1.5 * easeOut(p)})`;
  }

  /** Shrink font-size until the element fits its box and no single word overflows. */
  function fit(e, maxPx, minPx, maxW, maxH) {
    if (!e) return;
    const W = Math.min(maxW, e.clientWidth || maxW);
    let size = Math.round(maxPx * (THEME.size ?? 1));
    e.style.fontSize = size + "px";
    const fits = () => {
      if (e.scrollHeight > maxH || e.scrollWidth > W + 1) return false;
      for (const w of e.querySelectorAll(".w")) if (w.offsetWidth > W) return false;
      return true;
    };
    while (size > minPx && !fits()) {
      size -= 3;
      e.style.fontSize = size + "px";
    }
  }

  /** The logo, recoloured for light backgrounds (drawn into a canvas: tint only, no readback). */
  function logoEl(color) {
    const tint = color ?? THEME.tint;
    if (!tint) {
      const img = el("img", "logo");
      img.src = window.__LOGO;
      return img;
    }
    const c = el("canvas", "logo");
    c.width = 500; c.height = 500;
    c.paint = () => {
      const g = c.getContext("2d");
      g.clearRect(0, 0, 500, 500);
      g.drawImage(document.getElementById("logo-src"), 0, 0, 500, 500);
      g.globalCompositeOperation = "source-in";
      g.fillStyle = tint;
      g.fillRect(0, 0, 500, 500);
      g.globalCompositeOperation = "source-over";
    };
    return c;
  }

  // ---- scene builders -------------------------------------------------------
  // Each returns { root, cam, dur, layout?(), update(lt) }. lt = seconds since
  // the scene began.

  let sceneIndex = 0;
  function frame(type) {
    const root = el("div", `scene scene-${type}`);
    if (THEME.panels) {
      const c = PALETTE[((spec.paletteStart ?? 0) + sceneIndex) % PALETTE.length];
      root.style.setProperty("--bg", c.bg);
      root.style.setProperty("--fg", c.fg);
      root.style.setProperty("--hl", c.hl);
      root.appendChild(el("div", "panel"));
      root.appendChild(el("div", "scene-brand", "MYSTIC DIGITS"));
      root.fg = c.fg;
    }
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
          decorateAll(head, lt, 0.2);
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
      num.style.fontSize = Math.round((s.size ?? 560) * (THEME.size ?? 1)) + "px";
      const ring = makeRing();
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
      const ring = makeRing();
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
        // Optional per-item colour: tints the number, or (bold) floods the screen.
        const tint = it.color && !THEME.panels
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
      const home = { bg: f.root.style.getPropertyValue("--bg"), fg: f.root.style.getPropertyValue("--fg"), hl: f.root.style.getPropertyValue("--hl") };
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
              decorateAll(e, lt, t0 + i * per, 0.02);
            }
          });
          if (THEME.panels) {
            const it = s.items[idx];
            const c = it && it.color ? { bg: it.color, ...contrastFor(it.color) } : home;
            f.root.style.setProperty("--bg", c.bg);
            f.root.style.setProperty("--fg", c.fg);
            f.root.style.setProperty("--hl", c.hl);
          }
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

    /**
     * A conversation. messages: [{ me?: true, text, num?, typing?, hold? }].
     * The first message is on screen at frame 0 under the optional banner (the
     * hook); each reply shows typing dots first. Newest message sits at the
     * bottom and the thread scrolls up, like a real chat.
     */
    chat(s) {
      const root = el("div", "scene scene-chat");
      const cam = el("div", "cam");
      root.appendChild(cam);
      const header = el(
        "div", "chat-header",
        `<img class="chat-avatar" src="${window.__LOGO}"><div class="chat-who">` +
          `<div class="chat-name">${esc(s.name ?? "Mystic Digits")}</div><div class="chat-status">online</div></div>`,
      );
      const area = el("div", "chat-area");
      const track = el("div", "chat-track");
      area.appendChild(track);
      const typing = el("div", "typing", "<i></i><i></i><i></i>");
      track.appendChild(typing);
      const msgs = s.messages.map((m) => {
        const b = el(
          "div", `bubble ${m.me ? "me" : "them"}${m.num ? " num" : ""}`,
          m.num ? `<div class="n">${esc(m.num)}</div><div class="cap">${rich(m.text || "")}</div>` : rich(m.text),
        );
        track.appendChild(b);
        return { m, b };
      });
      const banner = s.banner ? el("div", "chat-banner", rich(s.banner)) : null;
      cam.append(header, area);
      if (banner) cam.appendChild(banner);
      const status = header.querySelector(".chat-status");

      // Timeline: replies type first, then hold long enough to read.
      const plan = [];
      let t = 0;
      msgs.forEach(({ m }, i) => {
        let typeStart = null;
        if (i > 0 && !m.me) { typeStart = t; t += m.typing ?? 0.6; }
        const at = i === 0 ? 0 : t;
        const hold = m.hold ?? (m.num ? 1.7 : (m.me ? 0.55 : 0.7) + words(m.text) * (m.me ? 0.17 : 0.21));
        plan.push({ typeStart, at });
        t = at + hold;
      });
      const bannerUntil = s.bannerUntil ?? Math.min(2.6, t);
      const dur = s.dur ?? t + 0.15;

      let H = 0, typingH = 0;
      const tops = [], bottoms = [];
      return {
        root, cam, dur,
        coverAt: 0.9,
        layout() {
          H = area.clientHeight;
          typingH = typing.offsetHeight;
          msgs.forEach(({ b }) => { tops.push(b.offsetTop); bottoms.push(b.offsetTop + b.offsetHeight); });
          if (banner) fit(banner, 70, 44, 940, 380);
        },
        update(lt) {
          let last = 0, typingIdx = -1;
          plan.forEach((p, i) => {
            if (lt >= p.at) last = i;
            else if (p.typeStart != null && lt >= p.typeStart && typingIdx < 0) typingIdx = i;
          });
          msgs.forEach(({ b, m }, i) => {
            if (i > last) { b.style.opacity = "0"; return; }
            const raw = i === 0 ? 1 : prog(lt, plan[i].at, 0.3);
            b.style.opacity = String(i === 0 ? 1 : clamp(raw * 4));
            b.style.transformOrigin = m.me ? "100% 100%" : "0% 100%";
            b.style.transform = `scale(${0.72 + 0.28 * easeBack(raw)})`;
            decorateAll(b, lt, (i === 0 ? 0.2 : plan[i].at + 0.2), 0.05);
          });
          if (typingIdx >= 0) {
            typing.style.opacity = "1";
            typing.style.top = tops[typingIdx] + "px";
            typing.querySelectorAll("i").forEach((d, k) => {
              d.style.transform = `translateY(${(-10 * Math.max(0, Math.sin(lt * 9 - k * 0.9))).toFixed(1)}px)`;
            });
          } else typing.style.opacity = "0";
          status.textContent = typingIdx >= 0 ? "typing…" : "online";

          // Scroll: ease from the previous bottom edge to the newest one.
          const events = [{ time: -1, bottom: bottoms[0] }];
          plan.forEach((p, i) => {
            if (i === 0) return;
            if (p.typeStart != null) events.push({ time: p.typeStart, bottom: tops[i] + typingH });
            events.push({ time: p.at, bottom: bottoms[i] });
          });
          let k = 0;
          while (k + 1 < events.length && events[k + 1].time <= lt) k++;
          const prev = k > 0 ? events[k - 1].bottom : events[0].bottom;
          const bottom = prev + (events[k].bottom - prev) * easeOut(prog(lt, events[k].time, 0.28));
          track.style.transform = `translateY(${(H - 12 - bottom).toFixed(1)}px)`;

          if (banner) {
            const pin = easeOut(prog(lt, 0, 0.35));
            banner.style.opacity = String(1 - prog(lt, bannerUntil, 0.3));
            banner.style.transform = `scale(${1.06 - 0.06 * pin})`;
            decorateAll(banner, lt, 0.25);
          }
        },
      };
    },

    end(s) {
      const f = frame("end");
      const logo = logoEl(THEME.panels ? f.root.fg : undefined);
      const head = el("div", "text", rich(s.text));
      const sub = s.sub ? el("div", "sub", rich(s.sub)) : null;
      const url = s.url === false ? null : el("div", "url", esc(s.url ?? "mysticdigits.in"));
      [logo, head, sub, url].forEach((x) => x && f.content.appendChild(x));
      const dur = s.dur ?? clamp(1.4 + words(s.text) * 0.2 + words(s.sub) * 0.15, 2.4, 3.4);
      return {
        ...f, dur,
        layout() {
          fit(head, s.size ?? 96, 56, 900, 420);
          if (logo.paint) logo.paint();
        },
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

  // ---- backgrounds ----------------------------------------------------------

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
  const accent = getComputedStyle(document.getElementById("stage")).getPropertyValue("--accent").trim() || "#c9a84c";
  const rgb = (hex) => { const n = parseInt(hex.replace("#", ""), 16); return [n >> 16, (n >> 8) & 255, n & 255].join(","); };

  function paintNight(t) {
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

  /** Static paper grain, drawn once. */
  function grainLayer(color, count, fibres) {
    const c = document.createElement("canvas");
    c.width = 1080; c.height = 1920;
    const g = c.getContext("2d");
    const r = rng(seedOf(spec.slug + "grain"));
    for (let i = 0; i < count; i++) {
      g.fillStyle = `rgba(${color},${(0.02 + r() * 0.06).toFixed(3)})`;
      const s = 0.8 + r() * 1.8;
      g.fillRect(r() * 1080, r() * 1920, s, s);
    }
    g.strokeStyle = `rgba(${color},0.05)`;
    for (let i = 0; i < fibres; i++) {
      const x = r() * 1080, y = r() * 1920, a = r() * 6.28, l = 10 + r() * 40;
      g.lineWidth = 0.6 + r();
      g.beginPath();
      g.moveTo(x, y);
      g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + 6, y + Math.sin(a) * l * 0.5, x + Math.cos(a) * l, y + Math.sin(a) * l);
      g.stroke();
    }
    return c;
  }

  // Paper: aged almanac page with marigold petals drifting down.
  let paperGrain;
  const petals = Array.from({ length: 15 }, () => ({
    x: rand() * 1080, y: rand() * 2100, v: 55 + rand() * 70,
    sway: 20 + rand() * 50, ph: rand() * 6.28, spin: (rand() - 0.5) * 2.4,
    w: 13 + rand() * 11, h: 7 + rand() * 5,
    c: ["#f59e0b", "#f97316", "#fbbf24", "#ea580c", "#facc15"][Math.floor(rand() * 5)],
  }));
  function paintPaper(t) {
    if (!paperGrain) paperGrain = grainLayer("110,70,20", 14000, 260);
    ctx.clearRect(0, 0, 1080, 1920);
    ctx.drawImage(paperGrain, 0, 0);
    for (const p of petals) {
      const y = ((p.y + t * p.v) % 2100) - 90;
      const x = p.x + Math.sin(t * 0.9 + p.ph) * p.sway;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(p.ph + t * p.spin);
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = p.c;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.w, p.h, 0, 0, 6.283);
      ctx.fill();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = "#9a3412";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-p.w * 0.8, 0);
      ctx.lineTo(p.w * 0.8, 0);
      ctx.stroke();
      ctx.restore();
    }
    ctx.globalAlpha = 1;
  }

  // Notebook: ruled page grain only; the lines are CSS.
  let notebookGrain;
  function paintNotebook() {
    if (!notebookGrain) {
      notebookGrain = grainLayer("60,60,80", 9000, 120);
      ctx.clearRect(0, 0, 1080, 1920);
      ctx.drawImage(notebookGrain, 0, 0);
    }
  }

  // Chat: a quiet wallpaper of tiny stars and crescents, a few twinkling.
  let chatWall;
  function paintChat(t) {
    if (!chatWall) {
      chatWall = document.createElement("canvas");
      chatWall.width = 1080; chatWall.height = 1920;
      const g = chatWall.getContext("2d");
      const r = rng(seedOf(spec.slug + "wall"));
      g.strokeStyle = "rgba(190,180,255,0.07)";
      g.fillStyle = "rgba(190,180,255,0.07)";
      g.lineWidth = 2;
      for (let y = 60; y < 1920; y += 150) {
        for (let x = 40 + ((y / 150) % 2) * 75; x < 1080; x += 150) {
          const k = r();
          g.save();
          g.translate(x + r() * 30, y + r() * 30);
          g.rotate(r() * 6.28);
          g.beginPath();
          if (k < 0.4) { // four-point star
            g.moveTo(0, -12); g.lineTo(3, -3); g.lineTo(12, 0); g.lineTo(3, 3);
            g.lineTo(0, 12); g.lineTo(-3, 3); g.lineTo(-12, 0); g.lineTo(-3, -3); g.closePath(); g.fill();
          } else if (k < 0.7) { // crescent
            g.arc(0, 0, 13, 0.6, 5.7); g.stroke();
          } else { // dot ring
            g.arc(0, 0, 6, 0, 6.283); g.stroke();
          }
          g.restore();
        }
      }
    }
    ctx.clearRect(0, 0, 1080, 1920);
    ctx.drawImage(chatWall, 0, 0);
    ctx.fillStyle = "#d9d2ff";
    for (const s of stars.slice(0, 40)) {
      ctx.globalAlpha = 0.35 * Math.max(0, Math.sin(t * s.f + s.ph));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Planet: deep space, nebula, and the ruling planet's glowing horizon.
  const PLANETS = {
    sun: { stops: ["#fff6cf", "#ffbe3b", "#e8650f"], glow: "#ffb547", kind: "sun" },
    moon: { stops: ["#f1f1f6", "#bfc1cd", "#6e7083"], glow: "#cfd8ff", kind: "moon" },
    jupiter: { stops: ["#f6dfb4", "#d0965a", "#80512c"], glow: "#ffcf8a", kind: "bands", spot: "#b8452a" },
    saturn: { stops: ["#f6e8c0", "#d9bb77", "#8f6f3c"], glow: "#f3d98f", kind: "bands", rings: true },
    mars: { stops: ["#f3a979", "#c8572b", "#6e2412"], glow: "#ff8a5c", kind: "patches" },
  };
  const nebulae = Array.from({ length: 4 }, () => ({
    x: rand() * 1080, y: 200 + rand() * 900, r: 380 + rand() * 300,
    f: 0.1 + rand() * 0.2, ph: rand() * 6.28, a: 0.1 + rand() * 0.1,
  }));
  const craters = Array.from({ length: 34 }, () => ({ a: rand() * 6.28, d: 30 + rand() * 520, r: 12 + rand() * 46 }));
  const granules = Array.from({ length: 260 }, () => ({ a: rand() * 6.28, d: rand() * 640, r: 6 + rand() * 16, ph: rand() * 6.28 }));
  function paintPlanet(t) {
    const P = PLANETS[spec.planet || "sun"];
    const sky = ctx.createLinearGradient(0, 0, 0, 1920);
    sky.addColorStop(0, "#03020d");
    sky.addColorStop(0.55, "#0a0a25");
    sky.addColorStop(1, "#15102e");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 1080, 1920);
    for (const n of nebulae) {
      const x = n.x + Math.sin(t * n.f + n.ph) * 50, y = n.y + Math.cos(t * n.f + n.ph) * 30;
      const g = ctx.createRadialGradient(x, y, 0, x, y, n.r);
      g.addColorStop(0, `rgba(${rgb(accent)},${n.a})`);
      g.addColorStop(1, `rgba(${rgb(accent)},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(x - n.r, y - n.r, n.r * 2, n.r * 2);
    }
    ctx.fillStyle = "#eef0ff";
    for (const s of stars) {
      const x = (((s.x - t * s.v * 0.6) % 1080) + 1080) % 1080;
      ctx.globalAlpha = s.a * (0.55 + 0.45 * Math.sin(t * s.f + s.ph));
      ctx.beginPath();
      ctx.arc(x, s.y, s.r, 0, 6.283);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    if (spec.sky === "sun") { // a distant sun high in the sky
      const sx = 880, sy = 430;
      const halo = ctx.createRadialGradient(sx, sy, 0, sx, sy, 300);
      halo.addColorStop(0, "rgba(255,214,120,0.55)");
      halo.addColorStop(1, "rgba(255,180,70,0)");
      ctx.fillStyle = halo;
      ctx.fillRect(sx - 300, sy - 300, 600, 600);
      const disc = ctx.createRadialGradient(sx - 15, sy - 15, 5, sx, sy, 62);
      disc.addColorStop(0, "#fffbe8");
      disc.addColorStop(0.6, "#ffd36a");
      disc.addColorStop(1, "#ff9a2e");
      ctx.fillStyle = disc;
      ctx.beginPath();
      ctx.arc(sx, sy, 62, 0, 6.283);
      ctx.fill();
    }

    const R = 1150, cx = 540 + Math.sin(t * 0.18) * 16, cy = 1255 + R;
    // atmosphere glow beyond the limb
    const atm = ctx.createRadialGradient(cx, cy, R - 10, cx, cy, R + (P.kind === "sun" ? 320 : 150));
    atm.addColorStop(0, `rgba(${rgb(P.glow)},${P.kind === "sun" ? 0.75 : 0.45})`);
    atm.addColorStop(1, `rgba(${rgb(P.glow)},0)`);
    ctx.fillStyle = atm;
    ctx.fillRect(0, 900, 1080, 1020);

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, 6.283);
    ctx.clip();
    const body = ctx.createRadialGradient(cx - 260, cy - R + 120, 40, cx, cy - R * 0.2, R * 1.05);
    body.addColorStop(0, P.stops[0]);
    body.addColorStop(0.45, P.stops[1]);
    body.addColorStop(1, P.stops[2]);
    ctx.fillStyle = body;
    ctx.fillRect(0, 1200, 1080, 720);
    const drift = t * 0.012;
    if (P.kind === "bands") {
      for (let i = 0; i < 16; i++) {
        const rr = R - 25 - i * 42 - (i % 3) * 9;
        ctx.strokeStyle = i % 2 ? `rgba(255,248,230,${0.1 + (i % 4) * 0.03})` : `rgba(90,50,20,${0.08 + (i % 3) * 0.04})`;
        ctx.lineWidth = 16 + (i % 4) * 9;
        ctx.beginPath();
        ctx.arc(cx, cy, rr, Math.PI * 1.08 + Math.sin(i + drift) * 0.02, Math.PI * 1.92);
        ctx.stroke();
      }
      if (P.spot) {
        const ang = Math.PI * 1.32 + ((t * 0.02) % 0.5);
        const sx = cx + Math.cos(ang) * (R - 190), sy = cy + Math.sin(ang) * (R - 190);
        ctx.fillStyle = P.spot;
        ctx.globalAlpha = 0.75;
        ctx.beginPath();
        ctx.ellipse(sx, sy, 70, 34, ang + Math.PI / 2, 0, 6.283);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    } else if (P.kind === "moon") {
      for (const c of craters) {
        const ang = Math.PI * 1.1 + ((c.a + drift) % (Math.PI * 0.8));
        const x = cx + Math.cos(ang) * (R - c.d), y = cy + Math.sin(ang) * (R - c.d);
        ctx.fillStyle = "rgba(80,82,100,0.32)";
        ctx.beginPath();
        ctx.ellipse(x, y, c.r, c.r * 0.55, 0, 0, 6.283);
        ctx.fill();
        ctx.strokeStyle = "rgba(255,255,255,0.25)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y - 2, c.r, c.r * 0.55, 0, Math.PI * 1.05, Math.PI * 1.95);
        ctx.stroke();
      }
    } else if (P.kind === "sun") {
      for (const g of granules) {
        const ang = Math.PI * 1.08 + ((g.a + drift) % (Math.PI * 0.84));
        const x = cx + Math.cos(ang) * (R - g.d), y = cy + Math.sin(ang) * (R - g.d);
        ctx.fillStyle = `rgba(255,240,180,${(0.1 + 0.12 * Math.sin(t * 2 + g.ph)).toFixed(3)})`;
        ctx.beginPath();
        ctx.arc(x, y, g.r, 0, 6.283);
        ctx.fill();
      }
    } else if (P.kind === "patches") {
      for (const c of craters) {
        const ang = Math.PI * 1.1 + ((c.a + drift) % (Math.PI * 0.8));
        ctx.fillStyle = "rgba(90,25,10,0.22)";
        ctx.beginPath();
        ctx.ellipse(cx + Math.cos(ang) * (R - c.d), cy + Math.sin(ang) * (R - c.d), c.r * 2.2, c.r, 0.3, 0, 6.283);
        ctx.fill();
      }
    }
    // night side: shade toward the bottom right
    const shade = ctx.createLinearGradient(200, 1250, 1080, 1920);
    shade.addColorStop(0, "rgba(0,0,10,0)");
    shade.addColorStop(1, "rgba(0,0,10,0.55)");
    ctx.fillStyle = shade;
    ctx.fillRect(0, 1200, 1080, 720);
    ctx.restore();

    // bright limb
    ctx.save();
    ctx.strokeStyle = `rgba(${rgb(P.glow)},0.9)`;
    ctx.lineWidth = 5;
    ctx.shadowColor = P.glow;
    ctx.shadowBlur = 40;
    ctx.beginPath();
    ctx.arc(cx, cy, R, Math.PI * 1.05, Math.PI * 1.95);
    ctx.stroke();
    ctx.restore();

    if (P.rings) {
      ctx.save();
      ctx.translate(540, 1215);
      ctx.rotate(-0.07);
      [[1500, 120, 0.35, 10], [1430, 108, 0.25, 6], [1600, 132, 0.18, 14]].forEach(([rx, ry, a, w]) => {
        ctx.strokeStyle = `rgba(243,217,143,${a})`;
        ctx.lineWidth = w;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx / 2, ry / 2, 0, Math.PI * 1.02, Math.PI * 1.98);
        ctx.stroke();
      });
      ctx.restore();
    }
  }

  const PAINT = { night: paintNight, paper: paintPaper, notebook: paintNotebook, bold: () => {}, planet: paintPlanet, chat: paintChat };

  // ---- timeline -------------------------------------------------------------

  const scenesHost = document.getElementById("scenes");
  const scenes = spec.scenes.map((s) => {
    const b = builders[s.type];
    if (!b) throw new Error(`Unknown scene type "${s.type}" in ${spec.slug}`);
    const sc = b(s);
    sceneIndex++;
    scenesHost.appendChild(sc.root);
    return sc;
  });
  // Notebook: a red-pen underline under every highlight.
  if (THEME.scribble) {
    for (const h of scenesHost.querySelectorAll(".hl")) {
      h.insertAdjacentHTML(
        "beforeend",
        '<svg class="scribble" viewBox="0 0 100 12" preserveAspectRatio="none"><path pathLength="1" d="M2 8 C20 3 36 11 52 6 S82 3 98 7"/></svg>',
      );
    }
  }
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
  const WIPE = 0.24;

  window.__init = () => {
    for (const sc of scenes) {
      sc.root.style.display = "block";
      sc.layout && sc.layout();
      sc.root.style.display = "none";
    }
    const first = scenes[0];
    return {
      duration: DURATION,
      coverAt: first.coverAt ?? first.dur - 0.25,
      scenes: scenes.map((sc, i) => ({ type: spec.scenes[i].type, start: sc.start, dur: sc.dur })),
    };
  };

  window.__seek = (t) => {
    PAINT[STYLE](t);
    mandala.style.transform = `rotate(${t * 4}deg) scale(${1 + 0.03 * Math.sin(t * 0.5)})`;
    glow.style.opacity = String(0.18 + 0.06 * Math.sin(t * 1.7));
    glow.style.transform = `scale(${1 + 0.05 * Math.sin(t * 1.1)})`;

    let active = scenes.length - 1;
    for (let i = 0; i < scenes.length; i++) {
      if (t < scenes[i].start + scenes[i].dur) { active = i; break; }
    }
    const activeLt = t - scenes[active].start;
    // Bold: the new colour block wipes over the last scene, which holds still beneath it.
    const under = THEME.panels && active > 0 && activeLt < WIPE ? active - 1 : -1;
    scenes.forEach((sc, i) => {
      // display, not visibility: a child with visibility:visible would show
      // through a hidden parent.
      if (i !== active && i !== under) { sc.root.style.display = "none"; return; }
      sc.root.style.display = "block";
      if (i === under) {
        sc.update(sc.dur - 0.001);
        sc.root.style.opacity = "1";
        sc.root.style.transform = "none";
        sc.root.style.clipPath = "none";
        return;
      }
      const lt = activeLt;
      sc.update(lt);
      sc.cam.style.transform = `scale(${1 + 0.035 * clamp(lt / sc.dur)})`;
      if (THEME.panels) {
        const p = i === 0 ? 1 : easeOut(prog(lt, 0, WIPE));
        const gap = ((1 - p) * 100).toFixed(2);
        sc.root.style.clipPath = i % 2 ? `inset(0 0 0 ${gap}%)` : `inset(${gap}% 0 0 0)`;
        sc.root.style.opacity = "1";
        sc.root.style.transform = "none";
      } else {
        const last = i === scenes.length - 1;
        const pe = last ? 0 : easeOut(prog(lt, sc.dur - EXIT, EXIT));
        sc.root.style.opacity = String(1 - pe);
        sc.root.style.transform = `translateY(${-26 * pe}px)`;
      }
      flash.style.opacity = i === 0 ? "0" : String(THEME.flash * (1 - prog(lt, 0, 0.24)));
    });
  };
})();
