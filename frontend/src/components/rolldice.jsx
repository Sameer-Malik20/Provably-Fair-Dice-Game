import { useState, useEffect } from "react";
import axios from "axios";
import { FaDiceFive } from "react-icons/fa";
import CryptoJS from "crypto-js";

const DiceGame = ({ setToken }) => {
    const [betAmount, setBetAmount] = useState("");
    const [balance, setBalance] = useState(0);
    const [rollResult, setRollResult] = useState(null);
    const [message, setMessage] = useState("");
    const [isRolling, setIsRolling] = useState(false);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [serverHash, setServerHash] = useState(""); // Server generated hash
    const [clientHash, setClientHash] = useState(""); // Client generated hash
    const [verificationResult, setVerificationResult] = useState("");

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
            fetchBalance(storedToken);
            loadHistory();
        } else {
            setMessage("Please login first.");
        }
    }, []);

    const fetchBalance = async (token) => {
        try {
            const response = await axios.get("http://localhost:5000/api/auth/user", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setBalance(response.data.balance);
        } catch (error) {
            console.error("Error fetching balance", error);
            setMessage("Failed to fetch balance");
        }
    };
    const loadHistory = () => {
        const storedHistory = localStorage.getItem("gameHistory");
        if (storedHistory) {
            setHistory(JSON.parse(storedHistory));
        }
    }


    const verifyFairness = async () => {
        if (!betAmount || betAmount <= 0) {
            setMessage("Invalid bet amount.");
            return;
        }

        // LocalStorage for clientSeed and betHash retrieve
        const storedClientSeed = localStorage.getItem("clientSeed");
        const storedBetHash = localStorage.getItem("betHash");

        if (!storedClientSeed || !storedBetHash) {
            setMessage("No previous bet found for verification.");
            return;
        }

        // SHA-256 Hash Generate 
        const verifyBetHash = CryptoJS.SHA256(`${betAmount}-${storedClientSeed}`).toString();

        console.log("🔹 Frontend Verify Hash:", verifyBetHash);
        console.log("🔹 Stored Bet Hash:", storedBetHash);

        try {
            const response = await axios.post("http://localhost:5000/api/auth/verify-fairness", {
                betAmount,
                clientSeed: storedClientSeed,
                betHash: storedBetHash,
            });

            setMessage(response.data.message);
        } catch (error) {
            setMessage("❌ Not Fair! Hash Mismatch");
        }
    };


    const rollDice = async () => {
        if (!betAmount || betAmount <= 0) {
            setMessage("Please enter a valid bet amount.");
            return;
        }

        if (betAmount > balance) {
            setMessage("Insufficient balance.");
            return;
        }

        setIsRolling(true);
        setMessage("");

        // Random client seed generate
        const clientSeed = Math.random().toString(36).substring(2, 10);

        // SHA-256 hash generate
        const betHash = CryptoJS.SHA256(`${betAmount}-${clientSeed}`).toString();

        // Debug: Frontend generated hash print
        console.log("🔹 Frontend Generated Hash:", betHash);

        setTimeout(async () => {
            try {
                const response = await axios.post("http://localhost:5000/api/auth/roll-dice",
                    { betAmount, clientSeed, betHash },
                    { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
                );
                //LocalStorage in clientSeed and betHash save
                localStorage.setItem("clientSeed", clientSeed);
                localStorage.setItem("betHash", betHash);
                setRollResult(response.data.roll);
                const gameResult = response.data.result === "Win"
                    ? `🎉 You Won! Rolled a ${response.data.roll}`
                    : `😞 You Lost! Rolled a ${response.data.roll}`;

                setMessage(gameResult);
                setBalance(response.data.newBalance);

                const newHistory = [{ roll: response.data.roll, result: gameResult, bet: betAmount }, ...history];
                setHistory(newHistory);
                localStorage.setItem("gameHistory", JSON.stringify(newHistory));
            } catch (error) {
                setMessage("Error rolling dice");
                console.error(error);
            }
            setIsRolling(false);
        }, 1500);
    };
    // SHA-256 hash generate function
    const generateHash = async (betAmount, rollResult) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(`${betAmount}-${rollResult}`);
        const hashBuffer = await crypto.subtle.digest("SHA-256", data);
        return Array.from(new Uint8Array(hashBuffer))
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    };

    // Verify Function
    const verifyHash = async () => {
        if (!rollResult) {
            setVerificationResult("Please roll the dice first.");
            return;
        }

        const clientGeneratedHash = await generateHash(betAmount, rollResult);
        setClientHash(clientGeneratedHash);

        if (clientGeneratedHash === serverHash) {
            setVerificationResult("Fair hash mathed.");
        } else {
            setVerificationResult("Not fair hash mathed.");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white px-4">
            {/* Header */}
            <div className="w-full flex justify-between items-center px-6 py-4 bg-gray-800 rounded-lg shadow-md">
                <h1 className="text-xl font-bold">🎲 Dice Game</h1>
                <button
                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-semibold transition duration-200"
                    onClick={() => {
                        localStorage.clear();
                        setToken(null);
                        setHistory([]);
                        setBalance(0);
                        setMessage("Logout successful");
                    }}
                >
                    Logout
                </button>
            </div>

            {/* Balance */}
            <div className="mt-4 text-center">
                <p className="text-lg">Your Balance</p>
                <h2 className="text-4xl font-bold text-green-400">${balance.toFixed(2)}</h2>
            </div>

            <h4 className="text-center mt-2">Roll a 4, 5, or 6 to Win 2x Double Your Bet!</h4>

            {/* Dice Roll Box */}
            <div className="mt-6 bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center w-full max-w-md">
                <FaDiceFive className={`text-green-400 text-6xl ${isRolling ? "animate-spin" : ""}`} />
                {message && <p className="mt-4 px-4 py-2 rounded-lg font-semibold bg-gray-700 text-center">{message}</p>}
            </div>

            {/* Bet Amount Input */}
            <div className="mt-6 w-full max-w-md">
                <label className="block text-gray-300 text-sm">Bet Amount</label>
                <div className="flex items-center bg-gray-800 p-2 rounded-lg mt-1">
                    <input
                        type="number"
                        className="bg-transparent text-white flex-1 px-2 outline-none"
                        value={betAmount}
                        onChange={(e) => setBetAmount(Number(e.target.value))}
                        placeholder="Enter bet amount"
                    />
                    <span className="text-gray-400">$</span>
                </div>
            </div>

            {/* Roll Dice Button */}
            <button
                className="mt-6 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg w-full max-w-md transition duration-200 mt-2"
                onClick={rollDice}
                disabled={isRolling}
            >
                {isRolling ? "Rolling..." : "Roll Dice"}
            </button>

            {/* Verify Button */}
            <button
                className="mt-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg w-full max-w-md transition duration-200"
                onClick={verifyFairness}
            >
                Verify Fairness
            </button>
            {/* Show History Button */}
            <button
                className="mt-2 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg w-full max-w-md transition duration-200"
                onClick={() => setShowHistory(!showHistory)}
            >
                {showHistory ? "Hide History" : "Show History"}
            </button>

            {/* Game History Section */}
            {showHistory && (
                <div className="mt-6 w-full max-w-md bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-bold mb-2">Game History</h3>
                    {history.length > 0 ? (
                        <>
                            <ul className="text-sm text-gray-300">
                                {history.map((game, index) => (
                                    <li key={index} className="py-1">
                                        Bet: ${game.bet}, Roll: {game.roll}, Result: {game.result}
                                    </li>
                                ))}
                            </ul>
                            {/* Clear History Button */}
                            <button
                                className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg w-full transition duration-200"
                                onClick={() => {
                                    localStorage.removeItem("gameHistory");
                                    setHistory([]);
                                    setMessage("Game history cleared.");
                                }}
                            >
                                Clear History
                            </button>
                        </>
                    ) : (
                        <p className="text-gray-400">No game history available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default DiceGame;
