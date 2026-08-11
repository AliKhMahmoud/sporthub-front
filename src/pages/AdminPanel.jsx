import { useEffect, useState } from "react";
import {
  approveCoachRequest,
  deleteUser,
  getPendingCoachRequests,
  getUsers,
  rejectCoachRequest,
} from "../services/adminService";
import { CustomAlert } from "../components/CustomAlert";
import { Trash2, Shield, User, Users, Clock, CheckCircle } from "lucide-react";

function AdminPanel() {
  const [activeTab, setActiveTab] = useState("requests"); // 'requests' | 'users'

  // Coach Requests State
  const [coachRequests, setCoachRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  // Users Management State
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [roleFilter, setRoleFilter] = useState(""); // "" (All), "athlete", "coach", "admin"

  useEffect(() => {
    if (activeTab === "requests") {
      loadRequests();
    } else if (activeTab === "users") {
      loadUsers();
    }
  }, [activeTab, roleFilter]);

  // ─── 1. Load Coach Requests ──────────────────────────────────────────────
  const loadRequests = async () => {
    setLoadingRequests(true);
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
      CustomAlert.error(error, "Failed to load coach requests");
    } finally {
      setLoadingRequests(false);
    }
  };

  // ─── 2. Load Users ───────────────────────────────────────────────────────
  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;

      const response = await getUsers(params);
      const usersData =
        response?.data?.users ||
        response?.users ||
        response?.data ||
        response;

      setUsers(Array.isArray(usersData) ? usersData : []);
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
      CustomAlert.error(error, "Failed to load users list");
    } finally {
      setLoadingUsers(false);
    }
  };

  // ─── 3. Approve Coach ────────────────────────────────────────────────────
  const approveCoach = async (coach) => {
    const isConfirmed = await CustomAlert.confirmAdd(
      "Confirm Approval",
      `Are you sure you want to approve the application for coach ${coach.name}?`
    );

    if (!isConfirmed) return;

    try {
      const coachId = coach._id || coach.id;
      await approveCoachRequest(coachId);
      CustomAlert.success("Approved Successfully", `Coach ${coach.name}'s account has been approved.`);
      loadRequests();
    } catch (error) {
      CustomAlert.error(error, "Failed to approve coach request");
    }
  };

  // ─── 4. Reject Coach ────────────────────────────────────────────────────
  const rejectCoach = async (coach) => {
    const isConfirmed = await CustomAlert.confirmDelete(
      "Confirm Rejection",
      `Are you sure you want to reject the application for coach ${coach.name}?`,
      "Yes, Reject Request"
    );

    if (!isConfirmed) return;

    try {
      const coachId = coach._id || coach.id;
      await rejectCoachRequest(coachId);
      CustomAlert.success("Rejected", `Coach ${coach.name}'s request has been rejected.`);
      loadRequests();
    } catch (error) {
      CustomAlert.error(error, "Failed to reject coach request");
    }
  };

  // ─── 5. Delete / Deactivate User ─────────────────────────────────────────
  const handleDeleteUser = async (user) => {
    const userId = user._id || user.id;

    const isConfirmed = await CustomAlert.confirmDelete(
      "Confirm User Deletion",
      `Are you sure you want to delete/deactivate user "${user.name}"? This action cannot be undone.`,
      "Yes, Delete User"
    );

    if (!isConfirmed) return;

    try {
      await deleteUser(userId);
      CustomAlert.success("User Deleted", `User "${user.name}" has been deleted successfully.`);
      loadUsers();
    } catch (error) {
      CustomAlert.error(error, "Failed to delete user");
    }
  };

  // Helper Badge Color for Roles
  const getRoleBadge = (role) => {
    switch (role) {
      case "admin":
        return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
      case "coach":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-12">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-950 dark:text-white">
              Admin Control Center
            </h1>
            <p className="text-slate-500 mt-1">
              Manage coach requests and system users efficiently.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 mb-8 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("requests")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "requests"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Clock size={18} />
            <span>Pending Coach Requests</span>
            {coachRequests.length > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-white text-red-600 rounded-full font-bold">
                {coachRequests.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "users"
                ? "bg-red-600 text-white shadow-sm"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
            }`}
          >
            <Users size={18} />
            <span>Users Management</span>
          </button>
        </div>

        {/* ─── TAB 1: COACH REQUESTS ───────────────────────────────────────── */}
        {activeTab === "requests" && (
          <div>
            {loadingRequests ? (
              <div className="text-center py-12 text-slate-500 animate-pulse">Loading requests...</div>
            ) : coachRequests.length === 0 ? (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-12 text-center text-slate-600 dark:text-slate-400 border border-dashed border-slate-300 dark:border-slate-700">
                <CheckCircle size={40} className="mx-auto mb-3 text-emerald-500 opacity-80" />
                <p className="text-lg font-medium">No pending coach requests available.</p>
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
                      className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50/50 dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition"
                    >
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                            {coach.name}
                          </h3>
                          <p className="text-slate-500 text-sm">{coach.email}</p>
                        </div>
                        <span className="self-start sm:self-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20">
                          Sport: {sportName}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 text-sm text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800/60 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                        <p><strong>Age:</strong> {coach.age || "Not specified"}</p>
                        <p><strong>Experience:</strong> {coach.experienceYears ? `${coach.experienceYears} years` : "Not specified"}</p>
                        <p><strong>Working Days:</strong> {workingDaysText || "Not specified"}</p>
                        <p><strong>Working Hours:</strong> {coach.workingHours || "Not specified"}</p>
                      </div>

                      {certificatesText && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-4">
                          <strong>Certificates:</strong> {certificatesText}
                        </p>
                      )}

                      {coach.bio && (
                        <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed italic">
                          "{coach.bio}"
                        </p>
                      )}

                      <div className="flex gap-3 mt-6">
                        <button
                          type="button"
                          onClick={() => approveCoach(coach)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer active:scale-95 shadow-sm"
                        >
                          Approve Coach
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectCoach(coach)}
                          className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition cursor-pointer active:scale-95 shadow-sm"
                        >
                          Reject Request
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── TAB 2: USERS MANAGEMENT TABLE ───────────────────────────────── */}
        {activeTab === "users" && (
          <div>
            {/* Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Filter by Role:</span>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white text-sm rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                >
                  <option value="">All Roles</option>
                  <option value="athlete">Athletes</option>
                  <option value="coach">Coaches</option>
                  <option value="admin">Admins</option>
                </select>
              </div>

              <span className="text-xs text-slate-500">
                Total fetched: <strong>{users.length}</strong> users
              </span>
            </div>

            {/* Users Table */}
            {loadingUsers ? (
              <div className="text-center py-12 text-slate-500 animate-pulse">Loading users list...</div>
            ) : users.length === 0 ? (
              <div className="bg-slate-100 dark:bg-slate-800/50 rounded-2xl p-12 text-center text-slate-600 dark:text-slate-400">
                No users found matching your criteria.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                      <th className="py-4 px-6">User</th>
                      <th className="py-4 px-6">Role</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6">Joined Date</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-sm">
                    {users.map((user) => {
                      const userId = user._id || user.id;

                      return (
                        <tr
                          key={userId}
                          className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors"
                        >
                          {/* User Info */}
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 overflow-hidden shrink-0">
                                {user.avatar ? (
                                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                  user.name?.charAt(0)?.toUpperCase() || <User size={20} />
                                )}
                              </div>
                              <div className="truncate max-w-xs">
                                <p className="font-semibold text-slate-900 dark:text-white truncate">
                                  {user.name}
                                </p>
                                <p className="text-slate-500 text-xs truncate">{user.email}</p>
                              </div>
                            </div>
                          </td>

                          {/* Role Badge */}
                          <td className="py-4 px-6">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadge(
                                user.role
                              )}`}
                            >
                              {user.role === "admin" && <Shield size={12} />}
                              {user.role}
                            </span>
                          </td>

                          {/* Account Status */}
                          <td className="py-4 px-6">
                            {user.isActive !== false ? (
                              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                                Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs text-red-500 font-medium">
                                <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                Inactive
                              </span>
                            )}
                          </td>

                          {/* Joined Date */}
                          <td className="py-4 px-6 text-slate-500 text-xs">
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                })
                              : "N/A"}
                          </td>

                          {/* Delete Action */}
                          <td className="py-4 px-6 text-right">
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user)}
                              title="Delete User"
                              className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-500/10 dark:hover:bg-red-500/20 transition cursor-pointer"
                            >
                              <Trash2 size={18} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}

export default AdminPanel;