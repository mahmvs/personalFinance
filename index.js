require("dotenv").config();
const app = require("./modules/express");
const connectToDatabase = require("./src/database/connect");

// rotas
const userRoutes = require("./src/models/routes/userRoutes");
app.use("/users", userRoutes);

// rotas de transações com autenticação
const transactionRoutes = require("./src/models/routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

connectToDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
