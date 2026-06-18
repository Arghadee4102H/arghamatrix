import { runAnalysisPipeline } from './engine/index.js';

// --- TELEGRAM WEBAPP INIT ---
const tg = window.Telegram ? window.Telegram.WebApp : null;
if (tg) {
  tg.ready();
  tg.expand();
  
  const user = tg.initDataUnsafe?.user;
  if (user) {
    document.getElementById('user-name').textContent = `${user.first_name} ${user.last_name || ""}`.trim();
    if (user.photo_url) {
      document.getElementById('user-avatar').src = user.photo_url;
    }
  }

  // Setup Top-Right Settings Button if supported
  if (tg.isVersionAtLeast("6.10")) {
    tg.SettingsButton.show();
    tg.onEvent("settingsButtonClicked", () => alert("Drawer Menu Opened"));
  } else {
    document.getElementById("customMenuBtn").style.display = "block";
    document.getElementById("customMenuBtn").onclick = () => alert("Drawer Menu Opened");
  }
}

// --- NAVIGATION ---
window.navTo = function(sectionId) {
  document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
  document.getElementById('section-' + sectionId).classList.add('active');
  
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const btnIndex = sectionId === 'home' ? 0 : sectionId === 'analysis' ? 1 : -1;
  if(btnIndex >= 0) document.querySelectorAll('.nav-item')[btnIndex].classList.add('active');
};

// --- SEARCH MOCK ---
const searchInput = document.getElementById('market-search');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value;
  // In production, this would call fuzzyRank from TV/Binance
  console.log("Searching for:", query);
});

// --- ANALYSIS PIPELINE TRIGGER ---
window.triggerAnalysis = async function() {
  const btn = document.getElementById('analyze-btn');
  btn.textContent = "🤖 ANALYZING...";
  btn.disabled = true;

  // Mock fetching fresh data (Stage -1)
  console.log("Fetching fresh data with maxCacheAgeMs = candle period...");
  await new Promise(resolve => setTimeout(resolve, 1500));

  const symbol = "BTCUSD";
  const marketData = { symbol, currentPrice: 67200, spread: 1.5 };
  const klines4H = []; // stub
  const klinesDaily = []; // stub
  const accountState = {
    dailyLossPct: 0, maxDailyLossPct: 5.0,
    consecutiveLosses: 0, maxConsecutiveLosses: 3,
    openSignals: 1, maxOpenSignals: 3,
    perTradeRiskPct: 1.0, exitModePref: "FIXED_RR"
  };
  const sessionInfo = { withinNewsBlackoutWindow: false };
  const userSettings = { isMacroSensitive: true, expectedCorrelation: "direct" };

  try {
    const result = await runAnalysisPipeline(symbol, marketData, klines4H, klinesDaily, accountState, sessionInfo, userSettings);
    renderOutputPanel(result);
  } catch (e) {
    alert("Analysis Failed: " + e.message);
  } finally {
    btn.textContent = "🤖 ANALYZE NOW (50 Credits)";
    btn.disabled = false;
  }
};

function renderOutputPanel(res) {
  if(res.status === "BLOCKED") {
    alert("Analysis Blocked: " + res.reasons.join(", "));
    return;
  }

  const panel = document.getElementById('analysis-output');
  panel.classList.remove('hidden');

  document.getElementById('out-score').textContent = res.score;
  const fill = document.getElementById('out-score-fill');
  fill.style.width = res.score + "%";
  fill.style.background = res.score >= 65 ? "var(--success)" : res.score >= 40 ? "orange" : "var(--danger)";

  document.getElementById('out-dir').textContent = res.tradePlan ? (res.bias === "BULLISH" ? "📈 LONG" : "📉 SHORT") : "N/A";
  document.getElementById('out-bias').textContent = res.bias;
  
  if (res.tradePlan) {
    document.getElementById('out-entry').textContent = "$" + res.tradePlan.entry.toFixed(2);
    document.getElementById('out-tp1').textContent = "$" + res.tradePlan.tp1.toFixed(2);
    document.getElementById('out-tp2').textContent = "$" + res.tradePlan.tp2.toFixed(2);
    document.getElementById('out-sl').textContent = "$" + res.tradePlan.sl.toFixed(2);
    document.getElementById('out-rr').textContent = "1:" + res.tradePlan.rr;
  }
}

// --- ADS & FORMS MOCK ---
window.watchAd = function() {
  alert("Ad Triggered. Would call show_10916448()");
};

window.submitSupport = async function(e) {
  e.preventDefault();
  alert("Submitted to Formspree: https://formspree.io/f/maqzzrwe");
  e.target.reset();
};
