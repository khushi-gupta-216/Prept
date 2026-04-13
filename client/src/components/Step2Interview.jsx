import React, { useState, useRef, useEffect } from "react";
import Timer from "./Timer";
import maleVideo from "../assets/Videos/male-ai.mp4";
import femaleVideo from "../assets/Videos/female-ai.mp4";
import { motion } from "motion/react";
import { FaMicrophone } from "react-icons/fa";
import { FaMicrophoneSlash } from "react-icons/fa";
import axios from "axios"
import { ServerUrl } from "@/App";
import {BsArrowRight } from "react-icons/bs";
import { useNavigate } from "react-router-dom";


const Step2Interview = ({ interviewData, onFinish }) => {
  // ✅ Prevent crash
 
const navigate = useNavigate();

  const { interviewId, questions = [], userName } = interviewData;

  const [isIntroPhase, setIsIntroPhase] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const recognitionRef = useRef(null);
  const [isAIPlaying, setIsAIPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [timeLeft, setTimeLeft] = useState(questions[0]?.timeLimit || 60);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [voiceGender, setVoiceGender] = useState("female");
  const [subtitle, setSubtitle] = useState("");
  const videoRef = useRef(null);
  const currentQuestion = questions[currentIndex];

  
  // ✅ Load voices
  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return;

      const femaleVoice = voices.find((v) =>
        v.name.toLowerCase().includes("female"),
      );

      const maleVoice = voices.find((v) =>
        v.name.toLowerCase().includes("male"),
      );

      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
        setVoiceGender("female");
      } else if (maleVoice) {
        setSelectedVoice(maleVoice);
        setVoiceGender("male");
      } else {
        setSelectedVoice(voices[0]);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const videoSource = voiceGender === "male" ? maleVideo : femaleVideo;

  // ✅ Speak function
  const speakText = (text) => {
    return new Promise((resolve) => {
      if (!window.speechSynthesis || !selectedVoice) {
        resolve();
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = selectedVoice;

      utterance.onstart = () => {
        setIsAIPlaying(true);
        stopMic()
        videoRef.current?.play();
      };

      utterance.onend = () => {
        videoRef.current?.pause();
        if (videoRef.current) videoRef.current.currentTime = 0;
        setIsAIPlaying(false);

        if (isMicOn) {
    setTimeout(() => startMic(), 300); // smoother start
  }

        setTimeout(() => {
          setSubtitle("");
          resolve();
        }, 300);
      };

      setSubtitle(text);
      window.speechSynthesis.speak(utterance);
    });
  };

  // ✅ Intro + Questions Flow
  useEffect(() => {
    if (!selectedVoice) return;

    const runFlow = async () => {
      // 🎤 Intro
      if (isIntroPhase) {
        await speakText(
          `Hi ${userName}, it's great to meet you today. I hope you're feeling confident and ready.`,
        );

        await speakText(
          "I'll ask you a few questions. Just answer naturally and take your time. Let's begin.",
        );

        setIsIntroPhase(false);
        return;
      }

      // 🎯 Questions
      if (currentQuestion) {
        await new Promise((r) => setTimeout(r, 800));

        if (currentIndex === questions.length - 1) {
          await speakText(
            "Alright, this one might be a bit more challenging. Do your best and stay calm. You've got this!",
          );
        }

        await speakText(currentQuestion.question);
      }
    };

    runFlow();
  }, [selectedVoice, isIntroPhase, currentIndex]);
  useEffect(() => {
  if (currentQuestion?.timeLimit) {
    setTimeLeft(currentQuestion.timeLimit);
  }
}, [currentIndex]);
useEffect(() => {
  if (isIntroPhase || !currentQuestion) return;

  const timer = setInterval(() => {
    setTimeLeft((prev) => {
      if (prev <= 1) {
        clearInterval(timer);
        return 0;
      }
      return prev - 1;
    });
  }, 1000);

  return () => clearInterval(timer);
}, [isIntroPhase, currentIndex]);

useEffect(() => {
  if (timeLeft === 0 && currentQuestion && !isSubmitting && !feedback) {
    submitAnswer(); // auto submit instead of skipping
  }
}, [timeLeft]);

useEffect(() => {
  if(!isIntroPhase && currentQuestion){
    setTimeLeft(currentQuestion.timeLimit || 60)
  }
}, [currentIndex]);

useEffect(()=>{
  if(!("webkitSpeechRecognition" in window)) return;
  const recognition = new window.webkitSpeechRecognition();
  recognition.lang="en-US";
  recognition.continuous= true;
  recognition.interimResults = false;

  recognition.onresult =(event) =>{
    const transcript =
  event.results[event.results.length - 1][0].transcript;

    setAnswer((prev) => prev + " " + transcript);
  }
  recognitionRef.current=recognition;

}, []);

const startMic = () => {
  if (!recognitionRef.current) return;

  if (isAIPlaying) return; // prevent mic when AI is speaking

  try {
    recognitionRef.current.start();
  } catch (error) {
    console.error("Mic start error:", error.message);
  }
};

const stopMic =() =>{
  if(recognitionRef.current){
    recognitionRef.current.stop();
  }
};

const toggleMic =() =>{
  if(isMicOn){
    stopMic();
  }else {
    startMic();
  }
  setIsMicOn(!isMicOn);
};

const submitAnswer = async () => {
if(isSubmitting)return;
stopMic()
setIsSubmitting(true)
try {
const result = await axios.post(ServerUrl + "/api/interview/submit-answer",
  {
    interviewId,
    questionIndex: currentIndex,
    answer,
    feedback,
    timeTaken: currentQuestion.timeLimit - timeLeft,
  },{withCredentials:true}
)

setFeedback(result.data.feedback)
speakText(result.data.feedback)
setIsSubmitting(false)
} catch (error) {
  console.log(error)
 setIsSubmitting(false)
}
}


const handleNext = async ()=>{
  setAnswer("");
  setFeedback("");
  
  if (currentIndex + 1 >= questions.length){
    finishInterview();
    return;
  }
  await speakText("Alright, let's move to the next question.");

 setCurrentIndex((prev) => prev + 1);

setTimeout(() => {
  if (isMicOn) startMic();
}, 500);
}
const finishInterview = async () =>{
  stopMic()
  setIsMicOn(false)
try{
  const result = await axios.post(ServerUrl + "/api/interview/finish" , {interviewId} , {withCredentials:true})

  console.log(result.data)
  onFinish(result.data)
   navigate(`/report/${interviewId}`);
} catch(error){
console.log(error)
}
}


useEffect(() => {
  return () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current.abort();
      } catch (error) {
        console.error("Mic cleanup error:", error.message);
      }
    }

    window.speechSynthesis.cancel();
  };
}, []);






 if (!interviewData) return <div>Loading...</div>;










 return (
  <div className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
    <div className="w-full max-w-7xl min-h-[85vh] bg-[#0f0f11] border border-amber-500/10 
    rounded-3xl shadow-2xl flex flex-col lg:flex-row overflow-hidden">

      {/* 🎥 LEFT - VIDEO */}
      <div className="w-full lg:w-[35%] bg-[#0f0f11] flex flex-col items-center p-6 space-y-6 border-r border-white/10">

        <div className="w-full max-w-md rounded-2xl overflow-hidden border border-white/10 shadow-xl">
          <video
            src={videoSource}
            key={videoSource}
            ref={videoRef}
            playsInline
            muted
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Subtitle */}
        {subtitle && (
          <div className="w-full max-w-md bg-[#141417] border border-white/10 rounded-xl p-4">
            <p className="text-stone-300 text-sm text-center leading-relaxed">
              {subtitle}
            </p>
          </div>
        )}

        {/* Timer Card */}
        <div className="w-full max-w-md bg-[#141417] border border-white/10 rounded-2xl p-6 space-y-5">

          <div className="flex justify-between items-center">
            <span className="text-xs text-stone-500">
              Interview Status
            </span>

            {isAIPlaying && (
              <span className="text-xs text-amber-400 font-medium">
                AI Speaking...
              </span>
            )}
          </div>

          <div className="h-px bg-white/10"></div>

          <div className="flex justify-center">
            <Timer
              timeLeft={timeLeft}
              totalTime={currentQuestion?.timeLimit}
            />
          </div>

          <div className="h-px bg-white/10"></div>

          <div className="grid grid-cols-2 gap-6 text-center">

            <div>
              <span className="text-2xl font-bold text-amber-400">
                {currentIndex + 1}
              </span>
              <p className="text-xs text-stone-500">
                Current
              </p>
            </div>

            <div>
              <span className="text-2xl font-bold text-amber-400">
                {questions.length}
              </span>
              <p className="text-xs text-stone-500">
                Total
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* 📝 RIGHT SIDE */}
      <div className="flex-1 flex flex-col p-6 md:p-8">

        {/* Header */}
        <h2 className="text-2xl font-semibold text-white mb-6">
          AI Interview Session
        </h2>

        {/* Question */}
        {!isIntroPhase && (
          <div className="bg-[#141417] border border-white/10 p-5 rounded-xl mb-5">
            <p className="text-xs text-stone-500 mb-2">
              Question {currentIndex + 1} of {questions.length}
            </p>

            <p className="text-base md:text-lg font-medium text-white leading-relaxed">
              {currentQuestion?.question}
            </p>
          </div>
        )}

        {/* Answer Box */}
        <textarea
          className="flex-1 bg-[#141417] p-5 rounded-2xl outline-none resize-none 
          border border-white/10 focus:ring-2 focus:ring-amber-500 
          text-white placeholder:text-stone-500"
          placeholder="Type your answer here..."
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />

        {/* ACTIONS */}
        {!feedback ? (
          <div className="flex items-center gap-4 mt-6">

            {/* Mic */}
            <motion.button
              onClick={toggleMic}
              whileTap={{ scale: 0.9 }}
              className="w-12 h-12 bg-amber-500 text-black rounded-full 
              flex items-center justify-center shadow-lg hover:bg-amber-400 transition"
            >
              {isMicOn ? (
                <FaMicrophone size={18} />
              ) : (
                <FaMicrophoneSlash size={18} />
              )}
            </motion.button>

            {/* Submit */}
            <motion.button
              onClick={submitAnswer}
              disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-amber-500 text-black py-3 rounded-xl 
              font-semibold hover:bg-amber-400 transition disabled:bg-gray-700"
            >
              {isSubmitting ? "Submitting..." : "Submit Answer"}
            </motion.button>

          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-6 bg-[#141417] border border-amber-500/20 p-5 rounded-2xl"
          >
            <p className="text-amber-300 mb-4">
              {feedback}
            </p>

            <button
              onClick={handleNext}
              className="w-full bg-amber-500 text-black py-3 rounded-xl 
              flex justify-center items-center gap-2 font-medium hover:bg-amber-400 transition"
            >
              Next Question <BsArrowRight size={18} />
            </button>
          </motion.div>
        )}

      </div>
    </div>
  </div>
);
};

export default Step2Interview;
