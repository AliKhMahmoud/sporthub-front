import { useEffect, useState, useRef } from "react";
import { Zap, Plus, Camera } from "lucide-react";
import { motion } from "framer-motion";

import {
  getProfile,
  updateProfile,
  assignSport,
} from "../services/profileService";
import {
  getMyProgress,
  getMyProgressStats,
  addProgress,
} from "../services/progressService";
import statService from "../services/statService";

import { useAuth } from "../context/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getAllSports } from "../services/sportsService";
import { uploadAvatar, uploadCover } from "../services/uploadService";


function Profile() {
  const { user, login } = useAuth();
  const isAthlete = user?.role === "athlete";
  const isCoach = user?.role === "coach";

  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);

  const [profileData, setProfileData] = useState(null);
  const [progressStats, setProgressStats] = useState([]);
  const [progressHistory, setProgressHistory] = useState([]);
  const [availableSports, setAvailableSports] = useState([]);

  // حالات التحميل عند رفع الصور
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // حالة فورم إضافة Progress جديد
  const [progressForm, setProgressForm] = useState({
    sport: "",
    metric: "weight",
    value: "",
    note: "",
  });

  const [xpData, setXpData] = useState({
    xp: 0,
    level: 1,
    levelTitle: "Rookie",
    xpProgress: 0,
    xpForNextLevel: 100,
  });

  const [formData, setFormData] = useState({
    name: "",
    about: "",
    phone: "",
    height: "",
    weight: "",
    sport: "",          // للرياضيين
    coachSport: "",     // للمدربين
  });

  const loadProfileData = async () => {
    try {
      // 1. جلب بيانات البروفايل الرئيسية من الـ API
      const response = await getProfile();
      const userData = response?.data || {};

      setProfileData(userData);

      // تعبئة البيانات في الفورم بناءً على شكل الاستجابة من الباك إند
      setFormData({
        name: userData.name || "",
        about: userData.profile?.bio || "",
        phone: userData.phone || "",
        height: userData.profile?.height || "",
        weight: userData.profile?.weight || "",
        sport: userData.sport?._id || userData.sport?.id || "",
        coachSport: userData.sport?._id || userData.sport?.id || "",
      });

      // 2. جلب قائمة الرياضات
      try {
        const sportsRes = await getAllSports();
        setAvailableSports(
          Array.isArray(sportsRes) ? sportsRes : sportsRes?.data || []
        );
      } catch (e) {
        console.error("Error loading sports:", e);
      }

      // 3. جلب البيانات الخاصة بالرياضي (سواء من الكائن المسترجع أو الـ Context)
      const currentRole = userData.role || user?.role;
      if (currentRole === "athlete" || isAthlete) {
        // جلب الإحصائيات الأساسية والنقاط XP
        try {
          const statsRes = await statService.getMyStats();
          if (statsRes) {
            setXpData({
              xp: statsRes.xp || 0,
              level: statsRes.level || 1,
              levelTitle: statsRes.levelTitle || "Rookie",
              xpProgress: statsRes.xpProgress || 0,
              xpForNextLevel: statsRes.xpForNextLevel || 100,
            });
          }
        } catch (statsError) {
          console.error("Error loading athlete stats:", statsError);
        }

        // جلب سجلات التقدم
        try {
          const progressRes = await getMyProgress();
          const progressData = progressRes?.data || [];
          setProgressHistory(Array.isArray(progressData) ? progressData : []);
        } catch (progError) {
          console.error("Error loading progress history:", progError);
        }

        // جلب إحصائيات التقدم (Latest, Best, Average)
        try {
          const progressStatsRes = await getMyProgressStats();
          const statsData = progressStatsRes?.data || [];
          setProgressStats(Array.isArray(statsData) ? statsData : []);
        } catch (statsError) {
          console.error("Error loading progress stats:", statsError);
        }
      }
    } catch (error) {
      console.error("Error loading profile details:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadProfileData();
    }
  }, [user]);

  // معالجة تغيير الأفاتار
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const res = await uploadAvatar(file);
      const updatedUser = res?.data || res;
      if (updatedUser) {
        login(updatedUser);
      }
      await loadProfileData();
    } catch (error) {
      console.error("Error uploading avatar:", error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // معالجة تغيير الغلاف
  const handleCoverChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingCover(true);
      const res = await uploadCover(file);
      const updatedUser = res?.data || res;
      if (updatedUser) {
        login(updatedUser);
      }
      await loadProfileData();
    } catch (error) {
      console.error("Error uploading cover:", error);
    } finally {
      setUploadingCover(false);
    }
  };

  const trainingSports = [
    ...new Set(
      progressHistory
        .map((item) => item.sport?.name)
        .filter(Boolean)
    ),
  ];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProgressChange = (event) => {
    const { name, value } = event.target;
    setProgressForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (event) => {
    event.preventDefault();

    try {
      // 1. تحديث بيانات البروفايل الأساسية
      const dataToSend = {
        name: formData.name,
        bio: formData.about,
        phone: formData.phone,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
      };

      const result = await updateProfile(dataToSend);
      const updatedUser = result?.data || result;

      if (updatedUser) {
        login(updatedUser);
        // تحديث profileData فقط بدون reloading كل شيء
        setProfileData(updatedUser);
      }

      // 2. تحديث الرياضة (منفصل عن updateProfile)
      if (isAthlete && formData.sport) {
        try {
          await assignSport(formData.sport);
        } catch (sportError) {
          console.error("Error assigning sport:", sportError);
        }
      }

      if (isCoach && formData.coachSport) {
        try {
          await assignSport(formData.coachSport);
        } catch (sportError) {
          console.error("Error assigning coach sport:", sportError);
        }
      }

      setIsEditOpen(false);

      // 3. جلب البيانات المحدثة فقط (بدون تأثر على XP والـ Progress)
      try {
        const response = await getProfile();
        const userData = response?.data || {};
        setProfileData(userData);
        setFormData({
          name: userData.name || "",
          about: userData.profile?.bio || "",
          phone: userData.phone || "",
          height: userData.profile?.height || "",
          weight: userData.profile?.weight || "",
          sport: userData.sport?._id || userData.sport?.id || "",
          coachSport: userData.sport?._id || userData.sport?.id || "",
        });
      } catch (error) {
        console.error("Error refreshing profile data:", error);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  const handleSaveProgress = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        traineeId: user?._id || user?.id,
        sportId: progressForm.sport,
        metric: progressForm.metric,
        value: Number(progressForm.value),
        note: progressForm.note,
      };

      const res = await addProgress(payload);
      if (res?.success || res) {
        setIsAddProgressOpen(false);
        setProgressForm({ sport: "", metric: "weight", value: "", note: "" });
        loadProfileData();
      }
    } catch (error) {
      console.error("Error Response Data:", error.response?.data);
      console.error("Full Error Object:", error);
    }
  };

  // تعيين الصور الافتراضية
  const avatarUrl =
    profileData?.avatar ||
    user?.avatar ||
    "https://i.pravatar.cc/150";

  const coverUrl =
    profileData?.cover ||
    user?.cover ||
    "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop";

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      {/* مدخلات ملفات مخفية للرفع */}
      <input
        type="file"
        ref={avatarInputRef}
        onChange={handleAvatarChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={handleCoverChange}
        accept="image/*"
        className="hidden"
      />

      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm dark:shadow-none"
      >
        {/* الغلاف (Cover Image) */}
        <div className="h-72 overflow-hidden relative group">
          <img
            src={coverUrl}
            alt="cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          
          {/* زر تغيير الصورة على الغلاف */}
          <button
            type="button"
            onClick={() => coverInputRef.current?.click()}
            disabled={uploadingCover}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2.5 rounded-full backdrop-blur-md transition-all flex items-center gap-2 text-sm font-medium"
          >
            <Camera size={18} />
            <span className="hidden sm:inline">
              {uploadingCover ? "Uploading..." : "Change Cover"}
            </span>
          </button>
        </div>

        <div className="px-8 pb-10 relative">
          {/* الصورة الشخصية (Avatar) */}
          <div className="absolute -top-20">
            <div className="relative w-40 h-40 group">
              <img
                src={avatarUrl}
                alt={profileData?.name || "profile"}
                className="w-40 h-40 rounded-full border-4 border-white dark:border-slate-950 object-cover shadow-xl"
              />
              {/* زر تغيير الأفاتار فوق الصورة */}
              <button
                type="button"
                onClick={() => avatarInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white"
              >
                <Camera size={28} />
              </button>
            </div>
          </div>

          <div className="pt-28 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <h1 className="text-5xl font-extrabold text-slate-950 dark:text-white">
                  {profileData?.name || user?.name}
                </h1>

                <span className="bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-2 rounded-full text-sm font-semibold capitalize">
                  {profileData?.role || user?.role || "Member"}
                </span>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-lg">
                {profileData?.email || user?.email || "sports member"} • SportsHub Member
              </p>

              {/* الشرح الشخصي Bio */}
              {profileData?.profile?.bio && (
                <p className="text-slate-700 dark:text-slate-300 mt-3 max-w-2xl">
                  {profileData.profile.bio}
                </p>
              )}

              {/* الطول والوزن */}
              {(profileData?.profile?.height || profileData?.profile?.weight) && (
                <div className="flex gap-4 mt-3 text-sm font-medium text-slate-600 dark:text-slate-400">
                  {profileData?.profile?.height && (
                    <span>
                      Height: <strong className="text-slate-900 dark:text-white">{profileData.profile.height} cm</strong>
                    </span>
                  )}
                  {profileData?.profile?.weight && (
                    <span>
                      Weight: <strong className="text-slate-900 dark:text-white">{profileData.profile.weight} kg</strong>
                    </span>
                  )}
                </div>
              )}

              {isCoach && profileData?.sport?.name && (
                <div className="mt-4 inline-flex items-center gap-2 bg-blue-500/10 text-blue-500 px-4 py-2 rounded-xl font-semibold">
                  🏆 Coach of {profileData.sport.name}
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
              {/* قسم مستويات الـ XP */}
              <div className="mt-10 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <p className="text-slate-600 dark:text-slate-400">Level System</p>
                    <h2 className="text-3xl font-bold text-slate-950 dark:text-white">
                      Level {xpData.level} • {xpData.levelTitle}
                    </h2>
                  </div>
                  <div className="flex items-center gap-2 text-red-500 dark:text-red-400 font-bold">
                    <Zap size={22} />
                    {xpData.xp} XP
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-4 overflow-hidden">
                  <div
                    className="bg-red-500 h-4 transition-all"
                    style={{ width: `${xpData.xpProgress}%` }}
                  />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                  {xpData.xpProgress} / 100 XP to next level
                </p>
              </div>

              {/* قسم مقاييس الأداء والإحصائيات */}
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
                        key={stat._id || stat.id}
                        className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl"
                      >
                        <p className="text-slate-500 dark:text-slate-400 uppercase text-xs font-bold tracking-wider">
                          {stat.metric || stat._id}
                        </p>
                        <div className="mt-2 flex items-baseline justify-between">
                          <div>
                            <span className="text-xs text-slate-400">Latest: </span>
                            <span className="text-xl font-bold text-slate-950 dark:text-white">
                              {stat.latest || "—"}
                            </span>
                          </div>
                          <div>
                            <span className="text-xs text-slate-400">Best: </span>
                            <span className="text-xl font-bold text-emerald-500">
                              {stat.best || "—"}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-slate-500">
                          Avg: {stat.average || "—"} • Records: {stat.count || 0}
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

              {isAthlete && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                    Sport
                  </label>
                  <select
                    name="sport"
                    value={formData.sport}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Sport</option>
                    {availableSports.map((sport) => (
                      <option key={sport._id} value={sport._id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {isCoach && (
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                    Coach Sport
                  </label>
                  <select
                    name="coachSport"
                    value={formData.coachSport}
                    onChange={handleChange}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-red-500 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Sport</option>
                    {availableSports.map((sport) => (
                      <option key={sport._id} value={sport._id}>
                        {sport.name}
                      </option>
                    ))}
                  </select>
                </div>
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