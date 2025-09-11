// Criar: /home/maiara/Documentos/GitHub/personalFinance/src/middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "ValidationError") {
    return res.status(400).json({
      message: "Dados inválidos",
      errors: Object.values(err.errors).map((e) => e.message),
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      message: "ID inválido",
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      message: "Dados duplicados",
    });
  }

  res.status(500).json({
    message: "Erro interno do servidor",
  });
};

module.exports = errorHandler;
