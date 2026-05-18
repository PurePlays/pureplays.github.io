/**
 * PurePlays Dashboard - Interactive Calculators & Tracker
 * Bonus EV, VIP Chase Cost, Redemption Planning, and Daily Claim Tracking
 */

// Utility: Format currency
function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Utility: Format percentage
function formatPercent(value) {
  return value.toFixed(2) + '%';
}

// ============================================================================
// BONUS EV CALCULATOR
// ============================================================================

document.getElementById('calcBonus').addEventListener('click', calculateBonus);

function calculateBonus() {
  const bonusAmount = parseFloat(document.getElementById('bonusAmount').value) || 0;
  const playthroughMultiple = parseFloat(document.getElementById('playthroughMultiple').value) || 0;
  const bonusHouseEdge = parseFloat(document.getElementById('bonusHouseEdge').value) || 0;
  const currentBalance = parseFloat(document.getElementById('currentBalance').value) || 0;
  const redemptionMin = parseFloat(document.getElementById('redemptionMin').value) || 0;
  const bonusWagerCap = parseFloat(document.getElementById('bonusWagerCap').value) || 0;

  // Validation
  if (bonusAmount <= 0) {
    showResult('bonusResult', '<div class="callout bad"><strong>Invalid Input</strong> Bonus amount must be greater than 0.</div>', false);
    return;
  }

  // Calculate playthrough requirement
  const playthroughRequired = bonusAmount * playthroughMultiple;
  
  // Calculate expected loss from house edge
  const houseEdgeLoss = playthroughRequired * (bonusHouseEdge / 100);
  
  // Net value after playthrough
  const netValue = bonusAmount - houseEdgeLoss;
  
  // Balance after bonus clearing
  const balanceAfterClearing = currentBalance + netValue;
  
  // Check if reachable for redemption
  const canRedeem = balanceAfterClearing >= redemptionMin;
  const shortfall = Math.max(0, redemptionMin - balanceAfterClearing);

  // ROI calculation
  const roi = playthroughRequired > 0 ? ((netValue / playthroughRequired) * 100) : 0;

  // Recommendation
  let recommendation = 'warn';
  let message = '';
  
  if (roi < -50) {
    recommendation = 'bad';
    message = 'This bonus is unlikely to be worth clearing. High house edge relative to playthrough.';
  } else if (roi < 0) {
    recommendation = 'warn';
    message = 'Negative EV. Only attempt if you plan to play anyway for entertainment.';
  } else if (roi >= 0 && roi < 10) {
    recommendation = 'warn';
    message = 'Low positive value. Consider your bankroll and entertainment preference.';
  } else {
    recommendation = 'good';
    message = 'Positive EV bonus. Worth considering if you meet the conditions.';
  }

  // Build result HTML
  const resultHTML = `
    <div class="metric-grid">
      <div class="metric">
        <span>Playthrough Required</span>
        <strong>${formatCurrency(playthroughRequired)}</strong>
      </div>
      <div class="metric">
        <span>Expected House Edge Loss</span>
        <strong>${formatCurrency(houseEdgeLoss)}</strong>
      </div>
      <div class="metric">
        <span>Net Bonus Value</span>
        <strong>${formatCurrency(netValue)}</strong>
      </div>
      <div class="metric">
        <span>ROI</span>
        <strong>${formatPercent(roi)}</strong>
      </div>
      <div class="metric">
        <span>Balance After Clearing</span>
        <strong>${formatCurrency(balanceAfterClearing)}</strong>
      </div>
      <div class="metric">
        <span>Redemption Eligible?</span>
        <strong>${canRedeem ? '✓ Yes' : '✗ No'}</strong>
      </div>
    </div>
    ${shortfall > 0 ? `<div class="callout warn"><strong>Shortfall</strong> You'd need ${formatCurrency(shortfall)} more to reach redemption minimum.</div>` : ''}
    <div class="callout ${recommendation}">
      <strong>${recommendation === 'good' ? '✓ Good EV' : recommendation === 'warn' ? '⚠ Fair Value' : '✗ Poor Value'}</strong>
      ${message}
    </div>
  `;

  showResult('bonusResult', resultHTML, true);
}

// Load bonus example
document.querySelector('[data-example="bonus"]').addEventListener('click', () => {
  document.getElementById('bonusAmount').value = '50';
  document.getElementById('playthroughMultiple').value = '25';
  document.getElementById('bonusHouseEdge').value = '2.5';
  document.getElementById('currentBalance').value = '100';
  document.getElementById('redemptionMin').value = '500';
  calculateBonus();
});

// Reset bonus form
document.getElementById('calcBonus').closest('.tool').addEventListener('reset', function() {
  setTimeout(() => {
    clearFormErrors(this);
    document.getElementById('bonusResult').innerHTML = '';
  }, 0);
});

// ============================================================================
// VIP CHASE COST CALCULATOR
// ============================================================================

document.getElementById('calcVip').addEventListener('click', calculateVip);

function calculateVip() {
  const vipWagerNeeded = parseFloat(document.getElementById('vipWagerNeeded').value) || 0;
  const vipHouseEdge = parseFloat(document.getElementById('vipHouseEdge').value) || 0;
  const vipRewardRate = parseFloat(document.getElementById('vipRewardRate').value) || 0;
  const vipBonus = parseFloat(document.getElementById('vipBonus').value) || 0;

  // Validation
  if (vipWagerNeeded <= 0) {
    showResult('vipResult', '<div class="callout bad"><strong>Invalid Input</strong> Wager needed must be greater than 0.</div>', false);
    return;
  }

  // Calculate costs and rewards
  const houseEdgeCost = vipWagerNeeded * (vipHouseEdge / 100);
  const rewardsEarned = vipWagerNeeded * (vipRewardRate / 100);
  const netCost = houseEdgeCost - rewardsEarned;
  const netValue = vipBonus - netCost;

  // Calculate ROI
  const roi = vipWagerNeeded > 0 ? ((netValue / vipWagerNeeded) * 100) : 0;

  // Recommendation
  let recommendation = 'warn';
  let message = '';

  if (netCost > vipBonus) {
    recommendation = 'bad';
    message = 'The cost to chase this level exceeds the bonus value. Not recommended.';
  } else if (netCost > 0) {
    recommendation = 'warn';
    message = 'You will lose money to reach this level. Only pursue if the VIP perks are valuable.';
  } else {
    recommendation = 'good';
    message = 'Positive or break-even chase. Worth pursuing for the VIP benefits.';
  }

  // Build result HTML
  const resultHTML = `
    <div class="metric-grid">
      <div class="metric">
        <span>Expected House Edge Cost</span>
        <strong>${formatCurrency(houseEdgeCost)}</strong>
      </div>
      <div class="metric">
        <span>Rewards / Rakeback Earned</span>
        <strong>${formatCurrency(rewardsEarned)}</strong>
      </div>
      <div class="metric">
        <span>Net Cost to Chase</span>
        <strong>${formatCurrency(netCost)}</strong>
      </div>
      <div class="metric">
        <span>Level-Up Bonus Value</span>
        <strong>${formatCurrency(vipBonus)}</strong>
      </div>
      <div class="metric">
        <span>Net Value (Bonus - Cost)</span>
        <strong>${formatCurrency(netValue)}</strong>
      </div>
      <div class="metric">
        <span>ROI</span>
        <strong>${formatPercent(roi)}</strong>
      </div>
    </div>
    <div class="callout ${recommendation}">
      <strong>${recommendation === 'good' ? '✓ Good Chase' : recommendation === 'warn' ? '⚠ Consider Carefully' : '✗ Not Recommended'}</strong>
      ${message}
    </div>
  `;

  showResult('vipResult', resultHTML, true);
}

// Reset VIP form
document.getElementById('calcVip').closest('.tool').addEventListener('reset', function() {
  setTimeout(() => {
    clearFormErrors(this);
    document.getElementById('vipResult').innerHTML = '';
  }, 0);
});

// ============================================================================
// REDEMPTION PLANNER
// ============================================================================

document.getElementById('calcRedeem').addEventListener('click', calculateRedemption);

function calculateRedemption() {
  const redeemBalance = parseFloat(document.getElementById('redeemBalance').value) || 0;
  const redeemMin = parseFloat(document.getElementById('redeemMin').value) || 0;
  const dailyClaim = parseFloat(document.getElementById('dailyClaim').value) || 0;
  const redeemEdge = parseFloat(document.getElementById('redeemEdge').value) || 0;

  // Validation
  if (redeemMin <= 0) {
    showResult('redeemResult', '<div class="callout bad"><strong>Invalid Input</strong> Redemption minimum must be greater than 0.</div>', false);
    return;
  }

  // Calculate redemption timeline - fixes negative value issue
  const neededBalance = Math.max(0, redeemMin - redeemBalance);
  const daysNeeded = neededBalance > 0 && dailyClaim > 0 ? Math.ceil(neededBalance / dailyClaim) : 0;
  const totalClaimsNeeded = neededBalance;
  const estimatedCost = totalClaimsNeeded * (redeemEdge / 100);

  const alreadyEligible = neededBalance === 0;

  // Build result HTML
  const resultHTML = `
    <div class="metric-grid">
      <div class="metric">
        <span>Current Balance</span>
        <strong>${formatCurrency(redeemBalance)}</strong>
      </div>
      <div class="metric">
        <span>Redemption Minimum</span>
        <strong>${formatCurrency(redeemMin)}</strong>
      </div>
      <div class="metric">
        <span>Needed Balance</span>
        <strong>${formatCurrency(neededBalance)}</strong>
      </div>
      <div class="metric">
        <span>Days to Target</span>
        <strong>${daysNeeded > 0 ? daysNeeded : '0'}</strong>
      </div>
      <div class="metric">
        <span>Total Claims Needed</span>
        <strong>${totalClaimsNeeded.toFixed(2)}</strong>
      </div>
      <div class="metric">
        <span>Est. Clearing Cost</span>
        <strong>${formatCurrency(estimatedCost)}</strong>
      </div>
    </div>
    <div class="callout ${alreadyEligible ? 'good' : 'warn'}">
      <strong>${alreadyEligible ? '✓ Already at redemption minimum' : '⚠ Timeline Estimate'}</strong>
      ${
        alreadyEligible
          ? `You are already at or above the entered redemption minimum of ${formatCurrency(redeemMin)}.`
          : `Approximately ${daysNeeded} days to reach ${formatCurrency(redeemMin)}, with an estimated ${formatCurrency(estimatedCost)} cost from house edge.`
      }
    </div>
  `;

  showResult('redeemResult', resultHTML, true);
}

// Reset redemption form
document.getElementById('calcRedeem').closest('.tool').addEventListener('reset', function() {
  setTimeout(() => {
    clearFormErrors(this);
    document.getElementById('redeemResult').innerHTML = '';
  }, 0);
});

// ============================================================================
// RESULT DISPLAY HELPER
// ============================================================================

function showResult(elementId, html, isSuccess) {
  const resultEl = document.getElementById(elementId);
  resultEl.innerHTML = html;
  resultEl.classList.toggle('error', !isSuccess);
}

function clearFormErrors(form) {
  form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
  form.querySelectorAll('.error-message').forEach((el) => {
    el.textContent = '';
  });
}

// ============================================================================
// DAILY CLAIM TRACKER
// ============================================================================

function initializeDailyTracker() {
  const today = new Date().toISOString().split('T')[0];
  const todayKey = `dailyTracker_${today}`;

  let checkedItems = {};

  // Load from localStorage with error handling (fixes browser storage issues)
  try {
    const savedData = localStorage.getItem(todayKey);
    checkedItems = savedData ? JSON.parse(savedData) : {};
  } catch {
    checkedItems = {};
  }

  // Get all checkboxes
  const checkboxes = document.querySelectorAll('[data-daily]');
  const statusEl = document.getElementById('dailyStatus');

  // Restore state
  checkboxes.forEach((checkbox) => {
    const key = checkbox.dataset.daily;
    if (checkedItems[key]) {
      checkbox.checked = true;
    }

    // Listen for changes
    checkbox.addEventListener('change', () => {
      checkedItems[key] = checkbox.checked;

      // Save to localStorage with error handling
      try {
        localStorage.setItem(todayKey, JSON.stringify(checkedItems));
      } catch {
        // Storage unavailable; tracker still works for this session.
      }

      updateStatus();
    });
  });

  function updateStatus() {
    const checkedCount = Object.values(checkedItems).filter(Boolean).length;
    const totalCount = checkboxes.length;
    const allChecked = checkedCount === totalCount;

    if (allChecked) {
      statusEl.className = 'callout good';
      statusEl.innerHTML = `<strong>✓ All set for today!</strong> You've checked all daily tasks. Great discipline.`;
    } else if (checkedCount > 0) {
      statusEl.className = 'callout warn';
      statusEl.innerHTML = `<strong>${checkedCount}/${totalCount} Complete</strong> Keep going—${totalCount - checkedCount} to go.`;
    } else {
      statusEl.className = 'callout';
      statusEl.innerHTML = `<strong>Start tracking</strong> Check off tasks as you complete them today.`;
    }
  }

  updateStatus();
}

// ============================================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================================

function initializeScrollReveal() {
  const revealElements = document.querySelectorAll('.reveal');

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

  revealElements.forEach((el) => observer.observe(el));
}

// ============================================================================
// NAVIGATION ACTIVE STATE
// ============================================================================

function initializeNavigation() {
  const navLinks = document.querySelectorAll('nav a');
  const sections = document.querySelectorAll('section');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navLinks.forEach((link) => {
            link.style.color = link.getAttribute('href') === `#${id}` ? 'var(--text)' : 'var(--soft)';
            link.style.borderColor = link.getAttribute('href') === `#${id}` ? 'var(--line)' : 'transparent';
          });
        }
      });
    },
    { threshold: 0.5 }
  );

  sections.forEach((section) => observer.observe(section));

  // Smooth scroll behavior handled by CSS (scroll-behavior: smooth)
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  initializeDailyTracker();
  initializeScrollReveal();
  initializeNavigation();
});
