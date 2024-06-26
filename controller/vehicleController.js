import pool from "../database/connection.js";
import { nanoid } from "nanoid";

//Create a vehicle
export async function createVehicle(req, res) {
  try {
    const {
      vname,
      reg_num,
      brand,
      model,
      purchase_year,
      mileage,
      notes,
      user_id,
    } = req.body;
    // Generate vehicle_id using nanoid
    let generatedID = nanoid();
    const vehicle_id = generatedID;
    // Insert details into vehicle table
    const newVehicle = await pool.query(
      "INSERT INTO vehicle (vehicle_id, vname, reg_num, brand, model, purchase_year, mileage, notes, user_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
      [
        vehicle_id,
        vname,
        reg_num,
        brand,
        model,
        purchase_year,
        mileage,
        notes,
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
        notes: readNewVehicle.rows[0].notes,
        user_id: readNewVehicle.rows[0].user_id,
      },
    };
    res.json(apiResponse);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all vehicle - ADMIN
export async function getAllVehicleAdmin(req, res) {
  try {
    const allVehicle = await pool.query("SELECT * FROM vehicle");
    return res.json(allVehicle.rows);
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
    const { user_id } = req.body;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all vehicles in vehicles table from one user
      const allVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE user_id = $1",
        [user_id]
      );
      if (allVehicle.rowCount === 0) {
        return res.status(404).json("No vehicle with specified user_id");
      } else {
        return res.json(allVehicle.rows);
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
      return res.json(allVehicle.rows);
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

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      const { vehicle_id } = req.params;
      const oneVehicle = await pool.query(
        "SELECT * FROM vehicle WHERE vehicle_id=$1",
        [vehicle_id]
      );
      if (oneVehicle.rowCount === 0) {
        return res
          .status(404)
          .json("No vehicle with specified registration number");
      } else {
        return res.json(oneVehicle.rows);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a vehicle - USER
export async function updateVehicleUser(req, res) {
  try {
    const {
      vname,
      reg_num,
      brand,
      model,
      purchase_year,
      mileage,
      notes,
      vehicle_id,
      user_id,
    } = req.body;
    // Check vehicle_id availability in database
    const checkVehicleId = await pool.query(
      "SELECT * FROM vehicle WHERE (vehicle_id, user_id) = ($1,$2)",
      [vehicle_id, user_id]
    );
    if (checkVehicleId.rowCount === 0) {
      return res.status(404).json("Vehicle does not exist");
    } else {
      // Update vehicles with user_id specified in token
      const updateVehicle = await pool.query(
        "UPDATE vehicle SET (vname, brand, model, reg_num, purchase_year, mileage, notes) = ($1, $2, $3, $4, $5, $6, $7) WHERE (vehicle_id, user_id)= ($8, $9)",
        [
          vname,
          brand,
          model,
          reg_num,
          purchase_year,
          mileage,
          notes,
          vehicle_id,
          user_id,
        ]
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
        notes: updateVehicleRead.rows[0].notes,
        user_id: updateVehicleRead.rows[0].user_id,
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
    const { vehicle_id } = req.body;
    const deleteOneVehicle = await pool.query(
      "DELETE FROM vehicle WHERE vehicle_id = $1",
      [vehicle_id]
    );
    res.json("Vehicle has been deleted");
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a vehicle - USER
export async function deleteVehicleUser(req, res) {
  try {
    const { vehicle_id, user_id } = req.body;
    const checkUserID = await pool.query(
      "SELECT * FROM vehicle WHERE vehicle_id=$1",
      [vehicle_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("Vehicle_id not found.");
    } else {
      const deleteOneVehicle = await pool.query(
        "DELETE FROM vehicle WHERE (vehicle_id,user_id)=($1,$2)",
        [vehicle_id, user_id]
      );
      res.json("Vehicle has been deleted");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
