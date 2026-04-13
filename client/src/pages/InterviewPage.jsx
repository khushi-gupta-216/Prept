import Step1SetUp from '@/components/Step1SetUp'
import Step2Interview from '@/components/Step2Interview'
import Step3Report from '@/components/Step3Report'
import React, { useState } from 'react'
import { motion, AnimatePresence } from "motion/react"

const InterviewPage = () => {
  const [step, setStep] = useState(1)
  const [interviewData, setInterviewData] = useState(null)

  const steps = [
    { id: 1, label: "Setup" },
    { id: 2, label: "Interview" },
    { id: 3, label: "Report" }
  ]

  return (
    <div className='min-h-screen bg-black'>

      {/* 🔥 STEP PROGRESS BAR */}
      <div className="w-full max-w-4xl mx-auto pt-6 px-4">
        <div className="flex items-center justify-between">

          {steps.map((s, index) => (
            <div key={s.id} className="flex-1 flex items-center">

              {/* Circle */}
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium
                ${step >= s.id
                    ? "bg-amber-500 text-black"
                    : "bg-[#141417] text-stone-500 border border-white/10"
                  }`}
              >
                {s.id}
              </div>

              {/* Line */}
              {index !== steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-2
                  ${step > s.id ? "bg-amber-500" : "bg-white/10"}`}
                />
              )}
            </div>
          ))}

        </div>

        {/* Labels */}
        <div className="flex justify-between mt-2 text-xs text-stone-400">
          {steps.map((s) => (
            <span key={s.id}>{s.label}</span>
          ))}
        </div>
      </div>

      {/* 🔥 STEP CONTENT */}
      <div className="mt-6">
        <AnimatePresence mode="wait">

          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
            >
              <Step1SetUp
                onStart={(data) => {
                  setInterviewData(data)
                  setStep(2)
                }}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
            >
              <Step2Interview
                interviewData={interviewData}
                onFinish={(report) => {
                  setInterviewData(report)
                  setStep(3)
                }}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Step3Report report={interviewData} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  )
}

export default InterviewPage