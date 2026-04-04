import React from 'react'
import { BsRobot } from "react-icons/bs";
import { RiSparkling2Line } from "react-icons/ri";
import {motion} from "motion/react"
import { FcGoogle } from "react-icons/fc";
import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/utils/firebase';
import axios from 'axios';
import { ServerUrl } from '@/App';
import { setUserData } from '@/redux/userSlice'
import { useDispatch } from 'react-redux';
const Auth = ({isModal = false}) => {
const dispatch = useDispatch()

const handleGoogleAuth = async () =>{
  try {
    const response = await signInWithPopup(auth , provider)
    let User = response.user
    let name = User.displayName
    let email = User.email
    const result = await axios.post(ServerUrl + "/api/auth/google" ,
      {name , email}, {withCredentials:true}
   )
    console.log(result.data)
  dispatch(setUserData(result.data))

  } catch (error) {
    console.log(error)
      dispatch(setUserData(null))
  }
}

  return (
   <>
   <div className={`w-full 
    ${isModal ? "py-4" : "min-h-screen bg-[#ebfdfe] flex items-center justify-center px-6 py-20"} `}>
    <motion.div 
    initial={{opacity:0 , y:-40}}
    animate={{opacity:1 , y:0}}
    transition={{duration:1.05}}
   className={`w-full
 ${isModal 
   ? "max-w-md p-8 rounded-3xl" 
   : "max-w-lg p-12 rounded-[32px]"
 } bg-[#c5e5fa] shadow-2xl border border-gray-200`}>
      <div className='flex items-center justify-center gap-3 mb-6 '>
        <div className='bg-black text-white p-2 rounded-lg'>
        <BsRobot size={18}/>
        </div>
        <h2 className='font-semibold text-lg'>IntervAI</h2>
      </div>
    <h1 className='text-2xl md:text-3xl font-semibold text-center leading-snug mb-4'>Continue with
      <span className='bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full inline-flex items-center gap-2'>
        <RiSparkling2Line />
        AI Smart Interview
      </span>
    </h1>
    <p className='text-gray-500 text-center text-sm md:text-base leading-relaxed mb-8'>
      Sign in to start AI-powered mock interviews, track your progress, and unlock detailed performance insights.
    </p>

   <motion.button 
   onClick={handleGoogleAuth}
    initial={{opacity:0.7 }}
    whileHover={{opacity:0.9,  scale: 1.03 }}
  whileTap={{opacity:1 , scale: 0.95 }}
   className='w-full flex items-center justify-center gap-3 py-3 bg-black text-white rounded-full shadow-md' >
    <FcGoogle />
   Continue with Google
   </motion.button>

      
    </motion.div>

   </div>
   </>
  )
}

export default Auth