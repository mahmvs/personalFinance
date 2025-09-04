require("dotenv").config();
const app = require("./modules/express");
const connectToDatabase = require("./src/database/connect");

connectToDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
