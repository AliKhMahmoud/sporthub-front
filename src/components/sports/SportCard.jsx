import { Link } from "react-router-dom";

function SportCard({ sport }) {
  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:scale-105 transition duration-300">
      <img
        src={sport.image}
        alt={sport.name}
        className="w-full h-60 object-cover"
      />

      <div className="p-6">
        <h2 className="text-white text-2xl font-bold mb-3">
          {sport.name}
        </h2>

        <p className="text-slate-400 mb-5">
          {sport.description}
        </p>

        <Link
          to={`/sports/${sport.slug}`}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition inline-block"
        >
          Explore
        </Link>
      </div>
    </div>
  );
}

export default SportCard;