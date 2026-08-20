import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Calendar,
  Eye,
  MessageSquare,
  Trash2,
  Plus,
} from "lucide-react";

import {
  addProgress,
  deleteProgress,
  getAllTraineesProgress,
} from "../services/progressService";
import { CustomAlert } from "../components/CustomAlert";
import { getMyTrainees } from "../services/dashboardService";
import { getAllSports } from "../services/sportsService";
import { useAuth } from "../context/AuthContext"; // 👈 استدعاء سياق المصادقة لجلب بيانات المدرب

function DashboardProgressReviews() {
  const { user } = useAuth(); // 👈 جلب بيانات المستخدم الحالية (role, sport)
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // حالات مودال الإضافة
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [trainees, setTrainees] = useState([]);
  const [sports, setSports] = useState([]);
  const [formData, setFormData] = useState({
    userId: "",
    sportId: "",
    metric: "weight",
    value: "",
    note: "",
  });

  useEffect(() => {
    loadRequests();
    loadDropdownData();
  }, []);

  // 👈 اختيار رياضة الكوتش تلقائياً عند فتح المودال
  useEffect(() => {
    if (isAddModalOpen && user?.role === "coach") {
      const coachSportId = user?.sport?._id || user?.sport;
      if (coachSportId) {
        setFormData((prev) => ({ ...prev, sportId: coachSportId }));
      }
    }
  }, [isAddModalOpen, user]);

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

  const loadDropdownData = async () => {
    try {
      const traineesRes = await getMyTrainees();
      const sportsRes = await getAllSports();
      setTrainees(traineesRes?.data || traineesRes || []);
      setSports(sportsRes?.data || sportsRes || []);
    } catch (error) {
      console.error("Error loading dropdown options:", error);
    }
  };

  const handleCreateProgress = async (e) => {
    e.preventDefault();
    try {
      await addProgress({
        userId: formData.userId,
        sportId: formData.sportId,
        metric: formData.metric,
        value: Number(formData.value),
        note: formData.note,
      });

      CustomAlert.success("Record Added", "Trainee progress record created successfully.");
      await loadRequests();
      setIsAddModalOpen(false);
      setFormData({ userId: "", sportId: "", metric: "weight", value: "", note: "" });
    } catch (error) {
      console.error("Error adding progress record:", error);
      CustomAlert.error(error, "Failed to Add Progress");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    const confirmed = await CustomAlert.confirmDelete(
      "Delete Progress Record",
      "Are you sure you want to delete this progress record? This action cannot be undone."
    );

    if (!confirmed) return;

    try {
      await deleteProgress(requestId);
      CustomAlert.success("Deleted", "Progress record deleted successfully.");
      await loadRequests();
      if (selectedRequest && (selectedRequest.id === requestId || selectedRequest._id === requestId)) {
        setSelectedRequest(null);
      }
    } catch (error) {
      console.error("Error deleting record:", error);
      CustomAlert.error(error, "Failed to Delete Record");
    }
  };

  const totalRecords = requests.length;

  return (
    <main className="p-10 text-white">
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-5"
      >
        <div>
          <span className="bg-blue-500/10 text-blue-400 px-4 py-2 rounded-full font-semibold">
            Progress Management
          </span>

          <h1 className="text-5xl font-extrabold mt-6 mb-4">
            Trainees Progress Logs
          </h1>

          <p className="text-slate-400 text-lg">
            Monitor your trainees&apos; performance metrics, track measurements, and manage training progress history.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-4 rounded-2xl transition shadow-lg shrink-0"
        >
          <Plus size={20} />
          Add Trainee Progress
        </button>
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
                      onClick={() => setSelectedRequest(request)}
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

      {/* Modal إضافة سجل جديد للمتدرب */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <form onSubmit={handleCreateProgress} className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-xl w-full space-y-4">
            <h2 className="text-3xl font-bold mb-4">Add Trainee Progress</h2>

            <div>
              <label className="block text-slate-400 mb-1">Select Trainee</label>
              <select
                required
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
              >
                <option value="">Select Trainee...</option>
                {trainees.map((t) => (
                  <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                ))}
              </select>
            </div>

            {/* 🔒 قسم اختيار الرياضة المعدل */}
            <div>
              <label className="block text-slate-400 mb-1">Select Sport</label>
              <select
                required
                disabled={user?.role === "coach"} // 👈 تجميد القائمة للمدرب لمنع تغيير الرياضة
                value={formData.sportId}
                onChange={(e) => setFormData({ ...formData, sportId: e.target.value })}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <option value="">Select Sport...</option>
                {sports.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-400 mb-1">Metric</label>
                <select
                  value={formData.metric}
                  onChange={(e) => setFormData({ ...formData, metric: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
                >
                  <option value="weight">Weight</option>
                  <option value="reps">Reps</option>
                  <option value="time">Time</option>
                  <option value="distance">Distance</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Value</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={formData.value}
                  onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                  placeholder="e.g. 75"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Note (Optional)</label>
              <textarea
                rows="3"
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="Add notes or feedback..."
                className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-white outline-none"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-semibold transition">
                Save Record
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal تفاصيل السجل */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            <h2 className="text-3xl font-bold mb-2">Progress Details</h2>

            <p className="text-slate-400 mb-6">
              Trainee: {selectedRequest.user?.name || "Trainee"}
            </p>

            <div className="bg-slate-800 rounded-2xl p-5 mb-6 space-y-3">
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Sport:</span> {selectedRequest.sport?.name || "Sport"}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Metric:</span> {selectedRequest.metric}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Value:</span> {selectedRequest.value}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Note / Feedback:</span> {selectedRequest.note || "No note attached"}
              </p>
              <p className="text-slate-300">
                <span className="text-slate-400 font-medium">Recorded At:</span> {selectedRequest.recordedAt ? new Date(selectedRequest.recordedAt).toLocaleString() : "N/A"}
              </p>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={() => handleDeleteRequest(selectedRequest.id || selectedRequest._id)}
                className="bg-red-500/10 hover:bg-red-500/20 text-red-400 py-4 px-6 rounded-xl font-semibold transition flex items-center justify-center gap-2"
              >
                <Trash2 size={18} />
                Delete Record
              </button>

              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 py-4 px-6 rounded-xl font-semibold transition"
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