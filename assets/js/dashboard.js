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
    
    // 1. Estado Vazio (UX)
    if (list.length === 0) {
        transactionList.innerHTML = `
            <div style="text-align: center; color: #94a3b8; padding: 40px 0;">
                <p>Nenhuma transação encontrada.</p>
                <small>Adicione a sua primeira entrada ou saída!</small>
            </div>`;
        balanceEl.innerText = "R$ 0,00";
        balanceEl.style.color = "inherit";
        if (myChart) myChart.destroy();
        return;
    }

    transactionList.innerHTML = '';
    let total = 0;
    let totalIncomes = 0;
    let totalExpenses = 0;

    list.forEach(item => {
        const amount = parseFloat(item.amount);
        const isIncome = item.type === 'income';
        
        if (isIncome) { totalIncomes += amount; total += amount; } 
        else { totalExpenses += amount; total -= amount; }

        // 2. Formatação Profissional
        const formattedAmount = amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        const date = new Date(item.created_at).toLocaleDateString('pt-BR');

        const li = document.createElement('li');
        li.innerHTML = `
            <div style="display: flex; flex-direction: column;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <button onclick="deleteTransaction('${item.id}')" title="Excluir" style="background:none; border:none; color:#cbd5e1; cursor:pointer; font-size:1.2rem;">×</button>
                    <span style="font-weight: 600;">${item.description}</span>
                </div>
                <small style="color: #94a3b8; margin-left: 30px;">${date}</small>
            </div>
            <strong style="color: ${isIncome ? '#10b981' : '#ef4444'}">
                ${isIncome ? '+' : '-'} ${formattedAmount}
            </strong>
        `;
        transactionList.appendChild(li);
    });

    balanceEl.innerText = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    balanceEl.style.color = total >= 0 ? '#10b981' : '#ef4444';

    if (typeof updateChart === 'function') updateChart(totalIncomes, totalExpenses);
}

let myChart = null; // Variável para controlar o gráfico

function updateChart(incomes, expenses) {
    const ctx = document.getElementById('financeChart').getContext('2d');

    // Se o gráfico já existir, destrói-o para criar um novo com dados frescos
    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Entradas', 'Saídas'],
            datasets: [{
                data: [incomes, expenses],
                backgroundColor: ['#10b981', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            plugins: {
                legend: { position: 'bottom' }
            },
            cutout: '70%' // Deixa o gráfico mais fino e elegante
        }
    });
}

async function deleteTransaction(id) {
    const confirmacao = confirm("Tens a certeza que desejas eliminar esta transação?");
    
    if (confirmacao) {
        const { error } = await _supabase
            .from('transactions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Erro ao eliminar:", error.message);
            alert("Não foi possível eliminar a transação.");
        } else {
            // Recarrega a lista e o saldo automaticamente
            loadTransactions();
        }
    }
}

// Chamar ao carregar a página
loadTransactions();