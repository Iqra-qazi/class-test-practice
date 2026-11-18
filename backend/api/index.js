import app from "../src/app.js";
import connectDB from "../src/db/db.js";

let databaseConnection;

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    return app(req, res);
  }

  try {
    databaseConnection ??= connectDB().catch((error) => {
      databaseConnection = undefined;
      throw error;
    });
    await databaseConnection;
    return app(req, res);
  } catch (error) {
    console.error("Could not connect to the database:", error);
    return res.status(500).json({ success: false, message: "Internal server error." });
  }
}
