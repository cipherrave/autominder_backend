// Import these in js controller
import fs from "fs";
import fastcsv from "fast-csv";

// Add these in function
const { generateCSV } = req.body;
const ws = fs.createWriteStream("all_links_one_user.csv");

// Place your SELECT query here

// Generate CSV file
if (generateCSV === false) {
  console.log("CSV not generated.");
  return res.json(allLinks.rows);
} else if (generateCSV === true) {
  const jsonData = JSON.parse(JSON.stringify(allLinks.rows));

  fastcsv.write(jsonData, { headers: true }).pipe(ws);
  console.log("all_links_one_user.csv generated");
  return res.json(allLinks.rows);
} else {
  return res.json(
    "Do you want to generate CSV file as a report? Type false or true without the quotation mark"
  );
}
