// assets/js/auth.js
// Verifica se já existe um usuário logado ao carregar a página
window.onload = async () => {
    const { data: { session } } = await _supabase.auth.getSession();
    
    if (session) {
        showDashboard(session.user);
    } else {
        showAuth();
    }
};
// 1. FUNÇÃO: CRIAR CONTA (Sign Up)
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("Preencha e-mail e senha!");

    const { data, error } = await _supabase.auth.signUp({ email, password });

    if (error) {
        alert("Erro no cadastro: " + error.message);
    } else {
        alert("Cadastro realizado! Você já pode entrar.");
    }
});

// 2. FUNÇÃO: FAZER LOGIN (Sign In)
document.getElementById('auth-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) {
        alert("Erro no login: " + error.message);
    } else {
        checkUser(); // Atualiza a tela após logar
    }
});

// 3. FUNÇÃO: VERIFICAR SESSÃO (Mantém o usuário logado ao dar F5)
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();

    const authSection = document.getElementById('auth-section');
    const dashboardSection = document.getElementById('dashboard-section');

    if (user) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('user-display').innerText = user.email;
        document.getElementById('auth-section').style.display = 'none';
        document.getElementById('dashboard-section').style.display = 'block';
        
        // Se houver uma função de carregar dados no dashboard.js, chamamos ela aqui
        if (typeof loadTransactions === 'function') {
            loadTransactions();
        }
    } else {
        authSection.style.display = 'block';
        dashboardSection.style.display = 'none';
    }
}

// 4. FUNÇÃO: SAIR (Logout)
async function logout() {
    const { error } = await _supabase.auth.signOut();
    if (error) alert("Erro ao sair");
    window.location.reload(); // Recarrega para limpar os dados da tela
}

// Executa assim que o script carrega
checkUser();