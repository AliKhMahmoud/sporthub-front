import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { useAuth } from "../context/AuthContext";
import { loginUser } from "../services/authService";
import { CustomAlert } from "../components/CustomAlert";

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // 1. Handle email verification status from URL params
  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      CustomAlert.success("Welcome!", "Your email has been verified successfully. You can now log in.");
    } else if (searchParams.get("error")) {
      CustomAlert.error(null, "Verification link is invalid or has expired.");
    }
  }, [searchParams]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!formData.email || !formData.password) {
      CustomAlert.warning("Warning", "Please fill in all required fields.");
      return;
    }

    try {
      setLoading(true);
      const response = await loginUser(formData);
      
      // Extract user data
      const loggedUser = response?.data || response;

      // 🔴 1. Check coach status if returned within 200 OK
      if (loggedUser.role === "coach") {
        if (loggedUser.coachStatus === "pending") {
          CustomAlert.warning(
            "Account Under Review",
            "Your coach application is currently under review by the administration. You will be notified once approved."
          );
          return;
        } 
        
        if (loggedUser.coachStatus === "rejected") {
          CustomAlert.error(
            null,
            "Sorry, your coach application has been rejected. Please contact support for more details."
          );
          return;
        }
      }

      // 🟢 2. Success login
      login(loggedUser);

      CustomAlert.success(
        "Welcome Back!",
        `Login successful! Welcome ${loggedUser.name || ""}`
      );

      navigate("/");

    } catch (error) {
      console.error("Login error:", error);

      // Extract Backend Response
      const responseData = error?.response?.data;
      const status = error?.response?.status;
      const backendMessage = responseData?.message;
      const errorCode = responseData?.code || responseData?.status;

      // 🔴 3. Handle Backend Errors
      if (errorCode === "COACH_PENDING" || backendMessage?.includes("pending")) {
        CustomAlert.warning(
          "Account Under Review",
          backendMessage || "Your coach account is waiting for administrative approval."
        );
      } else if (errorCode === "COACH_REJECTED" || backendMessage?.includes("rejected")) {
        CustomAlert.error(
          null,
          backendMessage || "Coach application rejected."
        );
      } else if (errorCode === "EMAIL_NOT_VERIFIED" || status === 403) {
        CustomAlert.info(
          "Email Verification",
          backendMessage || "Please verify your email address before logging in."
        );
      } else {
        // General error handling
        CustomAlert.error(error, "Login failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-16 flex justify-center items-center">
      <section className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800">
        <h1 className="text-4xl font-bold mb-3 text-center">
          Welcome Back
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Login to continue your training journey.
        </p>

        <form onSubmit={handleLogin} className="space-y-5">
          <Input
            name="email"
            type="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />

          <div className="flex items-center justify-between text-sm">
            <Link
              to="/forgot-password"
              className="text-red-400 hover:text-red-300 transition"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          Don&apos;t have an account?{" "}
          <Link
            to="/register"
            className="text-red-400 hover:text-red-300 font-medium"
          >
            Register
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Login;