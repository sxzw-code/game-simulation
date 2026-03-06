document.addEventListener("DOMContentLoaded", () => {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const panels = Array.from(document.querySelectorAll(".tab-panel"));
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const allTabTriggers = Array.from(
    document.querySelectorAll("[data-target]")
  );

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

  // ——— Market Making Game (Game 1) ———
  const TRUE_PROB = 0.5; // coin flip
  const BOT_NOISE = 0.07; // bot's estimate = TRUE_PROB ± BOT_NOISE

  const phaseQuote = document.getElementById("game1-phase-quote");
  const phaseResult = document.getElementById("game1-phase-result");
  const bidInput = document.getElementById("game1-bid");
  const askInput = document.getElementById("game1-ask");
  const postBtn = document.getElementById("game1-post");
  const botActionEl = document.getElementById("game1-bot-action");
  const coinWrap = document.getElementById("game1-coin-wrap");
  const coinEl = document.getElementById("game1-coin");
  const coinLabel = document.getElementById("game1-coin-label");
  const settlementEl = document.getElementById("game1-settlement");
  const nextBtn = document.getElementById("game1-next");
  const yourPnlEl = document.getElementById("game1-your-pnl");
  const botPnlEl = document.getElementById("game1-bot-pnl");

  let yourPnl = 0;
  let botPnl = 0;

  function formatPnl(x) {
    const sign = x >= 0 ? "+" : "";
    return sign + "$" + x.toFixed(2);
  }

  function updatePnlDisplay() {
    if (yourPnlEl) yourPnlEl.textContent = formatPnl(yourPnl);
    if (botPnlEl) botPnlEl.textContent = formatPnl(botPnl);
  }

  function clampBidAsk() {
    let bid = Number(bidInput.value) || 0;
    let ask = Number(askInput.value) || 100;
    bid = Math.max(0, Math.min(100, bid));
    ask = Math.max(0, Math.min(100, ask));
    if (bid >= ask) {
      ask = Math.min(100, bid + 5);
      bid = Math.max(0, ask - 5);
    }
    bidInput.value = Math.round(bid);
    askInput.value = Math.round(ask);
  }

  postBtn?.addEventListener("click", () => {
    clampBidAsk();
    const bid = Number(bidInput.value) / 100;
    const ask = Number(askInput.value) / 100;
    if (bid >= ask) return;

    const botEv = TRUE_PROB + (Math.random() * 2 - 1) * BOT_NOISE;
    const botEvClamped = Math.max(0.01, Math.min(0.99, botEv));

    let action = "pass";
    if (botEvClamped > ask) {
      action = "buy";
    } else if (botEvClamped < bid) {
      action = "sell";
    }

    phaseQuote?.classList.add("hidden");
    phaseResult?.removeAttribute("hidden");

    const askPct = Math.round(ask * 100);
    const bidPct = Math.round(bid * 100);

    if (action === "buy") {
      botActionEl.textContent = `Bot buys at ${askPct}¢ (its expected value is above your ask).`;
    } else if (action === "sell") {
      botActionEl.textContent = `Bot sells at ${bidPct}¢ (its expected value is below your bid).`;
    } else {
      botActionEl.textContent = `Bot passes (its expected value is between your bid and ask).`;
    }

    coinLabel.textContent = "Flipping…";
    coinEl.textContent = "?";
    coinEl.classList.remove("heads", "tails");
    settlementEl.textContent = "";

    const outcome = Math.random() < TRUE_PROB ? 1 : 0; // 1 = heads, 0 = tails

    setTimeout(() => {
      coinEl.textContent = outcome ? "H" : "T";
      coinEl.classList.add(outcome ? "heads" : "tails");
      coinLabel.textContent = outcome ? "Heads — contract pays $1" : "Tails — contract pays $0";
    }, 400);

    setTimeout(() => {
      let yourRound = 0;
      let botRound = 0;

      if (action === "buy") {
        botRound = outcome - ask;
        yourRound = ask - outcome;
      } else if (action === "sell") {
        yourRound = outcome - bid;
        botRound = bid - outcome;
      }

      yourPnl += yourRound;
      botPnl += botRound;
      updatePnlDisplay();

      if (action === "pass") {
        settlementEl.textContent = "No trade. No P&L this round.";
      } else {
        settlementEl.textContent = `This round: you ${formatPnl(yourRound)}, bot ${formatPnl(botRound)}.`;
      }
    }, 1200);
  });

  nextBtn?.addEventListener("click", () => {
    phaseResult?.setAttribute("hidden", "");
    phaseQuote?.classList.remove("hidden");
    coinEl.classList.remove("heads", "tails");
  });

  bidInput?.addEventListener("input", clampBidAsk);
  askInput?.addEventListener("input", clampBidAsk);
  updatePnlDisplay();
});

