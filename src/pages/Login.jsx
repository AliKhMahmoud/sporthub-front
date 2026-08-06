import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

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

    setFormData({
      ...formData,
      [name]: value,
    });

    setError("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const response = await loginUser(formData);
      
      const loggedUser = response?.data || response;

      console.log("LOGGED USER DATA:", loggedUser); 
      console.log("ROLE:", loggedUser.role);

      login(loggedUser);

      // التحقق من حالات الكوتش المعلق أو المرفوض أولاً لإظهار الخطأ المناسب إذا لزم
      if (loggedUser.role === "coach") {
        if (loggedUser.coachStatus === "pending") {
          setError("Your account is pending admin approval.");
          return;
        } else if (loggedUser.coachStatus === "rejected") {
          setError("Your coach request has been rejected.");
          return;
        }
      }

      // توجيه الجميع إلى الصفحة الرئيسية (Home) مباشرة بعد تسجيل الدخول الناجح
      navigate("/");

    } catch (error) {
      console.error(error);
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