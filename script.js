document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const allTabTriggers = Array.from(
    document.querySelectorAll("[data-target]")
  );

  // Theme toggle (dark / light)
  const THEME_KEY = "alpha-theme";
  const themeToggle = document.getElementById("theme-toggle");
  function getTheme() {
    return localStorage.getItem(THEME_KEY) || "dark";
  }
  function setTheme(theme) {
    theme = theme === "light" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }
  setTheme(getTheme());
  themeToggle?.addEventListener("click", () => {
    setTheme(getTheme() === "light" ? "dark" : "light");
  });

  function showPanel(id) {
    panels.forEach((panel) => {
      panel.classList.toggle("is-visible", panel.id === id);
    });

    navLinks.forEach((link) => {
      const target = link.getAttribute("data-target");
      link.classList.toggle("active", target === id);
    });

    if (window.innerWidth <= 720 && navList && navList.classList.contains("open")) {
      navList.classList.remove("open");
    }
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      const target = link.getAttribute("data-target");
      if (target) showPanel(target);
    });
  });

  allTabTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const target = btn.getAttribute("data-target");
      if (target) showPanel(target);
    });
  });

  if (navToggle && navList) {
    navToggle.addEventListener("click", () => {
      navList.classList.toggle("open");
    });
  }

  // ——— Game 1: Prisoner's Dilemma + Market Making ———
  // Symmetric PD: R (C,C), S (sucker), T (temptation), P (D,D). T > R > P > S.
  const phaseQuote = document.getElementById("game1-phase-quote");
  const phaseResult = document.getElementById("game1-phase-result");
  const bidInput = document.getElementById("game1-bid");
  const askInput = document.getElementById("game1-ask");
  const cooperateBtn = document.getElementById("game1-cooperate");
  const defectBtn = document.getElementById("game1-defect");
  const botActionEl = document.getElementById("game1-bot-action");
  const settlementEl = document.getElementById("game1-settlement");
  const nextBtn = document.getElementById("game1-next");
  const yourPnlEl = document.getElementById("game1-your-pnl");
  const botPnlEl = document.getElementById("game1-bot-pnl");
  const matrixCells = {
    cc: document.getElementById("game1-cc"),
    cd: document.getElementById("game1-cd"),
    dc: document.getElementById("game1-dc"),
    dd: document.getElementById("game1-dd"),
  };

  let yourTotal = 0;
  let botTotal = 0;
  let pdMatrix = { R: 3, S: 0, T: 5, P: 1 }; // R,S,T,P for symmetric PD

  function formatPnl(x) {
    const sign = x >= 0 ? "+" : "";
    return sign + "$" + x.toFixed(2);
  }

  function randomPDMatrix() {
    // PD: T > R > P > S. Sample in disjoint ranges so order is strict.
    const T = Math.round((5 + Math.random() * 3) * 10) / 10;   // [5, 8]
    const R = Math.round((2 + Math.random() * 1.5) * 10) / 10; // [2, 3.5]
    const P = Math.round((Math.random() * 1) * 10) / 10;       // [0, 1]
    const S = Math.round((-2.5 - Math.random() * 1.5) * 10) / 10; // [-4, -2.5]
    return { T, R, P, S };
  }

  function renderMatrix(m) {
    if (matrixCells.cc) matrixCells.cc.textContent = `(${m.R}, ${m.R})`;
    if (matrixCells.cd) matrixCells.cd.textContent = `(${m.S}, ${m.T})`;
    if (matrixCells.dc) matrixCells.dc.textContent = `(${m.T}, ${m.S})`;
    if (matrixCells.dd) matrixCells.dd.textContent = `(${m.P}, ${m.P})`;
  }

  function updatePnlDisplay() {
    if (yourPnlEl) yourPnlEl.textContent = formatPnl(yourTotal);
    if (botPnlEl) botPnlEl.textContent = formatPnl(botTotal);
  }

  function clampBidAsk() {
    let bid = Number(bidInput?.value) ?? 0;
    let ask = Number(askInput?.value) ?? 100;
    bid = Math.max(0, Math.min(100, bid));
    ask = Math.max(0, Math.min(100, ask));
    if (bid >= ask) {
      ask = Math.min(100, bid + 5);
      bid = Math.max(0, ask - 5);
    }
    if (bidInput) bidInput.value = Math.round(bid);
    if (askInput) askInput.value = Math.round(ask);
  }

  function playRound(yourChoice) {
    clampBidAsk();
    const bid = Number(bidInput?.value ?? 0) / 100;
    const ask = Number(askInput?.value ?? 100) / 100;
    if (bid >= ask) return;

    const botCooperates = Math.random() < 0.5;
    const botChoice = botCooperates ? "C" : "D";
    const contractPays = botCooperates ? 1 : 0;

    let marketAction = "pass";
    if (botCooperates && ask < 1) {
      marketAction = "buy";
    } else if (!botCooperates && bid > 0) {
      marketAction = "sell";
    }

    let yourMatrixPayoff = 0;
    let botMatrixPayoff = 0;
    const m = pdMatrix;
    if (yourChoice === "C" && botChoice === "C") {
      yourMatrixPayoff = m.R;
      botMatrixPayoff = m.R;
    } else if (yourChoice === "C" && botChoice === "D") {
      yourMatrixPayoff = m.S;
      botMatrixPayoff = m.T;
    } else if (yourChoice === "D" && botChoice === "C") {
      yourMatrixPayoff = m.T;
      botMatrixPayoff = m.S;
    } else {
      yourMatrixPayoff = m.P;
      botMatrixPayoff = m.P;
    }

    let yourMarketPnL = 0;
    let botMarketPnL = 0;
    if (marketAction === "buy") {
      botMarketPnL = contractPays - ask;
      yourMarketPnL = ask - contractPays;
    } else if (marketAction === "sell") {
      yourMarketPnL = contractPays - bid;
      botMarketPnL = bid - contractPays;
    }

    yourTotal += yourMatrixPayoff + yourMarketPnL;
    botTotal += botMatrixPayoff + botMarketPnL;
    updatePnlDisplay();

    phaseQuote?.classList.add("hidden");
    phaseResult?.removeAttribute("hidden");

    const askPct = Math.round(ask * 100);
    const bidPct = Math.round(bid * 100);
    if (marketAction === "buy") {
      botActionEl.textContent = `Bot cooperated and bought “bot cooperates” at ${askPct}¢. You played ${yourChoice}, bot played ${botChoice}.`;
    } else if (marketAction === "sell") {
      botActionEl.textContent = `Bot defected and sold “bot cooperates” at ${bidPct}¢. You played ${yourChoice}, bot played ${botChoice}.`;
    } else {
      botActionEl.textContent = `No trade (spread too tight). You played ${yourChoice}, bot played ${botChoice}.`;
    }
    settlementEl.textContent =
      `Matrix: you ${formatPnl(yourMatrixPayoff)}, bot ${formatPnl(botMatrixPayoff)}. ` +
      (marketAction !== "pass"
        ? `Market: you ${formatPnl(yourMarketPnL)}, bot ${formatPnl(botMarketPnL)}. `
        : "") +
      `Total this round: you ${formatPnl(yourMatrixPayoff + yourMarketPnL)}, bot ${formatPnl(botMatrixPayoff + botMarketPnL)}.`;
  }

  cooperateBtn?.addEventListener("click", () => playRound("C"));
  defectBtn?.addEventListener("click", () => playRound("D"));

  nextBtn?.addEventListener("click", () => {
    phaseResult?.setAttribute("hidden", "");
    phaseQuote?.classList.remove("hidden");
    pdMatrix = randomPDMatrix();
    renderMatrix(pdMatrix);
  });

  bidInput?.addEventListener("input", clampBidAsk);
  askInput?.addEventListener("input", clampBidAsk);

  pdMatrix = randomPDMatrix();
  renderMatrix(pdMatrix);
  updatePnlDisplay();

  // ——— Real-Time Market Making (Game 2): deck of cards, "next card is red" ———
  const BOT_NOISE_2 = 0.06;

  const game2BidInput = document.getElementById("game2-bid");
  const game2AskInput = document.getElementById("game2-ask");
  const game2Frequency = document.getElementById("game2-frequency");
  const game2StartBtn = document.getElementById("game2-start");
  const game2PauseBtn = document.getElementById("game2-pause");
  const game2StopBtn = document.getElementById("game2-stop");
  const game2EvEl = document.getElementById("game2-ev");
  const game2CardsLeftEl = document.getElementById("game2-cards-left");
  const game2LastCardEl = document.getElementById("game2-last-card");
  const game2YourPnlEl = document.getElementById("game2-your-pnl");
  const game2BotPnlEl = document.getElementById("game2-bot-pnl");
  const game2EventLog = document.getElementById("game2-event-log");

  let deck = [];
  let game2YourPnl = 0;
  let game2BotPnl = 0;
  let game2IntervalId = null;
  const game2LogMax = 80;

  function newDeck() {
    const d = [];
    for (let i = 0; i < 26; i++) d.push(true);
    for (let i = 0; i < 26; i++) d.push(false);
    for (let i = d.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [d[i], d[j]] = [d[j], d[i]];
    }
    return d;
  }

  function game2FormatPnl(x) {
    const sign = x >= 0 ? "+" : "";
    return sign + "$" + x.toFixed(2);
  }

  function game2ClampBidAsk() {
    let bid = Number(game2BidInput?.value) ?? 0;
    let ask = Number(game2AskInput?.value) ?? 100;
    bid = Math.max(0, Math.min(100, bid));
    ask = Math.max(0, Math.min(100, ask));
    if (bid >= ask) {
      ask = Math.min(100, bid + 5);
      bid = Math.max(0, ask - 5);
    }
    if (game2BidInput) game2BidInput.value = Math.round(bid);
    if (game2AskInput) game2AskInput.value = Math.round(ask);
  }

  function game2UpdateUI(evCents, cardsLeft, lastCardText) {
    if (game2EvEl) game2EvEl.textContent = (evCents ?? 0).toFixed(1) + "¢";
    if (game2CardsLeftEl) game2CardsLeftEl.textContent = String(cardsLeft ?? 0);
    if (game2LastCardEl) game2LastCardEl.textContent = lastCardText ?? "—";
    if (game2YourPnlEl) game2YourPnlEl.textContent = game2FormatPnl(game2YourPnl);
    if (game2BotPnlEl) game2BotPnlEl.textContent = game2FormatPnl(game2BotPnl);
  }

  function game2AddLog(msg) {
    if (!game2EventLog) return;
    const entry = document.createElement("div");
    entry.className = "event-log-entry";
    entry.textContent = msg;
    game2EventLog.insertBefore(entry, game2EventLog.firstChild);
    while (game2EventLog.children.length > game2LogMax) {
      game2EventLog.removeChild(game2EventLog.lastChild);
    }
  }

  function game2Tick() {
    game2ClampBidAsk();
    const bid = Number(game2BidInput?.value ?? 0) / 100;
    const ask = Number(game2AskInput?.value ?? 100) / 100;
    if (bid >= ask) return;

    if (deck.length === 0) {
      deck = newDeck();
      game2AddLog("Deck reshuffled.");
    }

    const reds = deck.filter(Boolean).length;
    const total = deck.length;
    const trueEv = total > 0 ? reds / total : 0.5;
    const trueEvCents = trueEv * 100;

    const botEv = Math.max(0.01, Math.min(0.99, trueEv + (Math.random() * 2 - 1) * BOT_NOISE_2));
    let action = "pass";
    if (botEv > ask) action = "buy";
    else if (botEv < bid) action = "sell";

    const card = deck.pop();
    const outcome = card ? 1 : 0;
    const cardLabel = card ? "red" : "black";

    let yourRound = 0;
    let botRound = 0;
    if (action === "buy") {
      botRound = outcome - ask;
      yourRound = ask - outcome;
      game2AddLog(`Bot bought at ${Math.round(ask * 100)}¢ → card ${cardLabel} → you ${game2FormatPnl(yourRound)}`);
    } else if (action === "sell") {
      yourRound = outcome - bid;
      botRound = bid - outcome;
      game2AddLog(`Bot sold at ${Math.round(bid * 100)}¢ → card ${cardLabel} → you ${game2FormatPnl(yourRound)}`);
    } else {
      game2AddLog(`Drew ${cardLabel} (no trade).`);
    }

    game2YourPnl += yourRound;
    game2BotPnl += botRound;

    const nextReds = deck.filter(Boolean).length;
    const nextTotal = deck.length;
    const nextEvCents = nextTotal > 0 ? (nextReds / nextTotal) * 100 : 50;

    game2UpdateUI(nextEvCents, nextTotal, cardLabel);
  }

  function game2Start() {
    if (game2IntervalId != null) return;
    const ms = Math.max(100, Number(game2Frequency?.value) || 500);
    game2IntervalId = setInterval(game2Tick, ms);
  }

  function game2Pause() {
    if (game2IntervalId != null) {
      clearInterval(game2IntervalId);
      game2IntervalId = null;
    }
  }

  function game2Stop() {
    game2Pause();
    deck = newDeck();
    game2YourPnl = 0;
    game2BotPnl = 0;
    if (game2EventLog) game2EventLog.innerHTML = "";
    const reds = deck.filter(Boolean).length;
    game2UpdateUI((reds / 52) * 100, 52, "—");
    game2AddLog("Stopped. Deck reset.");
  }

  game2Frequency?.addEventListener("change", () => {
    if (game2IntervalId == null) return;
    game2Pause();
    game2Start();
  });

  game2StartBtn?.addEventListener("click", game2Start);
  game2PauseBtn?.addEventListener("click", game2Pause);
  game2StopBtn?.addEventListener("click", game2Stop);
  game2BidInput?.addEventListener("input", game2ClampBidAsk);
  game2AskInput?.addEventListener("input", game2ClampBidAsk);

  deck = newDeck();
  game2UpdateUI(50, 52, "—");
});

