const transactionModel = require("../models/transaction");

// POST - cadastrar transação com title, amount, type e date
const createTransaction = async (req, res) => {
  try {
    const { title, amount, type, date, category } = req.body;

    // Validação básica
    if (!title || !amount || !type) {
      return res.status(400).json({
        message: "Title, amount e type são obrigatórios",
      });
    }

    // validação do amount
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Amount deve ser um número positivo",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type deve ser 'income' ou 'expense'",
      });
    }

    const transaction = await transactionModel.create({
      title,
      amount,
      type,
      date,
      category,
      userId: req.userId, // Adicionando userId da autenticação
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// GET - listar todas as transações do usuário
const getAllTransactions = async (req, res) => {
  try {
    const transactions = await transactionModel
      .find({ userId: req.userId })
      .sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - buscar transação por ID
const getTransactionById = async (req, res) => {
  try {
    const transaction = await transactionModel.findOne({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT - atualizar transação
const updateTransaction = async (req, res) => {
  try {
    const { title, amount, type, date, category } = req.body;

    // validação do amount (se amount for fornecido)
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Amount deve ser um número positivo",
      });
    }

    const transaction = await transactionModel.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, amount, type, date, category },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE - deletar transação
const deleteTransaction = async (req, res) => {
  try {
    const transaction = await transactionModel.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json({ message: "Transação deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - resumo financeiro (receitas, despesas e saldo)
const getTransactionSummary = async (req, res) => {
  try {
    const transactions = await transactionModel.find({ userId: req.userId });

    const income = transactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;

    res.json({
      income,
      expense,
      balance,
      totalTransactions: transactions.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - transações por tipo (income ou expense)
const getTransactionsByType = async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type deve ser 'income' ou 'expense'",
      });
    }

    const transactions = await transactionModel
      .find({ type, userId: req.userId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - transações por período (usando query params)
const getTransactionsByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate e endDate são obrigatórios",
      });
    }

    const transactions = await transactionModel
      .find({
        userId: req.userId,
        date: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - transações por categoria
const getTransactionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    // Validação das categorias disponíveis
    const validCategories = [
      "food",
      "transport",
      "health",
      "education",
      "rent",
      "other",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        message:
          "Categoria inválida. Categorias disponíveis: " +
          validCategories.join(", "),
      });
    }

    const transactions = await transactionModel
      .find({ category, userId: req.userId })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - resumo por categoria (total gasto/recebido em cada categoria)
const getCategorySummary = async (req, res) => {
  try {
    const transactions = await transactionModel.find({ userId: req.userId });

    // Agrupar por categoria
    const categorySummary = {};

    transactions.forEach((transaction) => {
      const { category, amount, type } = transaction;

      if (!categorySummary[category]) {
        categorySummary[category] = {
          category,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          transactionCount: 0,
        };
      }

      if (type === "income") {
        categorySummary[category].totalIncome += amount;
      } else {
        categorySummary[category].totalExpense += amount;
      }

      categorySummary[category].transactionCount += 1;
    });

    // Calcular o saldo para cada categoria
    Object.keys(categorySummary).forEach((category) => {
      const summary = categorySummary[category];
      summary.balance = summary.totalIncome - summary.totalExpense;
    });

    // Converter para array e ordenar por saldo (maior para menor)
    const summaryArray = Object.values(categorySummary).sort(
      (a, b) => b.balance - a.balance
    );

    res.json({
      categories: summaryArray,
      totalCategories: summaryArray.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET - relatório mensal (extrato detalhado por mês)
const getMonthlyReport = async (req, res) => {
  try {
    const { year, month } = req.query;

    // Validação dos parâmetros
    if (!year || !month) {
      return res.status(400).json({
        message: "Ano e mês são obrigatórios. Use: ?year=2024&month=1",
      });
    }

    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    if (isNaN(yearNum) || isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({
        message:
          "Ano e mês devem ser números válidos. Mês deve estar entre 1 e 12",
      });
    }

    // Criar datas de início e fim do mês
    const startDate = new Date(yearNum, monthNum - 1, 1);
    const endDate = new Date(yearNum, monthNum, 0, 23, 59, 59, 999);

    // Buscar transações do mês
    const transactions = await transactionModel
      .find({
        userId: req.userId,
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      })
      .sort({ date: -1 });

    // Calcular totais
    let totalIncome = 0;
    let totalExpense = 0;
    const categoryBreakdown = {};

    transactions.forEach((transaction) => {
      const { amount, type, category } = transaction;

      if (type === "income") {
        totalIncome += amount;
      } else {
        totalExpense += amount;
      }

      // Agrupar por categoria
      if (!categoryBreakdown[category]) {
        categoryBreakdown[category] = {
          category,
          income: 0,
          expense: 0,
          balance: 0,
          transactionCount: 0,
        };
      }

      if (type === "income") {
        categoryBreakdown[category].income += amount;
      } else {
        categoryBreakdown[category].expense += amount;
      }

      categoryBreakdown[category].transactionCount += 1;
    });

    // Calcular saldo por categoria
    Object.keys(categoryBreakdown).forEach((category) => {
      const breakdown = categoryBreakdown[category];
      breakdown.balance = breakdown.income - breakdown.expense;
    });

    const balance = totalIncome - totalExpense;

    // Nome do mês em português
    const monthNames = [
      "Janeiro",
      "Fevereiro",
      "Março",
      "Abril",
      "Maio",
      "Junho",
      "Julho",
      "Agosto",
      "Setembro",
      "Outubro",
      "Novembro",
      "Dezembro",
    ];

    res.json({
      period: {
        year: yearNum,
        month: monthNum,
        monthName: monthNames[monthNum - 1],
        startDate: startDate.toISOString().split("T")[0],
        endDate: endDate.toISOString().split("T")[0],
      },
      summary: {
        totalIncome,
        totalExpense,
        balance,
        transactionCount: transactions.length,
      },
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        title: transaction.title,
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        date: transaction.date,
        createdAt: transaction.createdAt,
      })),
      categoryBreakdown: Object.values(categoryBreakdown).sort(
        (a, b) => b.balance - a.balance
      ),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
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
};
