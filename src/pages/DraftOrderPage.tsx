import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type{ AppDispatch, RootState } from "../store";
import { getDraftCart, updateOrderData, getDraftOrderDetails, saveDraftOrder, updateDevicePower, removeDeviceFromOrder, deleteOrder, getUserOrders, clearDraft } from "../slice/draftSlice";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { toast } from 'react-toastify'

export const DraftOrderPage: React.FC = () => {
  const { id: urlOrderId } = useParams<{ id: string }>(); // ⬅️ переименовали
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { 
    order_id, // ⬅️ из Redux store (c нижним подчеркиванием)
    devices, 
    orderData, 
    count, 
    loading, 
    error
  } = useSelector((state: RootState) => state.draft);

  const isDraft = orderData.status === 'черновик';

  useEffect(() => {
  dispatch(getUserOrders());
}, [dispatch]);
  

useEffect(() => {
  
  if (urlOrderId) {
    // Если есть ID в URL
    if (urlOrderId === order_id?.toString()) {
      // Если открываем черновик
      dispatch(getDraftOrderDetails(urlOrderId));
    } else {
      // Если открываем другую заявку
      dispatch(getDraftOrderDetails(urlOrderId));
    }
  } else if (order_id) {
    // Если нет URL ID, но есть черновик - открываем черновик
    navigate(`/emission_calculations/${order_id}`);
  } else {
    // Если нет ничего - ищем черновик
    dispatch(getDraftCart());
  }
}, [dispatch, urlOrderId, order_id, navigate]);

  const handleOrderDataChange = (field: string, value: string) => {
    dispatch(updateOrderData({ [field]: value }));
  };

  const handleDistanceChange = (value: string) => {
    const distanceValue = parseFloat(value) || 0;
    dispatch(updateOrderData({ distance: distanceValue }));
  };

const handleDevicePowerChange = (index: number, value: string) => {
  const powerValue = parseFloat(value) || 0;
  dispatch(updateDevicePower({ index, custom_power: powerValue }));
};

const handleRemoveDevice = async (index: number, materialId: number) => {
  if (!order_id) return;
  
  try {
    await dispatch(removeDeviceFromOrder({
      orderId: order_id,
      materialId: materialId,
      index: index
    })).unwrap();
    
    toast.success('Устройство успешно удалено');
  } catch (error) {
    toast.error('Ошибка удаления устройства:');
  }
};

const handleSaveDraft = async () => {
  if (!order_id) return;
  
  try {
    await dispatch(saveDraftOrder({
      orderId: order_id,
      distance: orderData.distance || 0,
      devices: devices
    })).unwrap();
    
    toast.success('Заявка успешно сохранена!');
    dispatch(clearDraft()); // 1. Сбрасываем ID черновика
    navigate('/catalog');   // 2. Редирект на каталог
  } catch (error) {
    toast.error('Ошибка сохранения заявки');
  }
};

const handleDeleteOrder = async () => {
  if (!order_id) return;
  
  try {
    await dispatch(deleteOrder(order_id)).unwrap();
    navigate('/');
  } catch (error) {
    console.error('❌ Ошибка удаления заявки:', error);
  }
};

  if (loading) {
    return <div className="text-center mt-5">Загрузка заявки...</div>;
  }

  console.log('🎯 RENDER - current order data:', orderData);
console.log('🎯 RENDER - current devices:', devices);

    return (
      <div className="draft-order-page">
        <Container className="py-4">
          <div className="mb-3">
            <Breadcrumbs
              items={[
                { name: "Главная", path: "/" },
                { name: "Черновая заявка", path: `/emission_calculations/${order_id}` },
              ]}
            />
          </div>

          {error && <Alert variant="danger">{error}</Alert>}

          <Row>
            {/* Основной контент */}
            <Col md={8}>
              {/* Поле для ввода расстояния */}
              <Card className="mb-4">
                <Card.Header>
                  <h4>Параметры расчета</h4>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Расстояние для расчета (метры)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      min="0"
                      defaultValue={orderData.distance || 0}
                      onChange={(e) => handleDistanceChange(e.target.value)}
                      placeholder="Введите расстояние в метрах"
                      readOnly={!isDraft}
                    />
                    <Form.Text className="text-muted">
                      Расстояние от источника излучения до точки расчета
                    </Form.Text>
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Список устройств с полями для мощности */}
              <Card>
                <Card.Header>
                  <h4>Устройства в заявке ({count})</h4>
                </Card.Header>
                <Card.Body>
                  {devices.length === 0 ? (
                    <p className="text-muted">Устройства не добавлены</p>
                  ) : (
                    devices.map((deviceItem, index) => (
                      <div key={index} className="device-calculation-item mb-4 p-3 border rounded">
                        <Row className="align-items-center">
                          {/* Информация об устройстве */}
                          <Col md={6}>
                          {deviceItem.image && (
                            <img 
                              src={deviceItem.image} 
                              alt={deviceItem.title}
                              className="device-image-small mb-2"
                              style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                            />
                          )}
                            <div className="fw-bold mb-2">{deviceItem.title}</div>
                            <div className="device-specs">
                              <small className="d-block">
                                Типовая мощность: {deviceItem.avg_min_power || 0} - {deviceItem.avg_max_power || 0} Вт
                              </small>
                            </div>
                          </Col>
                          
                          {/* Поле для ввода мощности */}
                          <Col md={4}>
                            <Form.Group>
                              <Form.Label className="small">Мощность (Вт)</Form.Label>
                              <Form.Control
                                type="number"
                                step="0.1"
                                min="0"
                                defaultValue={deviceItem.custom_power || ''}
                                onChange={(e) => handleDevicePowerChange(index, e.target.value)}
                                placeholder="Введите мощность"
                                readOnly={!isDraft}
                              />
                            </Form.Group>
                          </Col>
                          <Col md={2}>
                          {isDraft &&(
                            <Button 
                                variant="outline-danger" 
                                size="sm"
                                onClick={() => handleRemoveDevice(index, deviceItem.id!)}
                                title="Удалить устройство"
                            >
                                ×
                            </Button>
                          )}
                        </Col>
                        </Row>
                      </div>
                    ))
                  )}
                </Card.Body>
              </Card>
            </Col>

            {/* Боковая панель с информацией о заявке */}
            <Col md={4}>
              <Card className="mb-4">
                <Card.Header>
                  <h5>Информация о заявке</h5>
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Label>Название заявки</Form.Label>
                    <Form.Control
                      type="text"
                      value={orderData.order_name || ''}
                      onChange={(e) => handleOrderDataChange('order_name', e.target.value)}
                      placeholder="Введите название заявки"
                      readOnly={!isDraft}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Описание</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={orderData.description || ''}
                      onChange={(e) => handleOrderDataChange('description', e.target.value)}
                      placeholder="Опишите цель расчета"
                      readOnly={!isDraft}
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Требования заказчика</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={orderData.customer_requirements || ''}
                      onChange={(e) => handleOrderDataChange('customer_requirements', e.target.value)}
                      placeholder="Укажите особые требования"
                      readOnly={!isDraft}
                    />
                  </Form.Group>
                </Card.Body>
              </Card>

              {/* Кнопки действий */}
              <Card>
                <Card.Body>
                  {isDraft &&(
                  <>
                  <Button variant="outline-success" className="w-100 mb-2" onClick={handleSaveDraft}>
                    Сформировать заявку
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    className="w-100"
                    onClick={handleDeleteOrder}
                  >
                    Удалить заявку
                  </Button>
                  </>
                  )}
                </Card.Body>
              </Card>
              <Card className="mt-4">
              </Card>

            </Col>
          </Row>
        </Container>
      </div>
    );
  };