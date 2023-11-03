// require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const hbs = require("hbs");
const bcryptjs = require("bcryptjs");
const port = process.env.PORT || 5000;
const cookieParser = require("cookie-parser");
require("./db/conn");
const auth = require("./middleware/auth");
const jwt = require("jsonwebtoken");

const Register = require("./models/registers");
const Booking = require("./models/book");

const static_path = path.join(__dirname, "..", "public");
const template_path = path.join(__dirname, "..", "templates", "views");
const partials_path = path.join(__dirname, "..", "templates", "partials");

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", template_path);
hbs.registerPartials(partials_path);

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/book", (req, res) => {
  const token = req.cookies.jwt;
  token ? res.render("book") : res.render("login");
});

app.get("/bookings", async (req, res) => {
  const token = req.cookies.jwt;
  if (token) {
    try {
      const data = await Booking.findOne({token:token});
      res.render("bookings", { jsonData: data });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "An error occurred" });
    }
  } else {
    res.render("login");
  }
});

app.post("/book", async (req, res) => {
    const token = req.cookies.jwt;
  try {
    const bookingTable = new Booking({
      name: req.body.name,
      phone: req.body.phone,
      date: req.body.date,
      slot: req.body.slot,
      seats: req.body.seats,
      messege: req.body.messege,
      token: token, 
    });
    const booked = await bookingTable.save();
    res.status(201).render("index");
  } catch (error) {
    res.status(401).send("No Booking Done");
    console.log("No Booking done!");
  }
});

app.get("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    res.clearCookie("jwt");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const password = req.body.password;
    const cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const registerEmployee = new Register({
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        phone: req.body.phone,
        password: password,
        confirmpassword: cpassword,
      });

      const token = await registerEmployee.generateAuthToken();

      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 3000000000),
        httpOnly: true,
      });
      // console.log(cookie);

      const registered = await registerEmployee.save();
      res.status(201).render("login");
    } else {
      res.send("Passwords are not matching!");
      console.log(password);
      console.log(cpassword);
    }
  } catch (err) {
    res.status(400).send(err);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const useremail = await Register.findOne({ email: email });
    const isMatch = await bcryptjs.compare(password, useremail.password);

    const token = await useremail.generateAuthToken();
    res.cookie("jwt", token, {
      expires: new Date(Date.now() + 3000000000),
    });

    if (isMatch) {
      res.status(201).render("index");
    } else {
      res.send("Invalid Login Details!");
    }
  } catch (err) {
    res.status(400).send("Invalid Email!");
  }
});

app.listen(port, () => {
  console.log(`Listening to port ${port}...`);
});
