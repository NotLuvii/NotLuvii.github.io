/* The opening's greeting: "Hi, I am Luvneet." The name breaks into random characters and settles into
   the next phrase, one character at a time, then the next, and back to the name. The headline keeps the
   height of its longest phrase (the stylesheet stacks every phrase, hidden, in one cell), so nothing below
   it moves. Screen readers get one fixed label instead of the changing text. */

// Mostly lowercase letters and digits, close in width to the letters they stand in for, so a phrase
// mid-scramble takes about the room it will settle into.
const GLYPHS = "abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz0123456789#%&*+=?/";
const HOLD = 2600; // ms each phrase stays
const TURN = 1000; // ms to turn one phrase into the next

/** When each character position starts scrambling and when it lands, as fractions of the turn. */
export type Plan = { from: string; to: string; start: number[]; end: number[] };

export function plan(from: string, to: string, rand = Math.random): Plan {
  const n = Math.max(from.length, to.length);
  const start: number[] = [];
  const end: number[] = [];
  for (let i = 0; i < n; i++) {
    const s = rand() * 0.4;
    start.push(s);
    end.push(s + 0.2 + rand() * 0.4);
  }
  return { from, to, start, end };
}

/** What shows at moment t (0 to 1) of a turn: per position, the old character, a random one, or the new one. */
export function frame(p: Plan, t: number, rand = Math.random) {
  const chars: string[] = [];
  const scrambled: boolean[] = [];
  for (let i = 0; i < p.start.length; i++) {
    const from = p.from[i] ?? "";
    const to = p.to[i] ?? "";
    if (t >= p.end[i]) {
      chars.push(to);
      scrambled.push(false);
    } else if (to === " " && t > 0) {
      // The new phrase's gaps open as soon as the turn starts, so the scramble breaks into lines the way
      // the phrase it is becoming will.
      chars.push(" ");
      scrambled.push(false);
    } else if (t <= p.start[i]) {
      // Not started: the old character, or nothing where the old phrase was shorter.
      chars.push(from);
      scrambled.push(false);
    } else if (from === " ") {
      // And the old phrase's gaps stay until their characters turn.
      chars.push(" ");
      scrambled.push(false);
    } else {
      chars.push(GLYPHS[Math.floor(rand() * GLYPHS.length)]);
      scrambled.push(true);
    }
  }
  return { chars, scrambled, text: chars.join("") };
}

/** Run the cycle in `el`. Returns controls to pause and resume it; it also waits while off screen. */
export function startGreeting(el: HTMLElement, phrases: string[]) {
  let index = 0;
  let paused = false;
  let visible = true;
  let timer = 0;
  let raf = 0;
  let turning: { p: Plan; t0: number; next: number } | null = null;

  const show = (chars: string[], scrambled: boolean[]) => {
    const parts: Node[] = [];
    let run = "";
    chars.forEach((c, i) => {
      if (scrambled[i]) {
        if (run) parts.push(document.createTextNode(run));
        run = "";
        const g = document.createElement("span");
        g.className = "glyph";
        g.textContent = c;
        parts.push(g);
      } else run += c;
    });
    if (run) parts.push(document.createTextNode(run));
    el.replaceChildren(...parts);
  };

  const settle = (i: number) => {
    index = i;
    turning = null;
    el.textContent = phrases[i];
  };

  const step = (now: number) => {
    raf = 0;
    if (!turning) return;
    const t = Math.min(1, (now - turning.t0) / TURN);
    const f = frame(turning.p, t);
    show(f.chars, f.scrambled);
    if (t < 1) raf = requestAnimationFrame(step);
    else {
      settle(turning.next);
      wait();
    }
  };

  const turn = () => {
    timer = 0;
    if (paused) return;
    if (!visible) return; // resumes when the opening comes back into view
    const next = (index + 1) % phrases.length;
    turning = { p: plan(phrases[index], phrases[next]), t0: performance.now(), next };
    raf = requestAnimationFrame(step);
  };

  const wait = () => {
    clearTimeout(timer);
    timer = window.setTimeout(turn, HOLD);
  };

  const stop = () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    timer = raf = 0;
    // Never leave the headline half scrambled: finish on the phrase it was turning into.
    if (turning) settle(turning.next);
  };

  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && !paused && !turning && !timer) wait();
  }).observe(el);

  wait();
  return {
    pause() {
      paused = true;
      stop();
    },
    play() {
      if (!paused) return;
      paused = false;
      wait();
    },
  };
}
