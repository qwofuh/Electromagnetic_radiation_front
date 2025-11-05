import React from "react";
import { Container, Button, Card } from "react-bootstrap";
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
          <Link to="/catalog">
            <Button variant="warning">Посмотреть список устройств</Button>
          </Link>
        </Card>
      </Container>
    </div>
  );
};
