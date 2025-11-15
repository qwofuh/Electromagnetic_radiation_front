import React from "react";
import { Navbar, Container, Nav } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import logo from "../assets/home-icon.png";
import "./Header.css";

export const Header: React.FC = () => {
  const calculationsCount = 0;

  return (
    <Navbar bg="light" expand="lg" className="shadow-sm">
      <Container>
        <div className="navbar-container">
          {/* Логотип */}
          <NavLink to="/" className="navbar-logo-link">
            <img src={logo} className="navbar-logo" alt="Логотип" />
          </NavLink>

          {/* Навигация */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
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
              
              {/* Иконка калькулятора */}
              <NavLink
                to="/calculator"
                className={({ isActive }) =>
                  isActive ? "calc-icon active" : "calc-icon"
                }
              >
                {/* SVG иконка калькулятора */}
                <svg 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M7 2H17C18.1 2 19 2.9 19 4V20C19 21.1 18.1 22 17 22H7C5.9 22 5 21.1 5 20V4C5 2.9 5.9 2 7 2ZM7 4V20H17V4H7ZM9 6H15V8H9V6ZM9 10H11V12H9V10ZM9 14H11V16H9V14ZM13 14H15V16H13V14ZM13 10H15V12H13V10ZM9 18H15V20H9V18Z" />
                </svg>
                
                {/* Бейдж с количеством расчётов (показывается только если count > 0) */}
                {calculationsCount > 0 && (
                  <span className="calc-badge">
                    {calculationsCount > 9 ? '9+' : calculationsCount}
                  </span>
                )}
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </div>
      </Container>
    </Navbar>
  );
};