const items = [
  {
    id: 1,
    name: "Crimson Strike",
    grade: "MG",
    store: "Baguio Gunpla Station",
    points: 120,
    image: "images/mecha-hero.svg",
    description: "A powerful red-accented build with heavy weapon styling and strong display presence."
  },
  {
    id: 2,
    name: "Royal White Frame",
    grade: "HG",
    store: "Mecha Corner Baguio",
    points: 95,
    image: "images/mecha-center.svg",
    description: "A clean white-and-blue frame perfect for builders who want a heroic centerpiece."
  },
  {
    id: 3,
    name: "Urban Vanguard",
    grade: "RG",
    store: "Runner Gate Hobby",
    points: 150,
    image: "images/mecha-hero.svg",
    description: "A compact real-grade inspired kit with sharp details and dynamic posing."
  },
  {
    id: 4,
    name: "Blue Nova",
    grade: "HG",
    store: "North Build Station",
    points: 80,
    image: "images/mecha-center.svg",
    description: "A beginner-friendly build with clean blue armor and flexible display options."
  }
];

let filteredItems = [...items];
let currentIndex = 1;

const carousel = document.getElementById("carousel");
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

function normalizeIndex() {
  if (filteredItems.length === 0) {
    currentIndex = 0;
    return;
  }

  if (currentIndex < 0) {
    currentIndex = filteredItems.length - 1;
  }

  if (currentIndex >= filteredItems.length) {
    currentIndex = 0;
  }
}

function getVisibleItems() {
  if (filteredItems.length === 0) return [];

  if (filteredItems.length === 1) {
    return [{ ...filteredItems[0], index: 0, position: "center" }];
  }

  if (filteredItems.length === 2) {
    return filteredItems.map((item, index) => ({
      ...item,
      index,
      position: index === currentIndex ? "center" : "side"
    }));
  }

  const left = (currentIndex - 1 + filteredItems.length) % filteredItems.length;
  const right = (currentIndex + 1) % filteredItems.length;

  return [
    { ...filteredItems[left], index: left, position: "side" },
    { ...filteredItems[currentIndex], index: currentIndex, position: "center" },
    { ...filteredItems[right], index: right, position: "side" }
  ];
}

function renderCarousel() {
  normalizeIndex();

  const visible = getVisibleItems();

  if (visible.length === 0) {
    carousel.innerHTML = `
      <div class="empty-state">
        <h2>No kits found</h2>
        <p>Try searching another keyword.</p>
      </div>
    `;
    return;
  }

  carousel.innerHTML = visible.map((item) => `
    <article class="discovery-card ${item.position}" data-index="${item.index}">
      <div class="discovery-card-inner">
        <div class="shop-badge">🛒</div>
        <img src="${item.image}" alt="${item.name}" />
        <div class="card-info">
          <h3>${item.name}</h3>
          <p>${item.grade} • ${item.store}</p>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".discovery-card").forEach((card) => {
    card.addEventListener("click", () => {
      currentIndex = Number(card.dataset.index);
      renderCarousel();
      openModal(filteredItems[currentIndex]);
    });
  });
}

function applySearch() {
  const query = searchInput.value.trim().toLowerCase();

  filteredItems = items.filter((item) => {
    return (
      item.name.toLowerCase().includes(query) ||
      item.grade.toLowerCase().includes(query) ||
      item.store.toLowerCase().includes(query)
    );
  });

  currentIndex = filteredItems.length > 1 ? 1 : 0;
  renderCarousel();
}

function openModal(item) {
  if (!item) return;

  modalContent.innerHTML = `
    <div class="modal-layout">
      <img src="${item.image}" alt="${item.name}" />

      <div class="modal-details">
        <h2>${item.name}</h2>

        <div class="modal-tags">
          <span class="modal-tag">Grade: ${item.grade}</span>
          <span class="modal-tag">Store: ${item.store}</span>
          <span class="modal-tag">Points: ${item.points}</span>
        </div>

        <p>${item.description}</p>

        <button class="modal-btn red" id="requestBtn">Request Kit</button>
      </div>
    </div>
  `;

  modal.classList.add("active");

  document.getElementById("requestBtn").addEventListener("click", () => {
    modalContent.innerHTML = `
      <div class="modal-details">
        <h2>Request Sent</h2>
        <p>Your request for <strong>${item.name}</strong> was sent to <strong>${item.store}</strong>.</p>
        <button class="modal-btn" id="doneBtn">Done</button>
      </div>
    `;

    document.getElementById("doneBtn").addEventListener("click", closeItemModal);
  });
}

function closeItemModal() {
  modal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

prevBtn.addEventListener("click", () => {
  currentIndex--;
  renderCarousel();
});

nextBtn.addEventListener("click", () => {
  currentIndex++;
  renderCarousel();
});

searchInput.addEventListener("input", applySearch);

seeMoreBtn.addEventListener("click", () => {
  openModal(filteredItems[currentIndex]);
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

renderCarousel();