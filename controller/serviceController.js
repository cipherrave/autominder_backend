import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import fs from "fs";
import fastcsv from "fast-csv";

//Create a service
export async function createService(req, res) {
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
      const {
        next_mileage,
        next_date,
        cost,
        service_name,
        place,
        note,
        service_date,
      } = req.body;
    }
    if (!next_mileage || !cost || !service_name || !service_date || !mileage) {
      return res.status(400).json("Missing required fields");
    } else {
      // Generate service_id using nanoid
      let generatedID = nanoid();
      const service_id = generatedID;
      // Obtain service_id from address bar
      const service_id = req.params;
      // Insert details into service table
      const newService = await pool.query(
        "INSERT INTO service (service_id, next_mileage, next_date, cost, service_name, place, note, service_date, service_id) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
        [
          service_id,
          next_mileage,
          next_date,
          cost,
          service_name,
          place,
          note,
          service_date,
          service_id,
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
          note: readNewService.rows[0].note,
          service_date: readNewService.rows[0].service_date,
          service_id: readNewService.rows[0].service_id,
        },
      };
      res.json(apiResponse);
    }
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
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_links_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all services in links table regardless of user
      const allservice = await pool.query("SELECT * FROM service");

      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allservice.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allservice.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_links_admin.csv generated");
        return res.json(allservice.rows);
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

// Get all service from one user - ADMIN
export async function getAllserviceOneUserAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { email } = req.body;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_service_one_user_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all links in links table from one user
      const allservice = await pool.query(
        "SELECT * FROM service WHERE email = $1",
        [email]
      );
      if (allservice.rowCount === 0) {
        return res.status(404).json("No service with specified email");
      }
      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allservice.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allservice.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_service_one_user_admin.csv generated");
        return res.json(allservice.rows);
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

// Get all service - USER
export async function getAllservice(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_your_service_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      // List all service in service table where the user_id is same as in token
      const allservice = await pool.query(
        "SELECT * FROM service WHERE user_id = $1",
        [user_id]
      );
      if (allservice.rowCount === 0) {
        return res.status(404).json("No service with specified user_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(allservice.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(allservice.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("all_your_services_user.csv generated");
          return res.json(allservice.rows);
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

//Get one service - ADMIN
export async function getOneserviceAdmin(req, res) {
  try {
    // Read admin_id from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_service_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // Get data from shorturl
      const { service_id } = req.body;
      const oneservice = await pool.query(
        "SELECT * FROM service WHERE service_id=$1",
        [service_id]
      );
      if (oneservice.rowCount === 0) {
        return res.status(404).json("No service with specified service_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneservice.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneservice.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_link_admin.csv generated");
          return res.json(oneservice.rows);
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

//Get one service - USER
export async function getOneservice(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_service_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      // Get data from shorturl
      const { service_id } = req.body;
      const oneservice = await pool.query(
        "SELECT * FROM service WHERE (service_id)  = $1",
        [service_id]
      );
      if (oneservice.rowCount === 0) {
        return res.status(404).json("No service with specified service_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneservice.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneservice.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_service_user.csv generated");
          return res.json(oneservice.rows);
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

// Update a service - USER
export async function updateserviceUser(req, res) {
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
        service_id,
        vname,
        reg_num,
        brand,
        model,
        purchase_year,
        mileage,
      } = req.body;

      // Update links with user_id specified in token
      const updateservice = await pool.query(
        "UPDATE service SET (vname, reg_num, brand, model, purchase_year, mileage) = ($1, $2, $3, $4, $5, $6) WHERE service_id= $7",
        [vname, reg_num, brand, model, purchase_year, mileage, service_id]
      );

      // Read back new data from user_id
      const updateserviceRead = await pool.query(
        "SELECT * FROM service WHERE service_id = $1",
        [service_id]
      );

      const updatedserviceData = {
        message: "Link data has been updated",
        vname: updateserviceRead.rows[0].vname,
        reg_num: updateserviceRead.rows[0].reg_num,
        brand: updateserviceRead.rows[0].brand,
        model: updateserviceRead.rows[0].moddel,
        purchase_year: updateserviceRead.rows[0].purchase_year,
        mileage: updateserviceRead.rows[0].mileage,
        service_id: updateserviceRead.rows[0].service_id,
      };

      res.status(200).json(updatedserviceData);
    }
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
      const deleteOneService = await pool.query(
        "DELETE FROM service WHERE service_id = $1",
        [service_id]
      );
      if (deleteOneService.rowCount === 0) {
        return res.status(404).json("Service not found.");
      } else {
        res.json("Service has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a service - USER
export async function deleteOneservice(req, res) {
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
      const service_id = req.body;
      const deleteOneservice = await pool.query(
        "DELETE FROM service WHERE (service_id, user_id) = ($1, $2)",
        [service_id, user_id]
      );
      if (deleteOneservice.rowCount === 0) {
        return res
          .status(404)
          .json("service not found or the service is not yours.");
      } else {
        res.json("service has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
