import React from 'react';
import { Icon } from '@iconify/react';
import './schedule.css';

const categories = [
  {},
  {},
  {},
  {},
];

const ScheduleCategoryList: React.FC = () => {
  return (
    <div className="schedule-category-list">
      <div className="schedule-category-header">
        <h3 className="schedule-category-title">Список категорий</h3>
        <button className="schedule-category-add-btn"><Icon icon="mdi:plus" /></button>
      </div>
      <div className="schedule-category-items">
        
      </div>
    </div>
  );
};

export default ScheduleCategoryList;
