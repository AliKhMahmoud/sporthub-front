import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Eye,
  MessageSquare,
  Trash2,
} from "lucide-react";

import {
  addProgress,
  deleteProgress,
  getAllTraineesProgress,
} from "../services/progressService";

function DashboardProgressReviews() {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [coachNote, setCoachNote] = useState("");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getAllTraineesProgress();
      const requestsArray = Array.isArray(data) ? data : data?.data || [];
      setRequests(requestsArray);
    } catch (error) {
      console.error("Error loading progress records:", error);
      setRequests([]);
    }
  };

  const handleUpdateNote = async (progressId) => {
    try {
      // استخدام addProgress لإضافة أو تحديث الملاحظة المرتبطة بالسجل إذا لزم الأمر
      await addProgress({
        progressId,
        note: coachNote,
      });

      await loadRequests();
      setSelectedRequest(null);
      setCoachNote("");
    } catch (error) {
      console.error("Error updating progress note:", error);
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Are you sure you want to delete this progress record?")) return;
    try {
      await deleteProgress(requestId);
      await loadRequests();
      if (selectedRequest && (selectedRequest.id === requestId || selectedRequest._id === requestId)) {
        setSelectedRequest(null);
        setCoachNote("");
      }
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const totalRecords = requests.length;

  return (
    <main className="p-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-semibold">
          Progress Management
        </span>

        <h1 className="text-5xl font-extrabold mt-6 mb-4">
          Trainees Progress Logs
        </h1>

        <p className="text-slate-400 text-lg">
          Monitor your trainees&apos; performance metrics, track measurements, and manage training progress history.
        </p>
      </motion.div>

      <section className="grid grid-cols-1 md:grid-cols-1 gap-5 mb-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex items-center gap-5">
          <div className="p-4 bg-blue-500/10 text-blue-400 rounded-2xl">
            <Activity size={32} />
          </div>
          <div>
            <p className="text-slate-400 mb-1">Total Progress Records</p>
            <h2 className="text-4xl font-bold">{totalRecords}</h2>
          </div>
        </div>
      </section>

      {requests.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center">
          <MessageSquare
            size={60}
            className="mx-auto text-blue-400 mb-5"
          />

          <h2 className="text-3xl font-bold mb-3">
            No Progress Records Found
          </h2>

          <p className="text-slate-400">
            Trainees performance metrics and progress logs will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => {
            const requestId = request.id || request._id;
            const athleteName = request.user?.name || request.athleteName || "Trainee";
            const sportName = request.sport?.name || request.sport || "Sport";
            const metric = request.metric || "Metric";
            const value = request.value ?? 0;
            const note = request.note || "No notes provided";
            const recordedDate = request.recordedAt ? new Date(request.recordedAt).toLocaleDateString() : "";

            return (
              <motion.div
                key={requestId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-bold">
                        {athleteName}
                      </h2>
                      <span className="bg-slate-800 text-blue-400 text-xs px-3 py-1 rounded-full font-medium">
                        {sportName}
                      </span>
                    </div>

                    <p className="text-slate-300 font-semibold mt-1">
                      Metric: <span className="text-blue-400">{metric}</span> = <span className="text-emerald-400">{value}</span>
                    </p>

                    <p className="text-slate-400 text-sm mt-1">
                      Note: {note}
                    </p>

                    {recordedDate && (
                      <p className="text-slate-500 text-xs mt-2 flex items-center gap-1">
                        <Calendar size={14} /> {recordedDate}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRequest(request);
                        setCoachNote(request.note || "");
                      }}
                      className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 px-4 py-3 rounded-xl transition"
                    >
                      <Eye size={18} />
                      View Details
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRequest(requestId)}
                      className="p-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition"
                      title="Delete Record"
                    >
                      <Trash2 size={18} />
                    </button>
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
              Progress Details
            </h2>

            <p className="text-slate-400 mb-6">
              Trainee: {selectedRequest.user?.name || "Trainee"}
            </p>

            <div className="bg-slate-800 rounded-2xl p-5 mb-6 space-y-2">
              <p className="text-slate-300">
                <span className="text-slate-400">Sport:</span> {selectedRequest.sport?.name || "Sport"}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Metric:</span> {selectedRequest.metric}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Value:</span> {selectedRequest.value}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400">Recorded At:</span> {selectedRequest.recordedAt ? new Date(selectedRequest.recordedAt).toLocaleString() : ""}
              </p>
            </div>

            <label className="block text-slate-400 mb-2 font-medium">Coach Note / Feedback</label>
            <textarea
              value={coachNote}
              onChange={(event) =>
                setCoachNote(event.target.value)
              }
              placeholder="Add a note or feedback for this metric..."
              rows="4"
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 outline-none focus:border-blue-500 text-white"
            />

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() =>
                  handleUpdateNote(selectedRequest.id || selectedRequest._id)
                }
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-semibold transition"
              >
                Save Note
              </button>

              <button
                type="button"
                onClick={() => handleDeleteRequest(selectedRequest.id || selectedRequest._id)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-4 px-6 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRequest(null);
                  setCoachNote("");
                }}
                className="bg-slate-700 hover:bg-slate-600 py-4 px-6 rounded-xl font-semibold transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default DashboardProgressReviews;