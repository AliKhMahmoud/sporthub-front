import { useState, useEffect } from "react";
import SportCard from "../components/sports/SportCard";
import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";
import { getAllSports, deleteSport } from "../services/sportsService";
import { useAuth } from "../context/AuthContext";
import { CustomAlert } from "../components/CustomAlert";

function Sports() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // جلب بيانات المستخدم لمعرفة الدور (Role)
  const { user } = useAuth() || {};
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchSports();
  }, []);

  const fetchSports = async () => {
    try {
      setLoading(true);
      const data = await getAllSports();
      setSports(data.data || data);
    } catch (err) {
      console.error("Error fetching sports:", err);
      setError("Failed to load sports. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // ─── دالة التعامل مع حذف الرياضة ──────────────────────────────────────
  const handleDeleteSport = async (sport) => {
    const isConfirmed = await CustomAlert.confirmDelete(
      "Delete Sport",
      `Are you sure you want to delete "${sport.name}"? This will deactivate the sport in the system.`,
      "Yes, Delete Sport"
    );

    if (!isConfirmed) return;

    try {
      const sportId = sport._id || sport.id;
      await deleteSport(sportId);

      // تحديث القائمة فوراً بعد الحذف
      setSports((prevSports) =>
        prevSports.filter((item) => (item._id || item.id) !== sportId)
      );

      CustomAlert.success(
        "Sport Deleted",
        `"${sport.name}" has been deleted successfully.`
      );
    } catch (err) {
      console.error("Error deleting sport:", err);
      CustomAlert.error(err, "Failed to delete sport");
    }
  };

  return (
    <main className="py-16">
      <Container>
        <section className="bg-slate-900 rounded-3xl p-8 border border-slate-800 mb-12">
          <SectionTitle
            title="Explore Sports"
            subtitle="Choose your favorite sport, explore training plans, join discussions, and start improving your fitness journey."
          />
        </section>

        <section>
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <SectionTitle title="Available Sports" />

            <p className="text-slate-400">
              {loading ? "Loading..." : `${sports.length} sports available`}
            </p>
          </div>

          {/* حالة التحميل */}
          {loading && (
            <div className="text-center py-12 text-slate-400 animate-pulse">
              Loading sports from database...
            </div>
          )}

          {/* حالة الخطأ */}
          {error && (
            <div className="text-center py-12 text-red-500 font-medium">
              {error}
            </div>
          )}

          {/* عرض الرياضات عند نجاح الجلب */}
          {!loading && !error && (
            <>
              {sports.length === 0 ? (
                <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-2xl border border-slate-800">
                  No active sports found at the moment.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sports.map((sport) => (
                    <SportCard
                      key={sport._id || sport.id}
                      sport={sport}
                      isAdmin={isAdmin}
                      onDelete={() => handleDeleteSport(sport)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </Container>
    </main>
  );
}

export default Sports;