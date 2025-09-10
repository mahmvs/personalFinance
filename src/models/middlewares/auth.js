const jwt = require("jsonwebtoken");

function auth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token não fornecido" });
  }

  // o token vem no formato "Bearer tokenAqui"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id; // agora podemos usar o id do usuário nas rotas
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token inválido ou expirado" });
  }
}

module.exports = auth;
