const express = require("express");
const auth = require("../middlewares/auth");
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetReport,
} = require("../../controllers/budget.controller");

const router = express.Router();

// middleware: todas as rotas daqui precisam de login
router.use(auth);

// POST - criar orçamento
router.post("/", createBudget);

// GET - listar orçamentos
router.get("/", getBudgets);

// GET - orçamento por ID
router.get("/:id", getBudgetById);

// PUT - atualizar orçamento
router.put("/:id", updateBudget);

// DELETE - deletar orçamento
router.delete("/:id", deleteBudget);

// GET - relatório de orçamentos vs gastos
router.get("/report/analysis", getBudgetReport);

module.exports = router;
