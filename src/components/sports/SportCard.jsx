import { Link } from "react-router-dom";

function SportCard({ sport }) {
  return (
    <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-lg hover:scale-105 transition duration-300 flex flex-col h-full">
      <img
        src={sport.image}
        alt={sport.name}
        className="w-full h-60 object-cover"
      />

      {/* اجعل حاوية المحتوى flex لتوزيع العناصر ودفع الزر للأسفل */}
      <div className="p-6 flex flex-col flex-grow">
        <h2 className="text-white text-2xl font-bold mb-3">
          {sport.name}
        </h2>

        {/* مساحة مرنة للوصف */}
        <p className="text-slate-400 mb-6 flex-grow">
          {sport.description}
        </p>

        {/* الزر سيستقر تلقائياً في الأسفل تماماً لجميع الكروت */}
        <div>
          <Link
            to={`/sports/${sport._id}`}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl transition inline-block text-center"
          >
            Explore
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SportCard;