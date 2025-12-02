import React, { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react'
import { Form, Button, Alert, Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { loginUserAsync } from '../slice/userSlice';
import { useNavigate } from "react-router-dom";
import { ROUTES } from '../Routes'
import "./LoginPage.css"

const LoginPage: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({ login: '', password: '' });
    const { error, loading } = useSelector((state: RootState) => state.user);

    // Обработчик события изменения полей ввода
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Обработчик события нажатия на кнопку "Войти"
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (formData.login && formData.password) {
            const result = await dispatch(loginUserAsync(formData));
            
            // Проверяем успешность логина перед переходом
            if (loginUserAsync.fulfilled.match(result)) {
                navigate(`${ROUTES.CATALOG}`); // переход на страницу услуг
            }
        }
    };

    return (
        <Container style={{ maxWidth: '100%', marginTop: '0' }}> 
            <Container style={{ maxWidth: '400px', marginTop: '150px' }}>
                <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Рады снова Вас видеть!</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="login" style={{ marginBottom: '15px' }}>
                        <Form.Label>Логин</Form.Label>
                        <Form.Control
                            type="text"
                            name="login"
                            value={formData.login}
                            onChange={handleChange}
                            placeholder="Введите логин"
                            disabled={loading}
                        />
                    </Form.Group>
                    <Form.Group controlId="password" style={{ marginBottom: '20px' }}>
                        <Form.Label>Пароль</Form.Label>
                        <Form.Control
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Введите пароль"
                            disabled={loading}
                        />
                    </Form.Group>
                    <Button className='auth-btn' 
                        variant="primary" 
                        type="submit" 
                        style={{ width: '100%' }}
                        disabled={loading}
                    >
                        {loading ? "Вход..." : "Войти"}
                    </Button>
                </Form>
            </Container>
        </Container>
    );
};

export default LoginPage;