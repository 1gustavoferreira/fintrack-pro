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
    transactionList.innerHTML = '';
    list.forEach(item => {
        const li = document.createElement('li');
        const color = item.type === 'income' ? 'text-green' : 'text-red';
        const symbol = item.type === 'income' ? '+' : '-';
        
        li.innerHTML = `
            <span>${item.description}</span>
            <span class="${color}">${symbol} R$ ${parseFloat(item.amount).toFixed(2)}</span>
        `;
        transactionList.appendChild(li);
    });
}

// Chamar ao carregar a página
loadTransactions();