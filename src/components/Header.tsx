import React from "react";
import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from '../store';
import { logoutUserAsync } from '../slice/userSlice'; 
import  { setQuery,  getFilteredData } from '../slice/filterSlice'; 
import { ROUTES } from '../Routes';
import logo from "../assets/home-icon.png";
import "./Header.css";
import { useEffect } from "react";
import { getDraftCart } from "../slice/draftSlice";

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const isAuthenticated = useSelector((state: RootState) => state.user.isAuthenticated);
  const username = useSelector((state: RootState) => state.user.username);
  const { order_id } = useSelector((state: RootState) => state.draft);

  // Обработчик события нажатия на кнопку "Выйти"
  const handleExit = async ()  => {
    console.log('Logout button clicked');
    
    try {
      console.log('Dispatching logoutUserAsync...');
      const result = await dispatch(logoutUserAsync());
      
      if (logoutUserAsync.fulfilled.match(result)) {
        console.log('Logout successful, clearing search and navigating...');
        dispatch(setQuery(''));
        navigate(ROUTES.CATALOG);
        dispatch(getFilteredData());
      } else {
        console.log('Logout failed:', result.payload);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  useEffect(() => {
  if (isAuthenticated) {
    dispatch(getDraftCart());
  }
}, [isAuthenticated, dispatch]);

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
              
              {isAuthenticated && (
                <Nav.Link as={Link} to="/my-orders">Мои заявки</Nav.Link>
              )}
              

              {/* Приветствие и кнопки входа/выхода */}
              {isAuthenticated && username && (
              <>
                <div className="user-greeting">
                  Добро пожаловать, {username}!
                </div>
                <Nav.Link as={Link} to="/profile">Личный кабинет</Nav.Link>
              </>
              )}

              {(isAuthenticated == false) && (
                <Link to={ROUTES.LOGIN} className="login-link">
                  <Button className="login-btn">Войти</Button>
                </Link>
              )}

              {(isAuthenticated == true) && (
                <Button 
                  variant="primary" 
                  className="login-btn" 
                  onClick={handleExit}
                >
                  Выйти
                </Button>
              )}
            </Nav>
          </Navbar.Collapse>
        </div>
      </Container>
    </Navbar>
  );
};