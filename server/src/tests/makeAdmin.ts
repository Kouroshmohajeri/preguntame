import mongoose from "mongoose";
import User from "../models/User.js";
import dotenv from "dotenv";

dotenv.config();

const makeAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("📡 Connected to MongoDB");

    // Hardcoded admin email
    const adminEmail = "kouroshmohajeriii8@gmail.com";

    // Find user
    const user = await User.findOne({ email: adminEmail });

    if (!user) {
      console.error(`❌ User with email ${adminEmail} not found`);
      console.log(
        "💡 Make sure you have logged in at least once to create the user account",
      );
      process.exit(1);
    }

    // Check if already admin
    if (user.isAdmin && user.role === "admin") {
      console.log(`✅ User ${adminEmail} is already an admin!`);
      process.exit(0);
    }

    // Make user admin
    user.isAdmin = true;
    user.role = "admin";
    await user.save();

    console.log(`✅ SUCCESS! User ${adminEmail} is now an admin!`);
    console.log(`👤 Name: ${user.name}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔐 Role: ${user.role}`);
    console.log(`⭐ isAdmin: ${user.isAdmin}`);

    await mongoose.disconnect();
    console.log("📡 Disconnected from MongoDB");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error making user admin:", error);
    process.exit(1);
  }
};

// Run the script
makeAdmin();
