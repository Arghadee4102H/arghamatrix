import { runAnalysisPipeline } from './engine/index.js';
import { computeJournalMetrics } from './engine/journal.js';

async function testPipeline() {
  console.log("=== ARGHA MATRIX PIPELINE TEST ===\n");

  const symbol = "BTCUSD";
  const marketData = { symbol, currentPrice: 105, spread: 1.5 };
  const klines4H = [];
  const klinesDaily = [];
  
  const accountState = {
    dailyLossPct: 1.5, maxDailyLossPct: 5.0,
    consecutiveLosses: 1, maxConsecutiveLosses: 3,
    openSignals: 0, maxOpenSignals: 5,
    perTradeRiskPct: 1.0
  };
  
  const sessionInfo = { withinNewsBlackoutWindow: false };
  const userSettings = { 
    isMacroSensitive: true, 
    expectedCorrelation: "direct",
    exitMode: "PARTIAL_TRAIL"
  };

  try {
    const result = await runAnalysisPipeline(
      symbol, 
      marketData, 
      klines4H, 
      klinesDaily, 
      accountState, 
      sessionInfo, 
      userSettings
    );
    
    console.log("PIPELINE RESULT:\n", JSON.stringify(result, null, 2));

    console.log("\n=== TESTING STAGE 10 (JOURNAL) ===");
    const mockSignals = [
      { outcome: "win", pnl: 50, rr: 2.0 },
      { outcome: "loss", pnl: -25, rr: -1.0 },
      { outcome: "win", pnl: 100, rr: 4.0 },
      { outcome: "pending" }
    ];
    const metrics = computeJournalMetrics(mockSignals);
    console.log("JOURNAL METRICS:\n", JSON.stringify(metrics, null, 2));

  } catch (err) {
    console.error("Pipeline Failed:", err);
  }
}

testPipeline();
