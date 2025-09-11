const express = require("express");
const auth = require("../middlewares/auth");
const {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  getTransactionSummary,
  getTransactionsByType,
  getTransactionsByPeriod,
  getTransactionsByCategory,
  getCategorySummary,
  getMonthlyReport,
} = require("../../controllers/transaction.controller");

const router = express.Router();

// middleware: todas as rotas daqui precisam de login
router.use(auth);

// POST - criar transação
router.post("/", createTransaction);

// GET - listar todas as transações do usuário
router.get("/", getAllTransactions);

// GET - buscar transação por ID
router.get("/:id", getTransactionById);

// PUT - atualizar transação
router.put("/:id", updateTransaction);

// DELETE - deletar transação
router.delete("/:id", deleteTransaction);

// GET - resumo financeiro (receitas, despesas e saldo)
router.get("/summary/balance", getTransactionSummary);

// GET - transações por tipo (income ou expense)
router.get("/type/:type", getTransactionsByType);

// GET - transações por período (usando query params)
router.get("/period/range", getTransactionsByPeriod);

// GET - transações por categoria
router.get("/category/:category", getTransactionsByCategory);

// GET - resumo por categoria
router.get("/summary/categories", getCategorySummary);

// GET - relatório mensal (extrato detalhado)
router.get("/report/monthly", getMonthlyReport);

module.exports = router;
