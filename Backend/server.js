const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});

const connectDB = require("./config/db");
connectDB();

app.use("/api/auth",require("./routes/authRoutes"));
app.use("/api/products",require("./routes/productRoutes"));