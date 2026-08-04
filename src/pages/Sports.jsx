import SportCard from "../components/sports/SportCard";

import Container from "../components/ui/Container";
import SectionTitle from "../components/ui/SectionTitle";

import { sports } from "../data/sportsData";

function Sports() {
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
            <SectionTitle
              title="Available Sports"
            />

            <p className="text-slate-400">
              {sports.length} sports available
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sports.map((sport) => (
              <SportCard
                key={sport.id}
                sport={sport}
              />
            ))}
          </div>
        </section>
      </Container>
    </main>
  );
}

export default Sports;