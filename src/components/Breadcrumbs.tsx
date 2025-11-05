import React from "react";
import { Breadcrumb } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import "./Breadcrumbs.css";

interface BreadcrumbsProps {
  items?: { name: string; path: string }[];
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  const location = useLocation();

  // Формируем массив крошек либо из props, либо из текущего пути
  const pathnames = location.pathname.split("/").filter((x) => x);
  const crumbs = items || pathnames.map((name, index) => ({
    name,
    path: "/" + pathnames.slice(0, index + 1).join("/"),
  }));

  // Маппинг URL → читаемое название
  const labelMap: Record<string, string> = {
    catalog: "Каталог",
    detailed_material: "Детали материала",
    // добавляй другие пути по необходимости
  };

  return (
    <Breadcrumb className="breadcrumbs mt-3 mb-4">
      {/* Всегда первая крошка — Главная */}
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }} key="home">
        Главная
      </Breadcrumb.Item>

      {crumbs.map((crumb, index) => {
        const isLast = index === crumbs.length - 1;
        const label = labelMap[crumb.name] || crumb.name;

        return isLast ? (
          <Breadcrumb.Item active key={crumb.name}>
            {label}
          </Breadcrumb.Item>
        ) : (
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: crumb.path }} key={crumb.name}>
            {label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};
