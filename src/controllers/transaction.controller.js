const express = require("express");
const transactionModel = require("../models/transaction");

const allTransactions = express.Router();

// POST - cadastrar transação com title, amount, type e date
allTransactions.post("/", async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;

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
    });
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET - listar todas as transações
allTransactions.get("/", async (req, res) => {
  try {
    const transactions = await transactionModel.find().sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - buscar transação por ID
allTransactions.get("/:id", async (req, res) => {
  try {
    const transaction = await transactionModel.findById(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - atualizar transação
allTransactions.put("/:id", async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;

    // validação do amount (se amount for fornecido)
    if (amount !== undefined && (isNaN(amount) || amount <= 0)) {
      return res.status(400).json({
        message: "Amount deve ser um número positivo",
      });
    }

    const transaction = await transactionModel.findByIdAndUpdate(
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
allTransactions.delete("/:id", async (req, res) => {
  try {
    const transaction = await transactionModel.findByIdAndDelete(req.params.id);
    if (!transaction) {
      return res.status(404).json({ message: "Transação não encontrada" });
    }
    res.json({ message: "Transação deletada com sucesso" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - resumo financeiro (receitas, despesas e saldo)
allTransactions.get("/summary/balance", async (req, res) => {
  try {
    const transactions = await transactionModel.find();

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
allTransactions.get("/type/:type", async (req, res) => {
  try {
    const { type } = req.params;

    if (!["income", "expense"].includes(type)) {
      return res.status(400).json({
        message: "Type deve ser 'income' ou 'expense'",
      });
    }

    const transactions = await transactionModel
      .find({ type })
      .sort({ date: -1 });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - transações por período (usando query params)
allTransactions.get("/period/range", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        message: "startDate e endDate são obrigatórios",
      });
    }

    const transactions = await transactionModel
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

module.exports = allTransactions;
