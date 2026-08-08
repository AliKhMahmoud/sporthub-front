import { useState, useEffect } from "react";
import SportCard from "../components/sports/SportCard";
import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";
import { getAllSports } from "../services/sportsService";

function Sports() {
  const [sports, setSports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log("Sports component rendered. Current sports state:", sports);
  useEffect(() => {
    const fetchSports = async () => {
      try {
        setLoading(true);
        const data = await getAllSports();
        // اعتماداً على هيكل استجابة الباك إند لديك (إذا كانت البيانات داخل data.data أو data مباشرة)
        setSports(data.data || data);
      } catch (err) {
        console.error("Error fetching sports:", err);
        setError("Failed to load sports. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSports();
  }, []);

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
            <div className="text-center py-12 text-slate-400">
              Loading sports from database...
            </div>
          )}

          {/* حالة الخطأ */}
          {error && (
            <div className="text-center py-12 text-red-500">
              {error}
            </div>
          )}

          {/* عرض الرياضات عند نجاح الجلب */}
          {!loading && !error && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sports.map((sport) => (
                <SportCard
                  key={sport._id} // تم التعديل من id إلى _id لأنه من MongoDB
                  sport={sport}
                />
              ))}
            </div>
          )}
        </section>
      </Container>
    </main>
  );
}

export default Sports;