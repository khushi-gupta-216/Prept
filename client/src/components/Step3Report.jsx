import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import axios from 'axios'
import {ServerUrl} from "../App"
import { FaArrowLeft } from 'react-icons/fa'
import { useEffect } from 'react'
import {motion} from "motion/react"
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';
import {
  ResponsiveContainer,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Area
} from "recharts";

import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

const Step3Report = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [report, setReport] = useState(null);

useEffect(() => {
  if (!id) return;  // ✅ STOP if id is undefined

  const fetchReport = async () => {
    try {
      const response = await axios.get(
        `${ServerUrl}/api/interview/report/${id}`,
        { withCredentials: true }
      );
      setReport(response.data);
    } catch (error) {
      console.log(error);
      console.error("Error fetching report:", error);
    }
  };

  fetchReport();
}, [id]);

  if(!report){
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <p className='text-gray-500 text-lg'>
          Loading...
          </p>
        </div>
    )
  }

  const {
    finalScore =0,
    confidence =0,
    communication =0,
    correctness =0,
    questionWiseScore =[],
  } = report;

  const questionScoreData = questionWiseScore.map((score,index)=>({
    name:`Q${index+1}`,
    score:score.score || 0
  }))
  const skills=[
    {label: "confidence", value:confidence},
    {label: "communication", value:communication},
    {label: "correctness", value:correctness}
  ];
 let performanceText = "";
let shortTagline = "";

if (finalScore >= 8) {
  performanceText = "Ready for job opportunities.";
  shortTagline = "Excellent clarity and structured responses.";
} else if (finalScore >= 5) {
  performanceText = "Needs minor improvement before interview.";
  shortTagline = "Good foundation, refine articulation.";
} else {
  performanceText = "Needs improvement.";
  shortTagline = "Focus on improving communication and confidence.";
}

const score = finalScore;
const percentage =(score/10)*100;

const downloadPDF = () =>{
  const doc = new jsPDF("p" , "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin *2;
  let currentY = 25;
 
doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.setTextColor(34, 197, 94);
    doc.text("AI Interview Performance Report", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 5;

    // underline
    doc.setDrawColor(34, 197, 94);
    doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);

    currentY += 15;

    // ================= FINAL SCORE BOX =================
    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin, currentY, contentWidth, 20, 4, 4, "F");

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(
      `Final Score: ${finalScore}/10`,
      pageWidth / 2,
      currentY + 12,
      { align: "center" }
    );

    currentY += 30;

    // ================= SKILLS BOX =================
    doc.setFillColor(249, 250, 251);
    doc.roundedRect(margin, currentY, contentWidth, 30, 4, 4, "F");

    doc.setFontSize(12);

    doc.text(`Confidence: ${confidence}`, margin + 10, currentY + 10);
    doc.text(`Communication: ${communication}`, margin + 10, currentY + 18);
    doc.text(`Correctness: ${correctness}`, margin + 10, currentY + 26);

    currentY += 45;

    // ================= ADVICE =================
    let advice = "";

    if (finalScore >= 8) {
      advice =
        "Excellent performance. Maintain confidence and structure. Continue refining clarity and supporting answers with strong real-world examples.";
    } else if (finalScore >= 5) {
      advice =
        "Good foundation shown. Improve clarity and structure. Practice delivering concise, confident answers with stronger supporting examples.";
    } else {
      advice =
        "Significant improvement required. Focus on structured thinking, clarity, and confident delivery. Practice answering aloud.";
    }

   doc.setFillColor(255, 255, 255);
doc.setDrawColor(220);

doc.roundedRect(margin, currentY, contentWidth, 35, 4, 4);

doc.setFont("helvetica", "bold");
doc.text("Professional Advice", margin + 10, currentY + 10);

doc.setFont("helvetica", "normal");
doc.setFontSize(11);

const splitAdvice = doc.splitTextToSize(advice, contentWidth - 20);

doc.text(splitAdvice, margin + 10, currentY + 20);

currentY += 50;

// === Question Table ===
autoTable(doc, {
  startY: currentY, // ✅ fixed (case-sensitive)
  margin: { left: margin, right: margin },

  head: [["#", "Question", "Score", "Feedback"]],

  body: questionWiseScore.map((q, i) => [
    `${i + 1}`,          // ✅ fixed quote
    q.question,
    `${q.score}/10`,     // ✅ fixed quote
    q.feedback,
  ]),

  styles: {
    fontSize: 9,
    cellPadding: 5,
    valign: "top",
  },

  headStyles: {
    fillColor: [34, 197, 94],
    textColor: 255,
    halign: "center",
  },

  columnStyles: {
    0: { cellWidth: 10, halign: "center" },
    1: { cellWidth: 55 },
    2: { cellWidth: 20, halign: "center" },
    3: { cellWidth: "auto" },
  },

  alternateRowStyles: {
    fillColor: [249, 250, 251],
  },
});

doc.save("AI_Interview_Report.pdf");
}

 return (
  <div className="min-h-screen bg-black px-4 sm:px-6 lg:px-10 py-8">

    {/* HEADER */}
    <div className="mb-10 flex flex-col sm:flex-row items-center sm:justify-between gap-4">

      <div className="flex items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate('/history')}
          className="p-3 rounded-full bg-[#141417] border border-white/10 
          hover:border-amber-500/30 transition"
        >
          <FaArrowLeft className="text-amber-400" />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Interview Report
          </h1>
          <p className="text-stone-400 mt-1">
            AI-powered performance insights
          </p>
        </div>
      </div>

      <button
        onClick={downloadPDF}
        className="bg-amber-500 text-black px-6 py-3 rounded-xl 
        font-semibold hover:bg-amber-400 transition"
      >
        Download Report
      </button>
    </div>

    {/* MAIN GRID */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

      {/* LEFT SIDE */}
      <div className="space-y-6">

        {/* PERFORMANCE CARD */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#0f0f11] border border-amber-500/10 rounded-3xl p-8 text-center"
        >
          <h3 className="text-stone-400 mb-6">
            Overall Performance
          </h3>

          <div className="w-28 h-28 mx-auto">
            <CircularProgressbar
              value={percentage}
              text={`${score}/10`}
              styles={buildStyles({
                strokeLinecap: "round",
                trailColor: "#1f1f23",
                pathColor: "#f59e0b",
                textColor: "#f59e0b",
                textSize: "18px",
              })}
            />
          </div>

          <p className="text-stone-500 mt-3 text-sm">
            Score out of 10
          </p>

          <div className="mt-4">
            <p className="font-semibold text-white">
              {performanceText}
            </p>
            <p className="text-stone-400 text-sm mt-1">
              {shortTagline}
            </p>
          </div>
        </motion.div>

        {/* SKILLS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1 }}
          className="bg-[#0f0f11] border border-white/10 rounded-3xl p-8"
        >
          <h3 className="text-white font-semibold mb-6 text-lg">
            Skill Evaluation
          </h3>

          <div className="space-y-5">
            {skills.map((skill, index) => (
              <div key={index}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="text-stone-400 capitalize">
                    {skill.label}
                  </span>
                  <span className="text-amber-400 font-semibold">
                    {skill.value}
                  </span>
                </div>

                <div className="bg-[#141417] h-2 rounded-full">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${skill.value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* RIGHT SIDE */}
      <div className="space-y-6">

        {/* CHART */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#0f0f11] border border-white/10 rounded-3xl p-6"
        >
          <h3 className="text-white font-semibold mb-6">
            Performance Trend
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={questionScoreData}>
                <CartesianGrid stroke="#222" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis domain={[0, 10]} stroke="#888" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="score"
                  stroke="#f59e0b"
                  fill="rgba(245,158,11,0.2)"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* QUESTION BREAKDOWN */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-[#0f0f11] border border-white/10 rounded-3xl p-6"
        >
          <h3 className="text-white font-semibold mb-6">
            Question Breakdown
          </h3>

          <div className="space-y-5">
            {questionWiseScore.map((q, i) => (
              <div
                key={i}
                className="bg-[#141417] border border-white/10 p-5 rounded-2xl"
              >
                <div className="flex justify-between items-start gap-3 mb-3">

                  <div>
                    <p className="text-xs text-stone-500">
                      Question {i + 1}
                    </p>
                    <p className="text-white font-medium">
                      {q.question || "Question not available"}
                    </p>
                  </div>

                  <div className="bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-sm font-semibold">
                    {q.score ?? 0}/10
                  </div>

                </div>

                <div className="bg-black border border-white/10 p-4 rounded-xl">
                  <p className="text-xs text-amber-400 mb-1">
                    AI Feedback
                  </p>
                  <p className="text-stone-300 text-sm leading-relaxed">
                    {q.feedback && q.feedback.trim() !== ""
                      ? q.feedback
                      : "No feedback available."}
                  </p>
                </div>

              </div>
            ))}
          </div>
        </motion.div>

      </div>

    </div>
  </div>
);
}

export default Step3Report