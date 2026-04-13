import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import axios from "axios";
import {
  FaUserTie,
  FaBriefcase,
  FaFileUpload,
  FaMicrophoneAlt,
  FaChartLine,
} from "react-icons/fa";
import { ServerUrl } from "@/App";
import { useDispatch, useSelector } from "react-redux";
import { setUserData } from "@/redux/userSlice";

function Step1SetUp({ onStart }) {
  const { userData } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const [role, setRole] = useState("");
  const [experience, setExperience] = useState("");
  const [mode, setMode] = useState("Technical");
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [resumeText, setResumeText] = useState("");
  const [analysisDone, setAnalysisDone] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  const features = [
    {
      icon: <FaUserTie className="text-amber-400 text-xl" />,
      text: "Choose Role & Experience",
    },
    {
      icon: <FaMicrophoneAlt className="text-amber-400 text-xl" />,
      text: "AI Powered Voice Interview",
    },
    {
      icon: <FaChartLine className="text-amber-400 text-xl" />,
      text: "Detailed Performance Insights",
    },
  ];

  const handleUploadResume = async () => {
    if (!resumeFile || analyzing) return;
    setAnalyzing(true);

    const formdata = new FormData();
    formdata.append("resume", resumeFile);

    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/resume",
        formdata,
        { withCredentials: true }
      );

      setRole(result.data.role || "");
      setExperience(result.data.experience || "");
      setProjects(result.data.projects || []);
      setSkills(result.data.skills || []);
      setResumeText(result.data.resumetext || "");
      setAnalysisDone(true);
    } catch (error) {
      console.log(error);
    }

    setAnalyzing(false);
  };

  const handleStart = async () => {
    setLoading(true);
    try {
      const result = await axios.post(
        ServerUrl + "/api/interview/generate-questions",
        {
          role,
          experience,
          mode,
          resumeText,
          projects,
          skills,
        },
        { withCredentials: true }
      );

      if (userData) {
        dispatch(
          setUserData({
            ...userData,
            credits: result.data.creditsLeft,
          })
        );
      }

      onStart(result.data);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-black px-4"
    >
      <div className="w-full max-w-6xl bg-[#0f0f11] border border-amber-500/10 rounded-2xl shadow-2xl grid md:grid-cols-2 overflow-hidden">

        {/* LEFT */}
        <div className="p-12 bg-gradient-to-br from-black to-[#0f0f11]">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Your AI Interview
          </h2>

          <p className="text-stone-400 mb-10">
            Practice real interview scenarios powered by AI. Improve your
            confidence and crack top interviews.
          </p>

          <div className="space-y-5">
            {features.map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.03 }}
                className="flex items-center space-x-4 bg-[#141417] p-4 rounded-xl border border-white/10 hover:border-amber-500/30 transition"
              >
                {item.icon}
                <span className="text-stone-300">{item.text}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-12 bg-[#0f0f11]">
          <h2 className="text-3xl font-bold text-white mb-8">
            Interview Setup
          </h2>

          <div className="space-y-6">

            {/* Role */}
            <div className="relative">
              <FaUserTie className="absolute top-4 left-4 text-stone-500" />
              <input
                type="text"
                placeholder="Enter role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/10 rounded-xl text-white placeholder:text-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Experience */}
            <div className="relative">
              <FaBriefcase className="absolute top-4 left-4 text-stone-500" />
              <input
                type="text"
                placeholder="Experience (e.g. 2 years)"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-[#141417] border border-white/10 rounded-xl text-white placeholder:text-stone-500 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>

            {/* Mode */}
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full py-3 px-4 bg-[#141417] border border-white/10 rounded-xl text-white focus:ring-2 focus:ring-amber-500 outline-none"
            >
              <option value="Technical">Technical Interview</option>
              <option value="HR">HR Interview</option>
            </select>

            {/* Upload */}
            {!analysisDone && (
              <div
                onClick={() =>
                  document.getElementById("resumeUpload").click()
                }
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-amber-500 hover:bg-amber-500/5 transition"
              >
                <FaFileUpload className="text-4xl mx-auto text-amber-400 mb-3" />

                <input
                  type="file"
                  accept="application/pdf"
                  id="resumeUpload"
                  className="hidden"
                  onChange={(e) => setResumeFile(e.target.files[0])}
                />

                <p className="text-stone-400">
                  {resumeFile
                    ? resumeFile.name
                    : "Upload resume (optional)"}
                </p>

                {resumeFile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadResume();
                    }}
                    className="mt-4 bg-amber-500 text-black px-5 py-2 rounded-lg hover:bg-amber-400 transition"
                  >
                    {analyzing ? "Analyzing..." : "Analyze Resume"}
                  </button>
                )}
              </div>
            )}

            {/* Result */}
            {analysisDone && (
              <div className="bg-[#141417] border border-white/10 rounded-xl p-5 space-y-4">
                <h3 className="text-white font-semibold">
                  Resume Insights
                </h3>

                {projects.length > 0 && (
                  <div>
                    <p className="text-stone-400 mb-1">Projects</p>
                    <ul className="text-sm text-stone-300 list-disc ml-5">
                      {projects.map((p, i) => (
                        <li key={i}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {skills.length > 0 && (
                  <div>
                    <p className="text-stone-400 mb-1">Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((s, i) => (
                        <span
                          key={i}
                          className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Button */}
            <button
              onClick={handleStart}
              disabled={!role || !experience || loading}
              className="w-full bg-amber-500 text-black py-3 rounded-xl font-medium hover:bg-amber-400 disabled:bg-gray-700 transition"
            >
              {loading ? "Starting..." : "Start Interview"}
            </button>

          </div>
        </div>

      </div>
    </motion.div>
  );
}

export default Step1SetUp;