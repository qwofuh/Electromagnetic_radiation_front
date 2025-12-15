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
  Row, 
  Col, 
  Badge, 
  Spinner, 
  Alert, 
  Button, 
  ButtonGroup,
  Form,
  Modal,
  Stack,
  ProgressBar
} from 'react-bootstrap';
import { 
  Eye, 
  XCircle, 
  CheckCircle, 
  Filter, 
  Calendar, 
  User, 
  AlertCircle, 
  Clock, 
  Cpu,
  Calculator,
  FileText,
  ChevronRight
} from 'lucide-react';
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
  const currentModeratorId = 1; // Временное значение
  
  // Загружаем заявки при монтировании
  useEffect(() => {
    dispatch(getAllOrdersAsync({}));
  }, [dispatch]);
  
  // Обработка изменения фильтров
  useEffect(() => {
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
      dispatch(setFilters({ 
        status: statusFilter || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      }));
    }
  }, [dispatch, creatorFilter, orders]);

  // Polling обновлений
  useEffect(() => {
    const intervalId = setInterval(() => {
      dispatch(getAllOrdersAsync({}));
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, [dispatch]);

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

  // Функция для получения иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'черновик': return <FileText size={16} />;
      case 'сформирован': return <Clock size={16} />;
      case 'завершен': return <CheckCircle size={16} />;
      case 'отклонен': return <XCircle size={16} />;
      default: return <FileText size={16} />;
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

  // Функция для форматирования времени
  const formatTime = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
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

  // Получаем название заявки
  const getOrderTitle = (orderId: number) => {
    const order = orders.find(o => o.id === orderId);
    return order ? `Заявка #${order.id}` : `Заявка #${orderId}`;
  };

// Функция для получения цвета результата (если есть)
const getEmissionColor = (emission: number | null | undefined) => {
  if (!emission && emission !== 0) return 'text-muted'; // учитываем и 0, и null/undefined
  if (emission < 10) return 'text-success';
  if (emission < 50) return 'text-warning';
  return 'text-danger';
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

      {/* Хедер с заголовком и статистикой */}
      <Card className="shadow mb-4">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h4 className="mb-0">Все заявки</h4>
              <p className="text-muted mb-0">
                Показано {filteredOrders.length} из {orders.length} заявок
              </p>
            </div>
            <Button 
              variant="outline-secondary" 
              onClick={handleResetFilters}
              size="sm"
            >
              <Filter size={16} className="me-1" />
              Сбросить фильтры
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Панель фильтров */}
      <Card className="shadow mb-4">
        <Card.Header className="bg-light">
          <h6 className="mb-0">Фильтры заявок</h6>
        </Card.Header>
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
              </Form.Group>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Ошибка */}
      {error && (
        <Alert variant="danger" className="mb-4" onClose={() => dispatch({ type: 'orders/clearOrdersError' })} dismissible>
          {error}
        </Alert>
      )}

      {/* Карточки заявок */}
      {filteredOrders.length === 0 ? (
        <Card className="shadow text-center py-5">
          <Card.Body>
            <Filter size={64} className="text-muted mb-3" />
            <h5 className="text-muted mb-3">Заявки не найдены</h5>
            <p className="text-muted">Попробуйте изменить параметры фильтров</p>
            <Button variant="outline-primary" onClick={handleResetFilters}>
              Сбросить фильтры
            </Button>
          </Card.Body>
        </Card>
      ) : (
        <Row className="g-4">
          {filteredOrders.map((order) => {
            const deviceCount = order.devices_count || 0;
            const isCompleting = completingOrderId === order.id;
            const statusColor = getStatusColor(order.status);
            
            return (
              <Col key={order.id} xl={4} lg={6} md={12}>
                <Card className="shadow-sm h-100 hover-shadow transition-all">
                  {/* Хедер карточки с статусом */}
                  <Card.Header className={`bg-${statusColor}-subtle border-${statusColor}-subtle`}>
                    <div className="d-flex justify-content-between align-items-center">
                      <Badge bg={statusColor} className="d-flex align-items-center gap-1">
                        {getStatusIcon(order.status)}
                        {getDisplayStatus(order.status)}
                      </Badge>
                      <span className="text-muted small">
                        ID: #{order.id}
                      </span>
                    </div>
                  </Card.Header>
                  
                  <Card.Body>
                    {/* Заголовок и дата */}
                    <div className="d-flex justify-content-between align-items-start mb-3">
                      <div>
                        <h6 className="fw-bold mb-1">Заявка #{order.id}</h6>
                        {order.id && (
                          <p className="text-muted small mb-0">{order.id}</p>
                        )}
                      </div>
                      <div className="text-end">
                        <div className="small text-muted">
                          <Clock size={12} className="me-1" />
                          {formatDate(order.create_at)}
                        </div>
                        <div className="small text-muted">
                          {formatTime(order.create_at)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Основная информация в виде иконок */}
                    <Stack direction="horizontal" className="mb-3" gap={3}>
                      
                      <div className="text-center">
                        <div className="rounded-circle bg-warning-subtle p-2 d-inline-flex">
                          <Calculator size={20} className="text-warning" />
                        </div>
                        <div className="mt-1">
                          <div className={`fw-bold ${getEmissionColor(order.total_emission)}`}>
                            {order.total_emission ? `${order.total_emission} мЗв` : '—'}
                          </div>
                          <div className="small text-muted">Результат</div>
                        </div>
                      </div>
                      
                      {order.distance && (
                        <div className="text-center">
                          <div className="rounded-circle bg-info-subtle p-2 d-inline-flex">
                            <Clock size={20} className="text-info" />
                          </div>
                          <div className="mt-1">
                            <div className="fw-bold">{order.distance} м</div>
                            <div className="small text-muted">Расстояние</div>
                          </div>
                        </div>
                      )}
                    </Stack>
                    
                    {/* Прогресс бар для завершенных заявок */}
                    {order.status?.toLowerCase() === 'завершен' && order.total_emission && (
                      <div className="mb-3">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Уровень эмиссии</span>
                          <span>{order.total_emission} мЗв</span>
                        </div>
                        <ProgressBar 
                          variant={
                            order.total_emission < 10 ? 'success' : 
                            order.total_emission < 50 ? 'warning' : 'danger'
                          }
                          now={Math.min(order.total_emission, 100)}
                          max={100}
                          className="rounded"
                          style={{ height: '6px' }}
                        />
                      </div>
                    )}
                    
                  </Card.Body>
                  
                  {/* Футер с действиями */}
                  <Card.Footer className="bg-white border-top-0 pt-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <Button 
                        variant="outline-primary" 
                        size="sm"
                        onClick={() => handleView(order.id)}
                        disabled={isCompleting}
                        className="d-flex align-items-center gap-1"
                      >
                        <Eye size={16} />
                        Подробнее
                        <ChevronRight size={14} />
                      </Button>
                      
                      {/* Кнопки действий для сформированных заявок */}
                      {order.status?.toLowerCase() === 'сформирован' && (
                        <ButtonGroup size="sm">
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
                        </ButtonGroup>
                      )}
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Подвал с информацией о фильтрах */}
      {(statusFilter || startDate || endDate || creatorFilter) && filteredOrders.length > 0 && (
        <Card className="shadow mt-4">
          <Card.Body className="py-2">
            <div className="d-flex align-items-center justify-content-between">
              <small className="text-muted">
                Активные фильтры: 
                {statusFilter && <Badge bg="primary" className="ms-2">Статус: {getDisplayStatus(statusFilter)}</Badge>}
                {startDate && <Badge bg="info" className="ms-2">Дата с: {formatDate(startDate)}</Badge>}
                {endDate && <Badge bg="info" className="ms-2">Дата по: {formatDate(endDate)}</Badge>}
                {creatorFilter && <Badge bg="secondary" className="ms-2">Создатель: {creatorFilter}</Badge>}
              </small>
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleResetFilters}
                className="text-decoration-none"
              >
                Очистить всё
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default AllOrdersPage;