const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      enum: ["food", "transport", "health", "education", "rent", "other"],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    period: {
      type: String,
      enum: ["monthly", "yearly"],
      default: "monthly",
    },
    year: {
      type: Number,
      required: true,
    },
    month: {
      type: Number,
      min: 1,
      max: 12,
      required: function () {
        return this.period === "monthly";
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    description: {
      type: String,
      maxLength: 200,
    },
  },
  {
    timestamps: true,
  }
);

// Índice para evitar orçamentos duplicados
budgetSchema.index(
  { userId: 1, category: 1, year: 1, month: 1, period: 1 },
  { unique: true }
);

const budgetModel = mongoose.model("Budget", budgetSchema);

module.exports = budgetModel;
