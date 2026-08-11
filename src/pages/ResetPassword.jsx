import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { resetPassword } from "../services/authService";

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill in both password fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      const res = await resetPassword(token, newPassword, confirmPassword);
      setMessage(res?.message || "Password reset successfully!");
      
      setTimeout(() => {
        navigate("/login");
      }, 2500);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Invalid or expired token. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-16 flex justify-center items-center">
      <section className="bg-slate-900 w-full max-w-md p-8 rounded-3xl border border-slate-800">
        <h1 className="text-3xl font-bold mb-3 text-center">Reset Password</h1>
        <p className="text-slate-400 text-center text-sm mb-8">
          Enter your new password below.
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
            type="password"
            placeholder="New Password (8+ chars, uppercase, number)"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          <Link to="/login" className="text-red-400 hover:text-red-300 font-medium">
            Back to Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default ResetPassword;