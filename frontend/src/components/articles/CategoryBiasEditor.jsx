import React, { useState, useEffect } from "react";
import { updateUserBiases, saveUserBiases } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import "./CategoryBiasEditor.css";

const CategoryBiasEditor = ({ 
  initialBiases = {}, 
  onBiasesChange = () => {}, 
  onSaveComplete = null,
  editable = true,
  className = "" 
}) => {
  const [biases, setBiases] = useState(initialBiases);
  const [saveError, setSaveError] = useState(null);
  const { isAuthenticated, setCurrentUser } = useAuth();

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
    
    // Always auto-save changes
    saveBiases(newBiases);
  };

  const saveBiases = async (biasesToSave = null) => {
    // Use provided biases or current state
    const biasesData = biasesToSave || biases;
    try {
      setSaveError(null);
      
      if (isAuthenticated) {
        // For authenticated users, update via API
        const updatedUser = await updateUserBiases(biasesData);
        
        // Update current user with new biases
        if (setCurrentUser && updatedUser) {
          setCurrentUser(updatedUser);
        }
        
        // Use whatever the server sends back (might have sanitized values)
        const updatedBiases = updatedUser.categoryBiases;
        setBiases(updatedBiases);
        onBiasesChange(updatedBiases);
      } else {
        // For non-authenticated users, save to localStorage
        saveUserBiases(biasesData);
        
        // No server sanitization, so just use what we have
        onBiasesChange(biasesData);
      }
      
      if (onSaveComplete) {
        onSaveComplete(biases);
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      setSaveError("Failed to save preferences. Please try again.");
    }
  };

  return (
    <div className={`category-bias-editor ${className}`}>
      <div className="biases-container">
        {Object.entries(biases).map(([category, value]) => (
          <div key={category} className="bias-item">
            <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="bias-label">{category}</div>
            <div className="bias-value">{value.toFixed(3)}</div>
            </div>
            
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
                    style={{ width: `${(value - 0.1) / 0.8 * 100}%` }}
                  ></div>
                </div>
              )}
              
            </div>
          </div>
        ))}
      </div>
      
      {saveError && (
        <div className="bias-actions">
          <div className="save-error">{saveError}</div>
        </div>
      )}
    </div>
  );
};

export default CategoryBiasEditor;
