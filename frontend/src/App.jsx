import { useState } from "react";
import axios from "axios";
import "./App.css";
import ConnectionTest from "./components/ConnectionTest";

const App = () => {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  const handleMessageChange = (event) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async () => {
    if (message.trim() === "") return;

    setLoading(true);
    try {
      const apiKey = import.meta.env.OPENAI_API_KEY;

      const result = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "user",
              content: message,
            },
          ],
          max_tokens: 150,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      setResponse(result.data.choices[0].message.content);
    } catch (error) {
      console.error("Error fetching the OpenAI response:", error);
      setResponse("Sorry, something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <ConnectionTest />
      <h1>OpenAI Chat</h1>
      <textarea
        value={message}
        onChange={handleMessageChange}
        placeholder="Ask something..."
        rows="5"
        cols="40"
      />
      <br />
      <button onClick={handleSendMessage} disabled={loading}>
        {loading ? "Loading..." : "Send"}
      </button>

      <div>
        <h2>Response:</h2>
        <p>{response}</p>
      </div>
    </div>
  );
};

export default App;
