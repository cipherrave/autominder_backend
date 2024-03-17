import express from "express";
import dbInit from "./database/dbinit.js";
import healthCheck from "./controller/healthCheck.js";
import dotenv from "dotenv";
import {
  createUser,
  validateAccount,
  loginUser,
  getOneUserAdmin,
  getAllUserAdmin,
  updateUserAdmin,
  updateUser,
  deleteUserAdmin,
  deleteUser,
} from "./controller/userController.js";
import isAuth from "./utils/isAuth.js";
import { errorPage, homePage } from "./controller/pageController.js";
import {
  createVehicle,
  deleteOneVehicleAdmin,
  deleteVehicleUser,
  getAllVehicle,
  getAllVehicleOneUserAdmin,
  getOneVehicle,
  getOneVehicleAdmin,
  updateVehicleUser,
} from "./controller/vehicleController.js";

const app = express();
//import links

dotenv.config();
const port = process.env.PORT;

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

//INITIALIZE DATABASE
dbInit();

// Pages Routes
app.get("/", homePage);
app.get("/error", errorPage);

// Public Routes
app.get("/health", healthCheck);

// Validation Route
app.get("/validate/:validation_key", validateAccount);

// Admin Routes
app.get("/admin/users/", isAuth, getOneUserAdmin);
app.get("/admin/users/all", isAuth, getAllUserAdmin);
app.put("/admin/updateUser", isAuth, updateUserAdmin);
app.delete("/admin/deleteUser", isAuth, deleteUserAdmin);

// Business Owner Routes

// User Routes
app.post("/register", createUser);
app.post("/login", loginUser);
app.put("/user/updateUser", isAuth, updateUser);
app.delete("/user/deleteUser", isAuth, deleteUser);

// Admin Vehicle Routes
app.get("/admin/vehicle", isAuth, getOneVehicleAdmin);
app.get("/admin/vehicle/all", isAuth, getAllVehicle);
app.post("/admin/vehicle/user/all", isAuth, getAllVehicleOneUserAdmin);
app.delete("/admin/vehicle/delete", isAuth, deleteOneVehicleAdmin);

// User Vehicle Routes
app.post("/links/create", isAuth, createVehicle);
app.get("/user/links", isAuth, getOneVehicle);
app.get("/user/links/all", isAuth, getAllVehicle);
app.put("/user/links/update", isAuth, updateVehicleUser);
app.delete("/user/links/delete", isAuth, deleteVehicleUser);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
