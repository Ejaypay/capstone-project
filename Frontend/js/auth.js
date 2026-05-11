const stores = [
  {
    id: 1,
    name: "Baguio Gunpla Station",
    location: "123 Session Road, Baguio City",
    barangay: "Session Road",
    categories: ["HG", "RG", "MG", "PG"],
    rating: 4.8,
    description: "The premier Gunpla shop in the heart of Baguio. Wide selection of Bandai kits from HG to PG.",
    longDescription: "Baguio Gunpla Station offers Gunpla kits, paints, tools, action bases, panel lining markers, and exclusive local promos.",
    products: ["HG Aerial", "RG Nu Gundam", "MG Barbatos", "PG Unicorn"]
  },
  {
    id: 2,
    name: "Mecha Corner Baguio",
    location: "45 Bonifacio Street, Baguio City",
    barangay: "Bonifacio",
    categories: ["HG", "Tools", "Paint"],
    rating: 4.8,
    description: "A beginner-friendly hobby shop with tools, paints, and build support for new collectors.",
    longDescription: "Mecha Corner Baguio focuses on accessible kits and basic tools for students, casual builders, and new collectors.",
    products: ["HG Strike", "HG Calibarn", "Nippers", "Sanding Sticks"]
  },
  {
    id: 3,
    name: "Runner Gate Hobby",
    location: "88 Bakakeng Road, Baguio City",
    barangay: "Bakakeng",
    categories: ["RG", "MG", "Tools"],
    rating: 4.8,
    description: "Known for detailed kits, premium tools, and collector-grade releases for serious Gunpla builders.",
    longDescription: "Runner Gate Hobby specializes in RG and MG kits, hobby knives, display stands, decals, and advanced detailing tools.",
    products: ["RG God Gundam", "MG Freedom", "Metallic Markers", "Display Stand"]
  },
  {
    id: 4,
    name: "North Build Station",
    location: "67 Aurora Hill, Baguio City",
    barangay: "Aurora Hill",
    categories: ["HG", "MG", "Paint"],
    rating: 4.8,
    description: "A local favorite for affordable kits, repaint supplies, and casual weekend build sessions.",
    longDescription: "North Build Station is a community-focused store for kit purchases, repaint supplies, restock requests, and events.",
    products: ["HG Zaku", "MG Wing Zero", "Spray Paint", "Top Coat"]
  }
];

const storeGrid = document.getElementById("storeGrid");
const barangayFilter = document.getElementById("barangayFilter");
const categoryFilter = document.getElementById("categoryFilter");
const modal = document.getElementById("storeModal");
const closeModal = document.getElementById("closeModal");
const modalContent = document.getElementById("modalContent");
const buyerBtn = document.getElementById("buyerBtn");
const sellerBtn = document.getElementById("sellerBtn");
const profileBtn = document.getElementById("profileBtn");

function renderStores() {
  const barangay = barangayFilter.value;
  const category = categoryFilter.value;

  const filteredStores = stores.filter((store) => {
    const matchesBarangay = barangay === "all" || store.barangay === barangay;
    const matchesCategory = category === "all" || store.categories.includes(category);

    return matchesBarangay && matchesCategory;
  });

  if (filteredStores.length === 0) {
    storeGrid.innerHTML = `
      <div class="empty-state">
        <h2>No stores found</h2>
        <p>Try another barangay or category.</p>
      </div>
    `;
    return;
  }

  storeGrid.innerHTML = filteredStores.map((store) => `
    <article class="store-card">
      <div>
        <h2>${store.name}</h2>
        <p class="location">⌖ ${store.location}</p>
        <p class="description">${store.description}</p>
      </div>

      <div class="card-bottom">
        <button class="view-store" data-id="${store.id}">
          View Store ›
        </button>

        <div class="rating">★ ${store.rating}</div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".view-store").forEach((button) => {
    button.addEventListener("click", () => {
      const storeId = Number(button.dataset.id);
      const selectedStore = stores.find((store) => store.id === storeId);
      openStoreModal(selectedStore);
    });
  });
}

function openStoreModal(store) {
  modalContent.innerHTML = `
    <div class="modal-store">
      <h2>${store.name}</h2>
      <p>⌖ ${store.location}</p>

      <div class="modal-tags">
        <span class="modal-tag">Barangay: ${store.barangay}</span>
        <span class="modal-tag">Rating: ★ ${store.rating}</span>
        ${store.categories.map((category) => `<span class="modal-tag">${category}</span>`).join("")}
      </div>

      <p>${store.longDescription}</p>

      <p>
        <strong>Available products:</strong><br />
        ${store.products.join(", ")}
      </p>

      <div class="modal-actions">
        <button class="modal-btn red" id="requestBtn">Request Product</button>
        <button class="modal-btn blue" id="locationBtn">View Location</button>
      </div>
    </div>
  `;

  modal.classList.add("active");

  document.getElementById("requestBtn").addEventListener("click", () => {
    showSuccess("Product Request Sent", `Your product request has been sent to ${store.name}.`);
  });

  document.getElementById("locationBtn").addEventListener("click", () => {
    showSuccess("Location Saved", `${store.name} has been added to your store list.`);
  });
}

function showSuccess(title, message) {
  modalContent.innerHTML = `
    <div class="modal-store">
      <h2>${title}</h2>
      <p>${message}</p>
      <button class="modal-btn blue" id="doneBtn">Done</button>
    </div>
  `;

  document.getElementById("doneBtn").addEventListener("click", closeStoreModal);
}

function closeStoreModal() {
  modal.classList.remove("active");
}

function toggleRole(role) {
  const buyerSelected = role === "buyer";

  buyerBtn.classList.toggle("active", buyerSelected);
  sellerBtn.classList.toggle("active", !buyerSelected);
}

barangayFilter.addEventListener("change", renderStores);
categoryFilter.addEventListener("change", renderStores);

closeModal.addEventListener("click", closeStoreModal);

modal.addEventListener("click", (event) => {
  if (event.target === modal) {
    closeStoreModal();
  }
});

buyerBtn.addEventListener("click", () => toggleRole("buyer"));
sellerBtn.addEventListener("click", () => toggleRole("seller"));

profileBtn.addEventListener("click", () => {
  alert("Profile page coming soon.");
});

renderStores();