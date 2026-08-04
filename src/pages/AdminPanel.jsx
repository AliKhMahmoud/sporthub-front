import { useEffect, useState } from "react";

import {
  approveCoachRequest,
  getPendingCoachRequests,
  rejectCoachRequest,
} from "../services/adminService";

import { createNotification } from "../services/notificationService";

function AdminPanel() {
  const [coachRequests, setCoachRequests] = useState([]);

  useEffect(() => {
    loadRequests();
  }, []);
  console.log("1");
  const loadRequests = async () => {
    try {
      const response = await getPendingCoachRequests();
      
      // استخراج المصفوفة بأمان بغض النظر عن هيكلية استجابة السيرفر
      const requestsData =
        response?.data?.requests ||
        response?.data ||
        response?.requests ||
        response;

      // التأكد التام من أن النتيجة مصفوفة لمنع أخطاء الـ map
      setCoachRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Error loading coach requests:", error);
      setCoachRequests([]);
    }
  };

  const approveCoach = async (coach) => {
    try {
      const coachId = coach._id || coach.id; // التقاط الـ ID بشكل صحيح سواء كان _id أو id
      await approveCoachRequest(coachId);

      await createNotification({
        type: "coach_status",
        userId: coachId,
        title: "Coach Request Approved",
        message: "Congratulations! Your coach account has been approved.",
        link: "/profile",
      });

      loadRequests();
    } catch (error) {
      console.error("Error approving coach:", error);
    }
  };

  const rejectCoach = async (coach) => {
    try {
      const coachId = coach._id || coach.id; // التقاط الـ ID بشكل صحيح سواء كان _id أو id
      await rejectCoachRequest(coachId);

      await createNotification({
        type: "coach_status",
        userId: coachId,
        title: "Coach Request Rejected",
        message: "Unfortunately your coach request was rejected.",
        link: "/profile",
      });

      loadRequests();
    } catch (error) {
      console.error("Error rejecting coach:", error);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
        <h1 className="text-4xl font-bold mb-2 text-slate-950 dark:text-white">
          Admin Panel
        </h1>

        <p className="text-slate-500 mb-8">
          Manage coach requests.
        </p>

        {coachRequests.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-600 dark:text-slate-300">
            No pending coach requests.
          </div>
        ) : (
          <div className="space-y-5">
            {coachRequests.map((coach) => (
              <div
                key={coach.id}
                className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6"
              >
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {coach.name}
                </h3>

                <p className="text-slate-500 mt-2">
                  {coach.email}
                </p>

                <p className="text-red-500 mt-2 font-semibold">
                  Coach for {coach.coachSport || "Not selected"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-slate-600 dark:text-slate-300">
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

                  <p>
                    <strong>Working Days:</strong>{" "}
                    {coach.workingDays || "Not specified"}
                  </p>

                  <p>
                    <strong>Working Hours:</strong>{" "}
                    {coach.workingHours || "Not specified"}
                  </p>
                </div>

                {coach.certificates && (
                  <p className="text-slate-600 dark:text-slate-300 mt-4">
                    <strong>Certificates:</strong>{" "}
                    {coach.certificates}
                  </p>
                )}

                {coach.bio && (
                  <p className="text-slate-600 dark:text-slate-300 mt-4 leading-7">
                    {coach.bio}
                  </p>
                )}

                <div className="flex gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => approveCoach(coach)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl transition"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => rejectCoach(coach)}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;