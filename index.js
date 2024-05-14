const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

const PORT = process.env.PORT || 8080;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to Database"))
  .catch((err) => {
    console.error("Error connecting to database:", err);
    process.exit(1); // Exit the process if database connection fails
  });

// Schema
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
  confirmPassword: String,
  image: String,
});

// Model
const userModel = mongoose.model("user", userSchema);

// API
app.get("/", (req, res) => {
  res.send("Server is running");
});

//sign up
app.post("/signup", async (req, res) => {
  try {
    const { email } = req.body;
    const existingUser = await userModel.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: "Email id is already registered",alert : false });
    }

    const newUser = new userModel(req.body);
    await newUser.save();

    res.status(201).json({ message: "Successfully signed up",alert : true });
  } catch (error) {
    console.error("Error signing up:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// API login
app.post("/login", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      // Email not found, return message and status 200
      return res.status(200).json({ message: "Email is not available, please sign up", alert: false });
    }

    // User found, proceed with login
    const dataSend = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      image: user.image,
    };

    res.status(200).json({ message: "Login successful", alert: true, data: dataSend });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


//product section
const schemaProduct = mongoose.Schema({
  name: String,
  category: String,
  image: String,
  price: String,
  description: String,
});
const productModel = mongoose.model("product",schemaProduct)


//save product in database
//api
app.post("/uploadProduct",async(req,res)=>{
  console.log(req.body)
  const data = await productModel(req.body)
  const datasave = await data.save()
  res.send({message : "Upload successfully"})
})

//
app.get("/product",async(req,res)=>{
  const data = await productModel.find({})
  res.send(JSON.stringify(data))
})

//server is running
app.listen(PORT, () => console.log("Server is running at port:", PORT));
