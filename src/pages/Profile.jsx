import { useEffect, useState } from "react";
import {
  Award,
  Camera,
  CheckCircle,
  Flame,
  Heart,
  Medal,
  MessageCircle,
  ShieldCheck,
  Star,
  Trophy,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "framer-motion";

import {
  getProfile,
  updateProfile,
} from "../services/profileService";

import Button from "../components/ui/Button";
import Input from "../components/ui/Input";

import { useAuth } from "../context/AuthContext";

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

  const [profilePosts, setProfilePosts] = useState([]);
  const [accountActivity, setAccountActivity] = useState([]);
  const [aiPlans, setAiPlans] = useState([]);
  const [normalWorkouts, setNormalWorkouts] = useState([]);

  const [profileStats, setProfileStats] = useState({
    forumPosts: 0,
    likesReceived: 0,
    commentsReceived: 0,
    averageProgress: 0,
    acceptedAthletes: 0,
    pendingRequests: 0,
    coachRating: 0,
  });

  // الحقول النصية للنموذج
  const [formData, setFormData] = useState({
    name: user?.name || "",
    about: user?.bio || user?.about || "",
    phone: user?.phone || "",
    height: user?.height || "",
    weight: user?.weight || "",
    coachSport: user?.coachSport || "Fitness",
  });

  // حقول الملفات الفعلية المرفوعة من الجهاز
  const [avatarFile, setAvatarFile] = useState(null);
  const [coverFile, setCoverFile] = useState(null);

  // معاينة الصور بصرياً أثناء التعديل
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar || "https://i.pravatar.cc/150"
  );
  const [coverPreview, setCoverPreview] = useState(
    user?.cover ||
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1600&auto=format&fit=crop"
  );

  useEffect(() => {
    const loadProfile = async () => {
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
      } catch (error) {
        console.error(error);
      }
    };

    loadProfile();
  }, [user]);

  const userPosts = profilePosts;
  const receivedLikes = profileStats.likesReceived || 0;
  const receivedComments = profileStats.commentsReceived || 0;

  const trainingSports = [
    ...new Set(
      normalWorkouts
        .map((workout) => workout.sport)
        .filter(Boolean)
    ),
  ];

  const totalAiPlans = aiPlans.length;
  const totalNormalPlans = normalWorkouts.length;
  const totalPlans = totalAiPlans + totalNormalPlans;

  const completedAiPlans = aiPlans.filter((plan) => {
    const totalDays = plan.plan?.days?.length || 0;
    const completedDays = plan.completedDays || [];
    return totalDays > 0 && completedDays.length === totalDays;
  }).length;

  const completedNormalPlans = normalWorkouts.filter(
    (workout) => {
      const exercises = workout.exercises || [];
      const completed = workout.completedExercises || [];
      return exercises.length > 0 && completed.length === exercises.length;
    }
  ).length;

  const completedPlans = completedAiPlans + completedNormalPlans;

  const aiProgress = aiPlans.reduce((sum, plan) => {
    const totalDays = plan.plan?.days?.length || 0;
    const completedDays = plan.completedDays || [];
    if (totalDays === 0) return sum;
    return sum + Math.round((completedDays.length / totalDays) * 100);
  }, 0);

  const normalProgress = normalWorkouts.reduce(
    (sum, workout) => {
      const exercises = workout.exercises || [];
      const completed = workout.completedExercises || [];
      if (exercises.length === 0) return sum;
      return sum + Math.round((completed.length / exercises.length) * 100);
    },
    0
  );

  const averageProgress =
    profileStats.averageProgress ||
    (totalPlans > 0 ? Math.round((aiProgress + normalProgress) / totalPlans) : 0);

  const ratedPlans = aiPlans.filter(
    (plan) => Number(plan.coachRating) > 0
  );

  const totalComments = aiPlans.reduce(
    (sum, plan) => sum + (plan.comments?.length || 0),
    0
  );

  const xp =
    totalPlans * 20 +
    completedPlans * 50 +
    totalComments * 5 +
    ratedPlans.length * 10 +
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

  const trainingDates = normalWorkouts
    .map((workout) =>
      workout.startedAt ? new Date(workout.startedAt).toDateString() : null
    )
    .filter(Boolean);

  const uniqueTrainingDates = [...new Set(trainingDates)];
  const currentStreak = uniqueTrainingDates.length > 0 ? uniqueTrainingDates.length : 0;

  const badges = [
    { icon: <Award size={22} />, title: "First Workout", unlocked: totalPlans >= 1 },
    { icon: <Flame size={22} />, title: "Progress Maker", unlocked: averageProgress >= 50 },
    { icon: <Trophy size={22} />, title: "Plan Finisher", unlocked: completedPlans >= 1 },
    { icon: <ShieldCheck size={22} />, title: "Consistent Athlete", unlocked: currentStreak >= 3 },
    { icon: <Star size={22} />, title: "Coach Reviewer", unlocked: ratedPlans.length >= 1 },
  ];

  const achievements = [
    { icon: <Trophy size={22} />, title: "Training Plans", description: `Created ${totalPlans} total training plans.` },
    { icon: <Flame size={22} />, title: "Training Progress", description: `Average progress is ${averageProgress}%.` },
    { icon: <Medal size={22} />, title: "Completed Plans", description: `Completed ${completedPlans} training plans.` },
    { icon: <CheckCircle size={22} />, title: "Forum Activity", description: `${userPosts.length} posts, ${receivedComments} comments received.` },
  ];

  const recentTrainingHistory = normalWorkouts.slice(0, 5).map((workout) => {
    const totalExercises = workout.exercises?.length || 0;
    const completedExercises = workout.completedExercises?.length || 0;
    const progress = totalExercises > 0 ? Math.round((completedExercises / totalExercises) * 100) : 0;
    return {
      id: workout.id,
      sport: workout.sport,
      title: workout.title,
      level: workout.level,
      progress,
    };
  });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // معالجة اختيار الملفات من الجهاز سواء من الواجهة الرئيسية أو من نافذة الـ Modal
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
      // تجهيز FormData تماماً كما يتوقع الباك اند (Multer)
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
      const updatedUser = result.user || result;

      login(updatedUser);
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
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

          {/* باقي تفاصيل الواجهة حسب الـ Role */}
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

              <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mt-6">
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400">Training Plans</p>
                  <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{totalPlans}</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400">Completed Plans</p>
                  <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{completedPlans}</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400">Comments</p>
                  <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{totalComments}</h3>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl">
                  <p className="text-slate-500 dark:text-slate-400">Progress</p>
                  <h3 className="text-3xl font-bold text-slate-950 dark:text-white">{averageProgress}%</h3>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.section>

      {/* نافذة التعديل (Edit Profile Modal) - مع رفع الملفات من الجهاز */}
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

              {/* اختيار صورة الأفاتار من نافذة الـ Modal */}
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

              {/* اختيار صورة الكفر من نافذة الـ Modal */}
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
    </main>
  );
}

export default Profile;