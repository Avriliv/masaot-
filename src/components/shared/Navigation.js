// src/components/shared/Navigation.js
import React from 'react';

function Navigation({ selectedMenu, onMenuSelect }) {
  const menuItems = [
    { id: 'dashboard', label: 'דף הבית' },
    { id: 'newTrip', label: 'טיול חדש' },
    { id: 'routes', label: 'מפת מסלולים' },
    { id: 'trips', label: 'הטיולים שלי' },
    { id: 'forms', label: 'טפסים ואישורים' }
  ];

  const menuItemStyle = {
    padding: '12px 15px',
    marginBottom: '8px',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s ease'
  };

  const menuItemActiveStyle = {
    ...menuItemStyle,
    backgroundColor: '#1e90ff',
    color: 'white'
  };

  return (
    <nav>
      {menuItems.map(item => (
        <div
          key={item.id}
          style={selectedMenu === item.id ? menuItemActiveStyle : menuItemStyle}
          onClick={() => onMenuSelect(item.id)}
        >
          {item.label}
        </div>
      ))}
    </nav>
  );
}

export default Navigation;