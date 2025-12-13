import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { getDeviceById, type Device } from "../modules/deviceApi";
import defaultImage from "../assets/DefaultImage.png";
import "./DeviceDetailPage.css";
import { dest_img } from "../target_config"

export const DeviceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [device, setDevice] = useState<Device | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    getDeviceById(Number(id))
      .then((data) => {
        setDevice(data)
      })
      .catch((error) =>
        console.error("Ошибка при загрузке устройства:", error)
      )
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="text-center mt-5">Загрузка...</div>;
  }

  if (!device) {
    return <div>Устройство не найдено</div>;
  }

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
            <img src={(dest_img + device.image) || defaultImage} alt={device.title} />
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