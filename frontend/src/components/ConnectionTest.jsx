import { useState } from "react";
import axios from "axios";
import "./ConnectionTest.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ConnectionTest = () => {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  const testConnection = async () => {
    setStatus("Testing connection...");
    setError("");

    try {
      const response = await axios.get(API_URL);
      setStatus(response.data.message);
    } catch (err) {
      console.error("Connection error:", err);
      setError(err.message);
      setStatus("Failed to connect to backend");
    }
  };

  return (
    <div className="connection-test">
      <h2>Backend Connection Test</h2>
      <button onClick={testConnection} className="test-button">
        Test Backend Connection
      </button>
      {status && <div className="status">{status}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default ConnectionTest;
