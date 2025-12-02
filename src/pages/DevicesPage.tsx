import React, { useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import type { RootState } from "../store";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { DeviceSearch } from "../components/DeviceSearch";
import { DeviceCard } from "../components/DeviceCard";
import "./DevicesPage.css";
import type { Device } from "../modules/deviceApi";
import { getFilteredData, setQuery } from "../slice/filterSlice";
import type { AppDispatch } from "../store";
import type{ DsDevice } from "../api/Api";

const mapDsDeviceToDevice = (dsDevice: DsDevice): Device => ({
  id: dsDevice.id || 0,
  title: dsDevice.title || '',
  image: dsDevice.image || '',
  minavgpower: dsDevice.avgMinPower || 0,
  maxavgpower: dsDevice.avgMaxPower || 0,
  minsaferange: dsDevice.minSafeRange || 0,
  maxsaferange: dsDevice.maxSafeRange || 0,
  radiationtype: dsDevice.radiationType || '',
  radiationsource: dsDevice.radiationSource || '',
  maxradiationzone: dsDevice.maxRadiationZone || '',
  visability: dsDevice.visability,
});

export const DevicesPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { query, data, loading } = useSelector((state: RootState) => state.filter);

  useEffect(() => {
    dispatch(getFilteredData());
  }, [dispatch]);

  const handleSearch = (searchQuery: string) => {
    dispatch(setQuery(searchQuery));
    dispatch(getFilteredData());
  };

  const devices = data.map(mapDsDeviceToDevice);

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
            {devices.map((device, index) => (
              <Col key={device.id || `device-${index}`} xs={12} sm={6} md={4} lg={3}>
                <DeviceCard {...device} />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </div>
  );
};