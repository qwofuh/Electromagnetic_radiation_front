import React, { useEffect } from "react";
import { Container, Row, Col, Card, Button, Form, Alert } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type{ AppDispatch, RootState } from "../store";
import { getDraftCart, updateOrderData, getDraftOrderDetails, saveDevicePowers, saveDistanceOnly,finalizeOrder, updateDevicePower, removeDeviceFromOrder, deleteOrder, getUserOrders, clearDraft } from "../slice/draftSlice";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { toast } from 'react-toastify'

export const DraftOrderPage: React.FC = () => {
  const { id: urlOrderId } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { 
    order_id,
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
      if (urlOrderId === order_id?.toString()) {
        console.log('📦 Opening DRAFT order:', urlOrderId);
        dispatch(getDraftOrderDetails(urlOrderId));
      } else {
        console.log('📦 Opening SPECIFIC order:', urlOrderId);
        dispatch(getDraftOrderDetails(urlOrderId));
      }
    } else if (order_id) {
      console.log('📦 Redirecting to DRAFT:', order_id);
      navigate(`/emission_calculations/${order_id}`);
    } else {
      console.log('📦 Looking for DRAFT order');
      dispatch(getDraftCart());
    }
  }, [dispatch, urlOrderId, order_id, navigate]);

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

  const handleSaveDistance = async () => {
    if (!order_id) return;
    
    try {
      await dispatch(saveDistanceOnly({
        orderId: order_id,
        distance: orderData.distance || 0
      })).unwrap();
      
      toast.success('Расстояние успешно сохранено!');
    } catch (error) {
      toast.error('Ошибка сохранения расстояния');
    }
  };

  const handleSaveDevicePowers = async () => {
    if (!order_id) return;
    
    try {
      await dispatch(saveDevicePowers({
        orderId: order_id,
        devices: devices
      })).unwrap();
      
      toast.success('Мощности устройств успешно сохранены!');
    } catch (error) {
      toast.error('Ошибка сохранения мощностей устройств');
    }
  };

  const handleFinalizeOrder = async () => {
    if (!order_id) return;
    
    try {
      await dispatch(finalizeOrder(order_id)).unwrap();
      toast.success('Заявка успешно сформирована!');
      dispatch(clearDraft());
      navigate('/catalog');
    } catch (error) {
      toast.error('Ошибка формирования заявки');
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
                <h4>Устройства ({count})</h4>
              </Card.Header>
              <Card.Body>
                {devices.length === 0 ? (
                  <p className="text-muted">Устройства не добавлены</p>
                ) : (
                  devices.map((deviceItem, index) => (
                    <div key={index} className="device-calculation-item mb-4 p-3 border rounded">
                      {/* Поле мощности СНАЧАЛА (наверху) */}
                      <div className="mb-3">
                        <Form.Group>
                          <Form.Label className="fw-bold">Мощность устройства (Вт)</Form.Label>
                          <Form.Control
                            type="number"
                            step="0.1"
                            min="0"
                            defaultValue={deviceItem.custom_power || ''}
                            onChange={(e) => handleDevicePowerChange(index, e.target.value)}
                            placeholder="Введите мощность в ваттах"
                            readOnly={!isDraft}
                            className="device-power-input"
                          />
                          <Form.Text className="text-muted">
                            Введите фактическую мощность устройства
                          </Form.Text>
                        </Form.Group>
                      </div>
                      
                      {/* Информация об устройстве */}
                      <Row className="align-items-center">
                        {deviceItem.image && (
                          <Col md={2}>
                            <img 
                              src={deviceItem.image} 
                              alt={deviceItem.title}
                              className="device-image-small mb-2 w-100"
                              style={{ height: '80px', objectFit: 'cover' }}
                            />
                          </Col>
                        )}
                        <Col md={deviceItem.image ? 8 : 10}>
                          <div className="fw-bold mb-1">{deviceItem.title}</div>
                          <div className="device-specs">
                            <small className="d-block text-muted">
                              Типовая мощность: {deviceItem.avg_min_power || 0} - {deviceItem.avg_max_power || 0} Вт
                            </small>
                            {deviceItem.description && (
                              <small className="d-block text-muted mt-1">
                                {deviceItem.description}
                              </small>
                            )}
                          </div>
                        </Col>
                        <Col md={2} className="text-end">
                          {isDraft && (
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
            <Card>
              <Card.Body>
                {isDraft && (
                  <>
                    <Button 
                      variant="outline-primary" 
                      className="w-100 mb-2" 
                      onClick={handleSaveDistance}
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить расстояние'}
                    </Button>
                    
                    <Button 
                      variant="outline-primary" 
                      className="w-100 mb-2" 
                      onClick={handleSaveDevicePowers}
                      disabled={loading}
                    >
                      {loading ? 'Сохранение...' : 'Сохранить устройства'}
                    </Button>
                    
                    <Button 
                      variant="outline-success" 
                      className="w-100 mb-2" 
                      onClick={handleFinalizeOrder}
                      disabled={loading}
                    >
                      {loading ? 'Формирование...' : 'Сформировать заявку'}
                    </Button>
                    
                    <Button 
                      variant="outline-danger" 
                      className="w-100"
                      onClick={handleDeleteOrder}
                      disabled={loading}
                    >
                      Удалить заявку
                    </Button>
                  </>
                )}
                {!isDraft && (
                  <div className="text-center">
                    <p className="text-success fw-bold mb-1">
                      Результат - {orderData.total_emission} мЗв
                    </p>
                    <small className="text-muted">Заявка успешно сформирована</small>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};