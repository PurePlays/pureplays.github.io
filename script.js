const fmtMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

function numberValue(id) {
  const el = document.getElementById(id);
  const value = Number(el?.value || 0);
  return Number.isFinite(value) ? value : 0;
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function calculatePromo() {
  const bonus = numberValue("bonusAmount");
  const deposit = numberValue("depositRequired");
  const playthrough = numberValue("playthroughMultiple");
  const edge = numberValue("bonusHouseEdge") / 100;
  const rewards = numberValue("bonusRewardRate") / 100;
  const contribution = Math.max(numberValue("playthroughContribution") / 100, 0.01);

  const requiredWager = (bonus * playthrough) / contribution;
  const expectedLoss = requiredWager * edge;
  const expectedRewards = requiredWager * rewards;
  const netValue = bonus + expectedRewards - deposit - expectedLoss;
  const breakEvenEdge = requiredWager > 0 ? ((bonus - deposit) / requiredWager + rewards) * 100 : 0;

  const result = document.getElementById("bonusResult");
  if (!result) return;

  result.innerHTML = `
    <div class="metric-grid">
      ${metric("Required wager", fmtMoney.format(requiredWager))}
      ${metric("Expected loss", fmtMoney.format(expectedLoss))}
      ${metric("Rewards estimate", fmtMoney.format(expectedRewards))}
      ${metric("Deposit required", fmtMoney.format(deposit))}
      ${metric("Net promo value", fmtMoney.format(netValue))}
      ${metric("Break-even edge", `${breakEvenEdge.toFixed(2)}%`)}
    </div>
    <div class="callout">
      <strong>${netValue > 0 ? "Positive estimate." : "Negative estimate."}</strong>
      ${netValue > 0 ? "This promo looks mathematically worth considering at these inputs." : "At these inputs, this promo does not look worth chasing."}
    </div>
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calcBonus")?.addEventListener("click", calculatePromo);
  calculatePromo();
});
