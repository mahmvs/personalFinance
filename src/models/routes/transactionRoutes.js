const express = require("express");
const Transaction = require("../transaction");
const auth = require("../middlewares/auth");

const router = express.Router();

// middleware: todas as rotas daqui precisam de login
router.use(auth);

// POST - criar transação
router.post("/", async (req, res) => {
  try {
    const { title, amount, type, date } = req.body;

    const transaction = new Transaction({
      title,
      amount,
      type,
      date,
      userId: req.userId,
    });

    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erro ao cadastrar transação", error: error.message });
  }
});

module.exports = router;
