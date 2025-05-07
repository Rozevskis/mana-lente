import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import CategoryBiasEditor from "../components/articles/CategoryBiasEditor";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [biases, setBiases] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser?.categoryBiases) {
      setBiases(currentUser.categoryBiases);
    }
  }, [currentUser]);

  const handleBiasesUpdate = (newBiases) => {
    setBiases(newBiases);
  };
  
  const handleSaveCompleted = () => {
    setIsEditing(false);
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        Welcome, {currentUser?.username || "User"}!
      </div>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          <p>Email: {currentUser?.email}</p>
          <p>Username: {currentUser?.username}</p>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h2>Category Preferences</h2>
            {!isEditing ? (
              <button onClick={() => setIsEditing(true)}>Edit</button>
            ) : (
              <button onClick={handleSaveCompleted}>Done</button>
            )}
          </div>
          
          <CategoryBiasEditor 
            initialBiases={biases} 
            onBiasesChange={handleBiasesUpdate}
            editable={isEditing}
            showSaveButton={isEditing}
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
