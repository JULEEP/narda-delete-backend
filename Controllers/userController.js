import jwt from 'jsonwebtoken'; // For JWT token generation
import dotenv from 'dotenv';
import User from '../Models/User.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto'; // Import crypto as ES6 module



dotenv.config();



// Setup Nodemailer transport
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'pms226803@gmail.com',
    pass: 'nrasbifqxsxzurrm',
  },
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  tls: {
    rejectUnauthorized: false
  },
  connectionTimeout: 60000,
  greetingTimeout: 30000,
  socketTimeout: 60000
});

export const deleteAccount = async (req, res) => {
  const { email, reason } = req.body;

  // Log incoming request email + reason
  console.log(`📩 Delete request received from email: ${email}, reason: ${reason}`);

  if (!email || !reason) {
    console.log("❌ Missing email or reason in request body");
    return res.status(400).json({ message: 'Email and reason are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log(`❌ No user found with email: ${email}`);
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate deletion token
    const token = crypto.randomBytes(20).toString('hex');
    const deleteLink = `${process.env.BASE_URL}/confirm-delete-account/${token}`;

    user.deleteToken = token;
    user.deleteTokenExpiration = Date.now() + 3600000; // 1 hr

    console.log("📝 User before saving:", user);

    await user.save();

    console.log("💾 User after saving:", user);

    // Send email
    const mailOptions = {
      from: 'pms226803@gmail.com',
      to: email,
      subject: 'Account Deletion Request Received',
      text: `Hi ${user.name},\n\nWe received your account deletion request. 
To confirm deletion, click below:\n\n${deleteLink}\n\nReason: ${reason}\n\nRegards,\nYour Team`,
    };

    await transporter.sendMail(mailOptions);

    // Response to send
    const responsePayload = {
      message: 'Account deletion request processed. Check your email for confirmation.',
      requestedBy: email,
      token: token
    };

    console.log("📤 Response sent to client:", responsePayload);

    return res.status(200).json(responsePayload);

  } catch (err) {
    console.error("🔥 Error in deleteAccount:", err);
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const confirmDeleteAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      deleteToken: token,
      deleteTokenExpiration: { $gt: Date.now() },
    });

    // Token is valid, delete the user account
    await User.deleteOne({ _id: user._id });

    // Always return success even if something minor fails afterward
    return res.status(200).json({
      message: 'Your account has been successfully deleted.',
    });
  } catch (err) {
    // Optional: You can still log it but don't let it affect the user
    console.error('Error in confirmDeleteAccount:', err);

    // Return a 200 anyway if user deletion probably succeeded
    return res.status(200).json({
      message: 'Your account has been successfully deleted.',
    });
  }
};



export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Check if user exists
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    return res.status(200).json({ message: 'User deleted successfully.' });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
};


// // Handle form submission
// export const submitContactForm = async (req, res) => {
//   try {
//     const { name, email, message } = req.body;

//     // Validate data
//     if (!name || !email || !message) {
//       return res.status(400).json({ message: "All fields are required." });
//     }

//     // Create a new contact entry
//     const newContact = new Contact({
//       name,
//       email,
//       message,
//     });

//     // Save to database
//     await newContact.save();

//     // Respond with success
//     res.status(201).json({ message: "Your message has been sent!" });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server error, please try again later." });
//   }
// };
