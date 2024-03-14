import express from "express";
import dbInit from "./database/dbinit.js";
import healthCheck from "./controller/healthCheck.js";
import dotenv from "dotenv";
import {
  createAdmin,
  createUser,
  deleteUser,
  deleteUserAdmin,
  getAllUsers,
  getOneUser,
  loginAdmin,
  loginUser,
  updateUser,
  updateUserAdmin,
  validateAccount,
} from "./controller/userController.js";
import { redirectController } from "./controller/redirectController.js";
import isAuth from "./utils/isAuth.js";
import { errorPage, homePage } from "./controller/pageController.js";

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
app.post("/register/admin", createAdmin);
app.post("/login/admin", loginAdmin);
app.get("/admin/users/", isAuth, getOneUser);
app.get("/admin/users/all", isAuth, getAllUsers);
app.put("/admin/updateUser", isAuth, updateUserAdmin);
app.delete("/admin/deleteUser", isAuth, deleteUserAdmin);

// Business Owner Routes

// User Routes
app.post("/register", createUser);
app.post("/login", loginUser);
app.put("/user/updateUser", isAuth, updateUser);
app.delete("/user/deleteUser", isAuth, deleteUser);

// Admin Vehicle Routes
app.get("/admin/links", isAuth, getOneLinkAdmin);
app.get("/admin/links/all", isAuth, getAllLinksAdmin);
app.post("/admin/links/user/all", isAuth, getAllLinksOneUserAdmin);
app.delete("/admin/links/delete", isAuth, deleteOneLinkAdmin);

// User Vehicle Routes
app.post("/links/create", isAuth, createLink);
app.get("/user/links", isAuth, getOneLink);
app.get("/user/links/all", isAuth, getAllLinks);
app.put("/user/links/update", isAuth, updateLinkUser);
app.delete("/user/links/delete", isAuth, deleteOneLink);

// Redirect route
app.get("/:shorturl", redirectController);

//PORT
app.listen(port, () => {
  console.log("Server is running on port 8989");
});
