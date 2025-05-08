import React from 'react';

const CategoryFilter = ({ categories, selectedCategory, onCategorySelect }) => {
  return (
    <div className="category-filter">
      <div className="category-buttons">
        <button 
          className={`category-button ${selectedCategory === null ? 'active' : ''}`}
          onClick={() => onCategorySelect(null)}
        >
          All Categories
        </button>
        {categories.map((category) => (
          <button
            key={category}
            className={`category-button ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => onCategorySelect(category)}
          >
            {category.length > 24 ? category.substring(0, 22) + '...' : category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
