const express = require("express");
const path = require("path");
const { userRoutes } = require("./routes");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = process.env.PORT;

//Allow CORS
app.use(cors());

//Declare global
global.userState = null;

//Declare routes
app.use("/user", userRoutes);

//Static Files
app.use(express.static(path.join(__dirname, "public")));

app.listen(port, (error) => {
  if (error) console.log("Something went wrong...");
  console.log("serve is running port: ", port);
});
