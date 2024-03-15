import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import fs from "fs";
import fastcsv from "fast-csv";

//Create a vehicle
export async function createVehicle(req, res) {
  try {
    // Read user_id from token
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const { vname, reg_num, brand, model, purchase_year, mileage } = req.body;
    }
    if (!vname || !reg_num || !brand || !model || !mileage) {
      return res.status(400).json("Missing required fields");
    } else {
      // Generate vehicle_id using nanoid
      let generatedID = nanoid();
      const vehicle_id = generatedID;
      // Insert details into vehicle table
      const newVehicle = await pool.query(
        "INSERT INTO vehicle (vehicle_id, vname, reg_num, brand, model, purchase_year, mileage, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
        [
          vehicle_id,
          vname,
          reg_num,
          brand,
          model,
          purchase_year,
          mileage,
          user_id,
        ]
      );

      const readNewVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE vehicle_id=$1",
        [vehicle_id]
      );

      // Generate response
      const apiResponse = {
        message: "A new vehicle is stored",
        data: {
          vehicle_id: readNewVehicle.rows[0].vehicle_id,
          vname: readNewVehicle.rows[0].vname,
          reg_num: readNewVehicle.rows[0].reg_num,
          brand: readNewVehicle.rows[0].brand,
          model: readNewVehicle.rows[0].model,
          purchase_year: readNewVehicle.rows[0].purchase_year,
          mileage: readNewVehicle.rows[0].mileage,
        },
      };
      res.json(apiResponse);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all vehicle - ADMIN
export async function getAllVehicleAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_vehicles_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all vehicles in vehicles table regardless of user
      const allVehicle = await pool.query("SELECT * FROM vehicle");

      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allVehicle.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allVehicle.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_vehicles_admin.csv generated");
        return res.json(allVehicle.rows);
      } else {
        return res.json(
          "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
        );
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all vehicle from one user - ADMIN
export async function getAllVehicleOneUserAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { email } = req.body;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_vehicle_one_user_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all vehicles in vehicles table from one user
      const allVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE email = $1",
        [email]
      );
      if (allVehicle.rowCount === 0) {
        return res.status(404).json("No vehicle with specified email");
      }
      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allVehicle.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allVehicle.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_vehicle_one_user_admin.csv generated");
        return res.json(allVehicle.rows);
      } else {
        return res.json(
          "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
        );
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all vehicle - USER
export async function getAllVehicle(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_your_vehicle_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      // List all vehicle in vehicle table where the user_id is same as in token
      const allVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE user_id = $1",
        [user_id]
      );
      if (allVehicle.rowCount === 0) {
        return res.status(404).json("No vehicle with specified user_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(allVehicle.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(allVehicle.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("all_your_vehicles_user.csv generated");
          return res.json(allVehicle.rows);
        } else {
          return res.json(
            "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

//Get one vehicle - ADMIN
export async function getOneVehicleAdmin(req, res) {
  try {
    // Read admin_id from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_vehicle_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      const { vehicle_id } = req.body;
      const oneVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE vehicle_id=$1",
        [vehicle_id]
      );
      if (oneVehicle.rowCount === 0) {
        return res.status(404).json("No vehicle with specified vehicle_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneVehicle.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneVehicle.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_vehicle_admin.csv generated");
          return res.json(oneVehicle.rows);
        } else {
          return res.json(
            "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

//Get one vehicle - USER
export async function getOneVehicle(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_vehicle_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const { vehicle_id } = req.body;
      const oneVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE (vehicle_id)  = $1",
        [vehicle_id]
      );
      if (oneVehicle.rowCount === 0) {
        return res.status(404).json("No vehicle with specified vehicle_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneVehicle.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneVehicle.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_vehicle_user.csv generated");
          return res.json(oneVehicle.rows);
        } else {
          return res.json(
            "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
          );
        }
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a vehicle - USER
export async function updateVehicleUser(req, res) {
  try {
    // Read data from token
    const authData = req.user;
    const user_id = authData.user_id;

    // Check user id availability in token
    const checkUserId = await pool.query(
      "SELECT * FROM users WHERE user_id = $1",
      [user_id]
    );
    if (checkUserId.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const {
        vehicle_id,
        vname,
        reg_num,
        brand,
        model,
        purchase_year,
        mileage,
      } = req.body;

      // Update vehicles with user_id specified in token
      const updateVehicle = await pool.query(
        "UPDATE vehicle SET (vname, reg_num, brand, model, purchase_year, mileage) = ($1, $2, $3, $4, $5, $6) WHERE vehicle_id= $7",
        [vname, reg_num, brand, model, purchase_year, mileage, vehicle_id]
      );

      // Read back new data from user_id
      const updateVehicleRead = await pool.query(
        "SELECT * FROM vehicle WHERE vehicle_id = $1",
        [vehicle_id]
      );

      const updatedVehicleData = {
        message: "vehicle data has been updated",
        vname: updateVehicleRead.rows[0].vname,
        reg_num: updateVehicleRead.rows[0].reg_num,
        brand: updateVehicleRead.rows[0].brand,
        model: updateVehicleRead.rows[0].moddel,
        purchase_year: updateVehicleRead.rows[0].purchase_year,
        mileage: updateVehicleRead.rows[0].mileage,
        vehicle_id: updateVehicleRead.rows[0].vehicle_id,
      };

      res.status(200).json(updatedVehicleData);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a vehicle - ADMIN
export async function deleteOneVehicleAdmin(req, res) {
  try {
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      const { vehicle_id } = req.body;
      const deleteOneVehicle = await pool.query(
        "DELETE FROM vehicle WHERE vehicle_id = $1",
        [vehicle_id]
      );
      if (deleteOneVehicle.rowCount === 0) {
        return res.status(404).json("Vehicle not found.");
      } else {
        res.json("Vehicle has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a vehicle - USER
export async function deleteVehicleUser(req, res) {
  try {
    const authData = req.user;
    const user_id = authData.user_id;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      const vehicle_id = req.body;
      const deleteOneVehicle = await pool.query(
        "DELETE FROM vehicle WHERE (vehicle_id, user_id) = ($1, $2)",
        [vehicle_id, user_id]
      );
      if (deleteOneVehicle.rowCount === 0) {
        return res
          .status(404)
          .json("Vehicle not found or the vehicle is not yours.");
      } else {
        res.json("Vehicle has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
