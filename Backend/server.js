const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/auth', require('./routes/authRoutes'));

mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/gunpla_db")
  .then(() => {
    console.log("Connected to MongoDB database: gunpla_db");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("Database connection failure:", err));