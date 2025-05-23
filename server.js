import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import path from "path";

const app = express();

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json()); // For JSON body parsing
app.set("view engine", "ejs");

import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "dbgoygd2h",
  api_key: "814559153155813",
  api_secret: "biRFToMgyXxl8NXiiUAK4K7orts",
});

mongoose
  .connect("mongodb+srv://yashtrivedi1020stp:2yRXysoZXRo73RTr@cluster0.xh9ogcw.mongodb.net/", {
    dbName: "Node_js_mastery_course",
  })
  .then(() => console.log("Mongo db connected"))
  .catch((err) => console.log(err));

// Routes
app.get("/", (req, res) => {
  res.render("login.ejs", { url: null });
});

app.get("/register", (req, res) => {
  res.render("register.ejs", { url: null });
});

// Multer Setup
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

// Mongoose Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  filename: String,
  public_id: String,
  imgUrl: String,
});

const User = mongoose.model("user", userSchema);

// Register Route
app.post("/register", upload.single("file"), async (req, res) => {
  const file = req.file;
  const filePath = file.path;
  const { name, email, password } = req.body;

  try {
    const cloudinaryRes = await cloudinary.uploader.upload(filePath, {
      folder: "NodeJS_Mastery_Course",
    });

    const db = await User.create({
      name,
      email,
      password,
      filename: file.originalname,
      public_id: cloudinaryRes.public_id,
      imgUrl: cloudinaryRes.secure_url,
    });

    res.redirect("/");
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    res.status(500).send("Image upload failed");
  }
});

// Login Route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log("printing the body = ", req.body);

  let user = await User.findOne({ email });
  if (!user || user.password !== password) {
    res.render("login.ejs");
  } else {
    res.render("profile.ejs", { user });
  }
});

const port = 3000;
app.listen(port, () => console.log(`server is running on port ${port}`));