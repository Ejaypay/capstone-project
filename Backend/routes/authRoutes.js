const router = require("express").Router();
const authController = require("../controllers/authController");
const verifyAuth = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected Admin Route Test
router.get("/admin-dashboard", verifyAuth, verifyAuth.requireRole("admin"), (req, res) => {
  res.json({ message: "Welcome to the admin dashboard!" });
});

module.exports = router;