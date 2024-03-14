import fs from "fs";

const homeHtmlContent = fs.readFileSync("./pages/home.html", "utf-8");
const errorHtmlContent = fs.readFileSync("./pages/404.html", "utf-8");

export async function homePage(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(homeHtmlContent);
}

export async function errorPage(req, res) {
  res.setHeader("Content-Type", "text/html");
  res.send(errorHtmlContent);
}
