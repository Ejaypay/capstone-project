const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGO_URI = "mongodb+srv://tagakiasda_db_user:ouvxUwCd32Q9oJF3@cluster0.23ykcun.mongodb.net/gunpla_db?retryWrites=true&w=majority";

console.log("1. Script started...");

const createAdmin = async () => {
  try {
    console.log("2. Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log('3. Connected successfully!');

    console.log("4. Hashing password...");
    const hashedPassword = await bcrypt.hash('YourSecureAdminPassword123', 10);

    console.log("5. Upserting admin user in DB...");
    const adminEmail = 'admin@gunplahub.com';

    // Find by email and update/create to guarantee role is 'admin'
    await User.findOneAndUpdate(
      { email: adminEmail },
      {
        username: 'MasterAdmin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin'
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('6. Admin account synced and created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('ERROR OCCURRED:', error.message);
    process.exit(1);
  }
};

createAdmin();