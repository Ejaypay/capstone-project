const stores = [
  {
    id: 1,
    name: "Baguio Gunpla Station",
    location: "123 Session Road, Baguio City",
    barangay: "Session Road",
    category: ["HG", "RG", "MG", "PG"],
    rating: 4.8,
    description:
      "The premier Gunpla shop in the heart of Baguio. Wide selection of Bandai kits from HG to PG.",
    longDescription:
      "Baguio Gunpla Station is a trusted hobby shop for Gunpla builders in Baguio City. It offers beginner kits, collector-grade releases, paints, tools, and hobby accessories.",
    products: ["HG Aerial", "RG Nu Gundam", "MG Barbatos", "PG Unicorn", "Panel Line Marker"]
  },
  {
    id: 2,
    name: "Mecha Corner Baguio",
    location: "45 Bonifacio Street, Baguio City",
    barangay: "Bonifacio",
    category: ["HG", "Tools", "Paint"],
    rating: 4.8,
    description:
      "The premier Gunpla shop in the heart of Baguio. Wide selection of Bandai kits from HG to PG.",
    longDescription:
      "Mecha Corner Baguio focuses on beginner-friendly kits, basic building tools, paints, and model customization supplies.",
    products: ["HG Calibarn", "HG Strike", "Nippers", "Sanding Sticks", "Acrylic Paint"]
  },
  {
    id: 3,
    name: "Runner Gate Hobby",
    location: "88 Bakakeng Road, Baguio City",
    barangay: "Bakakeng",
    category: ["RG", "MG", "Tools"],
    rating: 4.8,
    description:
      "The premier Gunpla shop in the heart of Baguio. Wide selection of Bandai kits from HG to PG.",
    longDescription:
      "Runner Gate Hobby specializes in detailed model kits, premium hobby tools, action bases, and collector-grade releases.",
    products: ["RG God Gundam", "MG Freedom", "Metallic Markers", "Hobby Knife", "Display Stand"]
  },
  {
    id: 4,
    name: "North Build Station",
    location: "67 Aurora Hill, Baguio City",
    barangay: "Aurora Hill",
    category: ["HG", "MG", "Paint"],
    rating: 4.8,
    description:
      "The premier Gunpla shop in the heart of Baguio. Wide selection of Bandai kits from HG to PG.",
    longDescription:
      "North Build Station is a community-focused hobby store where builders can buy kits, request restocks, and join local build sessions.",
    products: ["HG Zaku", "MG Wing Zero", "Spray Paint", "Top Coat", "Weathering Kit"]
  }
];

const storeGrid = document.getElementById("storeGrid");
const barangayFilter = document.getElementById("barangayFilter");
const categoryFilter = document.getElementById("categoryFilter");
const storeModal = document.getElementById("storeModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");
const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");

function renderStores() {
  const selectedBarangay = barangayFilter.value;
  const selectedCategory = categoryFilter.value;

  const filteredStores = stores.filter((store) => {
    const barangayMatches =
      selectedBarangay === "all" || store.barangay === selectedBarangay;

    const categoryMatches =
      selectedCategory === "all" || store.category.includes(selectedCategory);

    return barangayMatches && categoryMatches;
  });

  storeGrid.innerHTML = "";

  if (filteredStores.length === 0) {
    storeGrid.innerHTML = `
      <div class="empty-state">
        <h2>No stores found</h2>
        <p>Try selecting another barangay or category.</p>
      </div>
    `;
    return;
  }

  filteredStores.forEach((store) => {
    const card = document.createElement("article");
    card.className = "store-card";

    card.innerHTML = `
      <div>
        <h2>${store.name}</h2>
        <p class="location">⌖ ${store.location}</p>
        <p class="description">${store.description}</p>
      </div>

      <div class="card-bottom">
        <button class="view-store" data-store-id="${store.id}">
          View Store <span>›</span>
        </button>

        <div class="rating">
          ★ <span>${store.rating}</span>
        </div>
      </div>
    `;

    storeGrid.appendChild(card);
  });

  document.querySelectorAll("[data-store-id]").forEach((button) => {
    button.addEventListener("click", () => {
      const storeId = Number(button.dataset.storeId);
      const selectedStore = stores.find((store) => store.id === storeId);
      openStoreModal(selectedStore);
    });
  });
}

function openStoreModal(store) {
  if (!store) return;

  modalContent.innerHTML = `
    <div class="modal-store">
      <h2>${store.name}</h2>
      <p class="modal-location">⌖ ${store.location}</p>

      <div class="modal-tags">
        <span class="modal-tag">Barangay: ${store.barangay}</span>
        <span class="modal-tag">Rating: ★ ${store.rating}</span>
        ${store.category.map((category) => `<span class="modal-tag">${category}</span>`).join("")}
      </div>

      <p>${store.longDescription}</p>

      <p>
        <strong>Available products:</strong><br />
        ${store.products.join(", ")}
      </p>

      <div class="modal-actions">
        <button class="modal-btn red" id="requestProductBtn">Request Product</button>
        <button class="modal-btn blue" id="viewLocationBtn">View Location</button>
      </div>
    </div>
  `;

  storeModal.classList.add("active");

  document.getElementById("requestProductBtn").addEventListener("click", () => {
    showSuccess(
      "Product Request Sent",
      `Your product request has been sent to ${store.name}.`
    );
  });

  document.getElementById("viewLocationBtn").addEventListener("click", () => {
    showSuccess(
      "Location Saved",
      `${store.name} has been added to your store list.`
    );
  });
}

function showSuccess(title, message) {
  modalContent.innerHTML = `
    <div class="success-message">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="modal-btn blue" id="successCloseBtn">Close</button>
    </div>
  `;

  document.getElementById("successCloseBtn").addEventListener("click", closeStoreModal);
}

function closeStoreModal() {
  storeModal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

function initializeStorePage() {
  renderStores();

  barangayFilter.addEventListener("change", renderStores);
  categoryFilter.addEventListener("change", renderStores);

  closeModal.addEventListener("click", closeStoreModal);

  storeModal.addEventListener("click", (event) => {
    if (event.target === storeModal) {
      closeStoreModal();
    }
  });

  buyerBtn.addEventListener("click", () => toggleRole("buyer"));
  sellerBtn.addEventListener("click", () => toggleRole("seller"));

  profileBtn.addEventListener("click", () => {
    alert("Profile page coming soon.");
  });
}

initializeStorePage();