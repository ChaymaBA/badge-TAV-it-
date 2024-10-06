const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Joi = require('joi');
const bcrypt = require('bcryptjs');
const fs = require('fs'); // Import the fs module for file operations
const crypto = require('crypto');


// Import the userSchema from the User model
const User = require('../models/User');
const userSchema = require('../models/User').schema;

/**add user****/
// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Uploads will be saved in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname)); // Add timestamp to avoid filename conflicts
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit, adjust as needed
});

// Add user
router.post("/", upload.single('image'), async (req, res) => {
  console.log("Received Form Data:", req.body);
  console.log("Received File:", req.file);
  try {
    const schema = Joi.object({
      name: Joi.string().required(),
      familyName: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
      role: Joi.string().required(),
      CIN: Joi.string().required(),
      fonction: Joi.string().required(),
      etablissement: Joi.string().required(),
      image: Joi.any(), // image path will be stored as a string
    });

    const { error } = schema.validate(req.body);

    if (error) {
      return res.status(422).json({ error: error.details[0].message });
    }

    if (!req.file) {
      return res.status(422).json({ error: 'Image is required' });
    }

    // Validate CIN - Must be 8 digits and start with 0 or 1
    const cinPattern = /^(0|1)\d{7}$/;
    if (!cinPattern.test(req.body.CIN)) {
      return res.status(422).json({ error: 'CIN must be a number of 8 digits starting with 0 or 1' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    // Create new user object with hashed password and image URL
    const newUser = new User({
      name: req.body.name,
      familyName: req.body.familyName,
      email: req.body.email,
      password: hashedPassword,
      role: req.body.role,
      CIN: req.body.CIN,
      fonction: req.body.fonction,
      etablissement: req.body.etablissement,
      image: req.file.path, // Save the image URL (file path)
    });

    // Save the user to the database
    const savedUser = await newUser.save();

    res.json({ message: 'User added successfully', user: savedUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



/***update user*** */
// Function to generate a random filename
function generateRandomFilename(originalname) {
  const randomString = crypto.randomBytes(10).toString('hex'); // Generate a random string
  const extension = path.extname(originalname); // Get the file extension from the original filename
  return `${randomString}_${Date.now()}${extension}`; // Combine the random string, timestamp, and extension
}

// Multer configuration for updating image
const updateStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // Updated images will be saved in the 'uploads' folder
  },
  filename: function (req, file, cb) {
    cb(null, generateRandomFilename(file.originalname)); // Generate a unique filename
  },
});

const uploadUpdate = multer({
  storage: updateStorage,
  limits: { fileSize: 1024 * 1024 * 5 }, // 5MB file size limit, adjust as needed
});

// Update user
router.put("/:id", uploadUpdate.single("image"), async (req, res) => {
  try {
    const existingUser = await User.findById(req.params.id);

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    existingUser.name = req.body.name;
    existingUser.familyName = req.body.familyName;
    existingUser.email = req.body.email;
    existingUser.password = req.body.password;
    existingUser.role = req.body.role;
    existingUser.CIN = req.body.CIN;
    existingUser.fonction = req.body.fonction;
    existingUser.etablissement = req.body.etablissement;

    // If a new image is provided, update the image path
    if (req.file) {
      // Delete the existing image file if it exists
      if (existingUser.image) {
        if (fs.existsSync(existingUser.image)) {
          fs.unlinkSync(existingUser.image);
        }
      }
      existingUser.image = req.file.path;
    }

    const updatedUser = await existingUser.save();
    console.log(updatedUser);

    res.json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});


// Get a single user
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});





// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Remove the image file if it exists
    if (user.image) {
      try {
        if (fs.existsSync(user.image)) {
          fs.unlinkSync(user.image);
          console.log(`Deleted image file: ${user.image}`);
        } else {
          console.log(`Image file not found: ${user.image}`);
        }
      } catch (deleteError) {
        console.error("Error deleting image file:", deleteError);
        return res.status(500).json({ message: "An error occurred while deleting the image file" });
      }
    }

    res.json({ message: "User deleted successfully" });
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});


module.exports = router;