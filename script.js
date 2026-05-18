/**
 * PurePlays Dashboard - Interactive Calculators & Tracker
 * Handles Bonus EV, VIP Chase Cost, Redemption Planning, Daily Claim Tracking,
 * scroll reveal animations, and active navigation state.
 */

const STORAGE_PREFIX = 'dailyTracker_';

const moneyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatCurrency(value) {
  const number = Number(value);
  return moneyFormatter.format(Number.isFinite(number) ? number : 0);
}

function formatPercent(value) {
  const number = Number(value);
  return `${(Number.isFinite(number) ? number : 0).toFixed(2)}%`;
}

function getNumber(id) {
  const element = document.getElementById(id);
  if (!element) return 0;

  const value = Number.parseFloat(element.value);
  return Number.isFinite(value) ? value : 0;
}

function setValue(id, value) {
  const element = document.getElementById(id);
  if (element) element.value = value;
}

function showResult(elementId, html, isSuccess = true) {
  const resultElement = document.getElementById(elementId);
  if (!resultElement) return;

  resultElement.innerHTML = html;
  resultElement.classList.toggle('error', !isSuccess);
}

function metric(label, value) {
  return `
    <div class="metric">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `;
}

function recommendationLabel(className, label) {
  return `<strong>${label}</strong>`;
}

// ============================================================================
// BONUS EV CALCULATOR
// ============================================================================

function calculateBonus() {
  const bonusAmount = getNumber('bonusAmount');
  const playthroughMultiple = getNumber('playthroughMultiple');
  const bonusHouseEdge = getNumber('bonusHouseEdge');
  const currentBalance = getNumber('currentBalance');
  const redemptionMin = getNumber('redemptionMin');
  const bonusWagerCap = getNumber('bonusWagerCap');

  if (bonusAmount <= 0) {
    showResult(
      'bonusResult',
      '<div class="callout bad"><strong>Invalid input</strong> Bonus amount must be greater than $0.</div>',
      false
    );
    return;
  }

  if (playthroughMultiple < 0 || bonusHouseEdge < 0 || currentBalance < 0 || redemptionMin < 0 || bonusWagerCap < 0) {
    showResult(
      'bonusResult',
      '<div class="callout bad"><strong>Invalid input</strong> Values cannot be negative.</div>',
      false
    );
    return;
  }

  const playthroughRequired = bonusAmount * playthroughMultiple;
  const houseEdgeLoss = playthroughRequired * (bonusHouseEdge / 100);
  const netValue = bonusAmount - houseEdgeLoss;
  const balanceAfterClearing = currentBalance + netValue;
  const canRedeem = balanceAfterClearing >= redemptionMin;
  const shortfall = Math.max(0, redemptionMin - balanceAfterClearing);
  const roi = playthroughRequired > 0 ? (netValue / playthroughRequired) * 100 : 0;

  let recommendation = 'warn';
  let label = '⚠ Fair Value';
  let message = 'Low or uncertain value. Check terms, playthrough rules, max cashout, and eligible games before attempting.';

  if (netValue < 0) {
    recommendation = 'bad';
    label = '✗ Negative EV';
    message = 'Expected loss is higher than the bonus value at these inputs.';
  } else if (netValue > 0 && roi >= 1) {
    recommendation = 'good';
    label = '✓ Positive EV';
    message = 'Positive estimated promo value before variance. Still verify current terms and redemption rules.';
  }

  const resultHTML = `
    <div class="metric-grid">
      ${metric('Playthrough Required', formatCurrency(playthroughRequired))}
      ${metric('Expected House Edge Loss', formatCurrency(houseEdgeLoss))}
      ${metric('Net Bonus Value', formatCurrency(netValue))}
      ${metric('ROI', formatPercent(roi))}
      ${metric('Balance After Clearing', formatCurrency(balanceAfterClearing))}
      ${metric('Max Comfortable Wager', formatCurrency(bonusWagerCap))}
    </div>
    ${shortfall > 0 ? `<div class="callout warn"><strong>Shortfall</strong> You would need ${formatCurrency(shortfall)} more to reach the entered redemption minimum.</div>` : ''}
    <div class="callout ${recommendation}">
      ${recommendationLabel(recommendation, label)}
      ${message} ${canRedeem ? 'The estimated balance reaches the entered redemption minimum.' : 'The estimated balance does not reach the entered redemption minimum.'}
    </div>
  `;

  showResult('bonusResult', resultHTML, true);
}

function loadBonusExample() {
  setValue('bonusAmount', '25');
  setValue('playthroughMultiple', '1');
  setValue('bonusHouseEdge', '3');
  setValue('currentBalance', '0');
  setValue('redemptionMin', '50');
  setValue('bonusWagerCap', '1');
  calculateBonus();
}

// ============================================================================
// VIP CHASE COST CALCULATOR
// ============================================================================

function calculateVip() {
  const vipWagerNeeded = getNumber('vipWagerNeeded');
  const vipHouseEdge = getNumber('vipHouseEdge');
  const vipRewardRate = getNumber('vipRewardRate');
  const vipBonus = getNumber('vipBonus');

  if (vipWagerNeeded <= 0) {
    showResult(
      'vipResult',
      '<div class="callout bad"><strong>Invalid input</strong> Wager needed must be greater than $0.</div>',
      false
    );
    return;
  }

  if (vipHouseEdge < 0 || vipRewardRate < 0 || vipBonus < 0) {
    showResult(
      'vipResult',
      '<div class="callout bad"><strong>Invalid input</strong> Values cannot be negative.</div>',
      false
    );
    return;
  }

  const houseEdgeCost = vipWagerNeeded * (vipHouseEdge / 100);
  const rewardsEarned = vipWagerNeeded * (vipRewardRate / 100);
  const netCost = houseEdgeCost - rewardsEarned;
  const netValue = vipBonus - netCost;
  const roi = (netValue / vipWagerNeeded) * 100;

  let recommendation = 'warn';
  let label = '⚠ Consider Carefully';
  let message = 'The chase has a real expected cost. Only pursue it if the VIP benefits are worth that cost to you.';

  if (netValue < 0) {
    recommendation = 'bad';
    label = '✗ Not Recommended';
    message = 'The estimated chase cost exceeds the entered bonus/reward value.';
  } else if (netValue > 0) {
    recommendation = 'good';
    label = '✓ Positive Estimate';
    message = 'The entered rewards and bonus exceed the estimated house-edge cost.';
  }

  const resultHTML = `
    <div class="metric-grid">
      ${metric('Expected House Edge Cost', formatCurrency(houseEdgeCost))}
      ${metric('Rewards / Rakeback Earned', formatCurrency(rewardsEarned))}
      ${metric('Net Cost to Chase', formatCurrency(netCost))}
      ${metric('Level-Up Bonus Value', formatCurrency(vipBonus))}
      ${metric('Net Value', formatCurrency(netValue))}
      ${metric('ROI', formatPercent(roi))}
    </div>
    <div class="callout ${recommendation}">
      ${recommendationLabel(recommendation, label)}
      ${message}
    </div>
  `;

  showResult('vipResult', resultHTML, true);
}

// ============================================================================
// REDEMPTION PLANNER
// ============================================================================

function calculateRedemption() {
  const redeemBalance = getNumber('redeemBalance');
  const redeemMin = getNumber('redeemMin');
  const dailyClaim = getNumber('dailyClaim');
  const redeemEdge = getNumber('redeemEdge');

  if (redeemMin <= 0) {
    showResult(
      'redeemResult',
      '<div class="callout bad"><strong>Invalid input</strong> Redemption minimum must be greater than $0.</div>',
      false
    );
    return;
  }

  if (redeemBalance < 0 || dailyClaim < 0 || redeemEdge < 0) {
    showResult(
      'redeemResult',
      '<div class="callout bad"><strong>Invalid input</strong> Values cannot be negative.</div>',
      false
    );
    return;
  }

  const neededBalance = Math.max(0, redeemMin - redeemBalance);
  const daysNeeded = neededBalance > 0 && dailyClaim > 0 ? Math.ceil(neededBalance / dailyClaim) : 0;
  const totalClaimsNeeded = neededBalance;
  const estimatedCost = totalClaimsNeeded * (redeemEdge / 100);
  const alreadyEligible = neededBalance === 0;

  const resultHTML = `
    <div class="metric-grid">
      ${metric('Current Balance', formatCurrency(redeemBalance))}
      ${metric('Redemption Minimum', formatCurrency(redeemMin))}
      ${metric('Needed Balance', formatCurrency(neededBalance))}
      ${metric('Days to Target', `${daysNeeded}`)}
      ${metric('Total Claims Needed', formatCurrency(totalClaimsNeeded))}
      ${metric('Est. Clearing Cost', formatCurrency(estimatedCost))}
    </div>
    <div class="callout ${alreadyEligible ? 'good' : 'warn'}">
      <strong>${alreadyEligible ? '✓ Already at redemption minimum' : '⚠ Timeline Estimate'}</strong>
      ${
        alreadyEligible
          ? `You are already at or above the entered redemption minimum of ${formatCurrency(redeemMin)}.`
          : dailyClaim > 0
            ? `Approximately ${daysNeeded} day${daysNeeded === 1 ? '' : 's'} to reach ${formatCurrency(redeemMin)}, with an estimated ${formatCurrency(estimatedCost)} cost from house edge.`
            : 'Enter a daily claim amount above $0 to estimate the number of days needed.'
      }
    </div>
  `;

  showResult('redeemResult', resultHTML, true);
}

// ============================================================================
// DAILY CLAIM TRACKER
// ============================================================================

function initializeDailyTracker() {
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `${STORAGE_PREFIX}${today}`;
  const checkboxes = Array.from(document.querySelectorAll('[data-daily]'));
  const statusElement = document.getElementById('dailyStatus');

  let checkedItems = {};

  try {
    const savedData = localStorage.getItem(todayKey);
    checkedItems = savedData ? JSON.parse(savedData) : {};
  } catch {
    checkedItems = {};
  }

  function saveState() {
    try {
      localStorage.setItem(todayKey, JSON.stringify(checkedItems));
    } catch {
      // Storage unavailable; tracker still works until the page is refreshed.
    }
  }

  function updateStatus() {
    if (!statusElement) return;

    const checkedCount = checkboxes.filter((checkbox) => checkbox.checked).length;
    const totalCount = checkboxes.length;

    if (checkedCount === totalCount && totalCount > 0) {
      statusElement.className = 'callout good';
      statusElement.innerHTML = `<strong>✓ All set for today</strong> You've checked all daily tasks for today.`;
    } else if (checkedCount > 0) {
      statusElement.className = 'callout warn';
      statusElement.innerHTML = `<strong>${checkedCount}/${totalCount} complete</strong> Keep going — ${totalCount - checkedCount} left.`;
    } else {
      statusElement.className = 'callout';
      statusElement.innerHTML = `<strong>Start tracking</strong> Check off tasks as you complete them today.`;
    }
  }

  checkboxes.forEach((checkbox) => {
    const key = checkbox.dataset.daily;
    checkbox.checked = Boolean(checkedItems[key]);

    checkbox.addEventListener('change', () => {
      checkedItems[key] = checkbox.checked;
      saveState();
      updateStatus();
    });
  });

  updateStatus();
}

// ============================================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================================

function initializeScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

  if (!('IntersectionObserver' in window)) {
    revealElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  revealElements.forEach((element) => observer.observe(element));
}

// ============================================================================
// NAVIGATION ACTIVE STATE
// ============================================================================

function initializeNavigation() {
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const sections = Array.from(document.querySelectorAll('section[id]'));

  if (!('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const id = entry.target.id;
        navLinks.forEach((link) => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      });
    },
    { threshold: 0.45 }
  );

  sections.forEach((section) => observer.observe(section));
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('calcBonus')?.addEventListener('click', calculateBonus);
  document.getElementById('calcVip')?.addEventListener('click', calculateVip);
  document.getElementById('calcRedeem')?.addEventListener('click', calculateRedemption);
  document.querySelector('[data-example="bonus"]')?.addEventListener('click', loadBonusExample);

  initializeDailyTracker();
  initializeScrollReveal();
  initializeNavigation();

  calculateBonus();
  calculateVip();
  calculateRedemption();
});
