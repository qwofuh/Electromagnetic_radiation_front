import React from "react";
import { Container, Card, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./HomePage.css";

export const HomePage: React.FC = () => {
  return (
    <div className="homepage">
      <Container className="d-flex justify-content-center align-items-center py-5">
        <Card className="p-4 shadow-sm text-center homepage-card">
          <Card.Title as="h1" className="mb-3">
            Расчёт излучения от бытовых приборов
          </Card.Title>
          <Card.Text className="mb-4">
            Удобный инструмент для выбора устройств и расчёта излучения от них в бытовых условиях.
          </Card.Text>
          
          <Carousel indicators interval={5000} pause="hover" className="mb-4">
            {/* Слайд 1: Основной призыв к действию */}
            <Carousel.Item>
              <Link to="/catalog" className="carousel-link">
                <div className="carousel-card">
                  <h3>Начать расчёт</h3>
                  <p>Получите точную оценку уровня излучения от ваших бытовых приборов</p>
                </div>
              </Link>
            </Carousel.Item>

            {/* Слайд 2: Популярные категории */}
            <Carousel.Item>
              <Link to="/catalog" className="carousel-link">
                <div className="carousel-card">
                  <h3>Популярные устройства</h3>
                  <p>Изучите самые распространённые бытовые приборы и их характеристики</p>
                </div>
              </Link>
            </Carousel.Item>

            {/* Слайд 3: Преимущества */}
            <Carousel.Item>
              <Link to="/catalog" className="carousel-link">
                <div className="carousel-card">
                  <h3>Почему это важно?</h3>
                  <p>Контроль электромагнитного излучения помогает сохранить здоровье вашей семьи</p>
                </div>
              </Link>
            </Carousel.Item>

            {/* Слайд 4: Быстрый доступ */}
            <Carousel.Item>
              <Link to="/catalog" className="carousel-link">
                <div className="carousel-card">
                  <h3>Все устройства</h3>
                  <p>Полный каталог всех доступных для расчёта бытовых приборов</p>
                </div>
              </Link>
            </Carousel.Item>
          </Carousel>
        </Card>
      </Container>
    </div>
  );
};