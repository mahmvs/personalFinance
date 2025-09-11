require("dotenv").config();
const app = require("./modules/express");
const connectToDatabase = require("./src/database/connect");

// rotas
const userRoutes = require("./src/models/routes/userRoutes");
app.use("/users", userRoutes);

// rotas de transações com autenticação
const transactionRoutes = require("./src/models/routes/transactionRoutes");
app.use("/api/transactions", transactionRoutes);

// rotas de dashboard
const dashboardRoutes = require("./src/models/routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

// rotas de orçamentos
const budgetRoutes = require("./src/models/routes/budgetRoutes");
app.use("/api/budgets", budgetRoutes);

// rotas de metas financeiras
const financialGoalRoutes = require("./src/models/routes/financialGoalRoutes");
app.use("/api/goals", financialGoalRoutes);

// rotas de transações recorrentes
const recurringTransactionRoutes = require("./src/models/routes/recurringTransactionRoutes");
app.use("/api/recurring", recurringTransactionRoutes);

// Adicionar no index.js após as rotas
app.use("*", (req, res) => {
  res.status(404).json({
    message: "Rota não encontrada",
    path: req.originalUrl,
  });
});

connectToDatabase();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
