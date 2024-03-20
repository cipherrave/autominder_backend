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

import cors from "cors";
import {
  createService,
  deleteOneServiceAdmin,
  deleteServiceUser,
  getAllService,
  getAllServiceAdmin,
  getAllserviceOneUserAdmin,
  getOneService,
  getOneServiceAdmin,
  updateServiceUser,
} from "./controller/serviceController.js";

const app = express();
//import links

dotenv.config();
const port = process.env.PORT;

//MIDDLEWARE
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cors());

//INITIALIZE DATABASE
dbInit();

// Pages Routes
app.get("/", homePage);
app.get("/error", errorPage);

// Public Routes
app.get("/health", healthCheck);

// Validation Route
app.get("/validate/:validation_key", validateAccount);

// Dashboard
app.get("/protected", isAuth, function (req, res) {
  res.status(200).json({ message: "Protected Route", user: req.user });
});

// Admin Routes
app.get("/admin/user/", isAuth, getOneUserAdmin);
app.get("/admin/user/all", isAuth, getAllUserAdmin);
app.put("/admin/updateUser", isAuth, updateUserAdmin);
app.delete("/admin/deleteUser", isAuth, deleteUserAdmin);

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
app.post("/vehicle/create", isAuth, createVehicle);
app.get("/user/vehicle", isAuth, getOneVehicle);
app.get("/user/vehicle/all", isAuth, getAllVehicle);
app.put("/user/vehicle/update", isAuth, updateVehicleUser);
app.delete("/user/vehicle/delete", isAuth, deleteVehicleUser);

// Admin Service Routes
app.get("/admin/service", isAuth, getOneServiceAdmin);
app.get("/admin/service/all", isAuth, getAllServiceAdmin);
app.post("/admin/service/user/all", isAuth, getAllserviceOneUserAdmin);
app.delete("/admin/service/delete", isAuth, deleteOneServiceAdmin);

// User Service Routes
app.post("/service/create", isAuth, createService);
app.get("/user/service", isAuth, getOneService);
app.get("/user/service/all", isAuth, getAllService);
app.put("/user/service/update", isAuth, updateServiceUser);
app.delete("/user/service/delete", isAuth, deleteServiceUser);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
