import pool from "../database/connection.js";
import { nanoid } from "nanoid";

//Create a service
export async function createService(req, res) {
  try {
    // Read user_id from token
    const {
      next_mileage,
      next_date,
      cost,
      service_name,
      place,
      notes,
      service_date,
      vehicle_id,
      user_id,
    } = req.body;
    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    // Generate service_id using nanoid
    let generatedID = nanoid();
    const service_id = generatedID;
    // Insert details into service table
    const newService = await pool.query(
      "INSERT INTO service (service_id, next_mileage, next_date, cost, service_name, place, notes, service_date, user_id, vehicle_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *",
      [
        service_id,
        next_mileage,
        next_date,
        cost,
        service_name,
        place,
        notes,
        service_date,
        user_id,
        vehicle_id,
      ]
    );

    const readNewService = await pool.query(
      "SELECT * FROM service WHERE service_id=$1",
      [service_id]
    );

    // Generate response
    const apiResponse = {
      message: "A new service entry is made",
      data: {
        service_id: readNewService.rows[0].service_id,
        next_mileage: readNewService.rows[0].next_mileage,
        next_date: readNewService.rows[0].next_date,
        cost: readNewService.rows[0].cost,
        service_name: readNewService.rows[0].service_name,
        place: readNewService.rows[0].place,
        notes: readNewService.rows[0].notes,
        service_date: readNewService.rows[0].service_date,
        user_id: readNewService.rows[0].user_id,
        vehicle_id: readNewService.rows[0].vehicle_id,
      },
    };
    res.json(apiResponse);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all service - ADMIN
export async function getAllServiceAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all services in links table regardless of user
      const allService = await pool.query("SELECT * FROM service");
      return res.json(allService.rows);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all service from one user - ADMIN
export async function getAllserviceOneUserAdmin(req, res) {
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
      // List all links in links table from one user
      const allService = await pool.query(
        "SELECT * FROM service WHERE user_id = $1",
        [user_id]
      );
      if (allService.rowCount === 0) {
        return res.status(404).json("No service with specified email");
      } else {
        return res.json(allService.rows);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all service - USER
export async function getAllService(req, res) {
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
      // List all service in service table where the user_id is same as in token
      const allService = await pool.query(
        "SELECT * FROM service WHERE user_id = $1",
        [user_id]
      );
      return res.json(allService.rows);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

//Get one service - ADMIN
export async function getOneServiceAdmin(req, res) {
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
      // Get data from shorturl
      const { service_id } = req.body;
      const oneService = await pool.query(
        "SELECT * FROM service WHERE service_id=$1",
        [service_id]
      );
      if (oneService.rowCount === 0) {
        return res.status(404).json("No service with specified service id");
      } else {
        return res.json(oneService.rows);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

//Get one service - USER
export async function getOneService(req, res) {
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
      // Get data from service_id
      const { service_id } = req.body;
      const oneService = await pool.query(
        "SELECT * FROM service WHERE (service_id, user_id)  = ($1, $2)",
        [service_id, user_id]
      );
      if (oneService.rowCount === 0) {
        return res.status(404).json("No service with specified service_id");
      } else {
        return res.json(oneService.rows);
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Update a service - USER
export async function updateServiceUser(req, res) {
  try {
    const {
      service_id,
      next_mileage,
      next_date,
      cost,
      service_name,
      place,
      notes,
      service_date,
    } = req.body;
    // Update links with user_id specified in token
    const updateService = await pool.query(
      "UPDATE service SET (next_mileage, next_date, cost, service_name, place, notes, service_date) = ($1, $2, $3, $4, $5, $6, $7) WHERE service_id= $8",
      [
        next_mileage,
        next_date,
        cost,
        service_name,
        place,
        notes,
        service_date,
        service_id,
      ]
    );

    // Read back new data from user_id
    const updateServiceRead = await pool.query(
      "SELECT * FROM service WHERE service_id = $1",
      [service_id]
    );

    const updatedServiceData = {
      service_id: updateServiceRead.rows[0].service_id,
      next_mileage: updateServiceRead.rows[0].next_mileage,
      next_date: updateServiceRead.rows[0].next_date,
      cost: updateServiceRead.rows[0].cost,
      service_name: updateServiceRead.rows[0].service_name,
      place: updateServiceRead.rows[0].place,
      notes: updateServiceRead.rows[0].notes,
      service_date: updateServiceRead.rows[0].service_date,
      service_id: updateServiceRead.rows[0].service_id,
    };

    res.status(200).json(updatedServiceData);
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a service - ADMIN
export async function deleteOneServiceAdmin(req, res) {
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
      const { service_id } = req.body;
      const checkOneService = await pool.query(
        "SELECT FROM service WHERE (service_id) = ($1)",
        [service_id]
      );
      if (checkOneService.rowCount === 0) {
        return res.status(404).json("Service not found.");
      } else {
        const deleteOneService = await pool.query(
          "DELETE FROM service WHERE service_id = $1",
          [service_id]
        );
        res.json("Service has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a service - USER
export async function deleteServiceUser(req, res) {
  try {
    const { service_id, user_id } = req.body;
    const checkOneService = await pool.query(
      "SELECT FROM service WHERE (service_id, user_id) = ($1, $2)",
      [service_id, user_id]
    );
    if (checkOneService.rowCount === 0) {
      return res
        .status(404)
        .json("service not found or the service is not yours.");
    } else {
      const deleteOneService = await pool.query(
        "DELETE FROM service WHERE (service_id, user_id) = ($1, $2)",
        [service_id, user_id]
      );
      res.json("Service has been deleted");
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
