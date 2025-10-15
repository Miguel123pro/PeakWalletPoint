// auth.js - Sistema de autenticação e encriptação

class AuthManager {
    constructor() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.encryptionKey = null;
    }

    // Gerar chave de encriptação a partir da password
    async generateKey(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            true,
            ['encrypt', 'decrypt']
        );
    }

    // Encriptar dados
    async encrypt(data) {
        if (!this.encryptionKey) {
            throw new Error('Não está autenticado');
        }

        const encoder = new TextEncoder();
        const iv = crypto.getRandomValues(new Uint8Array(12));

        const encryptedData = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv: iv },
            this.encryptionKey,
            encoder.encode(JSON.stringify(data))
        );

        // Combinar IV + dados encriptados
        const combined = new Uint8Array(iv.length + encryptedData.byteLength);
        combined.set(iv, 0);
        combined.set(new Uint8Array(encryptedData), iv.length);

        return btoa(String.fromCharCode(...combined));
    }

    // Desencriptar dados
    async decrypt(encryptedString) {
        if (!this.encryptionKey) {
            throw new Error('Não está autenticado');
        }

        try {
            const combined = Uint8Array.from(atob(encryptedString), c => c.charCodeAt(0));
            const iv = combined.slice(0, 12);
            const data = combined.slice(12);

            const decryptedData = await crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                this.encryptionKey,
                data
            );

            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            throw new Error('Falha ao desencriptar. Password incorreta?');
        }
    }

    // Registar novo utilizador
    async register(username, password) {
        // Verificar se já existe utilizador
        const existingUser = localStorage.getItem('finance_user');
        if (existingUser) {
            throw new Error('Já existe um utilizador registado');
        }

        // Gerar salt aleatório
        const salt = crypto.getRandomValues(new Uint8Array(16));

        // Guardar credenciais (hash da password)
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
        const passwordHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

        const userData = {
            username: username,
            passwordHash: passwordHash,
            salt: btoa(String.fromCharCode(...salt)),
            createdAt: new Date().toISOString()
        };

        localStorage.setItem('finance_user', JSON.stringify(userData));

        // Gerar chave de encriptação
        this.encryptionKey = await this.generateKey(password, salt);
        this.currentUser = username;
        this.isAuthenticated = true;

        // Guardar chave de encriptação no sessionStorage
        const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
        sessionStorage.setItem('finance_encryption_key', JSON.stringify(exportedKey));

        return true;
    }

    // Fazer login
    async login(username, password) {
        const userDataString = localStorage.getItem('finance_user');
        if (!userDataString) {
            throw new Error('Nenhum utilizador registado');
        }

        const userData = JSON.parse(userDataString);

        // Verificar username
        if (userData.username !== username) {
            throw new Error('Username incorreto');
        }

        // Verificar password
        const encoder = new TextEncoder();
        const passwordData = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', passwordData);
        const passwordHash = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

        if (userData.passwordHash !== passwordHash) {
            throw new Error('Password incorreta');
        }

        // Gerar chave de encriptação
        const salt = Uint8Array.from(atob(userData.salt), c => c.charCodeAt(0));
        this.encryptionKey = await this.generateKey(password, salt);
        this.currentUser = username;
        this.isAuthenticated = true;

        // Guardar sessão
        sessionStorage.setItem('finance_session', 'active');

        // Guardar chave de encriptação no sessionStorage (persiste durante a sessão)
        const exportedKey = await crypto.subtle.exportKey('jwk', this.encryptionKey);
        sessionStorage.setItem('finance_encryption_key', JSON.stringify(exportedKey));

        return true;
    }

    // Verificar se tem sessão ativa
    hasActiveSession() {
        return sessionStorage.getItem('finance_session') === 'active';
    }

    async restoreEncryptionKey() {
        try {
            const keyData = sessionStorage.getItem('finance_encryption_key');
            if (!keyData) {
                console.warn('No encryption key found in session');
                return false;
            }

            const keyObject = JSON.parse(keyData);
            this.encryptionKey = await crypto.subtle.importKey(
                'jwk',
                keyObject,
                { name: 'AES-GCM', length: 256 },
                true,
                ['encrypt', 'decrypt']
            );

            this.isAuthenticated = true;
            console.log('✅ Encryption key restored from session');
            return true;
        } catch (error) {
            console.error('Failed to restore encryption key:', error);
            return false;
        }
    }


    // Logout
    logout() {
        this.isAuthenticated = false;
        this.currentUser = null;
        this.encryptionKey = null;
        sessionStorage.removeItem('finance_session');
        window.location.href = 'login.html';
    }

    // Verificar se está autenticado
    checkAuth() {
        if (!this.hasActiveSession()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Alterar password
    async changePassword(oldPassword, newPassword) {
        // Verificar password antiga
        const userDataString = localStorage.getItem('finance_user');
        const userData = JSON.parse(userDataString);

        const encoder = new TextEncoder();
        const oldPasswordData = encoder.encode(oldPassword);
        const oldHashBuffer = await crypto.subtle.digest('SHA-256', oldPasswordData);
        const oldPasswordHash = btoa(String.fromCharCode(...new Uint8Array(oldHashBuffer)));

        if (userData.passwordHash !== oldPasswordHash) {
            throw new Error('Password antiga incorreta');
        }

        // Desencriptar todos os dados com a password antiga
        const encryptedData = localStorage.getItem('finance_data');
        let allData = null;
        if (encryptedData) {
            allData = await this.decrypt(encryptedData);
        }

        // Gerar novo salt e nova chave
        const newSalt = crypto.getRandomValues(new Uint8Array(16));
        const newPasswordData = encoder.encode(newPassword);
        const newHashBuffer = await crypto.subtle.digest('SHA-256', newPasswordData);
        const newPasswordHash = btoa(String.fromCharCode(...new Uint8Array(newHashBuffer)));

        // Atualizar dados do utilizador
        userData.passwordHash = newPasswordHash;
        userData.salt = btoa(String.fromCharCode(...newSalt));
        localStorage.setItem('finance_user', JSON.stringify(userData));

        // Gerar nova chave de encriptação
        this.encryptionKey = await this.generateKey(newPassword, newSalt);

        // Re-encriptar dados com a nova password
        if (allData) {
            const newEncryptedData = await this.encrypt(allData);
            localStorage.setItem('finance_data', newEncryptedData);
        }

        return true;
    }
}

// Instância global
const authManager = new AuthManager();