const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth"); // Your existing JWT verification middleware
const adminOnly = require("../middleware/admin"); // The new admin check

router.get("/dashboard", auth, adminOnly, async (req, res) => {
  try {
    res.status(200).json({ 
      message: "Welcome to the secure admin panel",
      adminId: req.user.id 
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;