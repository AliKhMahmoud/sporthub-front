import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Search,
  Trophy,
  UserPlus,
  MessageCircle,
  Phone, // 🟢 تم إضافة أيقونة الهاتف
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getApprovedCoaches } from "../services/coachService";
import {
  getMyTrainingRequests,
  createTrainingRequest,
} from "../services/trainingRequestService";
import { startConversation } from "../services/chatService";
import { CustomAlert } from "../components/CustomAlert";

function Coaches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user?.id || user?._id;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [sportsOptions, setSportsOptions] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [requests, setRequests] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // 1. جلب الرياضات عند تحميل الصفحة
  useEffect(() => {
    const fetchSports = async () => {
      try {
        const response = await fetch(`${API_URL}/sports`);
        const data = await response.json();
        const sportsList = data.data || data;

        if (Array.isArray(sportsList) && sportsList.length > 0) {
          setSportsOptions(sportsList);
          setSelectedSportId(sportsList[0]._id);
        }
      } catch (err) {
        console.error("Failed to fetch sports:", err);
      }
    };

    fetchSports();
  }, [API_URL]);

  // 2. جلب المدربين والطلبات بناءً على الرياضة المختارة
  useEffect(() => {
    if (!selectedSportId) return;

    const loadData = async () => {
      try {
        const coachesData = await getApprovedCoaches(selectedSportId);
        const coachesList = coachesData?.data?.data || coachesData?.data || coachesData;
        setCoaches(Array.isArray(coachesList) ? coachesList : []);

        const requestsData = await getMyTrainingRequests();
        const requestsList = requestsData?.data?.data || requestsData?.data || requestsData;
        setRequests(Array.isArray(requestsList) ? requestsList : []);
      } catch (error) {
        console.error("Error loading coaches or requests:", error);
        setCoaches([]);
        setRequests([]);
      }
    };

    loadData();
  }, [selectedSportId]);

  // دالة لجلب حالة الطلب مع التأكد من مقارنة جميع احتمالات الـ IDs
  const getRequestStatus = (coach) => {
    const coachProfileId = coach.id || coach._id;
    const coachUserId = coach?.user?._id || coach?.user || coach?.userId?._id || coach?.userId;

    const existingRequest = requests.find((request) => {
      const reqCoachId = String(request.coach?._id || request.coach?.id || request.coach);
      return (
        reqCoachId === String(coachProfileId) ||
        (coachUserId && reqCoachId === String(coachUserId))
      );
    });

    return existingRequest?.status || null;
  };

  // إرسال طلب تدريب جديد
  const requestTraining = async (coach) => {
    if (!currentUserId) return;

    const coachId = coach.user?._id || coach.user || coach.id || coach._id;

    try {
      const result = await createTrainingRequest({
        coachId,
        message: `${user?.name || "An athlete"} wants to train with you.`,
      });

      if (result) {
        CustomAlert.success("Request Sent", "Training request sent successfully!");
        const updatedRequests = await getMyTrainingRequests();
        const requestsList = updatedRequests?.data?.data || updatedRequests?.data || updatedRequests;
        setRequests(Array.isArray(requestsList) ? requestsList : []);
      }
    } catch (error) {
      console.error("Error sending training request:", error);
      CustomAlert.error(error, "Failed to Send Request");
    }
  };

  // ✅ معالجة فتح المحادثة بعد التحقق من حالة الطلب واستخراج الـ User ID
  const handleOpenChat = async (coach) => {
    const requestStatus = getRequestStatus(coach);

    // 🔴 1. حالة عدم وجود طلب تدريب
    if (!requestStatus) {
      CustomAlert.warning(
        "Training Request Required",
        "You must send a training request to the coach and have it accepted before starting a chat."
      );
      return;
    }

    // 🟡 2. حالة الطلب قيد الانتظار
    if (requestStatus === "pending") {
      CustomAlert.warning(
        "Request Pending",
        "Your training request is currently pending. You can chat once the coach accepts your request."
      );
      return;
    }

    // ❌ 3. حالة الطلب المرفوض
    if (requestStatus === "rejected") {
      CustomAlert.error(
        "Request Rejected",
        "The coach has declined your training request. You cannot start a chat."
      );
      return;
    }

    // 🟢 4. استخراج معرف حساب المستخدم للمدرب (User ID)
    const coachUserId =
      coach?.user?._id ||
      coach?.user ||
      coach?.userId?._id ||
      coach?.userId ||
      coach?._id ||
      coach?.id;

    try {
      const response = await startConversation({ coachId: coachUserId });
      
      const resData = response?.data || response;
      
      // التوجيه بواسطة معرف المحادثة المسترجع
      const conversationId = 
        resData?.conversation?._id || 
        resData?.conversation?.id || 
        resData?._id || 
        resData?.id;

      if (conversationId) {
        navigate(`/chat/${conversationId}`);
      } else {
        navigate(`/chat/${coachUserId}`);
      }
    } catch (error) {
      console.error("Error starting chat:", error);
      CustomAlert.error(error, "Chat Access Denied");
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-16">
      <div className="mb-10">
        <span className="text-red-500 font-semibold">
          Find Your Coach
        </span>

        <h1 className="text-5xl font-extrabold mt-3 text-slate-950 dark:text-white">
          Choose a coach by sport
        </h1>

        <p className="text-slate-600 dark:text-slate-400 mt-4 text-lg">
          Browse approved coaches, check their experience, and send a training request.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 mb-10">
        <label className="flex items-center gap-2 text-slate-950 dark:text-white font-semibold mb-3">
          <Search size={18} />
          Select Sport
        </label>

        <select
          value={selectedSportId}
          onChange={(event) => setSelectedSportId(event.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
        >
          {sportsOptions.map((sportItem) => (
            <option key={sportItem._id} value={sportItem._id}>
              {sportItem.name}
            </option>
          ))}
        </select>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No approved coaches found for this sport yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coaches.map((coach) => {
            const coachId = coach.id || coach._id;
            const requestStatus = getRequestStatus(coach);

            return (
              <div
                key={coachId}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between"
              >
                <div>
                  <img
                    src={coach.avatar || "https://i.pravatar.cc/150"}
                    alt={coach.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-red-500/20 mb-5"
                  />

                  <h2 className="text-2xl font-bold text-slate-950 dark:text-white">
                    {coach.name}
                  </h2>

                  <p className="text-slate-500 mt-2">
                    {coach.email}
                  </p>

                  <div className="mt-4 inline-flex items-center gap-2 bg-red-500/10 text-red-500 px-4 py-2 rounded-xl font-semibold">
                    <Trophy size={18} />
                    Coach
                  </div>

                  <div className="mt-5 space-y-3 text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Age:</strong>{" "}
                      {coach.age || "Not specified"}
                    </p>

                    {/* 🟢 عرض رقم الهاتف هنا */}
                    <p className="flex items-center gap-2">
                      <Phone size={17} />
                      {coach.phone || coach.phoneNumber || "Phone not specified"}
                    </p>

                    <p>
                      <strong>Experience:</strong>{" "}
                      {coach.experienceYears
                        ? `${coach.experienceYears} years`
                        : "Not specified"}
                    </p>

                    <p className="flex items-center gap-2">
                      <CalendarDays size={17} />
                      {Array.isArray(coach.workingDays)
                        ? coach.workingDays.join(", ")
                        : coach.workingDays || "Working days not specified"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={17} />
                      {coach.workingHours || "Working hours not specified"}
                    </p>

                    {coach.certificates && (
                      <p>
                        <strong>Certificates:</strong>{" "}
                        {Array.isArray(coach.certificates)
                          ? coach.certificates.join(", ")
                          : coach.certificates}
                      </p>
                    )}

                    {coach.bio && (
                      <p className="leading-7">
                        {coach.bio}
                      </p>
                    )}
                  </div>
                </div>

                {/* Buttons Section */}
                <div className="mt-6 space-y-3">
                  {requestStatus === "pending" && (
                    <button
                      disabled
                      className="w-full bg-yellow-500/20 text-yellow-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Request Pending
                    </button>
                  )}

                  {requestStatus === "accepted" && (
                    <button
                      disabled
                      className="w-full bg-emerald-500/20 text-emerald-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Request Accepted
                    </button>
                  )}

                  {requestStatus === "rejected" && (
                    <button
                      disabled
                      className="w-full bg-red-500/20 text-red-500 py-3 rounded-xl font-semibold cursor-not-allowed"
                    >
                      Request Rejected
                    </button>
                  )}

                  {!requestStatus && (
                    <button
                      type="button"
                      onClick={() => requestTraining(coach)}
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <UserPlus size={18} />
                      Request Training
                    </button>
                  )}

                  {/* ✅ Send Message Button */}
                  <button
                    type="button"
                    onClick={() => handleOpenChat(coach)}
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle size={18} />
                    Send Message
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Coaches;