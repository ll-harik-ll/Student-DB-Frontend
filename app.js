const express = require("express");
const oracledb = require("oracledb");
const path = require("path");
require("dotenv").config();
const DBConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectionString: process.env.DB_CONNECTION_STRING
};

const app = express();
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); // Optional Explicitation
app.use(express.urlencoded({ extended: true })); // To parse form data

// Oracle DB Connection Config
const dbConfig = {
    user: "your_user",
    password: "your_password",
    connectionString: "your_connection_string"
};