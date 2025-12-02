import { Api } from './Api';

export const api = new Api({
    baseURL: 'http://localhost:8080',
    
    // 🔧 ДОБАВЬТЕ securityWorker для автоматической передачи токена
    securityWorker: (_securityData) => {
        // Получаем ПОЛНЫЙ токен из localStorage (с "Bearer ")
        const token = localStorage.getItem('token');
        
        if (token) {
            console.log('🔐 Security worker: Adding token to request');
            return {
                headers: {
                    Authorization: token // передаем полный токен
                }
            };
        }
        
        console.log('❌ Security worker: No token found');
        return {};
    }
});