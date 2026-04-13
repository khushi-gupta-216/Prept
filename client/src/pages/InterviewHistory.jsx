import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
  import axios from 'axios'
  import {ServerUrl} from "../App"
import { FaArrowLeft } from 'react-icons/fa'

const InterviewHistory = () => {
const [interviews , SetInterviews] =useState([])
const navigate = useNavigate()


useEffect(() =>{
  const getMyInterviews = async () =>{
    try {
      const result = await axios.get(`${ServerUrl}/api/interview/get-interview` , {withCredentials:true});
      console.log(result.data)
      SetInterviews(result.data);
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };
  getMyInterviews();

},[])


  return (
  <div className="min-h-screen bg-black py-10">
    <div className="w-[90vw] lg:w-[70vw] mx-auto">

      {/* HEADER */}
      <div className="mb-10 flex items-start gap-4 flex-wrap">
        <button
          onClick={() => navigate('/')}
          className="p-3 rounded-full bg-[#141417] border border-white/10 
          hover:border-amber-500/30 transition"
        >
          <FaArrowLeft className="text-amber-400" />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-white">
            Interview History
          </h1>
          <p className="text-stone-400 mt-1">
            Track your past interviews & performance
          </p>
        </div>
      </div>

      {/* EMPTY STATE */}
      {interviews.length === 0 ? (
        <div className="bg-[#0f0f11] border border-white/10 p-10 rounded-2xl text-center">
          <p className="text-stone-400">
            No interviews found. Start your first interview 🚀
          </p>
        </div>
      ) : (

        /* LIST */
        <div className="space-y-4">
          {interviews.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(`/report/${item._id}`)}
              className="bg-[#0f0f11] border border-white/10 p-6 rounded-2xl 
              hover:border-amber-500/30 hover:bg-[#141417] transition cursor-pointer"
            >

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                {/* LEFT INFO */}
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {item.role}
                  </h2>

                  <p className="text-stone-400 text-sm mt-1">
                    Experience: {item.experience}
                  </p>

                  <p className="text-stone-400 text-sm">
                    Mode: {item.mode}
                  </p>

                  <p className="text-stone-500 text-xs mt-2">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* RIGHT SIDE */}
                <div className="flex items-center gap-6">

                  {/* SCORE */}
                  <div className="text-right">
                    <p className="text-amber-400 font-bold text-xl">
                      {item.finalScore || 0}/10
                    </p>
                    <p className="text-stone-500 text-xs">
                      Score
                    </p>
                  </div>

                  {/* STATUS */}
                  <span
                    className={`px-4 py-1 rounded-full text-xs font-medium ${
                      item.status === "Completed"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    }`}
                  >
                    {item.status}
                  </span>

                </div>

              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  </div>
);
}

export default InterviewHistory