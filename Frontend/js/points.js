const STORAGE_KEY = "gunplaHubRewards";

const pointsBalance = document.getElementById("pointsBalance");
const tierText = document.getElementById("tierText");
const tierSubtext = document.getElementById("tierSubtext");
const tierProgress = document.getElementById("tierProgress");
const historyList = document.getElementById("historyList");

const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");

const pointsModal = document.getElementById("pointsModal");
const closeModal = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");

const testPurchaseBtn = document.getElementById("testPurchaseBtn");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const stores = [
  "Baguio Gunpla Station",
  "Mecha Corner Baguio",
  "Runner Gate Hobby",
  "North Build Station"
];

function getRewardsData() {
  const savedData = localStorage.getItem(STORAGE_KEY);

  if (!savedData) {
    return {
      transactions: [],
      scannedReceipts: []
    };
  }

  try {
    const parsedData = JSON.parse(savedData);

    return {
      transactions: Array.isArray(parsedData.transactions)
        ? parsedData.transactions
        : [],
      scannedReceipts: Array.isArray(parsedData.scannedReceipts)
        ? parsedData.scannedReceipts
        : []
    };
  } catch {
    return {
      transactions: [],
      scannedReceipts: []
    };
  }
}

function saveRewardsData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function calculatePoints(amount) {
  return Math.floor(Number(amount) / 10);
}

function calculateTotalPoints(transactions) {
  return transactions.reduce((total, transaction) => {
    return total + Number(transaction.points);
  }, 0);
}

function getTierInfo(points) {
  if (points >= 1500) {
    return {
      tier: "Gold Tier",
      nextTier: "Max Tier",
      pointsToNext: 0,
      progress: 100
    };
  }

  if (points >= 750) {
    return {
      tier: "Silver Tier",
      nextTier: "Gold",
      pointsToNext: 1500 - points,
      progress: ((points - 750) / 750) * 100
    };
  }

  return {
    tier: "Bronze Tier",
    nextTier: "Silver",
    pointsToNext: 750 - points,
    progress: (points / 750) * 100
  };
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return date.toLocaleDateString("en-GB");
}

function renderPointsPage() {
  const rewardsData = getRewardsData();
  const transactions = rewardsData.transactions;
  const totalPoints = calculateTotalPoints(transactions);
  const tierInfo = getTierInfo(totalPoints);

  pointsBalance.textContent = totalPoints.toLocaleString();
  tierText.textContent = tierInfo.tier;
  tierSubtext.textContent =
    tierInfo.pointsToNext === 0
      ? "Highest tier reached"
      : `${tierInfo.pointsToNext.toLocaleString()} pts to ${tierInfo.nextTier}`;

  tierProgress.style.width = `${Math.min(tierInfo.progress, 100)}%`;

  renderHistory(transactions);
}

function renderHistory(transactions) {
  if (transactions.length === 0) {
    historyList.innerHTML = `
      <div class="empty-state">
        <h3>No points yet</h3>
        <p>Scan a receipt QR or add a test purchase to check the system.</p>
        <a href="scanqr.html">Scan QR Now</a>
      </div>
    `;
    return;
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  historyList.innerHTML = sortedTransactions
    .map((transaction) => {
      const isRedemption = Number(transaction.points) < 0;
      const pointsText = isRedemption
        ? `${transaction.points} pts`
        : `+${transaction.points} pts`;

      const title = isRedemption
        ? `${transaction.receiptId} - ${transaction.rewardTitle || "Reward Redemption"}`
        : `${transaction.receiptId} - ${transaction.store}`;

      const subtitle = isRedemption
        ? `Redeemed at ${transaction.store}`
        : `Purchase: ₱${Number(transaction.amount).toLocaleString()}.00`;

      return `
        <article class="history-card">
          <div class="history-icon">${isRedemption ? "🎁" : "↗"}</div>

          <div class="history-info">
            <h3>${title}</h3>
            <p>${formatDate(transaction.date)}</p>
            <small>${subtitle}</small>
          </div>

          <div class="points-earned ${isRedemption ? "negative" : ""}">
            ${pointsText}
          </div>
        </article>
      `;
    })
    .join("");
}

function addTransaction({ receiptId, store, amount }) {
  const rewardsData = getRewardsData();

  if (rewardsData.scannedReceipts.includes(receiptId)) {
    openModal(
      "Duplicate Receipt",
      "This receipt has already been scanned. Points cannot be claimed twice."
    );
    return;
  }

  const points = calculatePoints(amount);

  const transaction = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `TX-${Date.now()}`,
    receiptId,
    store,
    amount: Number(amount),
    points,
    date: new Date().toISOString()
  };

  rewardsData.transactions.push(transaction);
  rewardsData.scannedReceipts.push(receiptId);

  saveRewardsData(rewardsData);
  renderPointsPage();

  openModal(
    "Points Added",
    `You earned ${points} points from a ₱${Number(amount).toLocaleString()}.00 purchase.`
  );
}

function openTestPurchaseModal() {
  modalContent.innerHTML = `
    <div class="modal-content">
      <h2>Add Test Purchase</h2>
      <p>This is for testing your frontend points system.</p>

      <form class="modal-form" id="testPurchaseForm">
        <label for="testStore">Store</label>
        <select id="testStore" required>
          ${stores.map((store) => `<option value="${store}">${store}</option>`).join("")}
        </select>

        <label for="testAmount">Purchase Amount</label>
        <input
          id="testAmount"
          type="number"
          min="10"
          step="10"
          value="3650"
          required
        />

        <button class="modal-btn red" type="submit">Add Purchase</button>
      </form>
    </div>
  `;

  pointsModal.classList.add("active");

  document.getElementById("testPurchaseForm").addEventListener("submit", (event) => {
    event.preventDefault();

    const store = document.getElementById("testStore").value;
    const amount = Number(document.getElementById("testAmount").value);
    const receiptId = `Receipt #${Date.now().toString().slice(-5)}`;

    closePointsModal();

    addTransaction({
      receiptId,
      store,
      amount
    });
  });
}

function clearHistory() {
  const confirmed = confirm("Clear all test points and receipt history?");

  if (!confirmed) {
    return;
  }

  localStorage.removeItem(STORAGE_KEY);
  renderPointsPage();

  openModal("History Cleared", "All local test data has been removed.");
}

function openModal(title, message) {
  modalContent.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="modal-btn" id="doneBtn">Done</button>
    </div>
  `;

  pointsModal.classList.add("active");

  document.getElementById("doneBtn").addEventListener("click", closePointsModal);
}

function closePointsModal() {
  pointsModal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

function initializePointsPage() {
  renderPointsPage();

  testPurchaseBtn.addEventListener("click", openTestPurchaseModal);
  clearHistoryBtn.addEventListener("click", clearHistory);

  closeModal.addEventListener("click", closePointsModal);

  pointsModal.addEventListener("click", (event) => {
    if (event.target === pointsModal) {
      closePointsModal();
    }
  });

  buyerBtn.addEventListener("click", () => toggleRole("buyer"));
  sellerBtn.addEventListener("click", () => toggleRole("seller"));

  profileBtn.addEventListener("click", () => {
    alert("Profile page coming soon.");
  });
}

initializePointsPage();