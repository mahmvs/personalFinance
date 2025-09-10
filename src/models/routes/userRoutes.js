const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Users");

const router = express.Router();

// Registro
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }

    // verificar se já existe usuário com esse email
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "Email já registrado" });
    }

    // criptografar senha
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // salvar no banco
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    // gerar token JWT
    const token = jwt.sign(
      { id: newUser._id }, // payload
      process.env.JWT_SECRET, // chave secreta
      { expiresIn: "1d" } // expira em 1 dia
    );

    res.status(201).json({
      message: "Usuário registrado com sucesso!",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // validação básica
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Preencha todos os campos" });
    }

    // buscar usuário no banco
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Email ou senha incorretos" });
    }

    // gerar token JWT
    const token = jwt.sign(
      { id: user._id }, // payload
      process.env.JWT_SECRET, // chave secreta
      { expiresIn: "1d" } // expira em 1 dia
    );

    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
    });
  } catch (error) {
    res.status(500).json({ message: "Erro no servidor", error: error.message });
  }
});

module.exports = router;
