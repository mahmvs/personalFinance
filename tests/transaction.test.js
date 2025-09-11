// Criar: /home/maiara/Documentos/GitHub/personalFinance/tests/transaction.test.js
const request = require("supertest");
const app = require("../modules/express");

describe("Transaction API", () => {
  test("GET /api/transactions should require authentication", async () => {
    const response = await request(app).get("/api/transactions").expect(401);

    expect(response.body.message).toBe("Token não fornecido");
  });
});
