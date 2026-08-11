import { useEffect, useState } from "react";
import {
  approveCoachRequest,
  getPendingCoachRequests,
  rejectCoachRequest,
} from "../services/adminService";
import { CustomAlert } from "../components/CustomAlert";

function AdminPanel() {
  const [coachRequests, setCoachRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const response = await getPendingCoachRequests("pending");

      const requestsData =
        response?.data?.requests ||
        response?.data ||
        response;

      setCoachRequests(Array.isArray(requestsData) ? requestsData : []);
    } catch (error) {
      console.error("Error loading coach requests:", error);
      setCoachRequests([]);
      // Alert when failing to load requests
      CustomAlert.error(error, "Failed to load coach requests");
    } finally {
      setLoading(false);
    }
  };

  const approveCoach = async (coach) => {
    // 1. Ask for confirmation
    const isConfirmed = await CustomAlert.confirmAdd(
      "Confirm Approval",
      `Are you sure you want to approve the application for coach ${coach.name}?`
    );

    if (!isConfirmed) return;

    try {
      const coachId = coach._id || coach.id;
      await approveCoachRequest(coachId);

      // 2. Show success alert
      CustomAlert.success("Approved Successfully", `Coach ${coach.name}'s account has been approved.`);
      loadRequests();
    } catch (error) {
      // 3. Show error alert
      CustomAlert.error(error, "Failed to approve coach request");
    }
  };

  const rejectCoach = async (coach) => {
    // 1. Ask for rejection confirmation
    const isConfirmed = await CustomAlert.confirmDelete(
      "Confirm Rejection",
      `Are you sure you want to reject the application for coach ${coach.name}?`,
      "Yes, Reject Request"
    );

    if (!isConfirmed) return;

    try {
      const coachId = coach._id || coach.id;
      await rejectCoachRequest(coachId);

      // 2. Show success alert
      CustomAlert.success("Rejected", `Coach ${coach.name}'s request has been rejected.`);
      loadRequests();
    } catch (error) {
      // 3. Show error alert
      CustomAlert.error(error, "Failed to reject coach request");
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

        {loading ? (
          <div className="text-center py-8 text-slate-500">Loading requests...</div>
        ) : coachRequests.length === 0 ? (
          <div className="bg-slate-100 dark:bg-slate-800 rounded-2xl p-8 text-center text-slate-600 dark:text-slate-300">
            No pending coach requests.
          </div>
        ) : (
          <div className="space-y-5">
            {coachRequests.map((coach) => {
              const coachId = coach._id || coach.id;

              const sportName = typeof coach.sport === "object"
                ? coach.sport?.name
                : coach.sport || "Not selected";

              const workingDaysText = Array.isArray(coach.workingDays)
                ? coach.workingDays.join(", ")
                : coach.workingDays;

              const certificatesText = Array.isArray(coach.certificates)
                ? coach.certificates.join(", ")
                : coach.certificates;

              return (
                <div
                  key={coachId}
                  className="border border-slate-200 dark:border-slate-700 rounded-2xl p-6"
                >
                  <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                    {coach.name}
                  </h3>

                  <p className="text-slate-500 mt-2">
                    {coach.email}
                  </p>

                  <p className="text-red-500 mt-2 font-semibold">
                    Coach for {sportName}
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
                      {workingDaysText || "Not specified"}
                    </p>

                    <p>
                      <strong>Working Hours:</strong>{" "}
                      {coach.workingHours || "Not specified"}
                    </p>
                  </div>

                  {certificatesText && (
                    <p className="text-slate-600 dark:text-slate-300 mt-4">
                      <strong>Certificates:</strong>{" "}
                      {certificatesText}
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
                      className="bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-3 rounded-xl transition cursor-pointer"
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      onClick={() => rejectCoach(coach)}
                      className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-xl transition cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;