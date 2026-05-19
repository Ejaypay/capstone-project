(() => {
  "use strict";

  const DATA = window.GUNPLA_DATA;
  const app = document.getElementById("app");
  const page = document.body.dataset.page || "home";

  const keys = {
    receipts: "gunpla.receipts.v1",
    transactions: "gunpla.transactions.v1",
    redemptions: "gunpla.redemptions.v1",
    rsvps: "gunpla.rsvps.v1",
    account: "gunpla.account.v1",
    inventory: "gunpla.inventory.v1",
    reservations: "gunpla.reservations.v1"
  };

  const read = (key, fallback) => {
    try {
      const value = JSON.parse(localStorage.getItem(key));
      return value ?? fallback;
    } catch {
      return fallback;
    }
  };

  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const money = (value) => `PHP ${Number(value).toLocaleString()}.00`;
  const byId = (id) => document.getElementById(id);

  function getReceipts() {
    const saved = read(keys.receipts, null);
    if (saved) return saved;
    write(keys.receipts, DATA.seedReceipts);
    return [...DATA.seedReceipts];
  }

  function getTransactions() {
    return read(keys.transactions, []);
  }

  function getRedemptions() {
    return read(keys.redemptions, []);
  }

  function claimedIds() {
    return getTransactions().filter((item) => item.type === "claim").map((item) => item.receiptId);
  }

  function pointsBalance() {
    const earned = getTransactions().reduce((sum, item) => sum + Number(item.points || 0), 0);
    const spent = getRedemptions().reduce((sum, item) => sum + Number(item.cost || 0), 0);
    return Math.max(0, earned - spent);
  }

  function navItem(id, label, href) {
    return `<a class="${page === id ? "active" : ""}" href="${href}">${label}</a>`;
  }

  function shell(content) {
    app.innerHTML = `
      <header class="topbar">
        <div class="nav-wrap">
          <a class="brand" href="index.html"><b><span>GUNPLA</span> HUB</b><small>Baguio builders network</small></a>
          <button class="menu-btn" id="menuBtn" aria-label="Open menu">☰</button>
          <nav class="nav-links" id="navLinks">
            ${navItem("home", "Home", "index.html")}
            ${navItem("discover", "Discover", "discover.html")}
            ${navItem("stores", "Stores", "store.html")}
            ${navItem("events", "Events", "events.html")}
            ${navItem("receipts", "Receipts", "receipts.html")}
            ${navItem("scan", "Scan QR", "scanqr.html")}
            ${navItem("points", "Points", "points.html")}
            ${navItem("rewards", "Rewards", "rewards.html")}
            ${navItem("seller", "Seller", "seller-dashboard.html")}
          </nav>
          <a class="login-chip" href="login.html">Login</a>
        </div>
      </header>
      <main id="mainContent" class="container">${content}</main>
      <div class="modal" id="modal" aria-hidden="true"><div class="modal-card"><button class="modal-close" id="modalClose">×</button><div id="modalBody"></div></div></div>
    `;

    byId("menuBtn")?.addEventListener("click", () => byId("navLinks").classList.toggle("open"));
    byId("modalClose")?.addEventListener("click", closeModal);
    byId("modal")?.addEventListener("click", (event) => {
      if (event.target.id === "modal") closeModal();
    });
  }

  function openModal(html) {
    byId("modalBody").innerHTML = html;
    byId("modal").classList.add("show");
    byId("modal").setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    byId("modal")?.classList.remove("show");
    byId("modal")?.setAttribute("aria-hidden", "true");
  }

  function titleBlock(kicker, title, text) {
    return `<section class="page-head"><p class="kicker">${kicker}</p><h1>${title}</h1><p>${text}</p></section>`;
  }

  function getInventoryOverrides() {
    return read(keys.inventory, {});
  }

  function getProductStock(product) {
    const overrides = getInventoryOverrides();
    return Number(overrides[product.id]?.stock ?? product.stock);
  }

  function getProductStatus(product) {
    const overrides = getInventoryOverrides();
    const manualStatus = overrides[product.id]?.status;
    const stock = getProductStock(product);

    if (manualStatus) return manualStatus;
    if (stock <= 0) return product.status === "Pre-order" ? "Pre-order" : "Out of Stock";
    if (stock <= 5) return "Low Stock";
    if (product.status === "Restock Soon") return "Restock Soon";
    return product.status === "Pre-order" ? "Pre-order" : "Available";
  }

  function setProductInventory(productId, stock, status = "") {
    const overrides = getInventoryOverrides();

    overrides[productId] = {
      ...(overrides[productId] || {}),
      stock: Math.max(0, Number(stock) || 0)
    };

    if (status) {
      overrides[productId].status = status;
    } else {
      delete overrides[productId].status;
    }

    write(keys.inventory, overrides);
  }

  function getSellerReservations() {
    const saved = read(keys.reservations, null);
    if (saved) return saved;

    return getReceipts().slice(0, 4).map((receipt, index) => ({
      id: `RSV-DEMO-${index + 1}`,
      receiptId: receipt.id,
      productId: DATA.products[index % DATA.products.length].id,
      productName: receipt.items.split(",")[0],
      store: receipt.store,
      customer: ["Jared Dela Cruz", "Alex Builder", "Mika Runner", "Demo Buyer"][index % 4],
      status: index === 2 ? "Pre-order" : "For Pickup",
      amount: receipt.amount,
      date: receipt.date
    }));
  }

  function createReservationRecord(product, receipt) {
    const store = DATA.stores.find((item) => item.id === product.storeId);
    const reservations = read(keys.reservations, []);

    reservations.unshift({
      id: `RSV-${receipt.id.replace("GH-", "")}`,
      receiptId: receipt.id,
      productId: product.id,
      productName: product.name,
      store: store?.name || receipt.store,
      customer: "Demo Builder",
      status: getProductStatus(product) === "Pre-order" ? "Pre-order" : "For Pickup",
      amount: receipt.amount,
      date: receipt.date
    });

    write(keys.reservations, reservations);
  }

  function statusClass(status) {
    if (status === "Available") return "green";
    if (status === "Pre-order" || status === "Low Stock" || status === "Restock Soon") return "yellow";
    return "red";
  }

  function productCard(product) {
    const store = DATA.stores.find((item) => item.id === product.storeId);
    const stock = getProductStock(product);
    const status = getProductStatus(product);

    return `
      <article class="product-card">
        <div class="product-art">
          <img src="${product.image}" alt="${product.name}">
        </div>

        <div class="product-body">
          <div class="card-row">
            <span class="pill ${statusClass(status)}">${status}</span>
            <span class="pill">${product.grade}</span>
          </div>

          <h3>${product.name}</h3>
          <p>${product.description}</p>

          <div class="card-row">
            <strong>${money(product.price)}</strong>
            <small>${store?.name || "Local store"} · ${stock} left</small>
          </div>

          <button class="primary-btn reserve-btn" data-id="${product.id}" ${status === "Out of Stock" ? "disabled" : ""}>
            ${status === "Pre-order" ? "Pre-order Kit" : "Reserve Kit"}
          </button>
        </div>
      </article>
    `;
  }

  function claimReceipt(receiptId) {
    const receipt = getReceipts().find((item) => item.id === receiptId);
    if (!receipt) return;

    if (claimedIds().includes(receipt.id)) {
      openModal(`<h2>Already claimed</h2><p>This receipt was already used. Points cannot be claimed twice.</p>`);
      return;
    }

    const transactions = getTransactions();
    transactions.unshift({
      id: `TX-${Date.now()}`,
      type: "claim",
      receiptId: receipt.id,
      store: receipt.store,
      points: receipt.points,
      date: new Date().toISOString()
    });
    write(keys.transactions, transactions);
    openModal(`<h2>Points claimed</h2><p>You earned <b>${receipt.points} points</b> from receipt ${receipt.id}.</p><a class="primary-btn" href="points.html">View points</a>`);
  }

  function addReceipt(product) {
    const store = DATA.stores.find((item) => item.id === product.storeId);
    const receipt = {
      id: `GH-${Math.floor(100000 + Math.random() * 900000)}`,
      store: store?.name || "Gunpla Hub Partner",
      amount: product.price,
      points: Math.floor(product.price / 10),
      items: product.name,
      date: new Date().toISOString().slice(0, 10)
    };
       const receipts = getReceipts();
    receipts.unshift(receipt);
    write(keys.receipts, receipts);

    createReservationRecord(product, receipt);

    const currentStock = getProductStock(product);
    if (currentStock > 0 && getProductStatus(product) !== "Pre-order") {
      setProductInventory(product.id, currentStock - 1);
    }

       openModal(`
      <h2>Reservation created</h2>
      <p>Your digital receipt <b>${receipt.id}</b> is ready. You may claim ${receipt.points} points from the Receipts page.</p>
      <a class="primary-btn" href="receipts.html">Open receipts</a>
    `);
  }

  function bindReserveButtons() {
    document.querySelectorAll(".reserve-btn").forEach((button) => {
      button.addEventListener("click", () => {
        const product = DATA.products.find((item) => item.id === button.dataset.id);
        if (product) addReceipt(product);
      });
    });
  }

  function renderHome() {
    shell(`
      <section class="hero">
        <div>
          <p class="kicker">Local hobby commerce platform</p>
          <h1>Discover. Build. Claim rewards.</h1>
          <p class="hero-text">Gunpla Hub connects Baguio builders with local stores, live stock labels, digital receipts, QR point claiming, and seller analytics that help stores stock smarter.</p>
          <div class="hero-actions"><a class="primary-btn" href="discover.html">Browse kits</a><a class="ghost-btn" href="seller-dashboard.html">View seller dashboard</a></div>
        </div>
        <div class="hero-visual hero-visual-clean">
  <img class="hero-mecha-img" src="../images/gundam.png" alt="Modern Gunpla mecha illustration">
</div>
      </section>
      <section class="feature-grid">
        <article><span>01</span><h3>Less searching</h3><p>One organized catalog replaces scattered social media posts.</p></article>
        <article><span>02</span><h3>Less waste</h3><p>Store analytics help avoid overstocking and missed demand.</p></article>
        <article><span>03</span><h3>More trust</h3><p>Receipts, QR confirmation, and store profiles make transactions clearer.</p></article>
      </section>
      <section class="section-head"><div><p class="kicker">Featured kits</p><h2>Built for beginners and collectors</h2></div><a class="ghost-btn" href="discover.html">See all</a></section>
      <section class="product-grid">${DATA.products.slice(0, 3).map(productCard).join("")}</section>
    `);
    bindReserveButtons();
  }

  function renderDiscover() {
    shell(`
      ${titleBlock("Product discovery", "Find the right kit faster", "Search by name, grade, skill level, availability, or local store.")}
      <section class="toolbar"><input id="search" placeholder="Search kits"><select id="grade"><option value="all">All grades</option><option>EG</option><option>HG</option><option>RG</option><option>MG</option></select><select id="skill"><option value="all">All skill levels</option><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></section>
      <section class="product-grid" id="products"></section>
    `);

    const draw = () => {
      const search = byId("search").value.toLowerCase();
      const grade = byId("grade").value;
      const skill = byId("skill").value;
      const products = DATA.products.filter((product) => {
        const text = `${product.name} ${product.grade} ${product.skill} ${product.status}`.toLowerCase();
        return text.includes(search) && (grade === "all" || product.grade === grade) && (skill === "all" || product.skill === skill);
      });
      byId("products").innerHTML = products.map(productCard).join("") || `<div class="empty">No kits found.</div>`;
      bindReserveButtons();
    };

    ["search", "grade", "skill"].forEach((id) => byId(id).addEventListener("input", draw));
    draw();
  }

  function renderStores() {
    shell(`
      ${titleBlock("Store network", "Local stores with clearer stock visibility", "Find partner shops, specialties, and store details without messaging several sellers first.")}
      <section class="toolbar single"><input id="storeSearch" placeholder="Search store, barangay, specialty"></section>
      <section class="store-grid" id="stores"></section>
    `);

    const draw = () => {
      const query = byId("storeSearch").value.toLowerCase();
      const stores = DATA.stores.filter((store) => `${store.name} ${store.barangay} ${store.specialties.join(" ")}`.toLowerCase().includes(query));
      byId("stores").innerHTML = stores.map((store) => `
        <article class="info-card">
          <div class="card-row"><span class="pill red">${store.barangay}</span><span>★ ${store.rating}</span></div>
          <h3>${store.name}</h3><p>${store.description}</p>
          <small>${store.location}</small>
          <div class="card-row wrap">${store.specialties.map((item) => `<span class="pill">${item}</span>`).join("")}</div>
        </article>`).join("");
    };
    byId("storeSearch").addEventListener("input", draw);
    draw();
  }

  function renderEvents() {
    shell(`${titleBlock("Community events", "Build nights, workshops, and showcases", "RSVP to local activities and encourage builders to join the local scene.")}<section class="event-list" id="events"></section>`);
    const rsvps = read(keys.rsvps, []);
    byId("events").innerHTML = DATA.events.map((event) => {
      const joined = rsvps.includes(event.id);
      return `<article class="event-card"><div class="date-chip"><b>${event.day}</b><span>${event.month}</span></div><div><span class="pill yellow">${event.type}</span><h3>${event.title}</h3><p>${event.description}</p><small>${event.venue}</small></div><button class="${joined ? "ghost-btn" : "primary-btn"} rsvp-btn" data-id="${event.id}">${joined ? "Going" : "RSVP"}</button></article>`;
    }).join("");
    document.querySelectorAll(".rsvp-btn").forEach((button) => button.addEventListener("click", () => {
      const list = read(keys.rsvps, []);
      const updated = list.includes(button.dataset.id) ? list.filter((id) => id !== button.dataset.id) : [...list, button.dataset.id];
      write(keys.rsvps, updated);
      renderEvents();
    }));
  }

  function renderReceipts() {
    shell(`
      ${titleBlock("Digital receipts", "Claim points with one-time receipt records", "Receipts create a clear transaction trail for buyers and useful demand signals for sellers.")}
      <section class="toolbar"><input id="receiptSearch" placeholder="Search receipt or store"><select id="receiptFilter"><option value="all">All receipts</option><option value="ready">Ready</option><option value="claimed">Claimed</option></select><button class="primary-btn" id="sampleReceipt">Create sample</button></section>
      <section class="receipt-list" id="receipts"></section>
    `);

    const draw = () => {
      const query = byId("receiptSearch").value.toLowerCase();
      const filter = byId("receiptFilter").value;
      const claimed = claimedIds();
      const items = getReceipts().filter((receipt) => {
        const status = claimed.includes(receipt.id) ? "claimed" : "ready";
        return `${receipt.id} ${receipt.store} ${receipt.items}`.toLowerCase().includes(query) && (filter === "all" || filter === status);
      });
      byId("receipts").innerHTML = items.map((receipt) => {
        const isClaimed = claimed.includes(receipt.id);
        return `<article class="receipt-card"><div class="receipt-icon">QR</div><div><span class="pill ${isClaimed ? "" : "green"}">${isClaimed ? "Claimed" : "Ready"}</span><h3>${receipt.id}</h3><p>${receipt.store} · ${receipt.items}</p><small>${receipt.date} · ${money(receipt.amount)} · ${receipt.points} pts</small></div><div class="button-stack"><button class="ghost-btn view-receipt" data-id="${receipt.id}">View</button><button class="primary-btn claim-receipt" data-id="${receipt.id}" ${isClaimed ? "disabled" : ""}>Claim</button></div></article>`;
      }).join("") || `<div class="empty">No receipts found.</div>`;
      document.querySelectorAll(".claim-receipt").forEach((button) => button.addEventListener("click", () => claimReceipt(button.dataset.id)));
      document.querySelectorAll(".view-receipt").forEach((button) => button.addEventListener("click", () => showReceipt(button.dataset.id)));
    };

    byId("sampleReceipt").addEventListener("click", () => addReceipt(DATA.products[0]));
    ["receiptSearch", "receiptFilter"].forEach((id) => byId(id).addEventListener("input", draw));
    draw();
  }

  function qrPattern(text) {
    let seed = 0;
    for (const char of text) seed = (seed * 31 + char.charCodeAt(0)) >>> 0;
    return Array.from({ length: 81 }, (_, index) => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const finder = index < 18 || index % 9 < 2 || index > 62;
      return `<i class="${finder || seed % 3 === 0 ? "on" : ""}"></i>`;
    }).join("");
  }

  function showReceipt(id) {
    const receipt = getReceipts().find((item) => item.id === id);
    if (!receipt) return;
    openModal(`<div class="qr-modal"><div class="fake-qr">${qrPattern(receipt.id)}</div><div><h2>${receipt.id}</h2><p>${receipt.store}</p><p>${receipt.items}</p><p><b>${money(receipt.amount)}</b> · ${receipt.points} pts</p><button class="primary-btn" id="modalClaim">Claim points</button></div></div>`);
    byId("modalClaim").addEventListener("click", () => claimReceipt(receipt.id));
  }

  function renderScan() {
    const options = getReceipts().map((receipt) => `<option value="${receipt.id}">${receipt.id} - ${receipt.store}</option>`).join("");
    shell(`${titleBlock("QR scanner", "Prototype receipt validation", "Simulate scanning a digital receipt QR to claim loyalty points once.")}<section class="scan-panel"><div class="scanner"><div class="scan-line"></div><div class="fake-qr large">${qrPattern("scan-demo")}</div></div><div class="info-card dark"><h3>Scan receipt QR</h3><p>Select a receipt below, then validate it like a scanned QR code.</p><select id="scanSelect">${options}</select><button class="primary-btn" id="scanBtn">Validate receipt</button></div></section>`);
    byId("scanBtn")?.addEventListener("click", () => claimReceipt(byId("scanSelect").value));
  }

  function renderPoints() {
    const balance = pointsBalance();
    const tx = getTransactions();
    shell(`${titleBlock("Points wallet", "Track earned loyalty points", "Points are earned from receipt QR claims and spent on local store rewards.")}<section class="wallet"><div><p class="kicker">Current balance</p><h2>${balance.toLocaleString()} pts</h2><div class="track"><span style="width:${Math.min(100, balance / 10)}%"></span></div><p>${balance >= 1000 ? "Gold Builder" : balance >= 500 ? "Silver Builder" : "Starter Builder"}</p></div><img src="../images/model.jpg" alt="Gunpla builder mascot"></section><section class="history-list">${tx.map((item) => `<article><b>+${item.points} pts</b><span>${item.store}</span><small>${item.receiptId} · ${new Date(item.date).toLocaleDateString()}</small></article>`).join("") || `<div class="empty">No point activity yet.</div>`}</section>`);
  }

  function renderRewards() {
    shell(`${titleBlock("Rewards", "Redeem points for store perks", "Encourage repeat purchases through useful hobby rewards, not random coupons.")}<section class="reward-grid">${DATA.rewards.map((reward) => `<article class="info-card"><span class="pill yellow">${reward.cost} pts</span><h3>${reward.title}</h3><p>${reward.description}</p><small>${reward.store}</small><button class="primary-btn redeem-btn" data-id="${reward.id}">Redeem</button></article>`).join("")}</section>`);
    document.querySelectorAll(".redeem-btn").forEach((button) => button.addEventListener("click", () => {
      const reward = DATA.rewards.find((item) => item.id === button.dataset.id);
      if (pointsBalance() < reward.cost) {
        openModal(`<h2>Not enough points</h2><p>You need ${reward.cost} points to redeem this reward.</p>`);
        return;
      }
      const list = getRedemptions();
      list.unshift({ ...reward, date: new Date().toISOString() });
      write(keys.redemptions, list);
      openModal(`<h2>Reward redeemed</h2><p>${reward.title} has been added to your rewards record.</p>`);
    }));
  }

   function renderSeller() {
    const receipts = getReceipts();
    const transactions = getTransactions();
    const redemptions = getRedemptions();
    const reservations = getSellerReservations();

    const products = DATA.products.map((product) => ({
      ...product,
      liveStock: getProductStock(product),
      liveStatus: getProductStatus(product),
      soldCount: receipts.filter((receipt) =>
        receipt.items.toLowerCase().includes(product.name.toLowerCase())
      ).length
    }));

    const sales = receipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0);
    const lowStockProducts = products.filter((product) => product.liveStock <= 5);
    const activeReservations = reservations.filter((item) => item.status !== "Completed");

    const pointLiability = Math.max(
      0,
      transactions.reduce((sum, item) => sum + Number(item.points || 0), 0) -
      redemptions.reduce((sum, item) => sum + Number(item.cost || 0), 0)
    );

    const claimRate = receipts.length ? Math.round((transactions.length / receipts.length) * 100) : 0;

    const salesByDate = receipts.reduce((map, receipt) => {
      map[receipt.date] = (map[receipt.date] || 0) + Number(receipt.amount);
      return map;
    }, {});

    const salesRows = Object.entries(salesByDate)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .slice(-6);

    const maxSales = Math.max(1, ...salesRows.map(([, value]) => value));

    const demandRows = products.map((product) => {
      const receiptHits = receipts.filter((receipt) =>
        receipt.items.toLowerCase().includes(product.name.toLowerCase()) ||
        receipt.items.toLowerCase().includes(product.grade.toLowerCase())
      ).length;

      const reservationHits = reservations.filter((item) =>
        item.productId === product.id ||
        item.productName.toLowerCase().includes(product.name.toLowerCase())
      ).length;

      const lowStockBoost = product.liveStock <= 5 ? 18 : 0;
      const preorderBoost = product.liveStatus === "Pre-order" ? 14 : 0;

      return {
        ...product,
        demandScore: receiptHits * 16 + reservationHits * 20 + lowStockBoost + preorderBoost
      };
    }).sort((a, b) => b.demandScore - a.demandScore);

    const topProduct = demandRows[0];

    const restockEstimate = lowStockProducts.reduce((sum, product) => {
      return sum + Math.max(0, 12 - product.liveStock) * product.price;
    }, 0);

    const stockHealth = Math.max(
      0,
      Math.round(((products.length - lowStockProducts.length) / products.length) * 100)
    );

    const gradeDemand = ["EG", "HG", "RG", "MG"].map((grade) => {
      const value =
        receipts.filter((receipt) => receipt.items.toLowerCase().includes(grade.toLowerCase())).length +
        products.filter((product) => product.grade === grade && product.liveStock <= 5).length;

      return { grade, value };
    });

    const maxGradeDemand = Math.max(1, ...gradeDemand.map((item) => item.value));

    const actionFor = (product) => {
      if (product.liveStock === 0) return "Move to pre-order or restock now";
      if (product.liveStock <= 3) return "Urgent restock needed";
      if (product.liveStock <= 5) return "Monitor and prepare reorder";
      if (product.soldCount === 0 && product.liveStock >= 12) return "Promote or bundle with tools";
      return "Stock level is healthy";
    };

    shell(`
      ${titleBlock(
        "Seller analytics",
        "Data analytics for sales and inventory",
        "A store-owner page for the capstone emerging technology: analytics that converts receipts, reservations, stock movement, QR claims, rewards, and buyer behavior into restocking decisions."
      )}

      <section class="seller-command">
        <div>
          <p class="kicker">Emerging technology</p>
          <h2>Evidence-based seller control center</h2>
          <p>
            This dashboard follows the manuscript goal: use data analytics to monitor sales performance,
            identify best-selling products, evaluate demand trends, and support inventory decisions.
          </p>
        </div>

        <div class="seller-actions">
          <button class="primary-btn" id="sellerAddSale">Simulate sale + QR receipt</button>
          <button class="ghost-btn" id="sellerResetInventory">Reset stock demo</button>
        </div>
      </section>

      <section class="metric-grid seller-metric-grid">
        <article>
          <span>Total sales</span>
          <b>${money(sales)}</b>
          <small>${receipts.length} digital receipts</small>
        </article>

        <article>
          <span>Active reservations</span>
          <b>${activeReservations.length}</b>
          <small>Reservation and pre-order queue</small>
        </article>

        <article>
          <span>Stock health</span>
          <b>${stockHealth}%</b>
          <small>${lowStockProducts.length} low-stock kits</small>
        </article>

        <article>
          <span>QR claim rate</span>
          <b>${claimRate}%</b>
          <small>${pointLiability.toLocaleString()} points liability</small>
        </article>

        <article>
          <span>Top demand signal</span>
          <b>${topProduct?.grade || "--"}</b>
          <small>${topProduct?.name || "No product data yet"}</small>
        </article>

        <article>
          <span>Restock budget signal</span>
          <b>${money(restockEstimate)}</b>
          <small>Estimated value to refill low stock to 12 units</small>
        </article>
      </section>

      <section class="seller-grid">
        <article class="info-card dark seller-panel wide">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Sales trend</p>
              <h3>Daily receipt revenue</h3>
            </div>
            <span class="pill green">Live from receipts</span>
          </div>

          ${
            salesRows.map(([date, value]) => `
              <div class="seller-bar-row">
                <span>${date}</span>
                <div><i style="width:${Math.max(8, (value / maxSales) * 100)}%"></i></div>
                <strong>${money(value)}</strong>
              </div>
            `).join("") || `<div class="empty">No sales data yet.</div>`
          }
        </article>

        <article class="info-card dark seller-panel">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Buyer demand</p>
              <h3>Grade interest</h3>
            </div>
          </div>

          ${
            gradeDemand.map((item) => `
              <div class="seller-bar-row compact">
                <span>${item.grade}</span>
                <div><i style="width:${Math.max(8, (item.value / maxGradeDemand) * 100)}%"></i></div>
                <strong>${item.value}</strong>
              </div>
            `).join("")
          }

          <p class="seller-note">
            Use this to plan beginner-friendly kits, RG/MG collector stock, and tool bundles.
          </p>
        </article>

        <article class="info-card dark seller-panel wide">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Inventory visibility</p>
              <h3>Stock movement and restock actions</h3>
            </div>
            <span class="pill yellow">Editable demo</span>
          </div>

          <div class="seller-table">
            <div class="seller-table-head">
              <span>Product</span>
              <span>Status</span>
              <span>Stock</span>
              <span>Demand</span>
              <span>Action</span>
            </div>

            ${
              demandRows.map((product) => `
                <form class="seller-table-row seller-stock-form" data-id="${product.id}">
                  <span>
                    <b>${product.name}</b>
                    <small>${product.grade} · ${product.skill}</small>
                  </span>

                  <span>
                    <em class="pill ${statusClass(product.liveStatus)}">${product.liveStatus}</em>
                  </span>

                  <span>
                    <input name="stock" type="number" min="0" value="${product.liveStock}" aria-label="${product.name} stock">
                  </span>

                  <span>
                    <b>${product.demandScore}</b>
                    <small>score</small>
                  </span>

                  <span class="seller-row-actions">
                    <button class="ghost-btn seller-view-product" type="button" data-id="${product.id}">View</button>
                    <button class="primary-btn" type="submit">Save</button>
                  </span>
                </form>
              `).join("")
            }
          </div>
        </article>

        <article class="info-card dark seller-panel">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Recommendations</p>
              <h3>Analytics decisions</h3>
            </div>
          </div>

          <ul class="seller-insights">
            <li><b>Restock first:</b> ${lowStockProducts[0]?.name || "No urgent restock"}</li>
            <li><b>Best demand:</b> ${topProduct?.name || "No demand data"}</li>
            <li><b>Inventory risk:</b> ${lowStockProducts.length ? `${lowStockProducts.length} products need attention` : "Stock levels are balanced"}</li>
            <li><b>Promotion idea:</b> Bundle tools with HG kits for beginner buyers.</li>
          </ul>
        </article>
      </section>

      <section class="section-head">
        <div>
          <p class="kicker">Capstone features</p>
          <h2>Seller page covers the complete platform flow</h2>
        </div>
      </section>

      <section class="seller-feature-grid">
        <article>
          <span>01</span>
          <h3>Product catalog</h3>
          <p>Manage product names, grades, skill level, prices, tags, and product visibility.</p>
          <a href="discover.html">Open catalog</a>
        </article>

        <article>
          <span>02</span>
          <h3>Inventory visibility</h3>
          <p>Show available, low-stock, pre-order, restock soon, and out-of-stock labels.</p>
          <a href="store.html">Open stores</a>
        </article>

        <article>
          <span>03</span>
          <h3>Reservations</h3>
          <p>Track buyer reservations and pre-orders created from product browsing.</p>
          <a href="receipts.html">Open receipts</a>
        </article>

        <article>
          <span>04</span>
          <h3>QR receipts</h3>
          <p>Use QR confirmation as a transaction record and source of seller analytics.</p>
          <a href="scanqr.html">Open scanner</a>
        </article>

        <article>
          <span>05</span>
          <h3>Points and rewards</h3>
          <p>Measure buyer engagement through loyalty claims and reward redemptions.</p>
          <a href="rewards.html">Open rewards</a>
        </article>

        <article>
          <span>06</span>
          <h3>Events and community</h3>
          <p>Connect local events to demand signals for beginner kits, tools, and supplies.</p>
          <a href="events.html">Open events</a>
        </article>
      </section>

      <section class="seller-grid lower">
        <article class="info-card dark seller-panel">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Reservation queue</p>
              <h3>Pickup and pre-order monitoring</h3>
            </div>
          </div>

          <div class="seller-list">
            ${
              activeReservations.slice(0, 5).map((item) => `
                <div>
                  <span class="pill ${item.status === "Pre-order" ? "yellow" : "green"}">${item.status}</span>
                  <b>${item.productName}</b>
                  <small>${item.customer} · ${item.store} · ${item.date}</small>
                </div>
              `).join("") || `<div class="empty">No active reservations.</div>`
            }
          </div>
        </article>

        <article class="info-card dark seller-panel">
          <div class="seller-panel-head">
            <div>
              <p class="kicker">Product requests</p>
              <h3>Demand opportunities</h3>
            </div>
          </div>

          <div class="seller-list">
            ${
              lowStockProducts.map((product) => `
                <div>
                  <span class="pill red">Request</span>
                  <b>${product.name}</b>
                  <small>${actionFor(product)}</small>
                </div>
              `).join("") || `
                <div>
                  <span class="pill green">Stable</span>
                  <b>No urgent product request</b>
                  <small>Keep monitoring QR receipts and reservations.</small>
                </div>
              `
            }
          </div>
        </article>
      </section>
    `);

    byId("sellerAddSale")?.addEventListener("click", () => {
      const product = demandRows.find((item) => item.liveStatus !== "Out of Stock") || products[0];
      if (product) addReceipt(product);
    });

    byId("sellerResetInventory")?.addEventListener("click", () => {
      localStorage.removeItem(keys.inventory);
      renderSeller();
    });

    document.querySelectorAll(".seller-stock-form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();

        const product = DATA.products.find((item) => item.id === form.dataset.id);
        const input = form.querySelector("input[name='stock']");

        setProductInventory(
          form.dataset.id,
          input.value,
          product?.status === "Pre-order" ? "Pre-order" : ""
        );

        renderSeller();
      });
    });

    document.querySelectorAll(".seller-view-product").forEach((button) => {
      button.addEventListener("click", () => {
        const product = demandRows.find((item) => item.id === button.dataset.id);
        if (!product) return;

        openModal(`
          <h2>${product.name}</h2>
          <p>${product.description}</p>
          <p><b>Status:</b> ${product.liveStatus} · <b>Stock:</b> ${product.liveStock} · <b>Demand score:</b> ${product.demandScore}</p>
          <p><b>Recommended seller action:</b> ${actionFor(product)}</p>
        `);
      });
    });
  }

  function renderLogin() {
    shell(`<section class="auth-card"><div><p class="kicker">Account access</p><h1>Welcome back, builder.</h1><p>Mock login for the frontend prototype. It saves only a demo profile in browser storage.</p></div><form id="loginForm"><label>Email<input required type="email" id="email" placeholder="builder@email.com"></label><label>Password<input required type="password" placeholder="••••••••"></label><label>Role<select id="role"><option>Buyer</option><option>Seller</option></select></label><button class="primary-btn">Login</button></form></section>`);
    byId("loginForm").addEventListener("submit", (event) => {
      event.preventDefault();
      write(keys.account, { email: byId("email").value, role: byId("role").value });
      openModal(`<h2>Login saved</h2><p>Your demo account was saved in this browser.</p><a class="primary-btn" href="index.html">Go home</a>`);
    });
  }

  const pages = {
    home: renderHome,
    discover: renderDiscover,
    stores: renderStores,
    events: renderEvents,
    receipts: renderReceipts,
    scan: renderScan,
    points: renderPoints,
    rewards: renderRewards,
    seller: renderSeller,
    login: renderLogin
  };

  (pages[page] || renderHome)();
})();