const express = require("express");
const app = express();

app.use(express.json());

// Importar e usar as rotas
const transactionRoutes = require("../src/models/routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

app.get("/", (req, res) => {
  res.send("API de Finanças funcionando! 🚀");
});

const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // máximo 100 requests por IP
  message: "Muitas tentativas, tente novamente em 15 minutos",
});

app.use(limiter);

module.exports = app;
