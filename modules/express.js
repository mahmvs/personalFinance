const express = require("express");
const app = express();

app.use(express.json());

// Importar e usar as rotas
const transactionRoutes = require("../src/controllers/transaction.controller");
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("API de Finanças funcionando! 🚀");
});

module.exports = app;
