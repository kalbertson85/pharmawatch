import React, { useState } from "react";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();
    if (username && password) {
      localStorage.setItem("authToken", "dummy-token");
      localStorage.setItem("user", JSON.stringify({ username, role: "admin" }));
      onLogin();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dhis2-gray-light dark:bg-dhis2-dark-background text-dhis2-text dark:text-dhis2-dark-textPrimary transition-colors px-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Login to PharmaWatch</h2>

        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-dhis2-blue hover:bg-dhis2-blueLight text-white font-semibold py-2 rounded-md transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;