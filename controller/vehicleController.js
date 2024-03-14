import pool from "../database/connection.js";
import { nanoid } from "nanoid";
import fs from "fs";
import fastcsv from "fast-csv";

//Create a link
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
      // Generate link_id using nanoid
      let generatedID = nanoid();
      const vehicle_id = generatedID;

      const { longurl } = req.body;

      // Generate shorurl using nanoid
      let generatedShort = nanoid(10);
      const shorturl = generatedShort;

      // Starts visit_count with 0 for each new links created
      const visit_count = 0;

      // Links are activated by default
      const activated = true;

      // Insert details into links table
      const newUrl = await pool.query(
        "INSERT INTO links (link_id, longurl, shorturl, visit_count, user_id, activated) VALUES($1, $2, $3, $4, $5, $6) RETURNING *",
        [link_id, longurl, shorturl, visit_count, user_id, activated]
      );

      // Generate response
      const apiResponse = {
        message: "A short url is generated",
        data: {
          link_id: generatedID,
          longurl: longurl,
          shorturl: "short.ly/" + shorturl,
          user_id: user_id,
          activated: activated,
        },
      };

      res.json(apiResponse);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Get all links - ADMIN
export async function getAllLinksAdmin(req, res) {
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
      // List all links in links table regardless of user
      const allLinks = await pool.query("SELECT * FROM links");

      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allLinks.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allLinks.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_links_admin.csv generated");
        return res.json(allLinks.rows);
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

// Get all links from one user - ADMIN
export async function getAllLinksOneUserAdmin(req, res) {
  try {
    // Read admin_id data from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { user_id } = req.body;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_links_one_user_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // List all links in links table from one user
      const allLinks = await pool.query(
        "SELECT * FROM links WHERE user_id = $1",
        [user_id]
      );
      if (allLinks.rowCount === 0) {
        return res.status(404).json("No links with specified user_id");
      }
      // Generate CSV file
      if (generateCSV === false) {
        console.log("CSV not generated.");
        return res.json(allLinks.rows);
      } else if (generateCSV === true) {
        const jsonData = JSON.parse(JSON.stringify(allLinks.rows));

        fastcsv.write(jsonData, { headers: true }).pipe(ws);
        console.log("all_links_one_user_admin.csv generated");
        return res.json(allLinks.rows);
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

// Get all links - USER
export async function getAllLinks(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("all_your_links_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      // List all links in links table where the user_id is same as in token
      const allLinks = await pool.query(
        "SELECT * FROM links WHERE user_id = $1",
        [user_id]
      );
      if (allLinks.rowCount === 0) {
        return res.status(404).json("No links with specified user_id");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(allLinks.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(allLinks.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("all_your_links_user.csv generated");
          return res.json(allLinks.rows);
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

//Get one link - ADMIN
export async function getOneLinkAdmin(req, res) {
  try {
    // Read admin_id from token
    const authData = req.user;
    const admin_id = authData.admin_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_link_admin.csv");

    const checkAdminID = await pool.query(
      "SELECT * FROM users WHERE admin_id=$1",
      [admin_id]
    );
    if (checkAdminID.rowCount === 0) {
      return res.status(404).json("Admin id not found. Not authorized!");
    } else {
      // Get data from shorturl
      const { shorturl } = req.body;
      const oneLink = await pool.query(
        "SELECT * FROM links WHERE shorturl = $1",
        [shorturl]
      );
      if (oneLink.rowCount === 0) {
        return res.status(404).json("No link with specified shorturl");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneLink.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneLink.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_link_admin.csv generated");
          return res.json(oneLink.rows);
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

//Get one link - USER
export async function getOneLink(req, res) {
  try {
    // Read user_id data from token
    const authData = req.user;
    const user_id = authData.user_id;
    const { generateCSV } = req.body;
    const ws = fs.createWriteStream("one_link_user.csv");

    const checkUserID = await pool.query(
      "SELECT * FROM users WHERE user_id=$1",
      [user_id]
    );
    if (checkUserID.rowCount === 0) {
      return res.status(404).json("User id not found.");
    } else {
      // Get data from shorturl
      const { shorturl } = req.body;
      const oneLink = await pool.query(
        "SELECT * FROM links WHERE (user_id, shorturl)  = ($1, $2)",
        [user_id, shorturl]
      );
      if (oneLink.rowCount === 0) {
        return res.status(404).json("No link with specified short url");
      } else {
        // Generate CSV file
        if (generateCSV === false) {
          console.log("CSV not generated.");
          return res.json(oneLink.rows);
        } else if (generateCSV === true) {
          const jsonData = JSON.parse(JSON.stringify(oneLink.rows));

          fastcsv.write(jsonData, { headers: true }).pipe(ws);
          console.log("one_link_user.csv generated");
          return res.json(oneLink.rows);
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

// Update a link - USER
export async function updateLinkUser(req, res) {
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
      const { link_id, longurl, activated } = req.body;

      // Update links with user_id specified in token
      const updateLink = await pool.query(
        "UPDATE links SET (longurl, activated) = ($1, $2) WHERE link_id= $3",
        [longurl, activated, link_id]
      );

      // Read back new data from user_id
      const updateLinksRead = await pool.query(
        "SELECT * FROM links WHERE link_id = $1",
        [link_id]
      );

      const newLinkData = {
        message: "Link data has been updated",
        longurl: updateLinksRead.rows[0].longurl,
        shorturl: updateLinksRead.rows[0].shorturl,
        activated: updateLinksRead.rows[0].activated,
      };

      res.status(200).json(newLinkData);
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a link - ADMIN
export async function deleteOneLinkAdmin(req, res) {
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
      const { shorturl } = req.body;
      const deleteOneLink = await pool.query(
        "DELETE FROM links WHERE shorturl = $1",
        [shorturl]
      );
      if (deleteOneLink.rowCount === 0) {
        return res.status(404).json("Link not found.");
      } else {
        res.json("Link has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}

// Delete a link - USER
export async function deleteOneLink(req, res) {
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
      const { shorturl } = req.body;
      const deleteOneLink = await pool.query(
        "DELETE FROM links WHERE (shorturl, user_id) = ($1, $2)",
        [shorturl, user_id]
      );
      if (deleteOneLink.rowCount === 0) {
        return res.status(404).json("Link not found or the link is not yours.");
      } else {
        res.json("Link has been deleted");
      }
    }
  } catch (error) {
    res.status(500).json(error.message);
  }
}
