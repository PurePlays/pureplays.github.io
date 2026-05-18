const SITE_PRESETS = [
  {
    id: "stakeus",
    name: "Stake.us",
    type: "U.S. sweeps",
    initial: "S",
    selected: true,
    affiliate: "https://stake.us/?c=PurePlays",
    dailies: 30,
    codes: 18,
    freebies: 10,
    offers: 20,
    vip: 15,
    giveaways: 8,
    minutes: 2,
    friction: 12
  },
  {
    id: "shuffleus",
    name: "Shuffle.us",
    type: "U.S. sweeps",
    initial: "Sh",
    selected: true,
    affiliate: "https://shuffle.us?r=PurePlays",
    dailies: 18,
    codes: 14,
    freebies: 8,
    offers: 18,
    vip: 6,
    giveaways: 6,
    minutes: 2,
    friction: 14
  },
  {
    id: "chumba",
    name: "Chumba Casino",
    type: "Sweeps + AMOE",
    initial: "C",
    selected: true,
    affiliate: "#",
    dailies: 30,
    codes: 4,
    freebies: 12,
    offers: 25,
    vip: 0,
    giveaways: 5,
    minutes: 4,
    friction: 18
  },
  {
    id: "luckyland",
    name: "LuckyLand Slots",
    type: "Sweeps + AMOE",
    initial: "L",
    selected: true,
    affiliate: "#",
    dailies: 25,
    codes: 4,
    freebies: 10,
    offers: 20,
    vip: 0,
    giveaways: 4,
    minutes: 4,
    friction: 18
  },
  {
    id: "crowncoins",
    name: "CrownCoins",
    type: "Sweeps",
    initial: "CC",
    selected: true,
    affiliate: "#",
    dailies: 20,
    codes: 8,
    freebies: 10,
    offers: 22,
    vip: 2,
    giveaways: 5,
    minutes: 3,
    friction: 16
  },
  {
    id: "modo",
    name: "Modo Casino",
    type: "Sweeps",
    initial: "M",
    selected: false,
    affiliate: "#",
    dailies: 20,
    codes: 6,
    freebies: 8,
    offers: 20,
    vip: 2,
    giveaways: 5,
    minutes: 3,
    friction: 16
  },
  {
    id: "high5",
    name: "High 5 Casino",
    type: "Sweeps",
    initial: "H5",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 5,
    freebies: 8,
    offers: 18,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  },
  {
    id: "pulsz",
    name: "Pulsz",
    type: "Sweeps",
    initial: "P",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 5,
    freebies: 8,
    offers: 18,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  },
  {
    id: "mcluck",
    name: "McLuck",
    type: "Sweeps",
    initial: "Mc",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 5,
    freebies: 8,
    offers: 18,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  },
  {
    id: "wowvegas",
    name: "WOW Vegas",
    type: "Sweeps",
    initial: "W",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 5,
    freebies: 8,
    offers: 16,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  },
  {
    id: "zula",
    name: "Zula Casino",
    type: "Sweeps",
    initial: "Z",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 4,
    freebies: 7,
    offers: 16,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  },
  {
    id: "realprize",
    name: "RealPrize",
    type: "Sweeps",
    initial: "R",
    selected: false,
    affiliate: "#",
    dailies: 15,
    codes: 4,
    freebies: 7,
    offers: 16,
    vip: 0,
    giveaways: 4,
    minutes: 3,
    friction: 18
  }
];

const state = {
  mode: "goal",
  sites: structuredClone(SITE_PRESETS)
};

const METHOD_LABELS = {
  dailies: "Dailies",
  codes: "Codes",
  freebies: "Freebies",
  offers: "Offers",
  vip: "VIP",
  giveaways: "Giveaways",
  amoe: "AMOE"
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const money2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const num = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 });

function $(id) {
  return document.getElementById(id);
}

function value(id) {
  const el = $(id);
  const v = Number(el?.value ?? 0);
  return Number.isFinite(v) ? v : 0;
}

function selectedMethods() {
  const methods = {};
  document.querySelectorAll(".method-toggle").forEach((toggle) => {
    methods[toggle.dataset.method] = toggle.checked;
  });
  return methods;
}

function effortMultiplier() {
  const effort = $("effortLevel")?.value || "regular";
  if (effort === "casual") return { monthlyMinutes: 150, multiplier: 0.65, label: "casual" };
  if (effort === "regular") return { monthlyMinutes: 450, multiplier: 1, label: "regular" };
  if (effort === "grinder") return { monthlyMinutes: 1350, multiplier: 1.35, label: "grinder" };
  return { monthlyMinutes: 2400, multiplier: 1.6, label: "heavy" };
}

function renderSiteGrid() {
  const grid = $("siteGrid");
  if (!grid) return;

  grid.innerHTML = state.sites.map((site) => `
    <article class="site-card" data-site-card="${site.id}">
      <div class="site-top">
        <div class="site-title">
          <div class="site-avatar">${site.initial}</div>
          <div>
            <strong>${site.name}</strong>
            <small>${site.type}</small>
          </div>
        </div>
        <label class="site-select"><input type="checkbox" data-site-select="${site.id}" ${site.selected ? "checked" : ""}> Use</label>
      </div>
      <div class="check-grid">
        <label>Dailies $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:dailies" value="${site.dailies}"></label>
        <label>Codes $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:codes" value="${site.codes}"></label>
        <label>Freebies $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:freebies" value="${site.freebies}"></label>
        <label>Offers $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:offers" value="${site.offers}"></label>
        <label>VIP $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:vip" value="${site.vip}"></label>
        <label>Giveaways $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:giveaways" value="${site.giveaways}"></label>
        <label>Min/day <input type="number" min="0" step="0.5" data-site-field="${site.id}:minutes" value="${site.minutes}"></label>
        <label>Friction % <input type="number" min="0" step="1" data-site-field="${site.id}:friction" value="${site.friction}"></label>
      </div>
    </article>
  `).join("");

  document.querySelectorAll("[data-site-select]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const site = state.sites.find((item) => item.id === event.target.dataset.siteSelect);
      if (site) site.selected = event.target.checked;
      runOptimizer();
    });
  });

  document.querySelectorAll("[data-site-field]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const [id, field] = event.target.dataset.siteField.split(":");
      const site = state.sites.find((item) => item.id === id);
      if (site) site[field] = Number(event.target.value || 0);
      runOptimizer();
    });
  });
}

function calculateAmoe(methods) {
  if (!methods.amoe) {
    return { value: 0, minutes: 0, score: 0 };
  }

  const credit = value("amoeCredit");
  const requests = value("amoeRequests");
  const cost = value("amoeCost");
  const approval = value("amoeApproval") / 100;
  const minutes = value("amoeMinutes");
  const clearingEdge = value("amoeClearingEdge") / 100;

  const gross = credit * requests * approval;
  const hardCost = cost * requests;
  const clearingCost = gross * clearingEdge;
  const net = Math.max(0, gross - hardCost - clearingCost);
  const totalMinutes = requests * minutes;
  const score = Math.max(0, Math.min(100, (net / 500) * 65 + (approval * 25) + 10));

  return { value: net, minutes: totalMinutes, score };
}

function calculateSite(site, methods, effort) {
  const baseKeys = ["dailies", "codes", "freebies", "offers", "vip", "giveaways"];
  let gross = 0;
  const active = [];

  baseKeys.forEach((key) => {
    if (methods[key]) {
      gross += Number(site[key] || 0);
      if (Number(site[key] || 0) > 0) active.push(key);
    }
  });

  gross *= effort.multiplier;

  const globalFriction = value("friction") / 100;
  const siteFriction = (site.friction || 0) / 100;
  const friction = Math.max(globalFriction, siteFriction);
  const net = gross * (1 - friction);
  const minutes = site.selected ? (site.minutes || 0) * 30 : 0;
  const hourly = minutes > 0 ? net / (minutes / 60) : net;
  const score = Math.max(0, Math.min(100,
    (net / 80) * 35 +
    Math.min(hourly / 2, 25) +
    (active.length * 5) +
    (100 - site.friction) * 0.20
  ));

  return { ...site, gross, net, minutes, hourly, score, active };
}

function makeBreakdown(sites, amoe) {
  const methods = selectedMethods();
  const effort = effortMultiplier();
  const totals = {
    dailies: 0,
    codes: 0,
    freebies: 0,
    offers: 0,
    vip: 0,
    giveaways: 0,
    amoe: amoe.value
  };

  sites.forEach((site) => {
    ["dailies", "codes", "freebies", "offers", "vip", "giveaways"].forEach((key) => {
      if (methods[key]) {
        const raw = (site[key] || 0) * effort.multiplier;
        const friction = Math.max(value("friction") / 100, (site.friction || 0) / 100);
        totals[key] += raw * (1 - friction);
      }
    });
  });

  return totals;
}

function buildActionPlan(total, goal, sites, amoe, methods, timeHours, hourly) {
  const gap = goal - total;
  const topSites = [...sites].sort((a, b) => b.score - a.score).slice(0, 4);
  const actions = [];

  if (gap <= 0) {
    actions.push(`Your goal is realistic at the current assumptions. The projected plan clears the target by ${money.format(Math.abs(gap))}/month.`);
  } else if (gap <= goal * 0.25) {
    actions.push(`You are close. The plan is short by about ${money.format(gap)}/month, so small AMOE volume, better codes, or a few positive EV promos could close the gap.`);
  } else {
    actions.push(`The goal is not realistic with the current setup. You are short by about ${money.format(gap)}/month.`);
  }

  if (topSites.length) {
    actions.push(`Prioritize ${topSites.map((s) => s.name).join(", ")} first based on the current value and friction estimates.`);
  }

  if (methods.amoe && amoe.value > 0) {
    actions.push(`AMOE is contributing about ${money.format(amoe.value)}/month. If you can handle the time and rules, this is likely one of the strongest value sources.`);
  } else {
    actions.push("AMOE is off or set to zero. If your goal is aggressive, dailies and codes alone probably will not be enough.");
  }

  if (!methods.offers) {
    actions.push("Deposit offers are turned off. That keeps risk lower, but also caps upside.");
  } else {
    actions.push("Only take deposit offers when the expected value is positive after rollover, house edge, cap, and redemption friction.");
  }

  if (hourly < 20) {
    actions.push(`The hourly value is only about ${money2.format(hourly)}/hr. Cut low-value sites or increase higher-value methods.`);
  } else {
    actions.push(`Estimated hourly value is about ${money2.format(hourly)}/hr, which is strong if the assumptions are realistic.`);
  }

  return actions;
}

function runOptimizer() {
  const methods = selectedMethods();
  const effort = effortMultiplier();
  const goal = value("goalAmount");

  const selected = state.sites.filter((site) => site.selected);
  const calculatedSites = selected.map((site) => calculateSite(site, methods, effort));
  const amoe = calculateAmoe(methods);
  const siteTotal = calculatedSites.reduce((sum, site) => sum + site.net, 0);
  const total = siteTotal + amoe.value;
  const totalMinutes = calculatedSites.reduce((sum, site) => sum + site.minutes, 0) + amoe.minutes;
  const timeHours = totalMinutes / 60;
  const hourly = timeHours > 0 ? total / timeHours : 0;
  const dailyMinutes = totalMinutes / 30;
  const gap = total - goal;
  const realism = goal > 0 ? Math.min(1, total / goal) : 1;
  const timePenalty = dailyMinutes > 60 ? 12 : dailyMinutes > 30 ? 6 : 0;
  const score = Math.max(0, Math.min(100, Math.round((realism * 58) + Math.min(hourly, 80) * 0.32 + Math.min(selected.length * 2, 12) - timePenalty)));

  const verdictTitle = $("verdictTitle");
  const verdictText = $("verdictText");

  if (total >= goal && goal > 0) {
    verdictTitle.textContent = "Possible at these assumptions";
    verdictText.textContent = `The plan projects about ${money.format(total)}/month, which clears your ${money.format(goal)} target. Double-check site rules, redemption friction, and whether you can keep up with the time required.`;
  } else if (goal > 0 && total >= goal * 0.70) {
    verdictTitle.textContent = "Close, but needs more value";
    verdictText.textContent = `The plan projects about ${money.format(total)}/month, short of your ${money.format(goal)} target. AMOE volume, better offers, or more sites may close the gap.`;
  } else if (goal > 0) {
    verdictTitle.textContent = "Not realistic with this setup";
    verdictText.textContent = `The plan only projects about ${money.format(total)}/month against a ${money.format(goal)} target. The tool would not call this realistic without adding higher-value methods.`;
  } else {
    verdictTitle.textContent = "Monthly value estimate";
    verdictText.textContent = `The selected setup projects about ${money.format(total)}/month.`;
  }

  $("scoreValue").textContent = score;
  $("monthlyValue").textContent = money.format(total);
  $("targetGap").textContent = gap >= 0 ? `+${money.format(gap)}` : `-${money.format(Math.abs(gap))}`;
  $("timeMonth").textContent = `${num.format(timeHours)} hrs`;
  $("hourlyValue").textContent = `${money2.format(hourly)}/hr`;
  $("dailyTime").textContent = `${num.format(dailyMinutes)} min/day`;
  $("selectedSites").textContent = selected.length;

  renderBreakdown(makeBreakdown(calculatedSites, amoe), total);
  renderActionPlan(buildActionPlan(total, goal, calculatedSites, amoe, methods, timeHours, hourly));
  renderRanking(calculatedSites, amoe);
}

function renderBreakdown(breakdown, total) {
  const container = $("valueBars");
  const entries = Object.entries(breakdown)
    .filter(([, value]) => value > 0)
    .sort((a, b) => b[1] - a[1]);

  if (!entries.length) {
    container.innerHTML = `<p class="muted">No value sources selected.</p>`;
    return;
  }

  container.innerHTML = entries.map(([key, value]) => {
    const width = total > 0 ? Math.max(3, Math.min(100, (value / total) * 100)) : 0;
    return `
      <div class="value-row">
        <div class="label"><span>${METHOD_LABELS[key]}</span><strong>${money.format(value)}</strong></div>
        <div class="bar-track"><div class="bar-fill" style="width:${width}%"></div></div>
      </div>
    `;
  }).join("");
}

function renderActionPlan(actions) {
  $("actionPlan").innerHTML = actions.map((action) => `<li>${action}</li>`).join("");
}

function renderRanking(sites, amoe) {
  const rows = sites
    .sort((a, b) => b.score - a.score)
    .map((site) => `
      <tr>
        <td class="rank-site"><strong>${site.name}</strong><small>${site.type}</small></td>
        <td>${site.active.length ? site.active.map((key) => `<span class="method-pill">${METHOD_LABELS[key]}</span>`).join("") : "—"}</td>
        <td><strong>${money.format(site.net)}</strong></td>
        <td>${num.format(site.minutes / 60)} hrs/mo</td>
        <td><span class="score-pill">${Math.round(site.score)}</span></td>
        <td><a class="link-button" href="${site.affiliate}" target="_blank" rel="sponsored noopener noreferrer">${site.affiliate === "#" ? "Pending" : "Open"}</a></td>
      </tr>
    `).join("");

  const amoeRow = amoe.value > 0 ? `
    <tr>
      <td class="rank-site"><strong>AMOE Plan</strong><small>Mail-in value estimate</small></td>
      <td><span class="method-pill">AMOE</span></td>
      <td><strong>${money.format(amoe.value)}</strong></td>
      <td>${num.format(amoe.minutes / 60)} hrs/mo</td>
      <td><span class="score-pill">${Math.round(amoe.score)}</span></td>
      <td><a class="link-button" href="#amoe">View</a></td>
    </tr>
  ` : "";

  $("rankingRows").innerHTML = (amoeRow + rows) || `<tr><td colspan="6">Select at least one site or enable AMOE.</td></tr>`;
}

function setCoreSites() {
  const core = new Set(["stakeus", "shuffleus", "chumba", "luckyland", "crowncoins"]);
  state.sites.forEach((site) => site.selected = core.has(site.id));
  renderSiteGrid();
  runOptimizer();
}

function selectAllSites(value) {
  state.sites.forEach((site) => site.selected = value);
  renderSiteGrid();
  runOptimizer();
}

function resetEstimates() {
  state.sites = structuredClone(SITE_PRESETS);
  renderSiteGrid();
  runOptimizer();
}

function bindControls() {
  document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".mode-tab").forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      state.mode = tab.dataset.mode;
      runOptimizer();
    });
  });

  document.querySelectorAll("[data-goal]").forEach((button) => {
    button.addEventListener("click", () => {
      $("goalAmount").value = button.dataset.goal;
      runOptimizer();
    });
  });

  document.querySelectorAll("input, select").forEach((input) => {
    input.addEventListener("input", runOptimizer);
    input.addEventListener("change", runOptimizer);
  });

  $("runOptimizer")?.addEventListener("click", runOptimizer);
  $("selectCore")?.addEventListener("click", setCoreSites);
  $("selectAllSites")?.addEventListener("click", () => selectAllSites(true));
  $("clearSites")?.addEventListener("click", () => selectAllSites(false));
  $("resetEstimates")?.addEventListener("click", resetEstimates);
}

document.addEventListener("DOMContentLoaded", () => {
  renderSiteGrid();
  bindControls();
  runOptimizer();
});


/* Funnel V2 override logic */

function siteNetPreview(site) {
  const methods = selectedMethods();
  const effort = effortMultiplier();
  return calculateSite(site, methods, effort);
}

function renderSiteGrid() {
  const grid = $("siteGrid");
  if (!grid) return;

  grid.innerHTML = state.sites.map((site) => {
    const preview = siteNetPreview(site);
    return `
      <article class="site-card collapsed" data-site-card="${site.id}">
        <div class="site-top">
          <div class="site-title">
            <div class="site-avatar">${site.initial}</div>
            <div>
              <strong>${site.name}</strong>
              <small>${site.type}</small>
            </div>
          </div>
          <label class="site-select"><input type="checkbox" data-site-select="${site.id}" ${site.selected ? "checked" : ""}> Use</label>
        </div>

        <div class="simple-site-summary">
          <div class="simple-chip"><span>Value</span><strong>${money.format(preview.net)}</strong></div>
          <div class="simple-chip"><span>Time</span><strong>${num.format(preview.minutes / 60)}h/mo</strong></div>
          <div class="simple-chip"><span>Score</span><strong>${Math.round(preview.score)}</strong></div>
        </div>

        <button type="button" class="edit-assumptions" data-edit-site="${site.id}">Edit assumptions</button>

        <div class="advanced-fields">
          <div class="check-grid">
            <label>Dailies $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:dailies" value="${site.dailies}"></label>
            <label>Codes $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:codes" value="${site.codes}"></label>
            <label>Freebies $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:freebies" value="${site.freebies}"></label>
            <label>Offers $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:offers" value="${site.offers}"></label>
            <label>VIP $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:vip" value="${site.vip}"></label>
            <label>Giveaways $/mo <input type="number" min="0" step="1" data-site-field="${site.id}:giveaways" value="${site.giveaways}"></label>
            <label>Min/day <input type="number" min="0" step="0.5" data-site-field="${site.id}:minutes" value="${site.minutes}"></label>
            <label>Friction % <input type="number" min="0" step="1" data-site-field="${site.id}:friction" value="${site.friction}"></label>
          </div>
        </div>
      </article>
    `;
  }).join("");

  document.querySelectorAll("[data-site-select]").forEach((input) => {
    input.addEventListener("change", (event) => {
      const site = state.sites.find((item) => item.id === event.target.dataset.siteSelect);
      if (site) site.selected = event.target.checked;
      renderSiteGrid();
      runOptimizer();
    });
  });

  document.querySelectorAll("[data-site-field]").forEach((input) => {
    input.addEventListener("input", (event) => {
      const [id, field] = event.target.dataset.siteField.split(":");
      const site = state.sites.find((item) => item.id === id);
      if (site) site[field] = Number(event.target.value || 0);
      runOptimizer(false);
    });
  });

  document.querySelectorAll("[data-edit-site]").forEach((button) => {
    button.addEventListener("click", () => {
      const card = document.querySelector(`[data-site-card="${button.dataset.editSite}"]`);
      if (!card) return;
      card.classList.toggle("collapsed");
      button.textContent = card.classList.contains("collapsed") ? "Edit assumptions" : "Hide assumptions";
    });
  });
}

function scenarioValues(total) {
  return {
    conservative: total * 0.70,
    realistic: total,
    aggressive: total * 1.32
  };
}

function affiliateReadySites(calculatedSites) {
  const known = calculatedSites.filter((site) => site.affiliate && site.affiliate !== "#");
  const placeholders = calculatedSites.filter((site) => !site.affiliate || site.affiliate === "#");
  return [...known.sort((a, b) => b.score - a.score), ...placeholders.sort((a, b) => b.score - a.score)];
}

function renderGapCards(total, goal, selectedSites, amoe, methods) {
  const gap = Math.max(0, goal - total);
  const summary = $("gapSummary");
  const container = $("gapCards");
  if (!container || !summary) return;

  if (goal <= 0) {
    summary.textContent = "Set a monthly target to see the best ways to close the gap.";
  } else if (gap <= 0) {
    summary.textContent = `This plan clears the goal by about ${money.format(total - goal)}/month. The next move is starting with the highest-score sites and the repeatable methods.`;
  } else {
    summary.textContent = `You need about ${money.format(gap)}/month more to hit the target. These are the most natural ways to close it.`;
  }

  const notSelected = state.sites
    .filter((site) => !site.selected)
    .map((site) => calculateSite({ ...site, selected: true }, methods, effortMultiplier()))
    .sort((a, b) => b.net - a.net);

  const bestAdd = notSelected[0];
  const secondAdd = notSelected[1];

  const cards = [];

  if (bestAdd) {
    cards.push({
      title: `Add ${bestAdd.name}`,
      gain: `+${money.format(bestAdd.net)}/mo`,
      text: `Best next site based on your selected methods. ${bestAdd.affiliate !== "#" ? "Can route through your PurePlays link." : "Affiliate link pending."}`
    });
  }

  if (secondAdd) {
    cards.push({
      title: `Add ${secondAdd.name}`,
      gain: `+${money.format(secondAdd.net)}/mo`,
      text: "Adds another value source and helps diversify daily claims, promos, and freebie hunting."
    });
  }

  if (!methods.amoe) {
    cards.push({
      title: "Turn on AMOE",
      gain: "+high upside",
      text: "For aggressive goals, AMOE is often the difference between a small daily-claim plan and a real monthly-value plan."
    });
  } else {
    cards.push({
      title: "Increase AMOE volume",
      gain: `Current ${money.format(amoe.value)}/mo`,
      text: "If the rules and approval rate are realistic, more AMOE volume is usually one of the strongest gap closers."
    });
  }

  cards.push({
    title: "Filter bad offers",
    gain: "Protect EV",
    text: "Only take deposit offers that still show positive value after rollover, house edge, caps, and redemption friction."
  });

  container.innerHTML = cards.slice(0, 4).map((card) => `
    <article class="gap-card">
      <h4>${card.title}</h4>
      <div class="gain">${card.gain}</div>
      <p>${card.text}</p>
    </article>
  `).join("");
}

function renderRecommendedSites(calculatedSites) {
  const container = $("recommendedSites");
  if (!container) return;

  const recommended = affiliateReadySites(calculatedSites).slice(0, 3);

  if (!recommended.length) {
    container.innerHTML = `<article class="recommended-card"><h4>No sites selected</h4><p>Select sites or use the core preset to generate recommendations.</p></article>`;
    return;
  }

  container.innerHTML = recommended.map((site) => {
    const hasLink = site.affiliate && site.affiliate !== "#";
    const methods = site.active.slice(0, 3).map((key) => METHOD_LABELS[key]).join(", ") || "general value";
    return `
      <article class="recommended-card">
        <div class="rec-top">
          <div class="rec-avatar">${site.initial}</div>
          <div>
            <h4>${site.name}</h4>
            <p>${site.type}</p>
          </div>
        </div>
        <span class="rec-score">PurePlay Score ${Math.round(site.score)}</span>
        <div class="gain">${money.format(site.net)}/mo</div>
        <p>Why it fits: ${methods}. Estimated time is ${num.format(site.minutes / 60)} hrs/month at current assumptions.</p>
        <div class="rec-buttons">
          <a class="join-button" href="${hasLink ? site.affiliate : "#sites"}" target="${hasLink ? "_blank" : "_self"}" rel="${hasLink ? "sponsored noopener noreferrer" : ""}">${hasLink ? "Join via PurePlays" : "Affiliate link pending"}</a>
          <a class="secondary-button" href="#sites">Adjust assumptions</a>
        </div>
      </article>
    `;
  }).join("");
}

function renderStartPlan(calculatedSites, total, goal, amoe, methods) {
  const container = $("startPlan");
  if (!container) return;

  const topAffiliateSites = affiliateReadySites(calculatedSites).slice(0, 3);
  const joinNames = topAffiliateSites.map((site) => site.name).join(", ") || "your selected sites";
  const dailyNames = calculatedSites
    .filter((site) => site.active.includes("dailies"))
    .sort((a, b) => b.net - a.net)
    .slice(0, 4)
    .map((site) => site.name)
    .join(", ") || "selected daily sites";

  const steps = [
    {
      title: "Join the recommended sites",
      text: `Start with ${joinNames}. These are the strongest signup opportunities based on the current plan.`
    },
    {
      title: "Run the daily checklist",
      text: `Claim/check ${dailyNames}. This is the repeatable baseline value.`
    },
    {
      title: "Add codes and offer checks",
      text: "Check codes, freebie drops, email promos, Discord/Twitter posts, and only take offers that clear the math."
    },
    {
      title: methods.amoe ? "Execute the AMOE batch" : "Add AMOE if short",
      text: methods.amoe ? `Current AMOE estimate is ${money.format(amoe.value)}/month. Follow rules carefully and track approvals.` : "If the plan is short, AMOE is the highest-upside method to add."
    }
  ];

  container.innerHTML = steps.map((step, index) => `
    <article class="start-step">
      <span class="step-number">${index + 1}</span>
      <h4>${step.title}</h4>
      <p>${step.text}</p>
    </article>
  `).join("");
}

function runOptimizer(rerenderCards = true) {
  const methods = selectedMethods();
  const effort = effortMultiplier();
  const goal = value("goalAmount");

  const selected = state.sites.filter((site) => site.selected);
  const calculatedSites = selected.map((site) => calculateSite(site, methods, effort));
  const amoe = calculateAmoe(methods);
  const siteTotal = calculatedSites.reduce((sum, site) => sum + site.net, 0);
  const total = siteTotal + amoe.value;
  const totalMinutes = calculatedSites.reduce((sum, site) => sum + site.minutes, 0) + amoe.minutes;
  const timeHours = totalMinutes / 60;
  const hourly = timeHours > 0 ? total / timeHours : 0;
  const dailyMinutes = totalMinutes / 30;
  const gap = total - goal;
  const realism = goal > 0 ? Math.min(1, total / goal) : 1;
  const timePenalty = dailyMinutes > 60 ? 12 : dailyMinutes > 30 ? 6 : 0;
  const score = Math.max(0, Math.min(100, Math.round((realism * 58) + Math.min(hourly, 80) * 0.32 + Math.min(selected.length * 2, 12) - timePenalty)));

  const verdictTitle = $("verdictTitle");
  const verdictText = $("verdictText");

  if (total >= goal && goal > 0) {
    verdictTitle.textContent = "Possible at these assumptions";
    verdictText.textContent = `The plan projects about ${money.format(total)}/month, clearing your ${money.format(goal)} target. The next step is starting with the recommended sites and repeatable methods.`;
  } else if (goal > 0 && total >= goal * 0.70) {
    verdictTitle.textContent = "Close, but needs more value";
    verdictText.textContent = `The plan projects about ${money.format(total)}/month, short of your ${money.format(goal)} target. Use the close-the-gap cards below to add sites, AMOE volume, or better offers.`;
  } else if (goal > 0) {
    verdictTitle.textContent = "Not realistic with this setup";
    verdictText.textContent = `The plan projects about ${money.format(total)}/month against a ${money.format(goal)} target. This is where the tool should be honest: you need more sites, AMOE, or stronger offers.`;
  } else {
    verdictTitle.textContent = "Monthly value estimate";
    verdictText.textContent = `The selected setup projects about ${money.format(total)}/month.`;
  }

  $("scoreValue").textContent = score;
  $("monthlyValue").textContent = money.format(total);
  $("targetGap").textContent = gap >= 0 ? `+${money.format(gap)}` : `-${money.format(Math.abs(gap))}`;
  $("timeMonth").textContent = `${num.format(timeHours)} hrs`;
  $("hourlyValue").textContent = `${money2.format(hourly)}/hr`;
  $("dailyTime").textContent = `${num.format(dailyMinutes)} min/day`;
  $("selectedSites").textContent = selected.length;

  const scenarios = scenarioValues(total);
  $("conservativeValue").textContent = money.format(scenarios.conservative);
  $("realisticValue").textContent = money.format(scenarios.realistic);
  $("aggressiveValue").textContent = money.format(scenarios.aggressive);

  renderGapCards(total, goal, calculatedSites, amoe, methods);
  renderRecommendedSites(calculatedSites);
  renderBreakdown(makeBreakdown(calculatedSites, amoe), total);
  renderActionPlan(buildActionPlan(total, goal, calculatedSites, amoe, methods, timeHours, hourly));
  renderStartPlan(calculatedSites, total, goal, amoe, methods);
  renderRanking(calculatedSites, amoe);
}
