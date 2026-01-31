// Configurações do Supabase
const SUPABASE_URL = "https://yafvsldylnorxlfdwlhq.supabase.co";
const SUPABASE_KEY = "sb_publishable_opwN8F2HKPbs-45kXeuNFQ_rZnIDDAS";
const _supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Referências do HTML
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authForm = document.getElementById('auth-form');

// --- ETAPA 1: LÓGICA DE LOGIN/CADASTRO ---

// Criar Conta
document.getElementById('register-btn').addEventListener('click', async () => {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert("Conta criada! Verifica o teu e-mail (ou faz login se desativaste a confirmação).");
});

// Fazer Login
authForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const { data, error } = await _supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else {
        alert("Login realizado com sucesso!");
        window.location.reload(); // Recarrega para verificar a sessão
    }
});

// Verificar se o utilizador já está logado ao abrir a página
async function checkUser() {
    const { data: { user } } = await _supabase.auth.getUser();

    if (user) {
        authSection.style.display = 'none';
        dashboardSection.style.display = 'block';
        document.getElementById('user-display').innerText = user.email;
    }
}

async function logout() {
    await _supabase.auth.signOut();
    window.location.reload();
}

checkUser();