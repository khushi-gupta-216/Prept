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
    <div className="min-h-screen bg-linear-to-br from-[#ebfdfe] via-white to-teal-100 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-350 min-h-[80vh] bg-white rounded-3xl shadow-2xl border border-gray-200 flex flex-col lg:flex-row overflow-hidden">
        {/* 🎥 Video Section */}
        <div className="w-full lg:w-[35%] bg-white flex flex-col items-center p-6 space-y-6 border-r border-gray-200">
          <div className="w-full max-w-md rounded-2xl overflow-hidden shadow-xl ">
               <video
            src={videoSource}
            key={videoSource}
            ref={videoRef}
            playsInline
            muted
            className="w-full h-auto object-cover"
          />
          </div>

           {/*Subtitle Section */}
         
         { subtitle && ( <div className="w-full max-w-md bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-sm">
            <p className="text-gray-700 text-sm sm:text-base font-medium text-center leading-relaxed">
              {subtitle}
            </p>
          </div>)}

            {/* timer Area */}
          <div className="w-full max-w-md bg-white border border-gray-200 rounded-2xl shadow-md p-6 space-y-5">
            <div className="flex justify-between items-center ">
             <span className="text-sm text-gray-500 ">
                Interview Status
              </span>
              {isAIPlaying && (
                <span className="text-sm text-blue-500 font-semibold">
                  {isAIPlaying ? "AI Speaking" : ""}
                </span>
              )}
            </div>
            <div className="h-px bg-gray-200"> </div>
            <div className="flex justify-center ">
             
              <Timer
                timeLeft={timeLeft}
                totalTime={currentQuestion?.timeLimit}
              />
            </div>
            <div className="h-px bg-gray-200"> </div>
            <div className="grid grid-cols-2 gap-6 text-center">
             
              <div>
               
                <span className="text-2xl font-bold text-blue-500 ">
                  {currentIndex + 1}
                </span>
                <span className="text-xs text-gray-500">
                  Current Question
                </span>
              </div>
              <div>
               
                <span className="text-2xl font-bold text-blue-500 ">
                  {questions.length}
                </span>
                <span className="text-xs text-gray-500">
                  Total question
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 📝 Text Section */}
        <div className="flex-1 flex flex-col p-4 sm:p6 md:p-8 relative">
          <h2 className="text-2xl sm:text-2xl font-bold text-blue-600 mb-6">
            AI Smart Interview
          </h2>

          {!isIntroPhase && (
            <div className=" relative bg-gray-50 p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm">
              <p className="text-gray-400 text-xs sm:text-sm mb-2">
                Question {currentIndex + 1} of {questions.length}
              </p>

              <div className="text-base sm:text-lg font-semibold text-gray-800 leading-relaxed">
                {currentQuestion?.question}
              </div>
            </div>
          )}

         <textarea
  className="flex-1 bg-gray-100 p-4 sm:p-6 rounded-2xl outline-none resize-none border border-gray-200 focus:ring-2 focus:ring-blue-500 transition text-gray-800"
  placeholder="Type your answer here..."
  value={answer}
  onChange={(e) => setAnswer(e.target.value)}
/>

         { !feedback ? (<div className="flex items-center gap-4 mt-6">
           <motion.button
  onClick={toggleMic}
  whileTap={{ scale: 0.9 }}
  className="w-12 h-12 sm:w-14 sm:h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg"
>
  {isMicOn ? (
    <FaMicrophone size={20} />
  ) : (
    <FaMicrophoneSlash size={20} />
  )}
</motion.button>

            <motion.button
            onClick={submitAnswer}
            disabled={isSubmitting}
              whileTap={{ scale: 0.95 }}
              className="flex-1 bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 sm:py-4 rounded-2xl font-semibold shadow-lg hover:opacity-90 transition disabled:bg-gray-500"
            >
              {isSubmitting
                ? "Submitting..."
                : "Submit Answer"}
            </motion.button>
          </div>) : (
            <motion.div 
            initial={{opacity:0}}
            animate={{opacity:1}}
            className='mt-6 bg-blue-50 border border-blue-200 p-5 rounded-2xl shadow-sm'>
              <p className="text-blue-700 font-medium mb-4">{feedback} </p>
              <button 
                onClick={handleNext}
                className="w-full bg-gradient-to-r from-blue-600 to-teal-500 text-white py-3 rounded-xl flex justify-center items-center gap-1 shadow-md hover:opacity-90 transition"> 
                Next Question <BsArrowRight size={18}/>
              </button>
            </motion.div>

          )}
        </div>
      </div>
    </div>
  );
};

export default Step2Interview;
