const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const switchModeBtn = document.getElementById("switchModeBtn");
const registerTab = document.getElementById("registerTab");
const loginTab = document.getElementById("loginTab");
const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const openRegisterBtn = document.getElementById("openRegisterBtn");
const openLoginBtn = document.getElementById("openLoginBtn");
const authMessage = document.getElementById("authMessage");

function setMode(mode) {
  const isLogin = mode === "login";

  authTitle.textContent = isLogin ? "WELCOME BACK!" : "CREATE ACCOUNT";
  authSubtitle.textContent = isLogin ? "Don't have an account?" : "Already have an account?";
  switchModeBtn.textContent = isLogin ? "Sign Up" : "Login";

  loginTab.classList.toggle("active", isLogin);
  registerTab.classList.toggle("active", !isLogin);

  loginForm.classList.toggle("active", isLogin);
  registerForm.classList.toggle("active", !isLogin);

  authMessage.textContent = "";
}

switchModeBtn.addEventListener("click", () => {
  const loginIsActive = loginForm.classList.contains("active");
  setMode(loginIsActive ? "register" : "login");
});

registerTab.addEventListener("click", () => setMode("register"));
loginTab.addEventListener("click", () => setMode("login"));
openRegisterBtn.addEventListener("click", () => setMode("register"));
openLoginBtn.addEventListener("click", () => setMode("login"));

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();
  authMessage.textContent = "Login successful! Redirecting...";

  setTimeout(() => {
    window.location.href = "index.html";
  }, 800);
});

registerForm.addEventListener("submit", (event) => {
  event.preventDefault();
  authMessage.textContent = "Account created successfully! You may now login.";

  setTimeout(() => {
    setMode("login");
  }, 900);
});

const urlParams = new URLSearchParams(window.location.search);
const startingMode = urlParams.get("mode") === "register" ? "register" : "login";
setMode(startingMode);