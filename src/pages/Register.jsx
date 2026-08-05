import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { registerUser, loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";

function Register() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
  const [sportsOptions, setSportsOptions] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "athlete",
    sport: "", // سيتم تعيين أول رياضة تلقائياً عند جلبها
    age: "",
    experienceYears: "",
    workingDays: [],
    workingHours: "",
    certificates: "",
    bio: "",
  });

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // جلب الرياضات من الـ Backend عند تحميل الصفحة
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(`${API_URL}/sports`);
        const data = await response.json();
        const sportsList = data.data || data;
        
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

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setError("Please fill in all required fields (Name, Email, Password)");
      return;
    }

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

    try {
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
      };

      if (formData.role === "coach") {
        dataToSend.sport = formData.sport; // إرسال الـ _id الصحيح مباشرة
        dataToSend.age = formData.age ? Number(formData.age) : undefined;
        dataToSend.experienceYears = formData.experienceYears !== "" ? Number(formData.experienceYears) : undefined;
        dataToSend.workingDays = formData.workingDays;
        dataToSend.workingHours = formData.workingHours.trim();
        dataToSend.certificates = formData.certificates 
          ? formData.certificates.split(",").map((c) => c.trim()).filter(Boolean)
          : [];
        dataToSend.bio = formData.bio ? formData.bio.trim() : "";
      }

      await registerUser(dataToSend);

      setSuccessMessage("Account created successfully! Logging you in...");

      const loginData = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      const loggedUser = loginData.user || loginData.data || loginData;
      login(loggedUser);

      setTimeout(() => {
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
      }, 1500);

    } catch (err) {
      console.error(err);
      
      const errorData = err?.response?.data;
      let errorMessage = "Registration failed";

      if (errorData?.errors && Array.isArray(errorData.errors)) {
        errorMessage = errorData.errors.map(e => e.message || e).join(", ");
      } else {
        errorMessage = 
          errorData?.message || 
          errorData?.error || 
          err?.message || 
          "Registration failed";
      }

      setError(errorMessage);
    }
  };

  const daysOptions = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
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
          />

          <Input
            name="email"
            type="email"
            placeholder="Email Address *"
            value={formData.email}
            onChange={handleChange}
          />

          <Input
            name="password"
            type="password"
            placeholder="Password (e.g. 8+ chars, Uppercase, Number) *"
            value={formData.password}
            onChange={handleChange}
          />

          <div>
            <label className="text-xs text-slate-400 block mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
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
                <label className="text-xs text-slate-400 block mb-1">Sport *</label>
                <select
                  name="sport"
                  value={formData.sport}
                  onChange={handleChange}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
                >
                  {sportsOptions.map((sportItem) => (
                    <option key={sportItem._id} value={sportItem._id}>
                      Coach for {sportItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Age * (Min 16)</label>
                <Input
                  name="age"
                  type="number"
                  placeholder="Age"
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Years of Experience *</label>
                <Input
                  name="experienceYears"
                  type="number"
                  placeholder="Years of Experience"
                  value={formData.experienceYears}
                  onChange={handleChange}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-slate-400">Working Days * (Select at least one)</label>
                <div className="grid grid-cols-2 gap-2">
                  {daysOptions.map((day) => (
                    <label key={day} className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer bg-slate-800/60 p-2 rounded-lg">
                      <input
                        type="checkbox"
                        checked={formData.workingDays.includes(day)}
                        onChange={() => handleWorkingDaysChange(day)}
                        className="accent-red-500"
                      />
                      {day}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Working Hours *</label>
                <Input
                  name="workingHours"
                  placeholder="e.g. 8AM - 5PM"
                  value={formData.workingHours}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Certificates (Optional)</label>
                <Input
                  name="certificates"
                  placeholder="Certificates (comma separated)"
                  value={formData.certificates}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Bio (Optional)</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell athletes about yourself..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-white"
                />
              </div>
            </div>
          )}

          <Button type="submit" className="w-full">
            Create Account
          </Button>
        </form>

        <p className="text-slate-400 text-center mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-400 hover:text-red-300"
          >
            Login
          </Link>
        </p>
      </section>
    </main>
  );
}

export default Register;