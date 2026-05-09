const features = [
  {
    side: "left",
    title: "Digital Receipts with QR",
    color: "red",
    text: "Scan QR codes from receipts to earn points. One-time use with 24-hour expiry keeps rewards fair."
  },
  {
    side: "left",
    title: "Loyalty Points System",
    color: "blue",
    text: "Earn 1 point for every 10 spent. Redeem points for vouchers, discounts, and exclusive freebies."
  },
  {
    side: "left",
    title: "Store Discovery",
    color: "yellow",
    text: "Find Gunpla stores across Baguio City. Filter by barangay, product category, and availability."
  },
  {
    side: "right",
    title: "Events & Community",
    color: "yellow",
    text: "Join build nights, workshops, and competitions. Connect with fellow builders and improve your skills."
  },
  {
    side: "right",
    title: "Analytics for Sellers",
    color: "blue",
    text: "Store owners get insights on sales trends, top products, customer behavior, and redemption rates."
  },
  {
    side: "right",
    title: "Product Requests",
    color: "red",
    text: "Looking for a specific kit? Request it from stores and get notified when it becomes available."
  }
];

const stores = [
  {
    name: "Mecha Corner Baguio",
    location: "Session Road",
    categories: ["HG", "RG", "Tools"],
    points: 240
  },
  {
    name: "Plastic Model Base",
    location: "Bonifacio Street",
    categories: ["MG", "HG", "Paint"],
    points: 390
  },
  {
    name: "Runner Gate Hobby",
    location: "Mines View",
    categories: ["RG", "Tools", "Paint"],
    points: 180
  },
  {
    name: "North Build Station",
    location: "Trancoville",
    categories: ["HG", "MG"],
    points: 310
  },
  {
    name: "Snap Fit Garage",
    location: "Aurora Hill",
    categories: ["Tools", "Paint"],
    points: 125
  },
  {
    name: "Red Frame Collectibles",
    location: "Bakakeng",
    categories: ["MG", "RG", "HG"],
    points: 500
  }
];

function renderFeatures() {
  const leftFeatures = document.getElementById("leftFeatures");
  const rightFeatures = document.getElementById("rightFeatures");

  if (!leftFeatures || !rightFeatures) return;

  leftFeatures.innerHTML = "";
  rightFeatures.innerHTML = "";

  features.forEach((feature) => {
    const card = document.createElement("article");
    card.className = "feature-card";

    card.innerHTML = `
      <h3 class="${feature.color}-text">${feature.title}</h3>
      <p>${feature.text}</p>
    `;

    if (feature.side === "left") {
      leftFeatures.appendChild(card);
    } else {
      rightFeatures.appendChild(card);
    }
  });
}

function renderStores() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const storeGrid = document.getElementById("storeGrid");

  if (!searchInput || !categoryFilter || !storeGrid) return;

  const query = searchInput.value.toLowerCase().trim();
  const selectedCategory = categoryFilter.value;

  const filteredStores = stores.filter((store) => {
    const matchesSearch =
      store.name.toLowerCase().includes(query) ||
      store.location.toLowerCase().includes(query);

    const matchesCategory =
      selectedCategory === "all" ||
      store.categories.includes(selectedCategory);

    return matchesSearch && matchesCategory;
  });

  storeGrid.innerHTML = "";

  if (filteredStores.length === 0) {
    storeGrid.innerHTML = `
      <div class="store-card">
        <h3>No stores found</h3>
        <p>Try searching another store name, location, or category.</p>
      </div>
    `;
    return;
  }

  filteredStores.forEach((store) => {
    const card = document.createElement("article");
    card.className = "store-card";

    card.innerHTML = `
      <h3>${store.name}</h3>
      <p>${store.location}</p>

      <div class="badge-row">
        ${store.categories.map((category) => `<span class="badge">${category}</span>`).join("")}
      </div>

      <button class="btn btn-blue" data-store="${store.name}">View Store</button>
    `;

    storeGrid.appendChild(card);
  });

  document.querySelectorAll("[data-store]").forEach((button) => {
    button.addEventListener("click", () => {
      const selectedStore = stores.find((store) => store.name === button.dataset.store);
      openStoreModal(selectedStore);
    });
  });
}

function openModal(type) {
  const modal = document.getElementById("appModal");
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent) return;

  if (type === "signup") {
    modalContent.innerHTML = `
      <h2>Create Account</h2>
      <p>Join Gunpla Hub and start earning rewards from your favorite local stores.</p>

      <input class="search-input" id="modalName" type="text" placeholder="Full name" style="width:100%; margin-bottom:12px;">
      <input class="search-input" id="modalEmail" type="email" placeholder="Email address" style="width:100%; margin-bottom:12px;">
      <input class="search-input" id="modalPassword" type="password" placeholder="Password" style="width:100%; margin-bottom:16px;">

      <button class="btn btn-yellow" id="signupSubmitBtn">Create Account</button>
    `;

    modal.classList.add("active");

    document.getElementById("signupSubmitBtn").addEventListener("click", () => {
      showSuccess("Account created successfully!");
    });

    return;
  }

  if (type === "qr") {
    modalContent.innerHTML = `
      <h2>Scan Receipt QR</h2>
      <p>Use this mock QR receipt scanner demo to earn loyalty points.</p>

      <div class="qr-box"></div>

      <button class="btn btn-blue" id="scanReceiptBtn">Scan Receipt</button>

      <div class="points-meter">
        <div class="points-fill" id="pointsFill"></div>
      </div>

      <p id="pointsText">Current points: 0</p>
    `;

    modal.classList.add("active");

    document.getElementById("scanReceiptBtn").addEventListener("click", earnPoints);
  }
}

function openStoreModal(store) {
  const modal = document.getElementById("appModal");
  const modalContent = document.getElementById("modalContent");

  if (!modal || !modalContent || !store) return;

  modalContent.innerHTML = `
    <h2>${store.name}</h2>

    <p>
      Location: <strong>${store.location}</strong><br>
      Available categories: <strong>${store.categories.join(", ")}</strong>
    </p>

    <div class="points-meter">
      <div class="points-fill" style="width:${Math.min(store.points / 5, 100)}%"></div>
    </div>

    <p>You can earn up to <strong>${store.points}</strong> reward points from current promos.</p>

    <button class="btn btn-yellow" id="requestProductBtn">
      Request Product
    </button>
  `;

  modal.classList.add("active");

  document.getElementById("requestProductBtn").addEventListener("click", () => {
    showSuccess(`Product request sent to ${store.name}!`);
  });
}

function showSuccess(message) {
  const modalContent = document.getElementById("modalContent");

  if (!modalContent) return;

  modalContent.innerHTML = `
    <h2 class="blue-text">Success</h2>
    <p>${message}</p>
    <button class="btn btn-light" id="successCloseBtn">Close</button>
  `;

  document.getElementById("successCloseBtn").addEventListener("click", closeAppModal);
}

function earnPoints() {
  const earnedPoints = Math.floor(Math.random() * 180) + 80;
  const fill = document.getElementById("pointsFill");
  const text = document.getElementById("pointsText");

  if (!fill || !text) return;

  fill.style.width = `${Math.min(earnedPoints / 3, 100)}%`;
  text.textContent = `Current points: ${earnedPoints}`;
}

function closeAppModal() {
  const modal = document.getElementById("appModal");

  if (!modal) return;

  modal.classList.remove("active");
}

function revealCardsOnScroll() {
  const cards = document.querySelectorAll(".feature-card");

  cards.forEach((card) => {
    const rect = card.getBoundingClientRect();
    const isVisible = rect.top < window.innerHeight - 80;

    if (isVisible) {
      card.classList.add("show");
    }
  });
}

function setAuthMode(mode) {
  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const switchAuthMode = document.getElementById("switchAuthMode");
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  if (
    !authTitle ||
    !authSubtitle ||
    !switchAuthMode ||
    !loginTab ||
    !registerTab ||
    !loginForm ||
    !registerForm
  ) {
    return;
  }

  const isLogin = mode === "login";

  authTitle.textContent = isLogin ? "WELCOME BACK!" : "CREATE ACCOUNT";
  authSubtitle.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
  switchAuthMode.textContent = isLogin ? "Sign Up" : "Login";

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("active", isLogin);
  registerForm.classList.toggle("active", !isLogin);

  if (authMessage) {
    authMessage.textContent = "";
  }
}

function initializeLandingPage() {
  const searchInput = document.getElementById("searchInput");
  const categoryFilter = document.getElementById("categoryFilter");
  const discoverBtn = document.getElementById("discoverBtn");
  const closeModal = document.getElementById("closeModal");
  const modal = document.getElementById("appModal");

  renderFeatures();
  renderStores();
  revealCardsOnScroll();

  document.querySelectorAll("[data-modal]").forEach((button) => {
    button.addEventListener("click", () => {
      openModal(button.dataset.modal);
    });
  });

  if (closeModal) {
    closeModal.addEventListener("click", closeAppModal);
  }

  if (modal) {
    modal.addEventListener("click", (event) => {
      if (event.target === modal) {
        closeAppModal();
      }
    });
  }

  if (discoverBtn) {
    discoverBtn.addEventListener("click", () => {
      document.getElementById("stores").scrollIntoView({
        behavior: "smooth"
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener("input", renderStores);
  }

  if (categoryFilter) {
    categoryFilter.addEventListener("change", renderStores);
  }

  window.addEventListener("scroll", revealCardsOnScroll);
}

function initializeAuthPage() {
  const loginTab = document.getElementById("loginTab");
  const registerTab = document.getElementById("registerTab");
  const switchAuthMode = document.getElementById("switchAuthMode");
  const openRegisterFromLogin = document.getElementById("openRegisterFromLogin");
  const openLoginFromRegister = document.getElementById("openLoginFromRegister");
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const authMessage = document.getElementById("authMessage");

  if (!loginTab || !registerTab || !loginForm || !registerForm) return;

  loginTab.addEventListener("click", () => setAuthMode("login"));
  registerTab.addEventListener("click", () => setAuthMode("register"));

  switchAuthMode.addEventListener("click", () => {
    const isLoginActive = loginForm.classList.contains("active");
    setAuthMode(isLoginActive ? "register" : "login");
  });

  openRegisterFromLogin.addEventListener("click", () => setAuthMode("register"));
  openLoginFromRegister.addEventListener("click", () => setAuthMode("login"));

  loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    authMessage.textContent = "Login successful! Redirecting to homepage...";

    setTimeout(() => {
      window.location.href = "index.html";
    }, 900);
  });

  registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    authMessage.textContent = "Account created successfully! You may now login.";

    setTimeout(() => {
      setAuthMode("login");
    }, 900);
  });

  setAuthMode("login");
}

document.addEventListener("DOMContentLoaded", () => {
  initializeLandingPage();
  initializeAuthPage();
});