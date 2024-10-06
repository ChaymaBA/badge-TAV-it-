const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const ValidateUser = require("./validation/Users.validation");
const usersRouter = require("./routes/Users");
const badgesRouter = require("./routes/Badges");

const User = require("./models/User");
const Badge = require("./models/Badge");

const app = express();
const path = require('path'); // Import the 'path' module

const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb+srv://ilefchebil:8orCgRfciaXqBF1q@cluster0.rw1d2p8.mongodb.net/?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to database, server running on port 5000');
}).catch(err => { console.log(err) });



// Login route
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Compare the provided password with the stored password
    const isPasswordValid = await bcrypt.compare(password, user.password);


    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Create a JWT token
    const token = jwt.sign(
      { userId: user._id, Email: user.email, Role: user.role },
      "secret_key" // Replace with your own secret key
    );

    // Redirect based on the user's role
    if (user.role === "admin") {
      return res.json({ token, redirect: "/Badges" });
    } else if (user.role === "responsable") {
      return res.json({ token, redirect: "/ResponsableBadge" });
    } else if (user.role === "printer") {
      return res.json({ token, redirect: "/ImprimeBadge" });
    } else {
      return res.json({ token, redirect: "/Home" });
    }
  } catch (error) {
    console.log("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});



app.use("/api/user", usersRouter);
app.use('/api/badges', badgesRouter);

// Serve images from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});


