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
import { NavLink } from "react-router-dom";

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
  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
    const draftCount = useSelector((state: RootState) => state.draft.count); // ← получаем количество устройств в корзине
    const currentOrder = useSelector((state: RootState) => state.draft.order_id)
    const { order_id } = useSelector((state: RootState) => state.draft);
    const hasDraft = !!order_id; 

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

{isAuthenticated && hasDraft && (
  <NavLink
    to={`/emission_calculations/${currentOrder}`}
    className={({ isActive }: { isActive: boolean }) =>
      isActive ? "calc-icon active" : "calc-icon"
    }
    style={{ display: "inline-flex", alignItems: "center", position: "absolute", top: "120px", right: "400px", textDecoration: "none" }}
  >
    {/* SVG иконка калькулятора */}
    <svg 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
    >
      <path d="M7 2H17C18.1 2 19 2.9 19 4V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2ZM7 4V20H17V4H7ZM9 6H15V8H9V6ZM9 10H11V12H9V10ZM9 14H11V16H9V14ZM13 14H15V16H13V14ZM13 10H15V12H13V10ZM9 18H15V20H9V18Z" />
    </svg>
    
    {/* Бейдж с количеством расчётов */}
    {draftCount > 0 && (
      <span 
        style={{
          position: "absolute",
          top: "-8px",
          right: "-8px",
          background: "#dc3545",
          color: "white",
          borderRadius: "50%",
          width: "20px",
          height: "20px",
          fontSize: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {draftCount > 9 ? '9+' : draftCount}
      </span>
    )}
  </NavLink>
)}

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