const STORAGE_KEY = "gunplaHubRewards";

const canvas = document.getElementById("qrCanvas");
const ctx = canvas.getContext("2d");

const generateQrBtn = document.getElementById("generateQrBtn");
const scanQrBtn = document.getElementById("scanQrBtn");
const downloadQrBtn = document.getElementById("downloadQrBtn");

const receiptIdElement = document.getElementById("receiptId");
const storeNameElement = document.getElementById("storeName");
const purchaseAmountElement = document.getElementById("purchaseAmount");
const rewardPointsElement = document.getElementById("rewardPoints");
const qrStatusElement = document.getElementById("qrStatus");
const pointsFill = document.getElementById("pointsFill");
const pointsPercent = document.getElementById("pointsPercent");

const modal = document.getElementById("scanModal");
const closeModal = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");

const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");
const scannerIcon = document.getElementById("scannerIcon");

const qrSize = 29;
const cellSize = canvas.width / qrSize;

const stores = [
  "Baguio Gunpla Station",
  "Mecha Corner Baguio",
  "Runner Gate Hobby",
  "North Build Station"
];

let currentReceipt = {
  id: "GH-000000",
  store: "Baguio Gunpla Station",
  amount: 0,
  points: 0,
  scanned: false
};

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

function createRandomReceipt() {
  const receiptNumber = Math.floor(100000 + Math.random() * 900000);
  const store = stores[Math.floor(Math.random() * stores.length)];
  const amount = Math.floor(Math.random() * 4500) + 500;
  const points = calculatePoints(amount);

  currentReceipt = {
    id: `Receipt #${receiptNumber}`,
    store,
    amount,
    points,
    scanned: false
  };

  updateReceiptUI();
}

function updateReceiptUI() {
  receiptIdElement.textContent = currentReceipt.id;
  storeNameElement.textContent = currentReceipt.store;
  purchaseAmountElement.textContent = `₱${currentReceipt.amount.toLocaleString()}.00`;
  rewardPointsElement.textContent = `${currentReceipt.points} pts`;

  if (currentReceipt.scanned) {
    qrStatusElement.textContent = "Scanned";
    qrStatusElement.classList.remove("status-pending");
    qrStatusElement.classList.add("status-success");
  } else {
    qrStatusElement.textContent = "Ready to Scan";
    qrStatusElement.classList.add("status-pending");
    qrStatusElement.classList.remove("status-success");
  }

  const progress = currentReceipt.scanned
    ? Math.min(Math.round((currentReceipt.points / 500) * 100), 100)
    : 0;

  pointsFill.style.width = `${progress}%`;
  pointsPercent.textContent = `${progress}%`;
}

function seededRandom(seedText) {
  let seed = 0;

  for (let i = 0; i < seedText.length; i++) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }

  return function random() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function drawFinderPattern(startX, startY) {
  ctx.fillStyle = "#000000";
  ctx.fillRect(startX * cellSize, startY * cellSize, 7 * cellSize, 7 * cellSize);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect((startX + 1) * cellSize, (startY + 1) * cellSize, 5 * cellSize, 5 * cellSize);

  ctx.fillStyle = "#000000";
  ctx.fillRect((startX + 2) * cellSize, (startY + 2) * cellSize, 3 * cellSize, 3 * cellSize);
}

function isInFinderArea(x, y) {
  const topLeft = x < 8 && y < 8;
  const topRight = x >= qrSize - 8 && y < 8;
  const bottomLeft = x < 8 && y >= qrSize - 8;

  return topLeft || topRight || bottomLeft;
}

function drawCenterLogo() {
  const logoSize = 58;
  const logoX = canvas.width / 2 - logoSize / 2;
  const logoY = canvas.height / 2 - logoSize / 2;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(logoX - 8, logoY - 8, logoSize + 16, logoSize + 16);

  ctx.fillStyle = "#ff1010";
  ctx.fillRect(logoX, logoY, logoSize, logoSize);

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 18px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("GH", canvas.width / 2, canvas.height / 2);
}

function drawGenericQrPattern() {
  const random = seededRandom(
    `${currentReceipt.id}-${currentReceipt.store}-${currentReceipt.amount}`
  );

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawFinderPattern(1, 1);
  drawFinderPattern(qrSize - 8, 1);
  drawFinderPattern(1, qrSize - 8);

  for (let y = 0; y < qrSize; y++) {
    for (let x = 0; x < qrSize; x++) {
      if (isInFinderArea(x, y)) {
        continue;
      }

      const shouldFill =
        random() > 0.57 ||
        (x % 5 === 0 && random() > 0.45) ||
        (y % 7 === 0 && random() > 0.5);

      if (shouldFill) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(
          Math.floor(x * cellSize),
          Math.floor(y * cellSize),
          Math.ceil(cellSize),
          Math.ceil(cellSize)
        );
      }
    }
  }

  drawCenterLogo();
}

function generateNewQr() {
  createRandomReceipt();
  drawGenericQrPattern();

  openModal(
    "QR Generated",
    `A receipt QR was generated for ${currentReceipt.id}.`
  );
}

function saveScannedReceipt() {
  const rewardsData = getRewardsData();

  if (rewardsData.scannedReceipts.includes(currentReceipt.id)) {
    openModal(
      "Already Scanned",
      "This receipt has already been scanned. Points cannot be claimed twice."
    );
    return false;
  }

  const transaction = {
    id: crypto.randomUUID
      ? crypto.randomUUID()
      : `TX-${Date.now()}`,
    receiptId: currentReceipt.id,
    store: currentReceipt.store,
    amount: currentReceipt.amount,
    points: currentReceipt.points,
    date: new Date().toISOString()
  };

  rewardsData.transactions.push(transaction);
  rewardsData.scannedReceipts.push(currentReceipt.id);

  saveRewardsData(rewardsData);

  return true;
}

function scanQr() {
  if (currentReceipt.scanned) {
    openModal(
      "Already Scanned",
      "This receipt was already scanned in this session."
    );
    return;
  }

  const saved = saveScannedReceipt();

  if (!saved) {
    return;
  }

  currentReceipt.scanned = true;
  updateReceiptUI();

  openModal(
    "QR Scanned",
    `You earned ${currentReceipt.points} points from a ₱${currentReceipt.amount.toLocaleString()}.00 purchase.`
  );
}

function downloadQr() {
  const link = document.createElement("a");

  link.download = `${currentReceipt.id.replaceAll(" ", "-")}-qr.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function openModal(title, message) {
  modalContent.innerHTML = `
    <div class="modal-content">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="modal-btn" id="doneBtn">Done</button>
    </div>
  `;

  modal.classList.add("active");

  document.getElementById("doneBtn").addEventListener("click", closeScanModal);
}

function closeScanModal() {
  modal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

function initializeScanPage() {
  createRandomReceipt();
  drawGenericQrPattern();

  generateQrBtn.addEventListener("click", generateNewQr);
  scannerIcon.addEventListener("click", generateNewQr);
  scanQrBtn.addEventListener("click", scanQr);
  downloadQrBtn.addEventListener("click", downloadQr);

  closeModal.addEventListener("click", closeScanModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeScanModal();
    }
  });

  buyerBtn.addEventListener("click", () => toggleRole("buyer"));
  sellerBtn.addEventListener("click", () => toggleRole("seller"));

  profileBtn.addEventListener("click", () => {
    alert("Profile page coming soon.");
  });
}

initializeScanPage();