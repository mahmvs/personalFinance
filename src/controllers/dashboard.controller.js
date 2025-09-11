const transactionModel = require("../models/transaction");

// GET - Dashboard principal com métricas em tempo real
const getDashboard = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Buscar transações do mês atual
    const currentMonthTransactions = await transactionModel.find({
      userId: req.userId,
      date: { $gte: startOfMonth },
    });

    // Buscar transações do mês anterior
    const lastMonthTransactions = await transactionModel.find({
      userId: req.userId,
      date: {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      },
    });

    // Calcular métricas do mês atual
    const currentMonthIncome = currentMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthExpense = currentMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const currentMonthBalance = currentMonthIncome - currentMonthExpense;

    // Calcular métricas do mês anterior
    const lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthExpense = lastMonthTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthBalance = lastMonthIncome - lastMonthExpense;

    // Calcular variações percentuais
    const incomeVariation =
      lastMonthIncome > 0
        ? ((currentMonthIncome - lastMonthIncome) / lastMonthIncome) * 100
        : 0;

    const expenseVariation =
      lastMonthExpense > 0
        ? ((currentMonthExpense - lastMonthExpense) / lastMonthExpense) * 100
        : 0;

    const balanceVariation =
      lastMonthBalance !== 0
        ? ((currentMonthBalance - lastMonthBalance) /
            Math.abs(lastMonthBalance)) *
          100
        : 0;

    // Top 5 categorias com mais gastos no mês
    const categoryExpenses = {};
    currentMonthTransactions
      .filter((t) => t.type === "expense")
      .forEach((transaction) => {
        const { category, amount } = transaction;
        categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
      });

    const topCategories = Object.entries(categoryExpenses)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Transações recentes (últimas 5)
    const recentTransactions = await transactionModel
      .find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title amount type category date");

    // Estatísticas gerais
    const totalTransactions = await transactionModel.countDocuments({
      userId: req.userId,
    });
    const totalIncome = await transactionModel.aggregate([
      { $match: { userId: req.userId, type: "income" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const totalExpense = await transactionModel.aggregate([
      { $match: { userId: req.userId, type: "expense" } },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const totalIncomeAmount = totalIncome[0]?.total || 0;
    const totalExpenseAmount = totalExpense[0]?.total || 0;
    const totalBalance = totalIncomeAmount - totalExpenseAmount;

    res.json({
      currentMonth: {
        income: currentMonthIncome,
        expense: currentMonthExpense,
        balance: currentMonthBalance,
        transactionCount: currentMonthTransactions.length,
        variations: {
          income: {
            value: incomeVariation,
            trend:
              incomeVariation > 0
                ? "up"
                : incomeVariation < 0
                ? "down"
                : "stable",
          },
          expense: {
            value: expenseVariation,
            trend:
              expenseVariation > 0
                ? "up"
                : expenseVariation < 0
                ? "down"
                : "stable",
          },
          balance: {
            value: balanceVariation,
            trend:
              balanceVariation > 0
                ? "up"
                : balanceVariation < 0
                ? "down"
                : "stable",
          },
        },
      },
      lastMonth: {
        income: lastMonthIncome,
        expense: lastMonthExpense,
        balance: lastMonthBalance,
        transactionCount: lastMonthTransactions.length,
      },
      overall: {
        totalIncome: totalIncomeAmount,
        totalExpense: totalExpenseAmount,
        totalBalance: totalBalance,
        totalTransactions: totalTransactions,
      },
      topCategories,
      recentTransactions: recentTransactions.map((t) => ({
        id: t._id,
        title: t.title,
        amount: t.amount,
        type: t.type,
        category: t.category,
        date: t.date,
      })),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDashboard,
};
