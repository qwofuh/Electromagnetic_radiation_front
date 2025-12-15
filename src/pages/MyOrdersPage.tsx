import React, { useEffect, useState } from "react";
import { 
  Container, 
  Card, 
  Button, 
  Row, 
  Col, 
  Badge, 
  Spinner, 
  Alert, 
  Stack, 
  ProgressBar,
  Form,
  ButtonGroup
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { AppDispatch, RootState } from "../store";
import { getUserOrders } from "../slice/draftSlice";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { 
  Eye, 
  Clock, 
  Cpu, 
  Calculator, 
  FileText, 
  CheckCircle, 
  XCircle, 
  ChevronRight,
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw
} from 'lucide-react';

export const MyOrdersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { userOrders, loading, error } = useSelector((state: RootState) => state.draft);
  
  // Состояния для фильтров
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  const [filteredOrders, setFilteredOrders] = useState(userOrders);

  useEffect(() => {
    dispatch(getUserOrders());
  }, [dispatch]);

  // Применение фильтров при изменении userOrders или фильтров
  useEffect(() => {
    let result = [...userOrders];
    
    // Фильтр по статусу
    if (statusFilter) {
      result = result.filter(order => 
        order.status?.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    
    // Фильтр по дате начала
    if (startDate) {
      const start = new Date(startDate);
      result = result.filter(order => 
        new Date(order.create_at) >= start
      );
    }
    
    // Фильтр по дате окончания
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Конец дня
      result = result.filter(order => 
        new Date(order.create_at) <= end
      );
    }
    
    // Поиск по названию или ID
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.order_name?.toLowerCase().includes(query) ||
        order.id.toString().includes(query) ||
        order.description?.toLowerCase().includes(query)
      );
    }
    
    setFilteredOrders(result);
  }, [userOrders, statusFilter, startDate, endDate, searchQuery]);

  const handleViewOrder = (orderId: number) => {
    navigate(`/emission_calculations/${orderId}`);
  };

  const handleResetFilters = () => {
    setStatusFilter('');
    setStartDate('');
    setEndDate('');
    setSearchQuery('');
    setShowFilters(false);
  };

  const handleRefresh = () => {
    dispatch(getUserOrders());
  };

  // Функция для получения цвета статуса
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'черновик': return 'warning';
      case 'сформирован': return 'primary';
      case 'завершен': return 'success';
      case 'отклонен': return 'danger';
      case 'удален': return 'secondary';
      default: return 'info';
    }
  };

  // Функция для получения иконки статуса
  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'черновик': return <FileText size={16} />;
      case 'сформирован': return <Clock size={16} />;
      case 'завершен': return <CheckCircle size={16} />;
      case 'отклонен': return <XCircle size={16} />;
      case 'удален': return <AlertCircle size={16} />;
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

  // Функция для получения цвета результата эмиссии
  const getEmissionColor = (emission: number | null | undefined) => {
    if (!emission && emission !== 0) return 'text-muted';
    if (emission < 10) return 'text-success';
    if (emission < 50) return 'text-warning';
    return 'text-danger';
  };

  // Функция для отображения результата эмиссии
  const renderEmissionResult = (emission: number | null | undefined) => {
    if (emission === null || emission === undefined) return '—';
    return `${emission} мЗв`;
  };

  // Получаем статистику по статусам
  const getStatusStats = () => {
    const stats = {
      черновик: 0,
      сформирован: 0,
      завершен: 0,
      отклонен: 0,
      всего: userOrders.length
    };
    
    userOrders.forEach(order => {
      const status = order.status?.toLowerCase();
      if (status && stats.hasOwnProperty(status)) {
        stats[status as keyof typeof stats]++;
      }
    });
    
    return stats;
  };

  const statusStats = getStatusStats();

  if (loading && userOrders.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <Container className="py-4">
        <div className="mb-4">
          <Breadcrumbs
            items={[
              { name: "Главная", path: "/" },
              { name: "Мои заявки", path: "/my-orders" },
            ]}
          />
        </div>

        

        {/* Панель фильтров */}
        {showFilters && (
          <Card className="shadow mb-4">
            <Card.Header className="bg-light">
              <h6 className="mb-0">Фильтры заявок</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                {/* Поиск по названию или ID */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Поиск по названию или ID
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Введите название, ID или описание..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                
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
                
                <Col md={3}>
                  <div className="d-flex h-100 align-items-end">
                    <Button 
                      variant="outline-danger" 
                      onClick={handleResetFilters}
                      className="w-100"
                    >
                      Сбросить фильтры
                    </Button>
                  </div>
                </Col>
                
                {/* Фильтр по дате начала */}
                <Col md={4}>
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
                <Col md={4}>
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
                
                {/* Быстрые фильтры по статусам */}
                <Col md={4}>
                  <Form.Group>
                    <Form.Label className="small fw-bold">
                      Быстрые фильтры
                    </Form.Label>
                    <div className="d-flex flex-wrap gap-2">
                      <Button
                        variant={statusFilter === 'черновик' ? 'warning' : 'outline-warning'}
                        size="sm"
                        onClick={() => setStatusFilter(statusFilter === 'черновик' ? '' : 'черновик')}
                      >
                        Черновики ({statusStats.черновик})
                      </Button>
                      <Button
                        variant={statusFilter === 'сформирован' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => setStatusFilter(statusFilter === 'сформирован' ? '' : 'сформирован')}
                      >
                        Сформированы ({statusStats.сформирован})
                      </Button>
                      <Button
                        variant={statusFilter === 'завершен' ? 'success' : 'outline-success'}
                        size="sm"
                        onClick={() => setStatusFilter(statusFilter === 'завершен' ? '' : 'завершен')}
                      >
                        Завершены ({statusStats.завершен})
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        )}

        {/* Ошибка */}
        {error && (
          <Alert variant="danger" className="mb-4" dismissible onClose={() => {}}>
            {error}
          </Alert>
        )}

        {/* Информация о фильтрах */}
        {(statusFilter || startDate || endDate || searchQuery) && filteredOrders.length > 0 && (
          <Card className="shadow mb-3">
            <Card.Body className="py-2">
              <div className="d-flex align-items-center justify-content-between">
                <small className="text-muted">
                  Активные фильтры: 
                  {statusFilter && <Badge bg="primary" className="ms-2">Статус: {statusFilter}</Badge>}
                  {startDate && <Badge bg="info" className="ms-2">Дата с: {formatDate(startDate)}</Badge>}
                  {endDate && <Badge bg="info" className="ms-2">Дата по: {formatDate(endDate)}</Badge>}
                  {searchQuery && <Badge bg="secondary" className="ms-2">Поиск: {searchQuery}</Badge>}
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

        {/* Карточки заявок */}
        {userOrders.length === 0 ? (
          <Card className="shadow text-center py-5">
            <Card.Body>
              <FileText size={64} className="text-muted mb-3" />
              <h5 className="text-muted mb-3">Заявок пока нет</h5>
              <p className="text-muted mb-4">Создайте свою первую заявку для расчета эмиссии</p>
              <Button 
                variant="primary" 
                onClick={() => navigate('/catalog')}
              >
                Перейти в каталог
              </Button>
            </Card.Body>
          </Card>
        ) : filteredOrders.length === 0 ? (
          <Card className="shadow text-center py-5">
            <Card.Body>
              <Filter size={64} className="text-muted mb-3" />
              <h5 className="text-muted mb-3">Заявки не найдены</h5>
              <p className="text-muted mb-4">Попробуйте изменить параметры фильтров</p>
              <Button 
                variant="outline-primary" 
                onClick={handleResetFilters}
              >
                Сбросить фильтры
              </Button>
            </Card.Body>
          </Card>
        ) : (
          <Row className="g-4">
            {filteredOrders.map((order) => {
              const deviceCount = order.devices?.length || 0;
              const statusColor = getStatusColor(order.status);
              
              return (
                <Col key={order.id} xl={4} lg={6} md={12}>
                  <Card className="shadow-sm h-100 hover-shadow transition-all">
                    {/* Хедер карточки с статусом */}
                    <Card.Header className={`bg-${statusColor}-subtle border-${statusColor}-subtle`}>
                      <div className="d-flex justify-content-between align-items-center">
                        <Badge bg={statusColor} className="d-flex align-items-center gap-1">
                          {getStatusIcon(order.status)}
                          {order.status}
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
                          <h6 className="fw-bold mb-1">{order.order_name || `Заявка #${order.id}`}</h6>
                          {order.description && (
                            <p className="text-muted small mb-0 text-truncate" style={{ maxWidth: '200px' }}>
                              {order.description}
                            </p>
                          )}
                        </div>
                        <div className="text-end">
                          <div className="small text-muted">
                            <Calendar size={12} className="me-1" />
                            {formatDate(order.create_at)}
                          </div>
                          <div className="small text-muted">
                            {formatTime(order.create_at)}
                          </div>
                        </div>
                      </div>
                      
                      {/* Информация о требованиях */}
                      {order.customer_requirements && (
                        <div className="mb-3">
                          <p className="small text-muted mb-1">Требования:</p>
                          <p className="small mb-0 text-truncate-2" style={{ maxHeight: '2.5em', overflow: 'hidden' }}>
                            {order.customer_requirements}
                          </p>
                        </div>
                      )}
                      
                      {/* Основная информация в виде иконок */}
                      <Stack direction="horizontal" className="mb-3" gap={3}>
                        <div className="text-center">
                          <div className="rounded-circle bg-primary-subtle p-2 d-inline-flex">
                            <Cpu size={20} className="text-primary" />
                          </div>
                          <div className="mt-1">
                            <div className="fw-bold">{deviceCount}</div>
                            <div className="small text-muted">Приборов</div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className="rounded-circle bg-warning-subtle p-2 d-inline-flex">
                            <Calculator size={20} className="text-warning" />
                          </div>
                          <div className="mt-1">
                            <div className={`fw-bold ${getEmissionColor(order.total_emission)}`}>
                              {renderEmissionResult(order.total_emission)}
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
                      
                      {/* Индикатор черновика */}
                      {order.status?.toLowerCase() === 'черновик' && (
                        <div className="alert alert-warning alert-sm mb-0 p-2">
                          <div className="d-flex align-items-center">
                            <FileText size={14} className="me-2" />
                            <small>Это черновик. Заполните все данные и сформируйте заявку.</small>
                          </div>
                        </div>
                      )}
                      
                      {/* Индикатор отклоненной заявки */}
                      {order.status?.toLowerCase() === 'отклонен' && (
                        <div className="alert alert-danger alert-sm mb-0 p-2">
                          <div className="d-flex align-items-center">
                            <XCircle size={14} className="me-2" />
                            <small>Заявка отклонена модератором.</small>
                          </div>
                        </div>
                      )}
                    </Card.Body>
                    
                    {/* Футер с действиями */}
                    <Card.Footer className="bg-white border-top-0 pt-0">
                      <div className="d-flex justify-content-between align-items-center">
                        <Button 
                          variant="outline-primary" 
                          size="sm"
                          onClick={() => handleViewOrder(order.id)}
                          className="d-flex align-items-center gap-1"
                        >
                          <Eye size={16} />
                          Подробнее
                          <ChevronRight size={14} />
                        </Button>
                        
                        {/* Индикатор статуса */}
                        <div className="small text-muted">
                          {order.status?.toLowerCase() === 'черновик' && (
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={12} />
                              В работе
                            </span>
                          )}
                          {order.status?.toLowerCase() === 'сформирован' && (
                            <span className="d-flex align-items-center gap-1">
                              <Clock size={12} />
                              Ожидает расчета
                            </span>
                          )}
                          {order.status?.toLowerCase() === 'завершен' && (
                            <span className="d-flex align-items-center gap-1 text-success">
                              <CheckCircle size={12} />
                              Завершено
                            </span>
                          )}
                        </div>
                      </div>
                    </Card.Footer>
                  </Card>
                </Col>
              );
            })}
          </Row>
        )}
      </Container>
    </div>
  );
};