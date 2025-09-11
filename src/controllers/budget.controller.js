const budgetModel = require("../models/budget");
const transactionModel = require("../models/transaction");

// POST - Criar orçamento
const createBudget = async (req, res) => {
  try {
    const { category, amount, period, year, month, description } = req.body;

    // Validação básica
    if (!category || !amount || !year) {
      return res.status(400).json({
        message: "Categoria, valor e ano são obrigatórios",
      });
    }

    if (period === "monthly" && !month) {
      return res.status(400).json({
        message: "Mês é obrigatório para orçamentos mensais",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        message: "Valor deve ser positivo",
      });
    }

    // Verificar se já existe orçamento para esta categoria/período
    const existingBudget = await budgetModel.findOne({
      userId: req.userId,
      category,
      year,
      month: period === "monthly" ? month : { $exists: false },
      period,
    });

    if (existingBudget) {
      return res.status(400).json({
        message: "Já existe um orçamento para esta categoria neste período",
      });
    }

    const budget = await budgetModel.create({
      userId: req.userId,
      category,
      amount,
      period,
      year,
      month: period === "monthly" ? month : undefined,
      description,
    });

    res.status(201).json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET - Listar orçamentos
const getBudgets = async (req, res) => {
  try {
    const { year, month, period } = req.query;

    let filter = { userId: req.userId, isActive: true };

    if (year) filter.year = parseInt(year);
    if (month) filter.month = parseInt(month);
    if (period) filter.period = period;

    const budgets = await budgetModel.find(filter).sort({ category: 1 });

    res.json(budgets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Orçamento por ID
const getBudgetById = async (req, res) => {
  try {
    const budget = await budgetModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado" });
    }

    res.json(budget);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - Atualizar orçamento
const updateBudget = async (req, res) => {
  try {
    const { amount, description, isActive } = req.body;

    if (amount !== undefined && amount <= 0) {
      return res.status(400).json({
        message: "Valor deve ser positivo",
      });
    }

    const budget = await budgetModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { amount, description, isActive },
      { new: true, runValidators: true }
    );

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado" });
    }

    res.json(budget);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - Deletar orçamento
const deleteBudget = async (req, res) => {
  try {
    const budget = await budgetModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!budget) {
      return res.status(404).json({ message: "Orçamento não encontrado" });
    }

    res.json({ message: "Orçamento deletado com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - Relatório de orçamentos vs gastos
const getBudgetReport = async (req, res) => {
  try {
    const { year, month } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    const currentMonth = month ? parseInt(month) : new Date().getMonth() + 1;

    // Buscar orçamentos do período
    const budgets = await budgetModel.find({
      userId: req.userId,
      year: currentYear,
      month: currentMonth,
      period: "monthly",
      isActive: true,
    });

    // Buscar gastos do período
    const startDate = new Date(currentYear, currentMonth - 1, 1);
    const endDate = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);

    const expenses = await transactionModel.find({
      userId: req.userId,
      type: "expense",
      date: { $gte: startDate, $lte: endDate },
    });

    // Agrupar gastos por categoria
    const expensesByCategory = {};
    expenses.forEach((expense) => {
      const { category, amount } = expense;
      expensesByCategory[category] =
        (expensesByCategory[category] || 0) + amount;
    });

    // Criar relatório comparativo
    const report = budgets.map((budget) => {
      const spent = expensesByCategory[budget.category] || 0;
      const remaining = budget.amount - spent;
      const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
      const status =
        percentage > 100 ? "exceeded" : percentage > 80 ? "warning" : "ok";

      return {
        budgetId: budget._id,
        category: budget.category,
        budgetAmount: budget.amount,
        spentAmount: spent,
        remainingAmount: remaining,
        percentage: Math.round(percentage * 100) / 100,
        status,
        description: budget.description,
      };
    });

    // Adicionar categorias que têm gastos mas não têm orçamento
    Object.keys(expensesByCategory).forEach((category) => {
      const hasBudget = budgets.some((budget) => budget.category === category);
      if (!hasBudget) {
        report.push({
          budgetId: null,
          category,
          budgetAmount: 0,
          spentAmount: expensesByCategory[category],
          remainingAmount: -expensesByCategory[category],
          percentage: 0,
          status: "no-budget",
          description: "Sem orçamento definido",
        });
      }
    });

    res.json({
      period: {
        year: currentYear,
        month: currentMonth,
      },
      report: report.sort((a, b) => b.spentAmount - a.spentAmount),
      summary: {
        totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: Object.values(expensesByCategory).reduce(
          (sum, amount) => sum + amount,
          0
        ),
        totalRemaining:
          budgets.reduce((sum, b) => sum + b.amount, 0) -
          Object.values(expensesByCategory).reduce(
            (sum, amount) => sum + amount,
            0
          ),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
  getBudgetReport,
};
