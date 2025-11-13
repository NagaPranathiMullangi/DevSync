import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FaUsers, FaComments, FaCode, FaStar } from "react-icons/fa";

const Home = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-5">

      {/* Animated Title */}
      <motion.h1
        className="text-5xl font-extrabold text-[#3C2A21] mb-5"
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        Welcome to <span className="text-[#A97155]">DevSync</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="text-lg text-gray-700 max-w-2xl mb-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.8 }}
      >
        Connect with developers, chat instantly, explore feeds, and grow your network.
        Your place to collaborate, learn, and innovate.
      </motion.p>

      {/* Floating Cards Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
      >
        {/* Card 1 */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6 w-72 hover:shadow-2xl transition cursor-pointer"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.05 }}
        >
          <FaUsers className="text-4xl mx-auto mb-3 text-[#A97155]" />
          <h3 className="text-xl font-semibold mb-2">Find Developers</h3>
          <p className="text-gray-600">Discover skilled developers and build new connections.</p>
        </motion.div>

        {/* Card 2 */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6 w-72 hover:shadow-2xl transition cursor-pointer"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.05 }}
        >
          <FaComments className="text-4xl mx-auto mb-3 text-[#A97155]" />
          <h3 className="text-xl font-semibold mb-2">Chat Instantly</h3>
          <p className="text-gray-600">Real-time messaging with ticks and online status.</p>
        </motion.div>

        {/* Card 3 */}
        <motion.div
          className="bg-white shadow-lg rounded-2xl p-6 w-72 hover:shadow-2xl transition cursor-pointer"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0 }
          }}
          whileHover={{ scale: 1.05 }}
        >
          <FaStar className="text-4xl mx-auto mb-3 text-[#A97155]" />
          <h3 className="text-xl font-semibold mb-2">Premium Insights</h3>
          <p className="text-gray-600">See ignored users, trends, and exclusive analytics.</p>
        </motion.div>
      </motion.div>

      {/* Buttons */}
      <motion.div
        className="flex gap-6"
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.7 }}
      >
        <Link
          to="/login"
          className="bg-[#3C2A21] text-white px-8 py-3 rounded-xl text-lg shadow hover:bg-[#2a1d15] transition"
        >
          lets dive
        </Link>

        
      </motion.div>

      {/* Floating animation background */}
      <motion.div
        className="absolute top-40 left-10 w-32 h-32 bg-[#E8D8C4] rounded-full blur-2xl opacity-40"
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 6, repeat: Infinity }}
      />

      <motion.div
        className="absolute bottom-20 right-10 w-40 h-40 bg-[#D8C0A8] rounded-full blur-3xl opacity-40"
        animate={{ y: [0, -25, 0] }}
        transition={{ duration: 7, repeat: Infinity }}
      />
    </div>
  );
};

export default Home;
