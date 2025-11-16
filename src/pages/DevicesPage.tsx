import React, { useEffect, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector} from "react-redux";
import type { RootState } from "../store";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DeviceSearch } from "../components/DeviceSearch";
import { DeviceCard } from "../components/DeviceCard";
import { getDevices, mapServerToDevice } from "../modules/deviceApi";
import "./DevicesPage.css";
import type { Device } from "../modules/deviceApi";

export const DevicesPage: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]); 
  const [loading, setLoading] = useState(true);
  const query = useSelector((state: RootState) => state.filter.query); // Берем из Redux

  // Загрузка устройств при монтировании и при изменении query
  useEffect(() => {
    const loadDevices = async () => {
      setLoading(true);
      try {
        const response = await getDevices(query);
        const mappedDevices = response.devices.map(mapServerToDevice);
        setDevices(mappedDevices);
      } catch (error) {
        console.error("Ошибка загрузки устройств:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDevices();
  }, []);

  const handleSearch = (searchQuery: string) => {
  const loadSearchedDevices = async () => {
    setLoading(true);
    try {
      const response = await getDevices(searchQuery); // Поиск только здесь
      const mappedDevices = response.devices.map(mapServerToDevice);
      setDevices(mappedDevices);
    } catch (error) {
      console.error("Ошибка поиска устройств:", error);
    } finally {
      setLoading(false);
    }
  };

  loadSearchedDevices();
};

  return (
    <div className="devices-page">
      <Container className="py-4">
        <div className="mb-3">
          <Breadcrumbs items={[{ name: "Каталог", path: "/catalog" }]} />
        </div>

        <div className="mb-4">
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