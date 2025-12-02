import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Breadcrumbs } from "../components/Breadcrumbs";
import defaultImage from "../assets/DefaultImage.png";
import "./DeviceDetailPage.css";
import { dest_img } from "../../target_config"
import { getDeviceDetail, clearDevice } from "../slice/deviceDetailSlice";
import type { AppDispatch, RootState } from "../store";
import type{ DsDevice } from "../api/Api";

// Функция преобразования DsDevice в Device (аналогично DevicesPage)
const mapDsDeviceToDevice = (dsDevice: DsDevice) => ({
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
});

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const { device: dsDevice, loading, error } = useSelector((state: RootState) => state.deviceDetail);

  useEffect(() => {
    if (!id) return;

    dispatch(getDeviceDetail(Number(id)));

    // Очищаем устройство при размонтировании
    return () => {
      dispatch(clearDevice());
    };
  }, [id, dispatch]);

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  if (error || !dsDevice) {
    return <div>{error || "Устройство не найдено"}</div>;
  }

  // Преобразуем DsDevice в Device
  const device = mapDsDeviceToDevice(dsDevice);

  // Функция для формирования URL изображения
  const getImageSrc = () => {
    if (!device.image) return defaultImage;
    if (device.image.startsWith('http')) return device.image;
    return device.image.startsWith('/') ? `${dest_img}${device.image}` : `${dest_img}/${device.image}`;
  };

  const imageSrc = getImageSrc();

  return (
    <div className="device-detail-page">
      <div className="container">
        {/* Хлебные крошки */}
        <div className="d-flex justify-content-between align-items-center mb-3 breadcrumbs-wrapper">
          <Breadcrumbs
            items={[
              { name: "Каталог", path: "/catalog" },
              { name: device.title, path: `/detailed_device/${device.id}` },
            ]}
          />
        </div>

        {/* Контейнер устройства */}
        <div className="device-container">
          {/* Изображение */}
          <div className="device-image">
            <img src={imageSrc} alt={device.title} />
          </div>

          {/* Информация в рамке */}
          <div className="device-info-wrapper">
            {/* Заголовок */}
            <div className="device-title">
              {device.title}
            </div>

            {/* Характеристики */}
            <div className="device-details">
              <div>
                <span className="name">Минимальная средняя мощность</span>
                <span className="value">{device.minavgpower} Вт</span>
              </div>
              <div>
                <span className="name">Максимальная средняя мощность</span>
                <span className="value">{device.maxavgpower} Вт</span>
              </div>
              <div>
                <span className="name">Минимальное безопасное расстояние</span>
                <span className="value">{device.minsaferange} м</span>
              </div>
              <div>
                <span className="name">Максимальное безопасное расстояние</span>
                <span className="value">{device.maxsaferange} м</span>
              </div>
              <div>
                <span className="name">Тип излучения</span>
                <span className="value">{device.radiationtype}</span>
              </div>
              <div>
                <span className="name">Источник излучения</span>
                <span className="value">{device.radiationsource}</span>
              </div>
              <div>
                <span className="name">Зона максимального излучения</span>
                <span className="value">{device.maxradiationzone}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};