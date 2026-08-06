import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Eye,
  MessageSquare,
  XCircle,
} from "lucide-react";

import {
  getProgressReviewRequests,
  approveProgressReview,
  rejectProgressReview,
} from "../services/trainingProgressService";

function DashboardProgressReviews() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [coachNote, setCoachNote] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getProgressReviewRequests();
      setRequests(data || []);
    } catch (error) {
      console.error(error);
      setRequests([]);
    }
  };

  const approveRequest = async (requestId) => {
    try {
      await approveProgressReview(requestId, {
        coachNote,
      });

      await loadRequests();
      setSelectedRequest(null);
      setCoachNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const rejectRequest = async (requestId) => {
    try {
      await rejectProgressReview(requestId, {
        coachNote,
      });

      await loadRequests();
      setSelectedRequest(null);
      setCoachNote("");
    } catch (error) {
      console.error(error);
    }
  };

  const pendingCount = requests.filter(
    (item) => item.status === "pending"
  ).length;

  const approvedCount = requests.filter(
    (item) => item.status === "approved"
  ).length;

  const rejectedCount = requests.filter(
    (item) => item.status === "rejected"
  ).length;

  return (
    <main className="p-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-semibold">
          Progress Reviews
        </span>

        <h1 className="text-5xl font-extrabold mt-6 mb-4">
          Athlete Progress Requests
        </h1>

        <p className="text-slate-400 text-lg">
          Review athletes&apos; training progress requests, approve progress,
          reject requests, and add coaching notes.
        </p>
      </motion.div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <Clock size={28} className="text-yellow-400 mb-4" />
          <p className="text-slate-400 mb-2">Pending</p>
          <h2 className="text-4xl font-bold">{pendingCount}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <CheckCircle size={28} className="text-emerald-400 mb-4" />
          <p className="text-slate-400 mb-2">Approved</p>
          <h2 className="text-4xl font-bold">{approvedCount}</h2>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <XCircle size={28} className="text-red-400 mb-4" />
          <p className="text-slate-400 mb-2">Rejected</p>
          <h2 className="text-4xl font-bold">{rejectedCount}</h2>
        </div>
      </section>

      {requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <MessageSquare
            size={60}
            className="mx-auto text-blue-400 mb-5"
          />

          <h2 className="text-3xl font-bold mb-3">
            No Review Requests
          </h2>

          <p className="text-slate-400">
            Athlete progress review requests will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const requestId = request.id || request._id;
            const athleteName = request.athlete?.name || request.athleteName || "Athlete";
            const planTitle = request.plan?.title || request.planTitle || "Training Plan";
            const sportName = request.sport?.name || request.sport || "Sport";
            const progressVal = request.currentProgress ?? request.progress ?? 0;

            return (
              <motion.div
                key={requestId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {athleteName}
                    </h2>

                    <p className="text-slate-400 mt-2">
                      Plan: {planTitle}
                    </p>

                    <p className="text-slate-400">
                      Sport: {sportName}
                    </p>

                    <p className="text-slate-400">
                      Current Progress: {progressVal}%
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(request);
                        setCoachNote(request.coachNote || "");
                      }}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition"
                    >
                      <Eye size={18} />
                      View
                    </button>

                    <span
                      className={
                        "px-4 py-3 rounded-xl text-sm font-semibold " +
                        (request.status === "approved"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : request.status === "rejected"
                          ? "bg-red-500/10 text-red-400"
                          : "bg-yellow-500/10 text-yellow-400")
                      }
                    >
                      {request.status}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">
              Review Progress
            </h2>

            <p className="text-slate-400 mb-6">
              Athlete: {selectedRequest.athlete?.name || selectedRequest.athleteName || "Athlete"}
            </p>

            <div className="bg-slate-800 rounded-2xl p-5 mb-6">
              <p className="text-slate-400 mb-2">
                Plan: {selectedRequest.plan?.title || selectedRequest.planTitle || "Training Plan"}
              </p>

              <p className="text-slate-400 mb-2">
                Sport: {selectedRequest.sport?.name || selectedRequest.sport || "Sport"}
              </p>

              <p className="text-slate-400">
                Current Progress: {selectedRequest.currentProgress ?? selectedRequest.progress ?? 0}%
              </p>
            </div>

            <textarea
              value={coachNote}
              onChange={(event) =>
                setCoachNote(event.target.value)
              }
              placeholder="Write a coaching note..."
              rows="5"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 text-white"
            />

            <div className="flex flex-col md:flex-row gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  approveRequest(selectedRequest.id || selectedRequest._id)
                }
                className="flex-1 bg-emerald-500 hover:bg-emerald-600 py-4 rounded-xl font-semibold transition"
              >
                Approve Progress
              </button>

              <button
                type="button"
                onClick={() =>
                  rejectRequest(selectedRequest.id || selectedRequest._id)
                }
                className="flex-1 bg-red-500 hover:bg-red-600 py-4 rounded-xl font-semibold transition"
              >
                Reject Request
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedRequest(null);
                setCoachNote("");
              }}
              className="mt-4 w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-xl font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardProgressReviews;