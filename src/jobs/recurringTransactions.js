// Criar: /home/maiara/Documentos/GitHub/personalFinance/src/jobs/recurringTransactions.js
const cron = require('node-cron');
const axios = require('axios');

// Executar todos os dias às 00:01
cron.schedule('1 0 * * *', async () => {
  try {
    const response = await axios.post('http://localhost:3000/api/recurring/execute');
    console.log('Transações recorrentes executadas:', response.data);
  } catch (error) {
    console.error('Erro ao executar transações recorrentes:', error.message);
  }
});
