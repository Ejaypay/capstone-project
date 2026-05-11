const discoverItems = [
  {
    id: 1,
    name: "Crimson Strike",
    grade: "MG",
    store: "Mecha Corner Baguio",
    points: 120,
    description:
      "A premium Master Grade-style kit with bold red armor details, heavy weapon styling, and strong shelf presence.",
    image: "images/mecha-hero.svg",
    bgClass: "bg-one"
  },
  {
    id: 2,
    name: "Royal White Frame",
    grade: "HG",
    store: "Plastic Model Base",
    points: 95,
    description:
      "Elegant white-and-blue frame inspired styling, perfect for collectors who want a clean heroic centerpiece build.",
    image: "images/mecha-center.svg",
    bgClass: "bg-two"
  },
  {
    id: 3,
    name: "Urban Vanguard",
    grade: "RG",
    store: "Runner Gate Hobby",
    points: 150,
    description:
      "Compact real-grade inspired design with neutral armor, balanced articulation, and strong detail density.",
    image: "images/mecha-hero.svg",
    bgClass: "bg-three"
  },
  {
    id: 4,
    name: "Blue Nova",
    grade: "HG",
    store: "North Build Station",
    points: 80,
    description:
      "Lightweight build style with clean blue panels, solid beginner-friendly construction, and dynamic posing options.",
    image: "images/mecha-center.svg",
    bgClass: "bg-two"
  },
  {
    id: 5,
    name: "Iron Sentinel",
    grade: "MG",
    store: "Red Frame Collectibles",
    points: 160,
    description:
      "A bulkier armored unit with sturdy proportions and a commanding silhouette suited for advanced builders.",
    image: "images/mecha-hero.svg",
    bgClass: "bg-one"
  }
];

let filteredItems = [...discoverItems];
let currentCenterIndex = 1;

const carouselStage = document.getElementById("carouselStage");
const searchInput = document.getElementById("discoverSearch");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const seeMoreBtn = document.getElementById("seeMoreBtn");
const modal = document.getElementById("discoverModal");
const closeModal = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");
const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");

function clampCenterIndex() {
  if (filteredItems.length === 0) {
    currentCenterIndex = 0;
    return;
  }

  if (currentCenterIndex < 0) {
    currentCenterIndex = filteredItems.length - 1;
  }

  if (currentCenterIndex >= filteredItems.length) {
    currentCenterIndex = 0;
  }
}

function getVisibleItems() {
  if (filteredItems.length === 0) {
    return [];
  }

  if (window.innerWidth <= 700) {
    return filteredItems.map((item, index) => ({
      ...item,
      positionClass: index === currentCenterIndex ? "center" : "side",
      realIndex: index
    }));
  }

  if (filteredItems.length === 1) {
    return [
      {
        ...filteredItems[0],
        positionClass: "center",
        realIndex: 0
      }
    ];
  }

  if (filteredItems.length === 2) {
    return [
      {
        ...filteredItems[0],
        positionClass: currentCenterIndex === 0 ? "center" : "side",
        realIndex: 0
      },
      {
        ...filteredItems[1],
        positionClass: currentCenterIndex === 1 ? "center" : "side",
        realIndex: 1
      }
    ];
  }

  const leftIndex =
    (currentCenterIndex - 1 + filteredItems.length) % filteredItems.length;
  const rightIndex =
    (currentCenterIndex + 1) % filteredItems.length;

  return [
    {
      ...filteredItems[leftIndex],
      positionClass: "side",
      realIndex: leftIndex
    },
    {
      ...filteredItems[currentCenterIndex],
      positionClass: "center",
      realIndex: currentCenterIndex
    },
    {
      ...filteredItems[rightIndex],
      positionClass: "side",
      realIndex: rightIndex
    }
  ];
}

function renderCarousel() {
  if (!carouselStage) return;

  clampCenterIndex();
  const visibleItems = getVisibleItems();

  if (filteredItems.length === 0) {
    carouselStage.innerHTML = `
      <div class="empty-state">
        <h3>No kits found</h3>
        <p>Try a different search keyword.</p>
      </div>
    `;
    return;
  }

  carouselStage.innerHTML = visibleItems
    .map((item) => {
      return `
        <article
          class="discovery-card ${item.positionClass} ${item.bgClass}"
          data-index="${item.realIndex}"
        >
          <div class="discovery-card-inner">
            <div class="discovery-card-bg"></div>
            <div class="shop-badge">🛒</div>
            <img src="${item.image}" alt="${item.name}" />
            <div class="card-info">
              <h3>${item.name}</h3>
              <p>${item.grade} • ${item.store}</p>
            </div>
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll(".discovery-card").forEach((card) => {
    card.addEventListener("click", () => {
      const index = Number(card.dataset.index);
      currentCenterIndex = index;
      renderCarousel();
      openItemModal(filteredItems[currentCenterIndex]);
    });
  });
}

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  filteredItems = discoverItems.filter((item) => {
    return (
      item.name.toLowerCase().includes(query) ||
      item.grade.toLowerCase().includes(query) ||
      item.store.toLowerCase().includes(query)
    );
  });

  currentCenterIndex = filteredItems.length > 1 ? 1 : 0;
  renderCarousel();
}

function showPrevious() {
  if (filteredItems.length === 0) return;
  currentCenterIndex -= 1;
  clampCenterIndex();
  renderCarousel();
}

function showNext() {
  if (filteredItems.length === 0) return;
  currentCenterIndex += 1;
  clampCenterIndex();
  renderCarousel();
}

function getCurrentItem() {
  if (filteredItems.length === 0) return null;
  clampCenterIndex();
  return filteredItems[currentCenterIndex];
}

function openItemModal(item) {
  if (!item || !modal || !modalContent) return;

  modalContent.innerHTML = `
    <div class="modal-layout">
      <div class="modal-image-wrap">
        <img src="${item.image}" alt="${item.name}">
      </div>

      <div class="modal-details">
        <h2>${item.name}</h2>

        <div class="modal-meta">
          <span class="modal-tag">Grade: ${item.grade}</span>
          <span class="modal-tag">Store: ${item.store}</span>
          <span class="modal-tag">Points: ${item.points}</span>
        </div>

        <p>${item.description}</p>

        <div class="modal-actions">
          <button class="modal-btn primary" id="requestBtn">Request Kit</button>
          <button class="modal-btn secondary" id="saveBtn">Save Item</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add("active");

  document.getElementById("requestBtn").addEventListener("click", () => {
    modalContent.innerHTML = `
      <div class="modal-details">
        <h2>Request Sent</h2>
        <p>Your request for <strong>${item.name}</strong> has been submitted to <strong>${item.store}</strong>.</p>
        <div class="modal-actions">
          <button class="modal-btn secondary" id="closeSuccessBtn">Close</button>
        </div>
      </div>
    `;

    document.getElementById("closeSuccessBtn").addEventListener("click", closeItemModal);
  });

  document.getElementById("saveBtn").addEventListener("click", () => {
    modalContent.innerHTML = `
      <div class="modal-details">
        <h2>Saved</h2>
        <p><strong>${item.name}</strong> has been added to your saved items.</p>
        <div class="modal-actions">
          <button class="modal-btn secondary" id="closeSavedBtn">Close</button>
        </div>
      </div>
    `;

    document.getElementById("closeSavedBtn").addEventListener("click", closeItemModal);
  });
}

function closeItemModal() {
  if (!modal) return;
  modal.classList.remove("active");
}

function toggleRole(selectedRole) {
  if (selectedRole === "buyer") {
    buyerBtn.classList.add("active");
    sellerBtn.classList.remove("active");
  } else {
    sellerBtn.classList.add("active");
    buyerBtn.classList.remove("active");
  }
}

function initializeEvents() {
  searchInput.addEventListener("input", applySearch);
  prevBtn.addEventListener("click", showPrevious);
  nextBtn.addEventListener("click", showNext);

  seeMoreBtn.addEventListener("click", () => {
    const item = getCurrentItem();
    openItemModal(item);
  });

  closeModal.addEventListener("click", closeItemModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeItemModal();
    }
  });

  buyerBtn.addEventListener("click", () => toggleRole("buyer"));
  sellerBtn.addEventListener("click", () => toggleRole("seller"));

  profileBtn.addEventListener("click", () => {
    alert("Profile page coming soon.");
  });

  window.addEventListener("resize", renderCarousel);
}

function initDiscoverPage() {
  currentCenterIndex = filteredItems.length > 1 ? 1 : 0;
  renderCarousel();
  initializeEvents();
}

initDiscoverPage();