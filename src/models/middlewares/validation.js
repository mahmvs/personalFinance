// Criar: /home/maiara/Documentos/GitHub/personalFinance/src/middlewares/validation.js
const Joi = require("joi");

const validateTransaction = (req, res, next) => {
  const schema = Joi.object({
    title: Joi.string().required().max(100),
    amount: Joi.number().positive().required(),
    type: Joi.string().valid("income", "expense").required(),
    category: Joi.string()
      .valid("food", "transport", "health", "education", "rent", "other")
      .required(),
    date: Joi.date().max("now"),
    description: Joi.string().max(500),
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({
      message: "Dados inválidos",
      details: error.details[0].message,
    });
  }
  next();
};

module.exports = { validateTransaction };
