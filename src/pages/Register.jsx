import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { registerUser } from "../services/authService";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();
  const [sportsOptions, setSportsOptions] = useState([]);
  const [loading, setLoading] = useState(false); // حالة التحميل أثناء الإرسال

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "athlete",
    sport: "",
    age: "",
    experienceYears: "",
    workingDays: [],
    workingHours: "",
    certificates: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // جلب الرياضات المتاحة من الـ Backend عند تحميل الصفحة
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await api.get("/sports");
        const sportsList = response.data?.data || response.data;

        if (Array.isArray(sportsList) && sportsList.length > 0) {
          setSportsOptions(sportsList);
          setFormData((prev) => ({ ...prev, sport: sportsList[0]._id }));
        }
      } catch (err) {
        console.error("Failed to fetch sports:", err);
      }
    };

    fetchSports();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData({
      ...formData,
      [name]: value,
    });
    setError("");
  };

  const handleWorkingDaysChange = (day) => {
    const currentDays = [...formData.workingDays];
    const index = currentDays.indexOf(day);

    if (index > -1) {
      currentDays.splice(index, 1);
    } else {
      currentDays.push(day);
    }

    setFormData({
      ...formData,
      workingDays: currentDays,
    });
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    // 1. التحقق الأول من الحقول الأساسية
    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all required fields (Name, Email, Password)");
      return;
    }

    // 2. التحقق من نمط كلمة المرور (8 عناصر على الأقل تحتوي حرف كبير، صغير، رقم، ورمز خاص)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,64}$/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character."
      );
      return;
    }

    // 3. التحقق من حقول المدرب إن كان الدور Coach
    if (formData.role === "coach") {
      if (!formData.sport) {
        setError("Sport is required for coach");
        return;
      }
      if (!formData.age) {
        setError("Age is required for coach");
        return;
      }
      if (formData.experienceYears === "") {
        setError("Experience years is required for coach");
        return;
      }
      if (!formData.workingDays || formData.workingDays.length === 0) {
        setError("At least one working day is required for coach");
        return;
      }
      if (!formData.workingHours.trim()) {
        setError("Working hours are required for coach");
        return;
      }
    }

    setLoading(true); // بدء التجميع والتحميل

    try {
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === "coach") {
        dataToSend.sport = formData.sport;
        dataToSend.age = formData.age ? Number(formData.age) : undefined;
        dataToSend.experienceYears =
          formData.experienceYears !== ""
            ? Number(formData.experienceYears)
            : undefined;
        dataToSend.workingDays = formData.workingDays;
        dataToSend.workingHours = formData.workingHours.trim();
        dataToSend.certificates = formData.certificates
          ? formData.certificates
              .split(",")
              .map((c) => c.trim())
              .filter(Boolean)
          : [];
        dataToSend.bio = formData.bio ? formData.bio.trim() : "";
      }

      const response = await registerUser(dataToSend);

      const msg =
        response?.message ||
        "Registered successfully! Please check your email to verify your account.";
      setSuccessMessage(msg);

      // توجيه المستخدم بعد 3 ثوانٍ إلى صفحة الدخول
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err) {
      console.error(err);

      const errorData = err?.response?.data;
      let errorMessage = "Registration failed";

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map((e) => e.message || e).join(", ");
      } else {
        errorMessage =
          errorData?.message ||
          errorData?.error ||
          err?.message ||
          "Registration failed";
      }

      setError(errorMessage);
    } finally {
      setLoading(false); // إيقاف التحميل مهما كانت النتيجة
    }
  };

  const daysOptions = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  return (
    <main className="bg-slate-950 min-h-screen text-white px-6 py-16 flex justify-center">
      <section className="bg-slate-900 w-full max-w-xl p-8 rounded-3xl border border-slate-800">
        <h1 className="text-4xl font-bold mb-3 text-center">
          Create Account
        </h1>

        <p className="text-slate-400 text-center mb-8">
          Join SportsHub and start your sports journey today.
        </p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl mb-5 text-center text-sm">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl mb-5 text-center text-sm">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-5">
          <Input
            name="name"
            type="text"
            placeholder="Full Name *"
            value={formData.name}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            name="email"
            type="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
            disabled={loading}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password (8+ chars, Uppercase, Number, Special) *"
            value={formData.password}
            onChange={handleChange}
            disabled={loading}
          />

          <div>
            <label className="text-xs text-slate-400 block mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white disabled:opacity-50"
            >
              <option value="athlete">Athlete</option>
              <option value="coach">Coach</option>
            </select>
          </div>

          {formData.role === "coach" && (
            <div className="space-y-5 bg-slate-950/60 border border-slate-800 rounded-2xl p-5">
              <p className="text-red-400 font-semibold">
                Coach Application Details (Required)
              </p>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Sport *
                </label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white disabled:opacity-50"
                >
                  {sportsOptions.map((sportItem) => (
                    <option key={sportItem._id} value={sportItem._id}>
                      Coach for {sportItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Age * (Min 16)
                </label>
                <Input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Years of Experience *
                </label>
                <Input
                  name="experienceYears"
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.experienceYears}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">
                  Working Days * (Select at least one)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOptions.map((day) => (
                    <label
                      key={day}
                      className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer bg-slate-800/60 p-2 rounded-lg"
                    >
                      <input
                        type="checkbox"
                        checked={formData.workingDays.includes(day)}
                        onChange={() => handleWorkingDaysChange(day)}
                        disabled={loading}
                        className="accent-red-500"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Working Hours *
                </label>
                <Input
                  name="workingHours"
                  placeholder="e.g. 8AM - 5PM"
                  value={formData.workingHours}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Certificates (Optional)
                </label>
                <Input
                  name="certificates"
                  placeholder="Certificates (comma separated)"
                  value={formData.certificates}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Bio (Optional)
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={loading}
                  rows="4"
                  placeholder="Tell athletes about yourself..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white disabled:opacity-50"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creating Account...
              </span>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6 text-sm">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-400 hover:text-red-300 font-medium"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;