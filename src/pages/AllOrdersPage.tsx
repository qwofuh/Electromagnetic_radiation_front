import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../store';
import { 
  getAllOrdersAsync, 
  setFilters, 
  applyCreatorFilter,
  resetFilters,
  completeOrRejectOrderAsync
} from '../slice/ordersSlice';
import { 
  Card, 
  Table, 
  Badge, 
  Spinner, 
  Alert, 
  Button, 
  ButtonGroup,
  Form,
  Row,
  Col,
  Modal
} from 'react-bootstrap';
import { Eye, XCircle, CheckCircle, Filter, Calendar, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AllOrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { 
    orders, 
    filteredOrders, 
    loading, 
    error, 
    creators,
    completingOrderId 
  } = useSelector((state: RootState) => state.orders);
  
  // Состояния для фильтров
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [creatorFilter, setCreatorFilter] = useState<string>('');
  
  // Состояния для модальных окон
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'complete' | 'reject' | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  
  const navigate = useNavigate();
  
  // Получаем ID текущего пользователя (администратора)
  // Это нужно заменить на реальное получение ID пользователя из вашего состояния
  const currentModeratorId = 1; // Временное значение
  
  // Загружаем заявки при монтировании
  useEffect(() => {
    dispatch(getAllOrdersAsync({}));
  }, [dispatch]);
  
  // Обработка изменения фильтров
  useEffect(() => {
    // Применяем серверные фильтры (статус и дата)
    const serverFilters = {
      status: statusFilter || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };
    
    dispatch(getAllOrdersAsync(serverFilters));
    dispatch(setFilters(serverFilters));
  }, [dispatch, statusFilter, startDate, endDate]);
  
  // Применяем фильтр по создателю локально
  useEffect(() => {
    if (creatorFilter) {
      dispatch(applyCreatorFilter(creatorFilter));
    } else {
      // Если фильтр по создателю сброшен, показываем все заявки
      dispatch(setFilters({ 
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }));
    }
  }, [dispatch, creatorFilter, orders]);

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'черновик': return 'secondary';
      case 'сформирован': return 'warning';
      case 'завершен': return 'success';
      case 'отклонен': return 'danger';
      default: return 'secondary';
    }
  };

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Обработчики действий
  const handleView = (orderId: number) => {
    navigate(`/emission_calculations/${orderId}`);
  };

  const handleRejectClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setConfirmAction('reject');
    setShowConfirmModal(true);
  };

  const handleCompleteClick = (orderId: number) => {
    setSelectedOrderId(orderId);
    setConfirmAction('complete');
    setShowConfirmModal(true);
  };


  useEffect(() => {
  // Первоначальная загрузка
  dispatch(getAllOrdersAsync({}));
  
  // Polling каждые 5 секунд
  const intervalId = setInterval(() => {
    dispatch(getAllOrdersAsync({}));
  }, 5000);
  
  // Очистка
  return () => clearInterval(intervalId);
}, [dispatch]);

  const handleConfirmAction = () => {
    if (selectedOrderId && confirmAction) {
      const status = confirmAction === 'complete' ? 'завершен' as const : 'отклонен' as const;
      
      dispatch(completeOrRejectOrderAsync({
        orderId: selectedOrderId,
        moderatorId: currentModeratorId,
        status
      }));
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setSelectedOrderId(null);
  };

  // Сброс фильтров
  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setCreatorFilter('');
    dispatch(resetFilters());
  };

  // Получаем отображаемый статус для фильтра
  const getDisplayStatus = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'черновик': return 'Черновик';
      case 'сформирован': return 'Сформирован';
      case 'завершен': return 'Завершен';
      case 'отклонен': return 'Отклонен';
      default: return status;
    }
  };

  // Получаем название заявки по ID
  const getOrderTitle = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `Заявка #${order.id}` : `Заявка #${orderId}`;
  };

  if (loading && !filteredOrders.length) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container mt-4">
      {/* Модальное окно подтверждения */}
      <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            <AlertCircle className="me-2" />
            {confirmAction === 'complete' ? 'Завершение заявки' : 'Отклонение заявки'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedOrderId && (
            <p>
              Вы уверены, что хотите {confirmAction === 'complete' ? 'завершить' : 'отклонить'} 
              заявку <strong>{getOrderTitle(selectedOrderId)}</strong>?
              {confirmAction === 'complete' && ' После завершения начнется расчет выбросов.'}
            </p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfirmModal(false)}>
            Отмена
          </Button>
          <Button 
            variant={confirmAction === 'complete' ? 'success' : 'danger'}
            onClick={handleConfirmAction}
            disabled={!selectedOrderId}
          >
            {completingOrderId === selectedOrderId ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {confirmAction === 'complete' ? 'Завершение...' : 'Отклонение...'}
              </>
            ) : (
              confirmAction === 'complete' ? 'Завершить' : 'Отклонить'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      <Card className="shadow">
        <Card.Header className="bg-white border-0">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="mb-0">Все заявки</h4>
            <Button 
              variant="outline-secondary" 
              size="sm"
              onClick={handleResetFilters}
              className="me-2"
            >
              Сбросить фильтры
            </Button>
          </div>
          
          {/* Панель фильтров */}
          <Card className="border-0 bg-light">
            <Card.Body>
              <Row className="g-3">
                {/* Фильтр по статусу */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Статус
                    </Form.Label>
                    <Form.Select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">Все статусы</option>
                      <option value="черновик">Черновик</option>
                      <option value="сформирован">Сформирован</option>
                      <option value="завершен">Завершен</option>
                      <option value="отклонен">Отклонен</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                
                {/* Фильтр по дате начала */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <Calendar size={14} className="me-1" />
                      Дата с
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                
                {/* Фильтр по дате окончания */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <Calendar size={14} className="me-1" />
                      Дата по
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={!startDate}
                    />
                    {startDate && !endDate && (
                      <Form.Text className="text-muted">
                        Укажите конечную дату
                      </Form.Text>
                    )}
                  </Form.Group>
                </Col>
                
                {/* Фильтр по создателю */}
                <Col md={3}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      <User size={14} className="me-1" />
                      Создатель
                    </Form.Label>
                    <Form.Select 
                      value={creatorFilter}
                      onChange={(e) => setCreatorFilter(e.target.value)}
                    >
                      <option value="">Все создатели</option>
                      {creators.map((creator, index) => (
                        <option key={index} value={creator}>
                          {creator}
                        </option>
                      ))}
                    </Form.Select>
                    <Form.Text className="text-muted">
                      {creators.length} создателей
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Card.Header>
        
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mb-4" onClose={() => dispatch({ type: 'orders/clearOrdersError' })} dismissible>
              {error}
            </Alert>
          )}
          
          {/* Информация о фильтрации */}
          <div className="mb-3">
            <small className="text-muted">
              Показано {filteredOrders.length} из {orders.length} заявок
              {(statusFilter || startDate || endDate || creatorFilter) && (
                <span className="ms-2">
                  • Активные фильтры: 
                  {statusFilter && ` статус: ${getDisplayStatus(statusFilter)}`}
                  {startDate && ` дата с: ${formatDate(startDate)}`}
                  {endDate && ` по: ${formatDate(endDate)}`}
                  {creatorFilter && ` создатель: ${creatorFilter}`}
                </span>
              )}
            </small>
          </div>
          
          {filteredOrders.length === 0 ? (
            <div className="text-center py-5">
              <Filter size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Заявки не найдены</h5>
              <p className="text-muted">Попробуйте изменить параметры фильтров</p>
            </div>
          ) : (
            <Table striped hover responsive>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Статус</th>
                  <th>Кол-во приборов</th>
                  <th>Результат (мЗв)</th>
                  <th>Создатель</th>
                  <th>Дата создания</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => {
                  const deviceCount = order.devices_count || 0;
                  const isCompleting = completingOrderId === order.id;
                  
                  return (
                    <tr key={order.id}>
                      <td className="fw-semibold">#{order.id}</td>
                      <td>
                        <Badge bg={getStatusColor(order.status)}>
                          {getDisplayStatus(order.status)}
                        </Badge>
                      </td>
                      <td>{deviceCount}</td>
                      <td className="fw-semibold">
                        {order.total_emission ? `${order.total_emission} мЗв` : '—'}
                      </td>
                      <td>
                        <div className="d-flex align-items-center">
                          <User size={14} className="me-1 text-muted" />
                          {order.creator || 'Неизвестно'}
                        </div>
                      </td>
                      <td>
                        {formatDate(order.create_at)}
                      </td>
                      <td>
                        <ButtonGroup size="sm">
                          {/* Кнопка посмотреть - всегда активна */}
                          <Button 
                            variant="outline-primary"
                            onClick={() => handleView(order.id)}
                            title="Просмотреть"
                            disabled={isCompleting}
                          >
                            <Eye size={16} />
                          </Button>
                          
                          {/* Кнопки для сформированных заявок */}
                          {order.status?.toLowerCase() === 'сформирован' && (
                            <>
                              <Button 
                                variant="outline-danger"
                                onClick={() => handleRejectClick(order.id)}
                                title="Отклонить"
                                disabled={isCompleting}
                              >
                                {isCompleting ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <XCircle size={16} />
                                )}
                              </Button>
                              <Button 
                                variant="outline-success"
                                onClick={() => handleCompleteClick(order.id)}
                                title="Завершить"
                                disabled={isCompleting}
                              >
                                {isCompleting ? (
                                  <Spinner animation="border" size="sm" />
                                ) : (
                                  <CheckCircle size={16} />
                                )}
                              </Button>
                            </>
                          )}
                        </ButtonGroup>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default AllOrdersPage;