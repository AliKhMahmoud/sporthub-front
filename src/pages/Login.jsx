import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const data = await loginUser(formData);
      const loggedUser = data.user || data;

      login(loggedUser);

      if (loggedUser.role === "admin") {
        navigate("/admin");
      } else if (
        loggedUser.role === "coach" &&
        loggedUser.coachStatus === "approved"
      ) {
        navigate("/dashboard");
      } else {
        navigate("/profile");
      }
    } catch (error) {
      console.error("Login Error details:", error);
      setError(
        error?.response?.data?.message ||
          "Invalid email or password"
      );
    }
  };

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-16 flex justify-center">
      <section className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800">
        <h1 className="text-4xl font-bold mb-3 text-center">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Login to continue your training journey.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm text-slate-300">Email Address</label>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              value={formData.email}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm text-slate-300">Password</label>
            <input
              name="password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-slate-400">
              <input type="checkbox" />
              Remember me
            </label>

            <span className="text-red-400 hover:text-red-300 cursor-pointer">
              Forgot password?
            </span>
          </div>

          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-red-400 hover:text-red-300"
          >
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;