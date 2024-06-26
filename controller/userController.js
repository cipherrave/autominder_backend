import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import { validateFail } from "./pageController.js";
import { validated } from "./pageController.js";

// Create an admin
export async function createAdmin(req, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cipherravedev@gmail.com",
      pass: "zmhmviixzmzururu",
    },
  });

  try {
    // Generate unique users id and validation key using nanoid
    let generatedID = nanoid();
    const user_id = generatedID;

    // Generate validation key that will be sent via email worker
    let generatedValidationKey = nanoid();
    const validation_key = generatedValidationKey;

    // Establish what needs to be included in JSON for POST, and encrypt it
    const { email, password, fname, lname } = req.body;
    if (!email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      const admin_id = nanoid();
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const validated = false;
      const newAdmin = await pool.query(
        "INSERT INTO users (user_id, fname, lname, email, password, validation_key, validated, admin_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          user_id,
          fname,
          lname,
          email,
          encryptedPassword,
          validation_key,
          validated,
          admin_id,
        ]
      );

      const mailOptions = {
        from: "cipherravedev@gmail.com",
        to: email,
        subject: "Autominder Verification Link",
        text:
          "Thank you for using our service. Here's the link to activate your account: https://autominder-backend.onrender.com/validate/" +
          validation_key,
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent");
        }
      });

      // Generate a response
      const apiResponse = {
        message: "Admin created successfully. Check email for validation link",
      };
      res.status(200).json(newAdmin.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Create a user PERSONAL, COMPANY
export async function createUser(req, res) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "cipherravedev@gmail.com",
      pass: "zmhmviixzmzururu",
    },
  });

  try {
    // Generate unique users id and validation key using nanoid
    let generatedID = nanoid();
    const user_id = generatedID;

    // Generate validation key that will be sent via email worker
    let generatedValidationKey = nanoid();
    const validation_key = generatedValidationKey;

    // Establish what needs to be included in JSON for POST, and encrypt it
    const { email, password, fname, lname, company, company_name, admin } =
      req.body;
    if (!email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Inserting encrypted new users details
      const salt = await bcrypt.genSalt(10);
      const encryptedPassword = await bcrypt.hash(password, salt);
      const validated = false;
      const newUser = await pool.query(
        "INSERT INTO users (user_id, fname, lname, email, password, validation_key, validated, company, company_name) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          user_id,
          fname,
          lname,
          email,
          encryptedPassword,
          validation_key,
          validated,
          company,
          company_name,
        ]
      );

      const mailOptions = {
        from: "cipherravedev@gmail.com",
        to: email,
        subject: "Autominder Verification Link",
        text:
          "Thank you for using our service. Here's the link to activate your account: https://autominder-backend.onrender.com/validate/" +
          validation_key,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent");
        }
      });

      res.status(200).json(newUser.rows[0]);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Email validation - ADMIN, USER, COMPANY
export async function validateAccount(req, res) {
  try {
    // Check validation key from url given in email
    let { validation_key } = req.params;
    const isValidationKeyValid = await pool.query(
      "SELECT * FROM users WHERE validation_key = $1",
      [validation_key]
    );
    if (isValidationKeyValid.rowCount === 0) {
      return res
        .status(404)
        .json("Validation key invalid. Please make sure correct link is used");
    } else {
      const user_id = isValidationKeyValid.rows[0].user_id;
      const validValidationKey = await pool.query(
        "UPDATE users SET validated = true WHERE user_id = $1",
        [user_id]
      );

      const apiResponse = {
        message: "Validation successful",
        email: isValidationKeyValid.rows[0].email,
      };
      validated;
      res.status(200).json(apiResponse);
    }
  } catch (error) {
    validateFail;
    res.status(500).json(error.message);
  }
}

// Log into account - ADMIN
export async function loginAdmin(req, res) {
  try {
    // Making sure users fill all fields
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Check users email availability
      const checkEmail = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (checkEmail.rowCount === 0) {
        return res.status(404).json("Email not found");
      } else {
        // Compare using hashed password
        const isPasswordCorrect = await bcrypt.compare(
          password,
          checkEmail.rows[0].password
        );
        if (!isPasswordCorrect) {
          return res.status(401).json("Password incorrect");
        } else {
          // Check validation status
          const validated = true;
          const checkValidationStatus = await pool.query(
            "SELECT validated FROM users WHERE (email, validated) = ($1, $2)",
            [email, validated]
          );
          if (checkValidationStatus.rowCount === 0) {
            return res
              .status(404)
              .json(
                "Email has not been validated. Please check your email inbox for validation link. Check your spam folder too."
              );
          } else {
            // If password matches, create a token using jsonwebtoken
            // Generate JWT token using userData with SECRET and EXPIRATION from .env file
            const userData = {
              user_id: checkEmail.rows[0].user_id,
              fname: checkEmail.rows[0].fname,
              lname: checkEmail.rows[0].lname,
              email: checkEmail.rows[0].email,
              validated: checkEmail.rows[0].validated,
              admin_id: checkEmail.rows[0].admin_id,
            };
            const token = jwt.sign(userData, process.env.JWT_SECRET);

            // Generate response
            const apiResponse = {
              message: "Login successful",
              users: {
                user_id: checkEmail.rows[0].user_id,
                fname: checkEmail.rows[0].fname,
                lname: checkEmail.rows[0].lname,
                email: checkEmail.rows[0].email,
                admin_id: checkEmail.rows[0].admin_id,
              },
              token: token,
            };

            res.status(200).json(apiResponse);
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Log into account - USER, COMPANY
export async function loginUser(req, res) {
  try {
    // Making sure users fill all fields
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json("Missing required fields");
    } else {
      // Check users email availability
      const checkEmail = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      if (checkEmail.rowCount === 0) {
        return res.status(404).json("Email not found");
      } else {
        // Compare using hashed password
        const isPasswordCorrect = await bcrypt.compare(
          password,
          checkEmail.rows[0].password
        );
        if (!isPasswordCorrect) {
          return res.status(401).json("Password incorrect");
        } else {
          // Check validation status
          const validated = true;
          const checkValidationStatus = await pool.query(
            "SELECT validated FROM users WHERE (email, validated) = ($1, $2)",
            [email, validated]
          );
          if (checkValidationStatus.rowCount === 0) {
            return res
              .status(404)
              .json(
                "Email has not been validated. Please check your email inbox for validation link. Check your spam folder too."
              );
          } else {
            // If password matches, create a token using jsonwebtoken
            // Generate JWT token using userData with SECRET and EXPIRATION from .env file
            const userData = {
              user_id: checkEmail.rows[0].user_id,
              fname: checkEmail.rows[0].fname,
              lname: checkEmail.rows[0].lname,
              email: checkEmail.rows[0].email,
              validated: checkEmail.rows[0].validated,
              company_name: checkEmail.rows[0].company_name,
            };
            const token = jwt.sign(userData, process.env.JWT_SECRET);

            // Generate response
            const apiResponse = {
              message: "Login successful",
              users: {
                user_id: checkEmail.rows[0].user_id,
                fname: checkEmail.rows[0].fname,
                lname: checkEmail.rows[0].lname,
                email: checkEmail.rows[0].email,
                company_name: checkEmail.rows[0].company_name,
              },
              token: token,
            };

            res.status(200).json(apiResponse);
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get one user - ADMIN
export async function getOneUserAdmin(req, res) {
  try {
    // Enter user_id of users/admin to get info from
    const { user_id } = req.body;
    const oneUser = await pool.query("SELECT * FROM users WHERE iser_id = $1", [
      user_id,
    ]);
    if (oneUser.rowCount === 0) {
      return res.status(401).json("User account not found");
    } else {
      return res.json(oneUser.rows);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all users - ADMIN
export async function getAllUserAdmin(req, res) {
  try {
    // Query to list all users in database
    const alluser = await pool.query("SELECT * FROM users");
    return res.json(alluser.rows);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update users/admin account - ADMIN
export async function updateUserAdmin(req, res) {
  try {
    const { fname, lname, email, password, company_name, user_id } = req.body;
    // Update credentials based on email
    const updateUserAdmin = await pool.query(
      "UPDATE users SET (fname, lname, email, password, company_name) = ($1, $2, $3, $4, $5) WHERE (user_id) = ($6)",
      [fname, lname, email, password, company_name, user_id]
    );

    // Read back new data from user_id
    const updateUserAdminRead = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    const newUserData = {
      message: "User data has been updated",
      user_id: updateUserAdminRead.rows[0].user_id,
      fname: updateUserAdminRead.rows[0].fname,
      lname: updateUserAdminRead.rows[0].lname,
      email: updateUserAdminRead.rows[0].email,
      password: password,
      admin_id: updateUserAdminRead.rows[0].admin_id,
      company_name: updateUserAdminRead.rows[0].company_name,
    };

    res.status(200).json(newUserData);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a user - USER, COMPANY
export async function updateUser(req, res) {
  try {
    const { fname, lname, password, company, company_name, user_id } = req.body;
    // Generate password hash
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);
    // Update users with user_id specified in token
    const updateUser = await pool.query(
      "UPDATE users SET (fname, lname, password, company, company_name) = ($1, $2, $3, $4, $5) WHERE (user_id) = ($6)",
      [fname, lname, encryptedPassword, company, company_name, user_id]
    );
    // Read back new data from user_id
    const updateUserRead = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );

    const updatedUserData = {
      user_id: updateUserRead.rows[0].user_id,
      fname: updateUserRead.rows[0].fname,
      lname: updateUserRead.rows[0].lname,
      email: updateUserRead.rows[0].email,
      company_name: updateUserRead.rows[0].company_name,
      admin_id: updateUserRead.rows[0].admin_id,
    };
    const token = jwt.sign(updatedUserData, process.env.JWT_SECRET);

    res.status(200).json(updatedUserData);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete own or other account - ADMIN.
export async function deleteUserAdmin(req, res) {
  try {
    // Delete data from specified email
    const { user_id } = req.body;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User ID not found");
    } else {
      const deleteUser = await pool.query(
        "DELETE FROM users WHERE user_id = $1",
        [user_id]
      );
      res.json("User has been deleted");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete own account - USERS & COMPANY
export async function deleteUser(req, res) {
  try {
    // Read user_id from token
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("user id not found.");
    } else {
      // Delete users from user_id token
      const deleteUser = await pool.query(
        "DELETE FROM users WHERE user_id=$1",
        [user_id]
      );
      res.json("user has been deleted");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
