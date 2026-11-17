import "dotenv/config";
import app from "./src/app.js";
import connectDB from "./src/db/db.js";

const port = Number(process.env.PORT) || 3000;

try {
  await connectDB();
  app.listen(port, () => {
    console.log(`Clinic API listening on port ${port}.`);
  });
} catch (error) {
  console.error("Could not start the API:", error.message);
  process.exitCode = 1;
}