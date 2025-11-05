import { type Device } from "./deviceApi";

export const DEVICES_MOCK: { devices: Device[] } = {
  devices: [
    {
      id: 1,
      title: "Стиральная машина",
      image: "",
      minavgpower: 200,
      maxavgpower: 800,
      minsaferange: 0.5,
      maxsaferange: 1.5,
      radiationtype: "Электромагнитное",
      radiationsource: "Двигатель, электронные компоненты",
      maxradiationzone: "Задняя панель",
      visability: true
    },
    {
      id: 2,
      title: "Холодильник",
      image: "",
      minavgpower: 100,
      maxavgpower: 400,
      minsaferange: 0.3,
      maxsaferange: 1.0,
      radiationtype: "Электромагнитное",
      radiationsource: "Компрессор, электронные компоненты",
      maxradiationzone: "Задняя часть",
      visability: true
    },
    {
      id: 3,
      title: "Индукционная плита",
      image: "",
      minavgpower: 1500,
      maxavgpower: 3500,
      minsaferange: 0.5,
      maxsaferange: 2.0,
      radiationtype: "Электромагнитное",
      radiationsource: "Индукционная катушка",
      maxradiationzone: "Варочная поверхность",
      visability: true
    },
    {
      id: 4,
      title: "Персональный компьютер",
      image: "",
      minavgpower: 300,
      maxavgpower: 800,
      minsaferange: 0.5,
      maxsaferange: 1.5,
      radiationtype: "Электромагнитное",
      radiationsource: "Блок питания, монитор",
      maxradiationzone: "Задняя часть системного блока",
      visability: true
    },
    {
      id: 5,
      title: "Посудомоечная машина",
      image: "",
      minavgpower: 1500,
      maxavgpower: 2400,
      minsaferange: 0.5,
      maxsaferange: 1.5,
      radiationtype: "Электромагнитное",
      radiationsource: "Нагревательный элемент, двигатель",
      maxradiationzone: "Задняя панель",
      visability: true
    },
    {
      id: 6,
      title: "СВЧ печь",
      image: "",
      minavgpower: 800,
      maxavgpower: 1500,
      minsaferange: 1.0,
      maxsaferange: 3.0,
      radiationtype: "Микроволновое",
      radiationsource: "Магнетрон",
      maxradiationzone: "Дверца, вентиляционные отверстия",
      visability: true
    },
    {
      id: 7,
      title: "Телевизор",
      image: "",
      minavgpower: 50,
      maxavgpower: 200,
      minsaferange: 0.5,
      maxsaferange: 2.0,
      radiationtype: "Электромагнитное",
      radiationsource: "Электронные компоненты, блок питания",
      maxradiationzone: "Задняя панель",
      visability: true
    },
    {
      id: 8,
      title: "Wi-Fi роутер",
      image: "",
      minavgpower: 2,
      maxavgpower: 10,
      minsaferange: 0.1,
      maxsaferange: 5.0,
      radiationtype: "Радиочастотное",
      radiationsource: "Антенны, передатчик",
      maxradiationzone: "Область вокруг антенн",
      visability: true
    }
  ],
};