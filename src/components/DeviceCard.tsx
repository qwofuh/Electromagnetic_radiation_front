import React from "react";
import { Card } from "react-bootstrap";
import { Link } from "react-router-dom";
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
          <Card.Img variant="top" src={(dest_img + image) || defaultImage} alt={title} onError={() => console.log('Image load error for:', dest_img+image)}/>
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
