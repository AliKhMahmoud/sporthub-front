import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 text-slate-950 dark:bg-slate-950 dark:border-slate-800 dark:text-white">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <h2 className="text-2xl font-bold text-red-500 mb-3">
            SportsHub
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Train, connect, and grow with your favorite sports community.
          </p>
        </div>

        <div>
          <h3 className="font-bold mb-3 text-slate-950 dark:text-white">
            Quick Links
          </h3>

          <ul className="space-y-2 text-slate-600 dark:text-slate-400">
            <li>
              <Link to="/" className="hover:text-red-500 transition">
                Home
              </Link>
            </li>

            <li>
              <Link to="/sports" className="hover:text-red-500 transition">
                Sports
              </Link>
            </li>

            <li>
              <Link to="/forum" className="hover:text-red-500 transition">
                Forum
              </Link>
            </li>

            <li>
              <Link to="/profile" className="hover:text-red-500 transition">
                Profile
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-bold mb-3 text-slate-950 dark:text-white">
            Sports
          </h3>

          <div className="flex flex-wrap gap-2">
            {["Bodybuilding", "Boxing", "Taekwondo", "Karate", "Fitness"].map(
              (sport) => (
                <Link
                  key={sport}
                  to="/sports"
                  className="text-slate-600 dark:text-slate-400 hover:text-red-500 transition"
                >
                  {sport}
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-slate-500 dark:text-slate-500 py-4 border-t border-slate-200 dark:border-slate-800">
        © 2026 SportsHub. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;