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
    account: "gunpla.account.v1"
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

  function statusClass(status) {
    if (status === "Available") return "green";
    if (status === "Pre-order") return "yellow";
    return "red";
  }

  function productCard(product) {
    const store = DATA.stores.find((item) => item.id === product.storeId);
    return `
      <article class="product-card">
        <div class="product-art"><img src="${product.image}" alt="${product.name}"></div>
        <div class="product-body">
          <div class="card-row"><span class="pill ${statusClass(product.status)}">${product.status}</span><span class="pill">${product.grade}</span></div>
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <div class="card-row"><strong>${money(product.price)}</strong><small>${store?.name || "Local store"}</small></div>
          <button class="primary-btn reserve-btn" data-id="${product.id}">Reserve Kit</button>
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
    openModal(`<h2>Reservation created</h2><p>Your digital receipt <b>${receipt.id}</b> is ready. You may claim ${receipt.points} points from the Receipts page.</p><a class="primary-btn" href="receipts.html">Open receipts</a>`);
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
    const sales = receipts.reduce((sum, receipt) => sum + Number(receipt.amount), 0);
    const lowStock = DATA.products.filter((product) => product.stock <= 5).length;
    shell(`${titleBlock("Seller dashboard", "Analytics for smarter restocking", "A sustainable seller view focused on demand, inventory, and useful customer signals.")}<section class="metric-grid"><article><span>Total sales</span><b>${money(sales)}</b></article><article><span>Receipts</span><b>${receipts.length}</b></article><article><span>Low stock kits</span><b>${lowStock}</b></article><article><span>Point claims</span><b>${getTransactions().length}</b></article></section><section class="analytics-grid"><article class="info-card dark"><h3>Inventory movement</h3>${DATA.products.map((product) => `<div class="bar-row"><span>${product.name}</span><div><i style="width:${Math.min(100, product.stock * 5)}%"></i></div><small>${product.stock} left</small></div>`).join("")}</article><article class="info-card dark"><h3>Sustainable actions</h3><p>Prioritize restocking kits with repeated reservations, avoid duplicate slow-moving stock, and use preorder labels for demand testing.</p><ul><li>Use stock status before reordering.</li><li>Promote beginner kits when event signups rise.</li><li>Bundle tools with high-demand HG kits.</li></ul></article></section>`);
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