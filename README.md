# 🎲 Provably Fair Dice Game

A **provably fair dice game** built using **React.js (Next.js)** for the frontend and **Node.js (Express.js)** for the backend. This game ensures fairness using **SHA-256 hashing** for bet verification, providing complete transparency to users.

## 🚀 Features

- 🎲 Roll the dice and win if you roll a 4, 5, or 6!
- 🔒 **Provably Fair System** using **SHA-256 hashing**.
- 💰 User authentication and balance management.
- 📜 **Game history tracking** (View past bets & results).
- 🗑️ **Clear game history** feature.
- 🖤 **Dark-themed, responsive UI**.

## 🛠️ Tech Stack

### **Frontend:**

- React.js / Next.js
- Tailwind CSS
- Axios
- CryptoJS (SHA-256 hashing)

### **Backend:**

- Node.js / Express.js
- MongoDB (Database)
- JSON Web Token (JWT) Authentication

## 📌 Installation

Follow these steps to run the project locally:

### 1️⃣ Clone the Repository

```sh
git clone https://github.com/your-username/provably-fair-dice-game.git
cd provably-fair-dice-game
```

### 2️⃣ Install Dependencies

#### **Frontend**

```sh
cd frontend
npm install
```

#### **Backend**

```sh
cd backend
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the backend and frontend directories with the necessary environment variables (like database connection, JWT secret, etc.).

### 4️⃣ Start the Project

#### **Backend**

```sh
cd backend
nodemon server.js
```

#### **Frontend**

```sh
cd frontend
npm start
```

## 🔬 How Provably Fair System Works

1. **Client Seed Generation:** The frontend generates a random seed when a bet is placed.
2. **Hash Calculation:** A SHA-256 hash is created using the `betAmount` and `clientSeed`.
3. **Server Verification:** After rolling, the backend verifies the hash and ensures the results are fair.

## 📬 Contact

If you have any questions, feel free to reach out!

- GitHub: [Sameer-Malik20](https://github.com/Sameer-Malik20)
- Email: [sameermalik63901@gmail.com](sameermalik63901@gmail.com)
- Live Link:[click open link](https://joyful-cactus-5c7f93.netlify.app)

Happy Rolling! 🎲🔥

