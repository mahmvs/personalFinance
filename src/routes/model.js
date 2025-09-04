const express = require("express");
const userModel = require("../models/user.model");

const router = express.Router();

// POST - cadastrar transação com title, amount, type e date
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;

    // Validação básica
    if (!title || !amount || !type) {
      return res.status(400).json({
        message: "Title, amount e type são obrigatórios",
      });
    }

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type deve ser 'income' ou 'expense'",
      });
    }

    const transaction = await userModel.create({ title, amount, type, date });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - listar todas as transações
router.get("/", async (req, res) => {
  try {
    const transactions = await userModel.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - buscar transação por ID
router.get("/:id", async (req, res) => {
  try {
    const transaction = await userModel.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - atualizar transação
router.put("/:id", async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;

    const transaction = await userModel.findByIdAndUpdate(
      req.params.id,
      { title, amount, type, date },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }

    res.json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE - deletar transação
router.delete("/:id", async (req, res) => {
  try {
    const transaction = await userModel.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json({ message: "Transação deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - resumo financeiro (receitas, despesas e saldo)
router.get("/summary/balance", async (req, res) => {
  try {
    const transactions = await userModel.find();

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
});

// GET - transações por tipo (income ou expense)
router.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type deve ser 'income' ou 'expense'",
      });
    }

    const transactions = await userModel.find({ type }).sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - transações por período (usando query params)
router.get("/period/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate e endDate são obrigatórios",
      });
    }

    const transactions = await userModel
      .find({
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
});

module.exports = router;
