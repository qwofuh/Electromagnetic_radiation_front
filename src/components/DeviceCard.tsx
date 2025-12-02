import React from "react";
import { Card, Button, Row, Col, Form } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type{ AppDispatch, RootState } from "../store";
import { addDeviceToDraftOrder } from "../slice/draftSlice";
import { getFilteredData } from "../slice/filterSlice";
import "./DeviceCard.css";
import { dest_img } from "../../target_config"
import defaultImage from "../assets/DefaultImage.png"

export interface DeviceCardProps {
  id: number;
  title: string;
  image: string;
  minavgpower: number;
  maxavgpower: number;
  minsaferange: number;
  maxsaferange: number;
  radiationtype: string;
  radiationsource: string;
  maxradiationzone: string;
  count?: number; // количество в заявке (для страницы заявки)
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  id,
  title,
  image,
  minavgpower,
  maxavgpower,
  minsaferange,
  maxsaferange,
  count,
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.draft);
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const { pathname } = useLocation();

  // Правильное формирование URL изображения
  const getImageSrc = () => {
    if (!image) return defaultImage;
    if (image.startsWith('http')) return image;
    return image.startsWith('/') ? `${dest_img}${image}` : `${dest_img}/${image}`;
  };

  const imageSrc = getImageSrc();

  // Обработчик добавления в корзину
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      alert('Для добавления устройств в заявку необходимо авторизоваться');
      return;
    }

    console.log('Adding device to draft order:', id);
    await dispatch(addDeviceToDraftOrder(id));
    await dispatch(getFilteredData()); // Для обновления отображения состояния иконки "корзины"
  };

  // Обработчик добавления на странице заявки
  const handleAdd = async () => {
    if (!isAuthenticated) {
      alert('Для добавления устройств в заявку необходимо авторизоваться');
      return;
    }

    console.log('Adding device to draft order:', id);
    await dispatch(addDeviceToDraftOrder(id));
    await dispatch(getFilteredData()); // Для обновления отображения состояния иконки "корзины"
  };

  // Вариант отображения на странице заявки
  if (pathname.includes("/draft")) {
    return (
      <div className="draft-device-card">
        <Row className="align-items-center">
          <Col xs={2} sm={2} md={2}>
            <div className="d-flex justify-content-center">
              <img 
                src={imageSrc} 
                alt={title} 
                className="draft-device-image"
                onError={(e) => {
                  e.currentTarget.src = defaultImage;
                }}
              />
            </div>
          </Col>
          <Col xs={10} sm={10} md={10}>
            <div className="draft-device-body">
              <h5>{title}</h5>
              <div className="form-group">
                <Row className="align-items-center">
                  <Col xs={4} sm={4} md={3}>
                    <label className="form-label">Количество: </label>
                  </Col>
                  <Col xs={8} sm={8} md={9}>
                    <Form.Control
                      type="number"
                      className="device-count"
                      value={count || 1}
                      disabled
                    />
                  </Col>
                </Row>
              </div>
              <Row className="align-items-center">
                <Col md={3} xs={6}>
                  <Link to={`/detailed_device/${id}`} className="draft-btn-details">
                    Подробнее
                  </Link>
                </Col>
                <Col md={6} xs={6}>
                  <div className="device-specs">
                    <small>Мощность: {minavgpower}-{maxavgpower} Вт</small>
                    <small>Расстояние: {minsaferange}-{maxsaferange} м</small>
                  </div>
                </Col>
                <Col md={3} xs={12} className="text-end">
                  {/* Кнопка "Добавить" на странице заявки */}
                  {(isAuthenticated == true) && (
                    <Button 
                      className="add-btn" 
                      onClick={handleAdd}
                      disabled={loading}
                      size="sm"
                    >
                      {loading ? "Добавление..." : "Добавить"}
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </div>
    );
  }

  // Вариант отображения на странице каталога (стандартный)
  return (
    <Link to={`/detailed_device/${id}`} className="card-link">
      <Card className="device-card">
        <div className="card-image">
          <Card.Img 
            variant="top" 
            src={imageSrc} 
            alt={title} 
            onError={(e) => {
              console.log('Image load error for:', imageSrc);
              e.currentTarget.src = defaultImage;
            }}
          />
        </div>
        <Card.Body className="card-info">
          <div className="card-title">
            {title}
          </div>
          <div className="card-bottom">
            <div className="card-volume">Типовая мощность: {minavgpower} - {maxavgpower} Вт</div>
            <div className="card-count">Безопасное расстояние: {minsaferange} - {maxsaferange} м</div>
            
            {/* Кнопка "В корзину" на странице каталога */}
            {(isAuthenticated == true) && (
              <Button 
                variant="outline-success" 
                size="sm" 
                className="add-to-cart-btn w-100 mt-3"
                onClick={handleAddToCart}
                disabled={loading}
              >
                {loading ? "Добавление..." : "В корзину"}
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};