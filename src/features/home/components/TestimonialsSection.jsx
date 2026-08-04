import { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import player1 from "../../../assets/sports/player-1.jpg";
import player2 from "../../../assets/sports/player-2.jpg";
import player3 from "../../../assets/sports/player-3.jpg";

const testimonials = [
  {
    name: "Michael Carter",
    role: "Fitness Athlete",
    image: player1,
    rating: 5,
    review:
      "SportsHub completely changed the way I train and interact with other athletes.",
  },
  {
    name: "Sarah Wilson",
    role: "Boxing Coach",
    image: player2,
    rating: 4,
    review:
      "The community and training plans are incredibly motivating and professional.",
  },
  {
    name: "David Lee",
    role: "Bodybuilder",
    image: player3,
    rating: 5,
    review:
      "One of the best sports platforms I have used. Clean, modern, and inspiring.",
  },
];

function TestimonialsSection() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="pb-24 overflow-hidden">
      <div className="text-center mb-14">
        <span className="bg-red-500/10 text-red-500 dark:text-red-400 px-4 py-2 rounded-full font-semibold">
          Athlete Reviews
        </span>

        <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
          What Athletes Say
        </h2>

        <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Real feedback from athletes who train and grow with SportsHub.
        </p>
      </div>

      <motion.div
        animate={isPaused ? { x: "0%" } : { x: ["0%", "-50%"] }}
        transition={{
          repeat: isPaused ? 0 : Infinity,
          duration: 18,
          ease: "linear",
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        className="flex gap-6 w-max"
      >
        {[...testimonials, ...testimonials].map((testimonial, index) => (
          <div
            key={index}
            className="w-[360px] bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-7 shadow-sm dark:shadow-none"
          >
            <div className="flex items-center gap-4 mb-5">
              <img
                src={testimonial.image}
                alt={testimonial.name}
                className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
              />

              <div>
                <h3 className="text-xl font-bold text-slate-950 dark:text-white">
                  {testimonial.name}
                </h3>

                <p className="text-slate-600 dark:text-slate-400">
                  {testimonial.role}
                </p>
              </div>
            </div>

            <div className="flex gap-1 mb-4 text-yellow-400">
              {[...Array(5)].map((_, starIndex) => (
                <Star
                  key={starIndex}
                  size={18}
                  fill={
                    starIndex < testimonial.rating
                      ? "currentColor"
                      : "transparent"
                  }
                />
              ))}
            </div>

            <p className="text-slate-700 dark:text-slate-300 leading-8">
              “{testimonial.review}”
            </p>
          </div>
        ))}
      </motion.div>
    </section>
  );
}

export default TestimonialsSection;