import { useState } from "react";
import Auth from "./components/auth";
import DiceGame from "./components/rolldice";
import PrivateRoute from "./components/private";

export default function App() {
  // State variables for user, token, and balance
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [balance, setBalance] = useState(1000);

  return (
    <div>
      {/* Render Auth component if no token, otherwise render DiceGame within PrivateRoute */}
      {!token ? (
        <Auth setUser={setUser} setToken={setToken} setBalance={setBalance} />
      ) : (
        <PrivateRoute>
          {/* Pass user, token, balance, and setToken to DiceGame */}
          <DiceGame user={user} token={token} balance={balance} setToken={setToken} />
        </PrivateRoute>
      )}
    </div>
  );
}
