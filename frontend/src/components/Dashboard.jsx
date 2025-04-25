import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import "../styles/Dashboard.css";
import axios from "axios";

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [biases, setBiases] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentUser?.categoryBiases) {
      setBiases(currentUser.categoryBiases);
    }
  }, [currentUser]);

  const handleBiasChange = (category, value) => {
    setBiases((prev) => ({
      ...prev,
      [category]: Math.max(0.1, Math.min(0.9, parseFloat(value))),
    }));
  };

  const saveBiases = async () => {
    try {
      setIsSaving(true);
      const response = await axios.post(
        `${
          import.meta.env.VITE_API_URL || "http://localhost:3000"
        }/users/preferences`,
        { categoryBiases: biases },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Update the current user's biases
      currentUser.categoryBiases = response.data.categoryBiases;
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save biases:", error);
      alert("Failed to save preferences. Please try again.");
    } finally {
      setIsSaving(false);
    }
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
              <button onClick={saveBiases} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save"}
              </button>
            )}
          </div>

          <div className="biases-container">
            {Object.entries(biases).map(([category, value]) => (
              <div key={category} className="bias-item">
                <label>{category}</label>
                {isEditing ? (
                  <input
                    type="range"
                    min="0.1"
                    max="0.9"
                    step="0.1"
                    value={value}
                    onChange={(e) => handleBiasChange(category, e.target.value)}
                  />
                ) : (
                  <div className="bias-value">{value.toFixed(1)}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
