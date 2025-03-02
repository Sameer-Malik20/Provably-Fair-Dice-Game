import { useState } from "react";
import axios from "axios";

// Auth component handles user authentication (login/signup)
export default function Auth({ setUser, setToken, setBalance }) {
    // State variables for username, password, login/signup mode, and message
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLogin, setIsLogin] = useState(true);
    const [message, setMessage] = useState("");

    // Handle form submission for login/signup
    const handleSubmit = async (e) => {
        e.preventDefault();
        const endpoint = isLogin ? "login" : "signup"; // Determine endpoint based on mode

        try {
            // Send POST request to the appropriate endpoint
            const response = await axios.post(`http://localhost:5000/api/auth/${endpoint}`, {
                username,
                password,
            });

            if (isLogin) {
                // If login is successful, store token and update user info
                localStorage.setItem("token", response.data.token);
                setToken(response.data.token);
                setUser(response.data.username);
                setBalance(response.data.balance); // Set correct balance from backend
            }

            // Set success message based on mode
            setMessage(isLogin ? "Login successful!" : "Signup successful! Please login.");
        } catch (error) {
            // Set error message if request fails
            setMessage(error.response?.data?.message || "Error occurred");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
            <h1 className="text-3xl font-bold">{isLogin ? "Login" : "Signup"}</h1>
            <form className="flex flex-col mt-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Username"
                    className="p-2 m-2 bg-gray-700 text-white rounded"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)} // Update username state
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="p-2 m-2 bg-gray-700 text-white rounded"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)} // Update password state
                />
                <button type="submit" className="bg-blue-500 p-2 rounded">
                    {isLogin ? "Login" : "Signup"}
                </button>
            </form>
            <p className="mt-2 cursor-pointer" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Don't have an account? Signup" : "Already have an account? Login"}
            </p>
            {message && <p className="mt-2 text-lg">{message}</p>}
        </div>
    );
}
