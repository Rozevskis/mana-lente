import React from 'react';
import CategoryBiasEditor from '../../articles/CategoryBiasEditor';

const DebugPanel = ({ userBiases, onBiasesChange }) => {
  if (!userBiases) return null;
  
  return (
    <div className="debug-panel">
      <div className="debug-section">
        <h4>Category Biases</h4>
        <p className="debug-hint">Adjust weights to see real-time changes in article sorting</p>
        <CategoryBiasEditor
          initialBiases={userBiases}
          onBiasesChange={onBiasesChange}
          editable={true}
          className="sidebar-editor"
        />
      </div>
    </div>
  );
};

export default DebugPanel;
