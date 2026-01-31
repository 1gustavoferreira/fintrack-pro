const transactionForm = document.getElementById('transaction-form');
const transactionList = document.getElementById('transaction-list');

// Função para SALVAR transação
transactionForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Pega o usuário atual
    const { data: { user } } = await _supabase.auth.getUser();

    if (!user) return alert("Sessão expirada. Faça login novamente.");

    // 2. Captura os valores do formulário
    const description = document.getElementById('desc').value;
    const amount = document.getElementById('amount').value;
    const type = document.getElementById('type').value;

    // 3. Insere no Supabase
    const { error } = await _supabase
        .from('transactions')
        .insert([
            { 
                description: description, 
                amount: parseFloat(amount), 
                type: type, 
                user_id: user.id 
            }
        ]);

    if (error) {
        alert("Erro ao salvar: " + error.message);
    } else {
        transactionForm.reset();
        loadTransactions(); // Vamos criar essa função agora para atualizar a lista
    }
});

// Função para LISTAR transações (O "R" do CRUD - Read)
async function loadTransactions() {
    const { data: { user } } = await _supabase.auth.getUser();
    
    const { data: transactions, error } = await _supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error("Erro ao carregar:", error.message);
    } else {
        renderTransactions(transactions);
    }
}

function renderTransactions(list) {
    const transactionList = document.getElementById('transaction-list');
    const balanceEl = document.getElementById('main-balance-display');
    
    if (!transactionList || !balanceEl) return;

    transactionList.innerHTML = '';
    let total = 0;

    list.forEach(item => {
        const amount = parseFloat(item.amount);
        const isIncome = item.type === 'income';
        total += isIncome ? amount : -amount;

        const li = document.createElement('li');
        const color = isIncome ? '#22c55e' : '#ef4444';
        const symbol = isIncome ? '+' : '-';
        
        li.innerHTML = `
            <span>${item.description}</span>
            <strong style="color: ${color}"> ${symbol} R$ ${amount.toFixed(2)}</strong>
        `;
        transactionList.appendChild(li);
    });

    // A MÁGICA ACONTECE AQUI
    balanceEl.innerText = `R$ ${total.toFixed(2)}`;
    balanceEl.style.color = total >= 0 ? '#22c55e' : '#ef4444';
    
    console.log("Interface atualizada com sucesso para:", total);
}
// Chamar ao carregar a página
loadTransactions();