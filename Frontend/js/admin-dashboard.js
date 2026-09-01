document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Client-side guard check
  if (!token || role !== "admin") {
    alert("Unauthorized access. Admin privileges required.");
    window.location.href = "index.html";
    return;
  }

  // Display user information if elements exist
  const usernameDisplay = document.getElementById("adminUsername");
  if (usernameDisplay) {
    usernameDisplay.textContent = localStorage.getItem("username") || "Administrator";
  }

  // Fetch admin dashboard overview data from backend
  try {
    const response = await fetch("http://localhost:5000/api/admin/dashboard", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("Failed to authenticate admin session with server.");
    }

    const data = await response.json();
    console.log("Admin payload loaded:", data);
    
    // Render dynamic statistics or lists into your UI containers here
    renderAdminStats(data);

  } catch (error) {
    console.error("Dashboard synchronization error:", error);
    localStorage.clear();
    window.location.href = "index.html";
  }

  // Handle Admin Logout action
  const logoutButton = document.getElementById("logoutBtn");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = "index.html";
    });
  }
});

function renderAdminStats(data) {
  // Example helper placeholder to populate dashboard UI counters
  const statsContainer = document.getElementById("adminStats");
  if (statsContainer && data.stats) {
    statsContainer.innerHTML = `
      <p>Total Users: ${data.stats.totalUsers || 0}</p>
      <p>Total Products: ${data.stats.totalProducts || 0}</p>
    `;
  }
}