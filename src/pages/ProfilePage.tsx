import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store'; // Импортируем AppDispatch
import { getUserInfoAsync, updateUserDataAsync, setUserId } from '../slice/userSlice';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';

const ProfilePage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>(); // Типизируем dispatch
  const { id, username, role, loading, error } = useSelector((state: RootState) => state.user);
  
  const [editMode, setEditMode] = useState(false);
  const [newLogin, setNewLogin] = useState(username);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

// Добавим useEffect для инициализации id
useEffect(() => {
  // Если id нет в состоянии, но пользователь авторизован
  if (!id && username) {
    console.log('No id in state but user is authenticated, extracting from token');
    
    // Пробуем извлечь id из токена
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Извлекаем JWT payload
        const tokenParts = token.split(' ');
        if (tokenParts.length === 2 && tokenParts[0] === 'Bearer') {
          const jwtToken = tokenParts[1];
          const payload = JSON.parse(atob(jwtToken.split('.')[1]));
          const userId = payload.user_id;
          
          console.log('Extracted userId from token:', userId);
          
          // Диспатчим действие для установки id
          dispatch(setUserId(userId));
          // Сохраняем в localStorage для использования в этом сеансе
          localStorage.setItem('userId', userId.toString());
        }
      } catch (error) {
        console.error('Error extracting userId from token:', error);
      }
    }
  }
}, [id, username, dispatch]);

  useEffect(() => {
    if (id) {
      dispatch(getUserInfoAsync(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    setNewLogin(username);
  }, [username]);

  const handleUpdateProfile = async () => {
    if (!id) {
      setUpdateError('Пользователь не найден');
      return;
    }

    // Валидация
    if (newPassword && newPassword !== confirmPassword) {
      setUpdateError('Новые пароли не совпадают');
      return;
    }

    if (newPassword && !currentPassword) {
      setUpdateError('Для смены пароля введите текущий пароль');
      return;
    }

    setUpdateError(null);
    setUpdateSuccess(false);

    try {
      const updateData: any = { id };

      if (newLogin !== username) {
        updateData.login = newLogin;
      }

      if (currentPassword && newPassword) {
        updateData.currentPassword = currentPassword;
        updateData.newPassword = newPassword;
      }

      await dispatch(updateUserDataAsync(updateData)).unwrap();
      
      setUpdateSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditMode(false);
      
      // Обновляем информацию о пользователе
      dispatch(getUserInfoAsync(id));
      
    } catch (err: any) {
      setUpdateError(err || 'Ошибка обновления профиля');
    }
  };

  const handleCancelEdit = () => {
    setEditMode(false);
    setNewLogin(username);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setUpdateError(null);
    setUpdateSuccess(false);
  };

  const getRoleText = (role: number | null) => {
    switch (role) {
      case 1: return 'Администратор';
      case 2: return 'Пользователь';
      default: return 'Неизвестно';
    }
  };

  if (loading && !username) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <Card className="shadow" style={{ width: '100%', maxWidth: '500px' }}>
        <Card.Body>
          <Card.Title className="text-center mb-4">Профиль пользователя</Card.Title>
          
          {error && (
            <Alert variant="danger" className="mb-3">
              {error}
            </Alert>
          )}
          
          {updateError && (
            <Alert variant="danger" className="mb-3">
              {updateError}
            </Alert>
          )}
          
          {updateSuccess && (
            <Alert variant="success" className="mb-3">
              Профиль успешно обновлен
            </Alert>
          )}

          {!editMode ? (
            // Режим просмотра
            <>
              <Form.Group className="mb-3">
                <Form.Label>Логин</Form.Label>
                <Form.Control 
                  type="text" 
                  value={username} 
                  readOnly 
                  plaintext 
                />
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Роль</Form.Label>
                <Form.Control 
                  type="text" 
                  value={getRoleText(role)} 
                  readOnly 
                  plaintext 
                />
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={() => setEditMode(true)}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Загрузка...
                    </>
                  ) : 'Обновить данные'}
                </Button>
              </div>
            </>
          ) : (
            // Режим редактирования
            <>
              <Form.Group className="mb-3">
                <Form.Label>Логин</Form.Label>
                <Form.Control 
                  type="text" 
                  value={newLogin} 
                  onChange={(e) => setNewLogin(e.target.value)}
                  placeholder="Введите новый логин"
                />
                <Form.Text className="text-muted">
                  Оставьте пустым, если не хотите менять логин
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Текущий пароль</Form.Label>
                <Form.Control 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Введите текущий пароль для подтверждения"
                />
                <Form.Text className="text-muted">
                  Обязательно для смены пароля
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Новый пароль</Form.Label>
                <Form.Control 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Введите новый пароль"
                />
                <Form.Text className="text-muted">
                  Оставьте пустым, если не хотите менять пароль
                </Form.Text>
              </Form.Group>
              
              <Form.Group className="mb-4">
                <Form.Label>Подтверждение нового пароля</Form.Label>
                <Form.Control 
                  type="password" 
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Повторите новый пароль"
                  disabled={!newPassword}
                />
              </Form.Group>
              
              <div className="d-grid gap-2">
                <Button 
                  variant="primary" 
                  onClick={handleUpdateProfile}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      {' '}Сохранение...
                    </>
                  ) : 'Сохранить изменения'}
                </Button>
                
                <Button 
                  variant="outline-secondary" 
                  onClick={handleCancelEdit}
                  disabled={loading}
                >
                  Отмена
                </Button>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage;