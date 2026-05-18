const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const numberFmt = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });

function getValue(id) {
  const element = document.getElementById(id);
  if (!element) return 0;
  const value = Number(element.value || 0);
  return Number.isFinite(value) ? value : 0;
}

function dollars(value) {
  if (!Number.isFinite(value)) return "Invalid";
  return money.format(value);
}

function metric(label, value) {
  return `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`;
}

function verdictClass(net) {
  if (net > 0) return "good";
  if (net < 0) return "bad";
  return "warn";
}

function promoMath(inputs) {
  const playBaseAmount = inputs.playBase === "bonusDeposit" ? inputs.bonus + inputs.deposit : inputs.bonus;
  const creditedPlaythrough = playBaseAmount * inputs.multiple;
  const rawWager = inputs.contribution > 0 ? creditedPlaythrough / inputs.contribution : Infinity;
  const usableBonus = inputs.maxCashout > 0
    ? Math.max(0, Math.min(inputs.currentBalance + inputs.bonus, inputs.maxCashout) - inputs.currentBalance)
    : inputs.bonus;
  const expectedLoss = rawWager * inputs.edge;
  const rewards = rawWager * inputs.rewardRate;
  const trueValue = usableBonus + rewards - inputs.deposit - expectedLoss;
  const finalBalance = inputs.currentBalance + trueValue;
  const breakEvenEdge = rawWager > 0 && Number.isFinite(rawWager)
    ? ((usableBonus - inputs.deposit) / rawWager + inputs.rewardRate) * 100
    : 0;
  const breakEvenPlaythrough = inputs.edge > inputs.rewardRate && playBaseAmount > 0
    ? (usableBonus - inputs.deposit) / (playBaseAmount * (inputs.edge - inputs.rewardRate))
    : Infinity;
  const varianceBuffer = expectedLoss * inputs.riskMultiplier;
  const minBankroll = Math.max(inputs.deposit + varianceBuffer, inputs.maxWager * 25);

  return {
    playBaseAmount,
    creditedPlaythrough,
    rawWager,
    usableBonus,
    expectedLoss,
    rewards,
    trueValue,
    finalBalance,
    breakEvenEdge,
    breakEvenPlaythrough,
    minBankroll
  };
}

function calculateBonus() {
  const inputs = {
    bonus: getValue("bonusAmount"),
    deposit: getValue("depositRequired"),
    multiple: getValue("playthroughMultiple"),
    playBase: document.getElementById("playthroughBase")?.value || "bonus",
    contribution: getValue("playthroughContribution") / 100,
    edge: getValue("bonusHouseEdge") / 100,
    rewardRate: getValue("bonusRewardRate") / 100,
    currentBalance: getValue("currentBalance"),
    redemptionMin: getValue("redemptionMin"),
    maxCashout: getValue("maxCashout"),
    riskMultiplier: getValue("riskLevel"),
    maxWager: getValue("maxComfortableWager")
  };

  if (inputs.bonus <= 0 && inputs.deposit <= 0) {
    document.getElementById("bonusResult").innerHTML = `<div class="callout bad"><strong>Invalid input.</strong> Enter a bonus value or deposit requirement above $0.</div>`;
    return;
  }

  const result = promoMath(inputs);
  const clearsRedemption = result.finalBalance >= inputs.redemptionMin;
  const cls = verdictClass(result.trueValue);

  let verdict = "Only if already playing.";
  if (result.trueValue > Math.max(1, inputs.deposit * 0.1)) verdict = "Worth considering.";
  if (result.trueValue < 0) verdict = "Skip at these inputs.";

  document.getElementById("bonusResult").innerHTML = `
    <div class="metric-grid">
      ${metric("Required raw wager", dollars(result.rawWager))}
      ${metric("Expected loss", dollars(result.expectedLoss))}
      ${metric("True bonus value", dollars(result.trueValue))}
      ${metric("Break-even house edge", `${numberFmt.format(result.breakEvenEdge)}%`)}
      ${metric("Break-even playthrough", Number.isFinite(result.breakEvenPlaythrough) ? `${numberFmt.format(result.breakEvenPlaythrough)}x` : "Not binding")}
      ${metric("Suggested bankroll buffer", dollars(result.minBankroll))}
      ${metric("Expected final balance", dollars(result.finalBalance))}
      ${metric("Usable bonus after cap", dollars(result.usableBonus))}
      ${metric("Rewards estimate", dollars(result.rewards))}
    </div>
    <div class="callout ${cls}"><strong>${verdict}</strong> ${clearsRedemption ? "Expected final balance clears the entered redemption minimum." : "Expected final balance does not clear the entered redemption minimum."}</div>
  `;
}

function calculateOffers() {
  const rows = Array.from(document.querySelectorAll("#offerRows tr"));
  const offers = rows.map((row) => {
    const cells = row.querySelectorAll("input");
    const name = cells[0]?.value.trim() || "Unnamed offer";
    const bonus = Number(cells[1]?.value || 0);
    const deposit = Number(cells[2]?.value || 0);
    const multiple = Number(cells[3]?.value || 0);
    const contribution = Number(cells[4]?.value || 0) / 100;
    const edge = Number(cells[5]?.value || 0) / 100;
    const maxCashout = Number(cells[6]?.value || 0);
    const rawWager = contribution > 0 ? (bonus * multiple) / contribution : Infinity;
    const usableBonus = maxCashout > 0 ? Math.min(bonus, maxCashout) : bonus;
    const expectedLoss = rawWager * edge;
    const net = usableBonus - deposit - expectedLoss;
    const burden = bonus > 0 && Number.isFinite(rawWager) ? rawWager / bonus : Infinity;
    return { name, bonus, deposit, rawWager, expectedLoss, net, burden };
  }).sort((a, b) => b.net - a.net);

  document.getElementById("offerResult").innerHTML = offers.map((offer, index) => {
    const cls = verdictClass(offer.net);
    const verdict = offer.net > 0 ? "best value candidate" : offer.net < 0 ? "likely trap" : "neutral";
    return `
      <div class="rank-item">
        <div>
          <strong>${index + 1}. ${offer.name}</strong>
          <span>Net EV: ${dollars(offer.net)} | Raw wager: ${dollars(offer.rawWager)} | Expected loss: ${dollars(offer.expectedLoss)} | Burden: ${Number.isFinite(offer.burden) ? `${numberFmt.format(offer.burden)}x bonus` : "Invalid"}</span>
        </div>
        <em class="${cls}">${verdict}</em>
      </div>
    `;
  }).join("");
}

function calculateAmoe() {
  const credit = getValue("amoeCredits");
  const postage = getValue("amoePostage");
  const materials = getValue("amoeMaterials");
  const approval = getValue("amoeApproval") / 100;
  const minutes = getValue("amoeMinutes");
  const monthly = getValue("amoeMonthlyLimit");
  const costPerRequest = postage + materials;
  const expectedCredit = credit * approval;
  const netPerRequest = expectedCredit - costPerRequest;
  const monthlyNet = netPerRequest * monthly;
  const monthlyHours = (minutes * monthly) / 60;
  const hourlyValue = monthlyHours > 0 ? monthlyNet / monthlyHours : 0;
  const breakEvenApproval = credit > 0 ? (costPerRequest / credit) * 100 : Infinity;
  const cls = verdictClass(netPerRequest);
  const verdict = netPerRequest > 0
    ? "Positive expected value if the approval and time estimates are realistic."
    : "Not worth it at these inputs.";

  document.getElementById("amoeResult").innerHTML = `
    <div class="metric-grid">
      ${metric("Expected credit/request", dollars(expectedCredit))}
      ${metric("Cost/request", dollars(costPerRequest))}
      ${metric("Net/request", dollars(netPerRequest))}
      ${metric("Monthly net", dollars(monthlyNet))}
      ${metric("Monthly hours", `${numberFmt.format(monthlyHours)} hrs`)}
      ${metric("Hourly value", dollars(hourlyValue))}
      ${metric("Break-even approval", Number.isFinite(breakEvenApproval) ? `${numberFmt.format(breakEvenApproval)}%` : "Invalid")}
      ${metric("Monthly requests", monthly.toLocaleString())}
      ${metric("Approval estimate", `${numberFmt.format(approval * 100)}%`)}
    </div>
    <div class="callout ${cls}">${verdict} Rejections, rule mistakes, delays, and changing AMOE terms can change the real result.</div>
  `;
}

function loadNoDepositExample() {
  document.getElementById("bonusAmount").value = 25;
  document.getElementById("depositRequired").value = 0;
  document.getElementById("playthroughMultiple").value = 1;
  document.getElementById("playthroughBase").value = "bonus";
  document.getElementById("playthroughContribution").value = 100;
  document.getElementById("bonusHouseEdge").value = 3;
  document.getElementById("bonusRewardRate").value = 0;
  document.getElementById("currentBalance").value = 0;
  document.getElementById("redemptionMin").value = 50;
  document.getElementById("maxCashout").value = 0;
  document.getElementById("riskLevel").value = 2.5;
  document.getElementById("maxComfortableWager").value = 1;
  calculateBonus();
}

function loadDepositMatchExample() {
  document.getElementById("bonusAmount").value = 50;
  document.getElementById("depositRequired").value = 50;
  document.getElementById("playthroughMultiple").value = 20;
  document.getElementById("playthroughBase").value = "bonusDeposit";
  document.getElementById("playthroughContribution").value = 100;
  document.getElementById("bonusHouseEdge").value = 3;
  document.getElementById("bonusRewardRate").value = 0.5;
  document.getElementById("currentBalance").value = 0;
  document.getElementById("redemptionMin").value = 100;
  document.getElementById("maxCashout").value = 0;
  document.getElementById("riskLevel").value = 4;
  document.getElementById("maxComfortableWager").value = 1;
  calculateBonus();
}

function initializeScrollReveal() {
  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  if (!("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  revealItems.forEach((item) => observer.observe(item));
}

function initializeNavigation() {
  const navLinks = Array.from(document.querySelectorAll(".nav-link"));
  const sections = Array.from(document.querySelectorAll("section[id]"));
  if (!("IntersectionObserver" in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const id = entry.target.id;
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    });
  }, { threshold: 0.35 });

  sections.forEach((section) => observer.observe(section));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calcBonus")?.addEventListener("click", calculateBonus);
  document.getElementById("compareOffers")?.addEventListener("click", calculateOffers);
  document.getElementById("calcAmoe")?.addEventListener("click", calculateAmoe);
  document.getElementById("loadNoDeposit")?.addEventListener("click", loadNoDepositExample);
  document.getElementById("loadDepositMatch")?.addEventListener("click", loadDepositMatchExample);

  initializeScrollReveal();
  initializeNavigation();

  calculateBonus();
  calculateOffers();
  calculateAmoe();
});
