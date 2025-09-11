const express = require("express");
const auth = require("../middlewares/auth");
const {
  createFinancialGoal,
  getFinancialGoals,
  getFinancialGoalById,
  updateFinancialGoal,
  deleteFinancialGoal,
  addProgressToGoal,
  getGoalsProgressReport,
} = require("../../controllers/financialGoal.controller");

const router = express.Router();

// middleware: todas as rotas daqui precisam de login
router.use(auth);

// POST - criar meta financeira
router.post("/", createFinancialGoal);

// GET - listar metas financeiras
router.get("/", getFinancialGoals);

// GET - meta financeira por ID
router.get("/:id", getFinancialGoalById);

// PUT - atualizar meta financeira
router.put("/:id", updateFinancialGoal);

// DELETE - deletar meta financeira
router.delete("/:id", deleteFinancialGoal);

// POST - adicionar progresso à meta
router.post("/:id/progress", addProgressToGoal);

// GET - relatório de progresso das metas
router.get("/report/progress", getGoalsProgressReport);

module.exports = router;
