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
  const draftCount = useSelector((state: RootState) => state.draft.count); // ← получаем количество устройств в корзине
  const currentOrder = useSelector((state: RootState) => state.draft.order_id)
  const { order_id } = useSelector((state: RootState) => state.draft);
  const hasDraft = !!order_id; 

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

  console.log('Header render - isAuthenticated:', isAuthenticated, 'username:', username);

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
            {isAuthenticated && (
              <>
              {hasDraft && (
              <>
                <NavLink
                to={`/emission_calculations/${currentOrder}`}
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
                {draftCount > 0 && (
                  <span className="calc-badge">
                    {draftCount > 9 ? '9+' : draftCount}
                  </span>
                )}
              </NavLink>
              </>
              )}
              <Nav.Link as={Link} to="/my-orders">Мои заявки</Nav.Link>
              </>
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