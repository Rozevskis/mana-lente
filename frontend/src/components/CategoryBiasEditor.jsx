import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/CategoryBiasEditor.css";

const CategoryBiasEditor = ({ 
  initialBiases = {}, 
  onBiasesChange = () => {}, 
  editable = true,
  showSaveButton = true,
  className = "" 
}) => {
  const [biases, setBiases] = useState(initialBiases);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setBiases(initialBiases);
  }, [initialBiases]);

  const handleBiasChange = (category, value) => {
    const newBiases = {
      ...biases,
      [category]: Math.max(0.1, Math.min(0.9, parseFloat(value))),
    };
    
    setBiases(newBiases);
    onBiasesChange(newBiases); // Immediately notify parent of changes
  };

  const saveBiases = async () => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    try {
      setIsSaving(true);
      const response = await axios.post(
        `${API_URL}/users/preferences`,
        { categoryBiases: biases },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      
      // Update biases with those returned from the server
      const updatedBiases = response.data.categoryBiases;
      setBiases(updatedBiases);
      onBiasesChange(updatedBiases);
      return true;
    } catch (error) {
      console.error("Failed to save biases:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`category-bias-editor ${className}`}>
      <div className="biases-container">
        {Object.entries(biases).map(([category, value]) => (
          <div key={category} className="bias-item">
            <div className="bias-label">{category}</div>
            <div className="bias-control">
              {editable ? (
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={value}
                  onChange={(e) => handleBiasChange(category, e.target.value)}
                />
              ) : (
                <div className="bias-bar-container">
                  <div 
                    className="bias-bar" 
                    style={{ width: `${value * 100}%` }}
                  ></div>
                </div>
              )}
              <div className="bias-value">{value.toFixed(1)}</div>
            </div>
          </div>
        ))}
      </div>
      
      {showSaveButton && editable && (
        <div className="bias-actions">
          <button 
            onClick={saveBiases} 
            disabled={isSaving} 
            className="save-button"
          >
            {isSaving ? "Saving..." : "Save Preferences"}
          </button>
        </div>
      )}
    </div>
  );
};

export default CategoryBiasEditor;
