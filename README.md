💰 API de Finanças Pessoais

Uma API simples para gerenciar transações financeiras pessoais, criada com Node.js, Express e MongoDB.

Permite cadastrar, listar, atualizar e excluir transações financeiras.

🛠 Tecnologias usadas

Node.js

Express

MongoDB (via Mongoose)

dotenv (para variáveis de ambiente)

Postman (para testar a API)

⚡ Funcionalidades

POST /transactions → Cadastrar nova transação

GET /transactions → Listar todas as transações

PUT /transactions/:id → Atualizar uma transação existente

DELETE /transactions/:id → Apagar uma transação

⚙️ Como rodar o projeto

1 - Clone o repositório:

git clone <URL_DO_REPOSITORIO>


2 - Instale as dependências:

npm install


3 - Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

PORT=3000
MONGO_URI=mongodb://localhost:27017/financas


4 - Rode o servidor:

node index.js
