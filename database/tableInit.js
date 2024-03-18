import pool from "./connection.js";

// create users table if not exist
export async function createUserTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "users" ( user_id VARCHAR(225) UNIQUE NOT NULL PRIMARY KEY, fname VARCHAR(225), lname VARCHAR(225), email VARCHAR(255) NOT NULL UNIQUE, password VARCHAR(225) NOT NULL, validation_key VARCHAR(255) NOT NULL UNIQUE, validated BOOLEAN NOT NULL, admin_id VARCHAR(225) UNIQUE, company BOOLEAN, company_name VARCHAR(225), creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP )'
    );
    console.log("users table created successfully");
  } catch (error) {
    console.log(error, "Error creating users table");
  }
}

// create Vehicles table if not exist
export async function createVehicleTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "vehicle" ( vehicle_id VARCHAR(225) UNIQUE NOT NULL PRIMARY KEY, vname VARCHAR(225) NOT NULL, reg_num VARCHAR(20) NOT NULL, brand VARCHAR(50) NOT NULL, model VARCHAR(225) NOT NULL, purchase_year INTEGER, mileage INTEGER NOT NULL, notes VARCHAR(1000), creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, user_id VARCHAR(225) REFERENCES "users"(user_id) ON DELETE CASCADE )'
    );
    console.log("vehicles table created successfully");
  } catch (error) {
    console.log(error, "Error creating vehicles table");
  }
}

// create Service_records table if is not exist
export async function createServiceTable() {
  try {
    const createTableQuery = await pool.query(
      'CREATE TABLE IF NOT EXISTS "service" ( service_id VARCHAR(225) UNIQUE NOT NULL PRIMARY KEY, next_mileage INTEGER NOT NULL, next_date DATE, cost INTEGER, service_name VARCHAR(255) NOT NULL, place VARCHAR(255), notes VARCHAR(1000), service_date DATE NOT NULL, creation_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, vehicle_id VARCHAR(225) REFERENCES "vehicle"(vehicle_id), user_id VARCHAR(255))'
    );
    console.log("service table created successfully");
  } catch (error) {
    console.log(error, "Error creating service table");
  }
}
