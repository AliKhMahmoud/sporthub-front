import { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Search,
  Trophy,
  UserPlus,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import { getApprovedCoaches } from "../services/coachService";
import {
  getMyTrainingRequests,
  createTrainingRequest,
} from "../services/trainingRequestService";

const sportsOptions = [
  "Fitness",
  "Boxing",
  "Bodybuilding",
  "Karate",
  "Taekwondo",
];

function Coaches() {
  const { user } = useAuth();
  const currentUserId = user?.id || user?._id;

  const [selectedSport, setSelectedSport] = useState("Fitness");
  const [requests, setRequests] = useState([]);
  const [coaches, setCoaches] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const coachesData = await getApprovedCoaches(selectedSport);
        setCoaches(coachesData || []);

        const requestsData = await getMyTrainingRequests();
        setRequests(requestsData.data || requestsData || []);
      } catch (error) {
        console.error("Error loading coaches or requests:", error);
      }
    };

    loadData();
  }, [selectedSport]);

  const getRequestStatus = (coach) => {
    const coachId = coach.id || coach._id;

    // الباك إند يخزن الطلب كـ ID أو كـ Object في خانة coach
    const existingRequest = requests.find((request) => {
      const reqCoachId = request.coach?._id || request.coach;
      return String(reqCoachId) === String(coachId);
    });

    return existingRequest?.status || null;
  };

  const requestTraining = async (coach) => {
    if (!currentUserId) return;

    const coachId = coach.id || coach._id;

    try {
      // إرسال البيانات بالطريقة المطابقة تماماً للباك إند Controller
      const result = await createTrainingRequest({
        coachId,
        message: `${user?.name || "An athlete"} wants to train with you.`,
      });

      if (result) {
        // تحديث قائمة الطلبات محلياً بعد الإرسال الناجح
        const updatedRequests = await getMyTrainingRequests();
        setRequests(updatedRequests.data || updatedRequests || []);
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
          value={selectedSport}
          onChange={(event) => setSelectedSport(event.target.value)}
          className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-slate-900 dark:text-white"
        >
          {sportsOptions.map((sport) => (
            <option key={sport} value={sport}>
              {sport}
            </option>
          ))}
        </select>
      </div>

      {coaches.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <p className="text-slate-500 dark:text-slate-400">
            No approved coaches found for {selectedSport} yet.
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
                    Coach for {coach.coachSport || selectedSport}
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
                      {coach.workingDays || "Working days not specified"}
                    </p>

                    <p className="flex items-center gap-2">
                      <Clock size={17} />
                      {coach.workingHours || "Working hours not specified"}
                    </p>

                    {coach.certificates && (
                      <p>
                        <strong>Certificates:</strong>{" "}
                        {coach.certificates}
                      </p>
                    )}

                    {coach.bio && (
                      <p className="leading-7">
                        {coach.bio}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6">
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