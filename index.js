import express from "express";
import dbInit from "./database/dbinit.js";
import healthCheck from "./controller/healthCheck.js";
import dotenv from "dotenv";
import {
  createUser,
  createAdmin,
  validateAccount,
  loginUser,
  loginAdmin,
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
  getAllVehicleAdmin,
  getAllVehicleOneUserAdmin,
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
  res.status(200).json({
    message: "Protected Route",
    user_id: req.user_id,
  });
});
app.get("/admin/protected", isAuth, function (req, res) {
  res.status(200).json({
    message: "Protected Route",
    user_id: req.user_id,
    admin_id: req.admin_id,
  });
});

// Admin Routes
app.post("/admin/register", createAdmin);
app.post("/admin/login", loginAdmin);
app.get("/admin/user", getOneUserAdmin);
app.get("/admin/user/all", getAllUserAdmin);
app.put("/admin/updateUser", updateUserAdmin);
app.delete("/admin/deleteUser", deleteUserAdmin);

// User Routes
app.post("/register", createUser);
app.post("/login", loginUser);
app.put("/user/updateUser", updateUser);
app.delete("/user/deleteUser", isAuth, deleteUser);

// Admin Vehicle Routes
app.get("/admin/vehicle", getOneVehicleAdmin);
app.get("/admin/vehicle/all", getAllVehicleAdmin);
app.post("/admin/vehicle/user/all", getAllVehicleOneUserAdmin);
app.delete("/admin/vehicle/delete", deleteOneVehicleAdmin);

// User Vehicle Routes
app.post("/vehicle/create", createVehicle);
app.get("/user/vehicle/all", isAuth, getAllVehicle);
app.put("/user/vehicle/update", updateVehicleUser);
app.delete("/user/vehicle/delete", deleteVehicleUser);

// Admin Service Routes
app.get("/admin/service", getOneServiceAdmin);
app.get("/admin/service/all", getAllServiceAdmin);
app.post("/admin/service/user/all", getAllserviceOneUserAdmin);
app.delete("/admin/service/delete", deleteOneServiceAdmin);

// User Service Routes
app.post("/service/create", createService);
app.get("/user/service/all", isAuth, getAllService);
app.put("/user/service/update", updateServiceUser);
app.delete("/user/service/delete", deleteServiceUser);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
