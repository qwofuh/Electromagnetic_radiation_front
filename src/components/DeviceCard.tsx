import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./DeviceCard.css";

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
}

export const DeviceCard: React.FC<DeviceCardProps> = ({
  id,
  title,
  image,
  minavgpower,
  maxavgpower,
  minsaferange,
  maxsaferange,
}) => {
  return (
    <Link to={`/detailed_device/${id}`} className="card-link">
      <Card className="device-card">
        <div className="card-image">
          <Card.Img variant="top" src={image} alt={title} />
        </div>
        <Card.Body className="card-info">
          <div className="card-title">
            {title}
          </div>
          <div className="card-bottom">
            <div className="card-volume">Типовая мощность: {minavgpower} - {maxavgpower} Вт</div>
            <div className="card-count">Безопасное расстояние: {minsaferange} - {maxsaferange} м</div>
          </div>
        </Card.Body>
      </Card>
    </Link>
  );
};
