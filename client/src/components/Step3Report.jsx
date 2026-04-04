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
   <div className='min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 px-4 sm:px-6 lg:px-10 py-8'>
  
  <div className='mb-8 flex flex-col sm:flex-row items-center sm:justify-between gap-4'>
    
    <div className='md:mb-10 w-full flex items-start gap-4 flex-wrap'>
      <button
        onClick={() => navigate('/history')}
        className='mt-1 p-3 rounded-full bg-white shadow hover:shadow-md transition'
      >
        <FaArrowLeft />
      </button>

      <div>
        <h1 className='text-3xl font-bold text-gray-800'>
          Interview Analysis Dashboard
        </h1>
        <p className='text-gray-500 mt-2'>
          AI-powered performance insights
        </p>
      </div>
    </div>

    <button
    onClick={downloadPDF} className='bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-md transition-all duration-300 font-semibold text-sm sm:text-base whitespace-nowrap'>
      Download Report
    </button>
  </div>

  <div className='grid grid-cols-1 lg:grid-cols-2 lg:gap-8 gap-6 mb-8'>
    
    <div className='space-y-6'>
      
      {/* PERFORMANCE CARD */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8 text-center'
      >
        <h3 className='text-gray-500 mb-4 sm:mb-6 text-sm sm:text-base'>
          Overall Performance
        </h3>

        <div className='relative w-20 h-20 sm:w-24 sm:h-24 mx-auto'>
          <CircularProgressbar
            value={percentage}
            text={`${score}/10`}
            styles={buildStyles({
              strokeLinecap: "round",
            trailColor: "#e0e7ff",  
pathColor: "#3b82f6",   
textSize: "20px",
textColor: "#1e3a8a"  
            })}
          />
        </div>

        <p className='text-gray-400 mt-3 text-xs sm:text-sm'>
          Out of 10
        </p>

        <div className='mt-4'>
          <p className='font-semibold text-gray-800 text-sm sm:text-base'>
            {performanceText}
          </p>
          <p className='text-gray-600 text-xs sm:text-sm mt-1'>
            {shortTagline}
          </p>
        </div>
      </motion.div>

      {/* SKILLS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-6 sm:p-8'
      >
        <h3 className='text-gray-700 font-semibold mb-4 sm:mb-6 text-base sm:text-lg'>
          Skill Evaluation
        </h3>

        <div className='space-y-5'>
          {skills.map((skill, index) => (
            <div key={index}>
              <div className='flex justify-between mb-2 text-sm sm:text-base'>
                <span>{skill.label}</span>
                <span className='text-indigo-600 font-semibold'>
                  {skill.value}
                </span>
              </div>

              <div className='bg-gray-200 h-2 sm:h-3 rounded-full'>
                <div
                  className='bg-indigo-500 h-full rounded-full'
                  style={{ width: `${skill.value * 10}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

    </div>

    {/* CHART */}
    <div className='lg:col-span-1 space-y-6'>
     <motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8 flex flex-col'
>
        <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-4 sm:mb-6'>
          Performance Trend
        </h3>
<div className='h-64 sm:h-72 w-full min-h-[250px]'>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={questionScoreData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="score"
             stroke="#3b82f6"  
fill="#bfdbfe"    
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

      </motion.div>
      <motion.div 
      initial={{opacity:0}}
      animate={{opacity:1}}
      className='bg-white rounded-2xl sm:rounded-3xl shadow-lg p-5 sm:p-8'>
        <h3 className='text-base sm:text-lg font-semibold text-gray-700 mb-6'>
          Question Breakdown
        </h3>
        <div className="space-y-6">
          {questionWiseScore.map((q,i)=>(
            <div key={i} 
            className='bg-gray-50 p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-gray-200'>

              <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
              <div >
              
                <p className='text-xs text-gray-400'>Question {i + 1}</p>
                <p className='font-semibold text-xs text-gray-800 sm:text-base leading-relaxed'>{q.question || "Question not available"}</p>
              </div>
              <div className='bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full font-bold text-xs sm:text-sm w-fit'>
                {q.score ?? 0 }/10
                 </div>
                  </div>

                  <div className='bg-indigo-50 border border-indigo-200 p-3 rounded-lg'> 
                    <p className='text-xs text-indigo-600 font-semibold mb-1'>AI Feedback</p>
                    <p className='text-sm text-gray-600 leading-relaxed'>
                      {
                        q.feedback && q.feedback.trim() !== "" ? q.feedback :
                        "No feedback available for this question."
                      }
                    </p>
                  </div>


                  </div>

          ))}

          </div>
      </motion.div>


    </div>

  </div>
</div>
  )
}

export default Step3Report