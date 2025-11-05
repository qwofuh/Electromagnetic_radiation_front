import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DeviceCard } from "../components/DeviceCard";
import { DeviceSearch } from "../components/DeviceSearch";
import { getDevices, type Device } from "../modules/deviceApi";
import "../components/DeviceSearch.css";
import "./DevicesPage.css";
import DefaultImage from "../assets/DefaultImage.png"

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);

  const handleSearch = (query: string) => {
    setLoading(true);
    getDevices(query)
      .then((response) => {

        // Правильный маппинг полей вручную
        const devicesData = response.devices.map(device => ({
          id: device.ID,
          title: device.Title,
          image: device.Image || DefaultImage,
          minavgpower: device.AvgMinPower,
          maxavgpower: device.AvgMaxPower,
          minsaferange: device.MinSafeRange,
          maxsaferange: device.MaxSafeRange,
          radiationtype: device.RadiationType,
          radiationsource: device.RadiationSource,
          maxradiationzone: device.MaxRadiationZone,
          visability: device.Visability ?? true
        }));
        setDevices(devicesData);
      })
      .catch((error) => {
        console.error("Ошибка при загрузке устройств:", error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    handleSearch("");
  }, []);

  return (
    <div className="devices-page">
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-3 breadcrumbs-wrapper">
          <Breadcrumbs items={[{ name: "Каталог", path: "/catalog" }]} />
          <DeviceSearch onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="text-center mt-5">Загрузка...</div>
        ) : (
          <Row className="g-4">
            {devices.map((device) => (
              <Col key={device.id} xs={12} sm={6} md={4} lg={3}>
                <DeviceCard {...device} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};