import { useEffect, useState } from "react";
import {
  Camera,
  Zap,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getProfile,
  updateProfile,
} from "../services/profileService";
import { getMyStats, getMyProgress, addProgress } from "../services/progressService";

import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getAllSports } from "../services/sportsService";

const sportsOptions = [
  "Fitness",
  "Boxing",
  "Bodybuilding",
  "Karate",
  "Taekwondo",
];

function Profile() {
  const { user, login } = useAuth();

  const isAthlete = user?.role === "athlete";
  const isCoach = user?.role === "coach";

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);

  const [profilePosts, setProfilePosts] = useState([]);
  const [accountActivity, setAccountActivity] = useState([]);
  const [aiPlans, setAiPlans] = useState([]);
  const [normalWorkouts, setNormalWorkouts] = useState([]);
  
  // حالات جديدة خاصة بالـ Progress والإحصائيات الحقيقية
  const [progressStats, setProgressStats] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);

  // حالة فورم إضافة Progress جديد
  const [progressForm, setProgressForm] = useState({
    sport: "",
    metric: "weight",
    value: "",
    note: "",
  });

  const [profileStats, setProfileStats] = useState({
    forumPosts: 0,
    likesReceived: 0,
    commentsReceived: 0,
    averageProgress: 0,
    acceptedAthletes: 0,
    pendingRequests: 0,
    coachRating: 0,
  });

  const [formData, setFormData] = useState({
    name: user?.name || "",
    about: user?.bio || user?.about || "",
    phone: user?.phone || "",
    height: user?.height || "",
    weight: user?.weight || "",
    coachSport: user?.coachSport || "Fitness",
  });

  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || "https://i.pravatar.cc/150"
  );
  const [coverPreview, setCoverPreview] = useState(
    user?.cover ||
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
  );

  const loadProfileData = async () => {
    try {
      const data = await getProfile();
      const profileUser = data?.user || user;

      if (profileUser) {
        setFormData({
          name: profileUser.name || "",
          about: profileUser.bio || profileUser.about || "",
          phone: profileUser.phone || "",
          height: profileUser.height || "",
          weight: profileUser.weight || "",
          coachSport: profileUser.coachSport || "Fitness",
        });

        if (profileUser.avatar) setAvatarPreview(profileUser.avatar);
        if (profileUser.cover) setCoverPreview(profileUser.cover);
      }

      setProfilePosts(data?.posts || []);
      setAccountActivity(data?.notifications || []);
      setAiPlans(data?.aiPlans || []);
      setNormalWorkouts(data?.workouts || []);
      setProfileStats(data?.stats || {});

      // جلب الإحصائيات الحقيقية والـ Progress من الـ Backend
      if (isAthlete) {
        const statsRes = await getMyStats();
        if (statsRes?.success) {
          setProgressStats(statsRes.data || []);
        }

        const progressRes = await getMyProgress();
        if (progressRes?.success) {
          setProgressHistory(progressRes.data || []);
        }

        try {
          const sportsRes = await getAllSports();
          if (sportsRes) {
            setAvailableSports(sportsRes.data || sportsRes);
          }
        } catch (e) {
          console.error("Error loading sports:", e);
        }
      }
    } catch (error) {
      console.error("Error loading profile details:", error);
    }
  };

  useEffect(() => {
    loadProfileData();
  }, [user, isAthlete]);

  const receivedLikes = profileStats.likesReceived || 0;
  const receivedComments = profileStats.commentsReceived || 0;

  const trainingSports = [
    ...new Set(
      progressHistory
        .map((item) => item.sport?.name)
        .filter(Boolean)
    ),
  ];

  const totalPlans = aiPlans.length + normalWorkouts.length;
  const completedPlans = aiPlans.length;

  const xp =
    totalPlans * 20 +
    completedPlans * 50 +
    receivedLikes * 2 +
    receivedComments * 3;

  const level = Math.floor(xp / 100) + 1;
  const currentLevelXp = xp % 100;
  const nextLevelXp = 100;

  const levelTitle =
    level >= 10
      ? "Legend"
      : level >= 7
      ? "Elite Athlete"
      : level >= 5
      ? "Champion"
      : level >= 3
      ? "Active Athlete"
      : "Rookie";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleProgressChange = (event) => {
    const { name, value } = event.target;
    setProgressForm({
      ...progressForm,
      [name]: value,
    });
  };

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);

    if (type === "avatar") {
      setAvatarFile(file);
      setAvatarPreview(previewUrl);
    } else if (type === "cover") {
      setCoverFile(file);
      setCoverPreview(previewUrl);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      const dataToSend = new FormData();
      dataToSend.append("name", formData.name);
      dataToSend.append("about", formData.about);
      dataToSend.append("phone", formData.phone);
      dataToSend.append("height", formData.height);
      dataToSend.append("weight", formData.weight);

      if (isCoach) {
        dataToSend.append("coachSport", formData.coachSport);
      }

      if (avatarFile) {
        dataToSend.append("avatar", avatarFile);
      }

      if (coverFile) {
        dataToSend.append("cover", coverFile);
      }
      
      const result = await updateProfile(dataToSend);
      const updatedUser = result.data || result.user || result;
      
      login(updatedUser);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  // حفظ الـ Progress الجديد
  const handleSaveProgress = async (event) => {
    event.preventDefault();
    try {
      const res = await addProgress(progressForm);
      if (res?.success || res) {
        setIsAddProgressOpen(false);
        setProgressForm({ sport: "", metric: "weight", value: "", note: "" });
        loadProfileData(); // إعادة تحديث الإحصائيات
      }
    } catch (error) {
      console.error("Error creating progress:", error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-none"
      >
        <div className="h-72 overflow-hidden relative">
          <img
            src={coverPreview}
            alt="cover"
            className="w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <label className="absolute top-5 right-5 bg-black/70 text-white px-4 py-3 rounded-xl cursor-pointer hover:bg-black transition flex items-center gap-2">
            <Camera size={18} />
            Change Cover
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={(event) => handleFileChange(event, "cover")}
            />
          </label>
        </div>

        <div className="px-8 pb-10 relative">
          <div className="absolute -top-20">
            <div className="relative w-40 h-40">
              <img
                src={avatarPreview}
                alt={user?.name || "profile"}
                className="w-40 h-40 rounded-full border-4 border-white dark:border-slate-950 object-cover shadow-xl"
              />

              <label className="absolute bottom-2 right-2 bg-red-500 hover:bg-red-600 text-white w-11 h-11 rounded-full cursor-pointer transition flex items-center justify-center shadow-lg">
                <Camera size={19} />
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(event) => handleFileChange(event, "avatar")}
                />
              </label>
            </div>
          </div>

          <div className="pt-28 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-5xl font-extrabold text-slate-950 dark:text-white">
                  {formData.name || user?.name}
                </h1>

                <span className="bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-2 rounded-full text-sm font-semibold">
                  {isCoach ? "Coach" : "Athlete"}
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {user?.email || "sports member"} • SportsHub Member
              </p>

              {isCoach && formData.coachSport && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl font-semibold">
                  🏆 Coach of {formData.coachSport}
                </div>
              )}

              {isAthlete && trainingSports.length > 0 && (
                <div className="mt-4">
                  <p className="font-semibold text-slate-950 dark:text-white mb-2">
                    Training Sports
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {trainingSports.map((sport) => (
                      <span
                        key={sport}
                        className="bg-emerald-500/10 text-emerald-500 px-3 py-2 rounded-xl font-medium"
                      >
                        {sport}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Button onClick={() => setIsEditOpen(true)}>
              Edit Profile
            </Button>
          </div>

          {isAthlete && (
            <>
              <div className="mt-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Level System</p>
                    <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                      Level {level} • {levelTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold">
                    <Zap size={22} />
                    {xp} XP
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-red-500 h-4 transition-all"
                    style={{ width: `${currentLevelXp}%` }}
                  />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                  {currentLevelXp} / {nextLevelXp} XP to next level
                </p>
              </div>

              {/* قسم عرض الإحصائيات الفعلية المسترجعة مع زر إضافة قياس جديد */}
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                    Performance Metrics & Stats
                  </h3>
                  <Button
                    onClick={() => setIsAddProgressOpen(true)}
                    className="flex items-center gap-2 text-sm py-2 px-4"
                  >
                    <Plus size={16} /> Add Progress
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  {progressStats.length > 0 ? (
                    progressStats.map((stat) => (
                      <div
                        key={stat._id}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl"
                      >
                        <p className="text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
                          Metric: {stat._id}
                        </p>
                        <div className="mt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Latest: </span>
                            <span className="text-xl font-bold text-slate-950 dark:text-white">
                              {stat.latest}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Best: </span>
                            <span className="text-xl font-bold text-emerald-500">
                              {stat.best}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Total records tracked: {stat.count}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 dark:text-slate-400 col-span-3 text-center py-4">
                      No progress metrics recorded yet. Start adding your progress!
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </motion.section>

      {/* نافذة التعديل (Edit Profile Modal) */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-6 text-slate-950 dark:text-white">
              Edit Profile
            </h2>

            <form onSubmit={handleSave} className="space-y-5">
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Full Name"
              />

              <textarea
                name="about"
                value={formData.about}
                onChange={handleChange}
                rows="3"
                placeholder="About you / Bio"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
              />

              <div className="grid grid-cols-2 gap-4">
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                />
                <Input
                  name="height"
                  type="number"
                  value={formData.height}
                  onChange={handleChange}
                  placeholder="Height (cm)"
                />
              </div>

              <Input
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                placeholder="Weight (kg)"
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Avatar Image
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={avatarPreview}
                    alt="avatar preview"
                    className="w-12 h-12 rounded-full object-cover border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "avatar")}
                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Cover Image
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={coverPreview}
                    alt="cover preview"
                    className="w-16 h-10 rounded-lg object-cover border"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "cover")}
                    className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-red-500 file:text-white hover:file:bg-red-600 cursor-pointer"
                  />
                </div>
              </div>

              {isCoach && (
                <select
                  name="coachSport"
                  value={formData.coachSport}
                  onChange={handleChange}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                >
                  {sportsOptions.map((sport) => (
                    <option key={sport} value={sport}>
                      {sport}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1">
                  Save
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsEditOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة إضافة قياس تقدم جديد (Add Progress Modal) */}
      {isAddProgressOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-50">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-slate-950 dark:text-white">
              Add New Progress
            </h2>

            <form onSubmit={handleSaveProgress} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Sport
                </label>
                <select
                  name="sport"
                  value={progressForm.sport}
                  onChange={handleProgressChange}
                  required
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                >
                  <option value="">Select Sport</option>
                  {availableSports.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Metric Type
                </label>
                <select
                  name="metric"
                  value={progressForm.metric}
                  onChange={handleProgressChange}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                >
                  <option value="weight">Weight (kg)</option>
                  <option value="reps">Reps</option>
                  <option value="time">Time (min/sec)</option>
                  <option value="distance">Distance (km/m)</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Value
                </label>
                <Input
                  name="value"
                  type="number"
                  step="any"
                  value={progressForm.value}
                  onChange={handleProgressChange}
                  placeholder="Enter value (e.g., 75)"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-1">
                  Note (Optional)
                </label>
                <textarea
                  name="note"
                  value={progressForm.note}
                  onChange={handleProgressChange}
                  rows="2"
                  placeholder="Add any note..."
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <Button type="submit" className="flex-1">
                  Add Record
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsAddProgressOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

export default Profile;