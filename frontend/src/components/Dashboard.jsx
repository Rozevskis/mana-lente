import React from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Dashboard.css";

const Dashboard = () => {
  const { currentUser } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {currentUser?.username || "User"}!</h1>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Your Profile</h2>
          <p>Email: {currentUser?.email}</p>
          <p>Username: {currentUser?.username}</p>
        </div>
        <div className="dashboard-card">
          <h2>News Feed</h2>
          <p>Your personalized news feed will appear here.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
