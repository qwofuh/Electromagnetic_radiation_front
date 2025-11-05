import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import logo from "../assets/home-icon.png";
import "./Header.css";

export const Header: React.FC = () => {
  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container className="d-flex justify-content-between align-items-center">
        {/* Логотип */}
        <NavLink to="/" className="navbar-logo-link">
          <img src={logo} className="navbar-logo" />
        </NavLink>

        {/* Навигация */}
        <Nav className="navbar-links">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Главная
          </NavLink>
          <NavLink
            to="/catalog"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Устройства
          </NavLink>
        </Nav>
      </Container>
    </Navbar>
  );
};
