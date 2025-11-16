import React from "react";
import { Form, Button } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { setQuery } from "../slice/filterSlice";
import type { RootState } from "../store";
import searchIcon from "../assets/search-icon.png";
import "./DeviceSearch.css"

interface DeviceSearchProps {
  onSearch: (query: string) => void;
}

export const DeviceSearch: React.FC<DeviceSearchProps> = ({ onSearch }) => {
  const query = useSelector((state: RootState) => state.filter.query);
  const dispatch = useDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch(setQuery(e.target.value)); // Сохраняем в Redux при вводе
  };

  const handleSearch = () => {
    onSearch(query); // Поиск при кнопке
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSearch(query); // Поиск при Enter
    }
  };

  return (
    <div className="device-search-container">
      <div className="device-search" style={{ display: 'flex', alignItems: 'center' }}>
        <Form.Control
          type="text"
          placeholder="Поиск по устройствам"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyPress}
          className="search-input"
        />
        <Button 
          variant="success" 
          onClick={handleSearch} 
          className="search-btn"
          style={{ 
            width: '40px', 
            height: '36px', 
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginLeft: '8px'
          }}
        >
          <img src={searchIcon} alt="Поиск" className="search-icon" />
        </Button>
      </div>
    </div>
  );
};