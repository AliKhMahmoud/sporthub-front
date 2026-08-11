import { useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { forgotPassword } from "../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    try {
      setLoading(true);
      const res = await forgotPassword(email.trim());
      setMessage(res?.message || "Password reset link sent to your email!");
    } catch (err) {
      setError(
        err?.response?.data?.message || "Failed to send reset link. Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-16 flex justify-center items-center">
      <section className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800">
        <h1 className="text-3xl font-bold mb-3 text-center">Forgot Password?</h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-center text-sm">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-5 text-center text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          Remembered your password?{" "}
          <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ForgotPassword;