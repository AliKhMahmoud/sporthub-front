import { useMemo, useState } from "react";
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
  getTrainingRequests,
  createTrainingRequest,
} from "../services/trainingRequestService";

import { createNotification } from "../services/notificationService";

import { useEffect } from "react";

const sportsOptions = [
  "Fitness",
  "Boxing",
  "Bodybuilding",
  "Karate",
  "Taekwondo",
];

function Coaches() {
  const { user } = useAuth();

  const currentUserId = user?.id || user?.email;

  const [selectedSport, setSelectedSport] = useState("Fitness");
  const [requests, setRequests] = useState([]);

  const [coaches, setCoaches] = useState([]);

useEffect(() => {
  const loadData = async () => {
    const coachesData =
      await getApprovedCoaches(selectedSport);

    const requestsData =
      await getTrainingRequests();

    setCoaches(coachesData);
    setRequests(requestsData);
  };

  loadData();
}, [selectedSport]);

  

  const getRequestStatus = (coach) => {
    const coachId = coach.id || coach.email;

    const existingRequest = requests.find(
      (request) =>
        String(request.athleteId) === String(currentUserId) &&
        String(request.coachId) === String(coachId)
    );

    return existingRequest?.status || null;
  };

  const requestTraining = async (coach) => {
  if (!currentUserId) return;

  const coachId = coach.id || coach.email;

  const result =
    await createTrainingRequest({
      athleteId: currentUserId,
      athleteName: user?.name || "Athlete",
      athleteEmail: user?.email || "",
      coachId,
      coachName: coach.name,
      coachEmail: coach.email,
      sport: coach.coachSport,
      message: `${
        user?.name || "An athlete"
      } wants to train with you.`,
    });

  if (!result.success) return;

  const updatedRequests =
    await getTrainingRequests();

  setRequests(updatedRequests);

  await createNotification({
    type: "training_request",
    title: "New Training Request",
    message: `${
      user?.name || "An athlete"
    } requested training with you.`,
    userId: coachId,
    senderId: currentUserId,
    requestId: result.request.id,
    link: "/dashboard/athletes",
  });
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
            const requestStatus = getRequestStatus(coach);

            return (
              <div
                key={coach.id || coach.email}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6"
              >
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
                  Coach for {coach.coachSport}
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

                {requestStatus === "pending" && (
                  <button
                    disabled
                    className="mt-6 w-full bg-yellow-500/20 text-yellow-500 py-3 rounded-xl font-semibold"
                  >
                    Request Pending
                  </button>
                )}

                {requestStatus === "accepted" && (
                  <button
                    disabled
                    className="mt-6 w-full bg-emerald-500/20 text-emerald-500 py-3 rounded-xl font-semibold"
                  >
                    Request Accepted
                  </button>
                )}

                {requestStatus === "rejected" && (
                  <button
                    disabled
                    className="mt-6 w-full bg-red-500/20 text-red-500 py-3 rounded-xl font-semibold"
                  >
                    Request Rejected
                  </button>
                )}
                {!requestStatus && (
                  <button
                    type="button"
                    onClick={() => requestTraining(coach)}
                    className="mt-6 w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                  >
                    <UserPlus size={18} />
                    Request Training
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default Coaches;