import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import ForumPostCard from "../features/forum/components/ForumPostCard";
import SportCard from "../components/sports/SportCard";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import CommunityActivity from "../features/home/components/CommunityActivity";

import { useAuth } from "../context/AuthContext";

import { sports } from "../data/sportsData";
import heroImage from "../assets/sports/sports-hero.jpg";

import { getHomeData } from "../services/homeService";

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

function Home() {
  const { user, isAthlete, isCoach } = useAuth();

  const [latestPosts, setLatestPosts] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [aiPlans, setAiPlans] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const data = await getHomeData();

        const users = data?.users || [];

        setLatestPosts(data?.posts || data?.latestPosts || []);

        setCoaches(
          data?.coaches ||
            users.filter((item) => item.role === "coach")
        );

        setAiPlans(data?.aiPlans || []);
        setWorkouts(data?.workouts || []);
      } catch (error) {
        console.error(error);
        setLatestPosts([]);
        setCoaches([]);
        setAiPlans([]);
        setWorkouts([]);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const featuredCoaches = coaches.slice(0, 3);
  const recentAiPlans = aiPlans.slice(0, 3);

  const sportUsage = sports.map((sport) => {
    const count = workouts.filter(
      (workout) => workout.sport === sport.name
    ).length;

    return {
      ...sport,
      count,
    };
  });

  const topActiveSports = sportUsage
    .filter((sport) => sport.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const platformHighlights = [
    {
      label: "Available Sports",
      value: sports.length,
      description: "Sports categories ready for athletes.",
    },
    {
      label: "Specialized Coaches",
      value: coaches.length,
      description: "Coaches available by sport specialty.",
    },
    {
      label: "AI Training Plans",
      value: aiPlans.length,
      description: "Personalized plans created by athletes.",
    },
    {
      label: "Started Workouts",
      value: workouts.length,
      description: "Training sessions started by athletes.",
    },
  ];

  const renderHeroActions = () => {
    if (!user) {
      return (
        <>
          <Link to="/register">
            <Button className="text-lg px-8 py-4">
              Get Started
            </Button>
          </Link>

          <Link to="/login">
            <Button
              variant="outline"
              className="text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:text-red-400"
            >
              Sign In
            </Button>
          </Link>
        </>
      );
    }

    if (isAthlete) {
      return (
        <>
          <Link to="/coaches">
            <Button className="text-lg px-8 py-4">
              Find a Coach
            </Button>
          </Link>

          <Link to="/ai-trainer">
            <Button
              variant="outline"
              className="text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:text-red-400"
            >
              AI Trainer
            </Button>
          </Link>
        </>
      );
    }

    if (isCoach) {
      return (
        <>
          <Link to="/dashboard">
            <Button className="text-lg px-8 py-4">
              Dashboard
            </Button>
          </Link>
          <Link to="/dashboard/chats">
            <Button
              variant="outline"
              className="text-lg px-8 py-4 bg-white/10 backdrop-blur-md border-white/30 text-white hover:text-red-400"
            >
              Coach Messages
            </Button>
          </Link>
        </>
      );
    }

    return null;
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-slate-950 dark:text-white">
        Loading...
      </main>
    );
  }

  return (
    <main>
      <section className="relative min-h-[88vh] flex items-center justify-center overflow-hidden mb-24">
        <img
          src={heroImage}
          alt="Sports training"
          className="absolute inset-0 w-full h-full object-cover blur-[2px] scale-105"
        />

        <div className="absolute inset-0 bg-black/65" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.8,
            ease: "easeOut",
          }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
            }}
            className="inline-block bg-red-500/20 text-red-300 border border-red-500/30 px-4 py-2 rounded-full font-semibold mb-6"
          >
            Your Sports Community
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.35,
            }}
            className="text-5xl md:text-7xl font-extrabold mb-6 text-white leading-tight"
          >
            Train Harder. Connect Better. Grow Stronger.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.5,
            }}
            className="text-slate-200 text-xl max-w-2xl mx-auto mb-8 leading-8"
          >
            Build your athletic journey with smart training plans,
            real coaches, sport communities, and progress tracking.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.65,
            }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {renderHeroActions()}
          </motion.div>
        </motion.div>
      </section>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-10 gap-4"
        >
          <div>
            <h2 className="text-4xl font-bold mb-2 text-slate-950 dark:text-white">
              Featured Sports
            </h2>

            <p className="text-slate-600 dark:text-slate-400">
              Explore the most popular sports on SportsHub.
            </p>
          </div>

          <Link to="/sports">
            <Button
              variant="secondary"
              className="flex items-center gap-3 group"
            >
              <div>
                <p className="font-semibold text-slate-950 dark:text-white">
                  View All Sports
                </p>

                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {sports.length} Sports Available
                </p>
              </div>
              <span className="text-2xl text-red-500 group-hover:translate-x-1 transition">
                →
              </span>
            </Button>
          </Link>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sports.slice(0, 3).map((sport, index) => (
            <motion.div
              key={sport.id}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: index * 0.15,
              }}
            >
              <SportCard sport={sport} />
            </motion.div>
          ))}
        </div>
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-semibold">
            Platform Highlights
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
            What Makes SportsHub Powerful?
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Important platform statistics generated from real user activity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {platformHighlights.map((item) => (
            <motion.div
              key={item.label}
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center"
            >
              <h3 className="text-5xl font-extrabold text-red-500 mb-4">
                {item.value}
              </h3>

              <p className="text-xl font-bold text-slate-950 dark:text-white">
                {item.label}
              </p>

              <p className="text-slate-500 mt-3">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-semibold">
            Most Active Sports
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
            Community Activity Trends
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Sports currently attracting the highest athlete activity.
          </p>
        </motion.div>

        {topActiveSports.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-slate-500">
              No training activity yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-4 gap-6">
            {topActiveSports.map((sport) => (
              <motion.div
                key={sport.id}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 text-center"
              >
                <h3 className="text-2xl font-bold text-red-500">
                  {sport.name}
                </h3>
                <p className="mt-4 text-slate-500">
                  {sport.count} active workouts
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-semibold">
            Coaches
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
            Available Specialized Coaches
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Coaches registered on SportsHub by sport specialty.
          </p>
        </motion.div>

        {featuredCoaches.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-slate-500">
              No coaches registered yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featuredCoaches.map((coach, index) => (
  <motion.div
    key={coach.id || coach.email || index}
    variants={fadeUp}
    initial="hidden"
    whileInView="visible"
    viewport={{ once: true }}
    transition={{
      duration: 0.6,
      delay: index * 0.15,
    }}
    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"
  >
    <img
      src={coach.avatar || "https://i.pravatar.cc/150"}
      alt={coach.name || "Coach"}
      className="w-20 h-20 rounded-full object-cover border-4 border-red-500/20 mb-5"
    />

    <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
      {coach.name || "Coach"}
    </h3>

    <p className="text-red-500 font-semibold mt-2">
      Coach for {coach.coachSport || "General Fitness"}
    </p>

    <Link to="/coaches">
      <Button className="mt-5 w-full">
        View Coaches
      </Button>
    </Link>
  </motion.div>
))}
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <span className="bg-red-500/10 text-red-500 px-4 py-2 rounded-full font-semibold">
            AI Training
          </span>

          <h2 className="text-4xl font-bold mt-6 mb-4 text-slate-950 dark:text-white">
            Latest AI Training Plans
          </h2>

          <p className="text-slate-600 dark:text-slate-400">
            Recent AI plans generated by athletes on SportsHub.
          </p>
        </motion.div>

        {recentAiPlans.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-slate-500">
              No AI plans generated yet.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {recentAiPlans.map((plan, index) => (
              <motion.div
                key={plan.id || index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8"
              >
                <h3 className="text-2xl font-bold text-slate-950 dark:text-white">
                  {plan.plan?.title ||
                    plan.title ||
                    "AI Training Plan"}
                </h3>

                <p className="text-red-500 font-semibold mt-3">
                  {plan.sport || "General Training"}
                </p>

                <p className="text-slate-500 mt-4">
                  Status: {plan.status || "Pending Review"}
                </p>
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10"
        >
          <div>
            <h2 className="text-4xl font-bold text-slate-950 dark:text-white mb-3">
              Latest Forum Posts
            </h2>

            <p className="text-slate-600 dark:text-slate-400">
              Discover the newest discussions from athletes.
            </p>
          </div>

          <Link to="/forum">
            <Button>View Forum</Button>
          </Link>
        </motion.div>

        {latestPosts.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
            <p className="text-slate-500">
              No forum posts yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {latestPosts.slice(0, 3).map((post, index) => (
              <motion.div
                key={post.id || index}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.15,
                }}
              >
                <ForumPostCard post={post} />
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      <Container className="pb-20">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <CommunityActivity />
        </motion.div>
      </Container>
    </main>
  );
}

export default Home;