import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  Search,
  Trophy,
  UserPlus,
  MessageCircle,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getApprovedCoaches } from "../services/coachService";
import {
  getMyTrainingRequests,
  createTrainingRequest,
} from "../services/trainingRequestService";

function Coaches() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentUserId = user?.id || user?._id;
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

  const [sportsOptions, setSportsOptions] = useState([]);
  const [selectedSportId, setSelectedSportId] = useState("");
  const [requests, setRequests] = useState([]);
  const [coaches, setCoaches] = useState([]);

  // 1. جلب الرياضات أولاً عند تحميل الصفحة
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

  // 2. جلب المدربين والطلبات بناءً على الـ _id للرياضة المختارة
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

  const getRequestStatus = (coach) => {
    const coachId = coach.id || coach._id;

    const existingRequest = requests.find((request) => {
      const reqCoachId = request.coach?._id || request.coach?.id || request.coach;
      return String(reqCoachId) === String(coachId);
    });

    return existingRequest?.status || null;
  };

  const requestTraining = async (coach) => {
    if (!currentUserId) return;

    const coachId = coach.id || coach._id;

    try {
      const result = await createTrainingRequest({
        coachId,
        message: `${user?.name || "An athlete"} wants to train with you.`,
      });

      if (result) {
        const updatedRequests = await getMyTrainingRequests();
        const requestsList = updatedRequests?.data?.data || updatedRequests?.data || updatedRequests;
        setRequests(Array.isArray(requestsList) ? requestsList : []);
      }
    } catch (error) {
      console.error("Error sending training request:", error);
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

                  {/* ✅ Send Message Button - موجودة دايماً */}
                  <button
                    type="button"
                    onClick={() => navigate(`/chat/${coachId}`)}
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