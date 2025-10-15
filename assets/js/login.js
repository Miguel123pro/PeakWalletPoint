// login.js - Lógica da página de login

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const errorMessage = document.getElementById('errorMessage');
    const showRegisterLink = document.getElementById('showRegister');
    const loginBtn = document.getElementById('loginBtn');

    // Verificar se já existe utilizador registado
    const existingUser = localStorage.getItem('finance_user');
    const isFirstTime = !existingUser;

    // Se for primeira vez, mostrar registo
    if (isFirstTime) {
        setupRegisterMode();
    }

    // Redirecionar se já tiver sessão ativa
    if (authManager.hasActiveSession()) {
        window.location.href = 'index.html';
    }

    // Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        if (!username || !password) {
            showError('Por favor preencha todos os campos');
            return;
        }

        loginBtn.disabled = true;
        loginBtn.textContent = 'A entrar...';
        errorMessage.textContent = '';

        try {
            if (isFirstTime) {
                // Registar
                await authManager.register(username, password);
                window.location.href = 'index.html';
            } else {
                // Login
                await authManager.login(username, password);
                window.location.href = 'index.html';
            }
        } catch (error) {
            showError(error.message);
            loginBtn.disabled = false;
            loginBtn.textContent = isFirstTime ? 'Criar Conta' : 'Entrar';
        }
    });

    // Link para alternar entre login/registo
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        if (isFirstTime) return; // Já está em modo registo

        setupRegisterMode();
    });

    function setupRegisterMode() {
        document.querySelector('h1').textContent = 'Criar Conta';
        document.querySelector('.subtitle').textContent = 'Primeiro Acesso';
        loginBtn.textContent = 'Criar Conta';
        document.querySelector('.register-link').style.display = 'none';

        const passwordInput = document.getElementById('password');
        passwordInput.setAttribute('autocomplete', 'new-password');
        passwordInput.placeholder = 'Mínimo 6 caracteres';

        // Adicionar validação de password forte
        passwordInput.addEventListener('input', () => {
            if (passwordInput.value.length > 0 && passwordInput.value.length < 6) {
                showError('Password deve ter no mínimo 6 caracteres');
            } else {
                errorMessage.textContent = '';
            }
        });
    }

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';

        // Animar o erro
        errorMessage.style.animation = 'none';
        setTimeout(() => {
            errorMessage.style.animation = 'shake 0.3s';
        }, 10);
    }

    // Enter para submeter
    document.getElementById('password').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});