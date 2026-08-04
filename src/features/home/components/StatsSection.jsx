import { useEffect, useRef, useState } from "react";
import { Users, Dumbbell, MessageCircle, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";

const stats = [
  {
    icon: <Users size={30} />,
    image:
      "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?q=80&w=500&auto=format&fit=crop",
    value: 1200,
    suffix: "+",
    label: "Active Athletes",
    link: "/profile",
  },
  {
    icon: <Dumbbell size={30} />,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=500&auto=format&fit=crop",
    value: 350,
    suffix: "+",
    label: "Training Plans",
    link: "/sports",
  },
  {
    icon: <MessageCircle size={30} />,
    image:
      "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=500&auto=format&fit=crop",
    value: 85,
    suffix: "+",
    label: "Forum Posts",
    link: "/forum",
  },
  {
    icon: <Trophy size={30} />,
    image:
      "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=500&auto=format&fit=crop",
    value: 24,
    suffix: "+",
    label: "Sport Categories",
    link: "/sports",
  },
];

function AnimatedNumber({ value, suffix }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    let start = 0;
    const duration = 1200;
    const stepTime = 20;
    const increment = value / (duration / stepTime);

    const timer = setInterval(() => {
      start += increment;

      if (start >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

function StatsSection() {
  return (
    <section className="pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            whileHover={{ y: -8, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 220 }}
          >
            <Link
              to={stat.link}
              className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-red-500 transition shadow-sm dark:shadow-none block min-h-[260px]"
            >
              <img
                src={stat.image}
                alt={stat.label}
                className="absolute inset-0 w-full h-full object-cover opacity-35 dark:opacity-40"
              />

              <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/70 to-white dark:from-slate-900/60 dark:via-slate-900/70 dark:to-slate-900" />

              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 dark:text-red-400 flex items-center justify-center mb-6 backdrop-blur-sm">
                  {stat.icon}
                </div>

                <h3 className="text-4xl font-extrabold text-slate-950 dark:text-white mb-2">
                  <AnimatedNumber value={stat.value} suffix={stat.suffix} />
                </h3>

                <p className="text-slate-700 dark:text-slate-300 font-medium">
                  {stat.label}
                </p>

                <span className="inline-block mt-6 text-sm font-semibold text-red-500 dark:text-red-400">
                  View details →
                </span>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default StatsSection;