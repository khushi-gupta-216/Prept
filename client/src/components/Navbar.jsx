import React, { useState } from 'react'
import { motion } from "motion/react"
import { useDispatch, useSelector } from 'react-redux'
import { BsRobot, BsCoin } from 'react-icons/bs'
import { HiOutlineLogout } from 'react-icons/hi'
import { FaUserAstronaut } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from '@/App'
import { setUserData } from '@/redux/userSlice'
import AuthModel from './AuthModel'
import { Button } from './ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const Navbar = () => {
  const { userData } = useSelector((state) => state.user)
  const [showCreditPopup, setShowCreditPopup] = useState(false)
  const [showUserPopup, setShowUserPopup] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleLogout = async () => {
    try {
      await axios.get(ServerUrl + "/api/auth/logout", { withCredentials: true })
      dispatch(setUserData(null))
      setShowCreditPopup(false)
      setShowUserPopup(false)
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-3 sm:px-10 py-3 
    border-b border-amber-500/10 bg-black/80 backdrop-blur-xl">

      {/* Logo */}
      <a href="/">
        <img
          src="/prept.png"
          alt="Prept Logo"
          className="h-11 w-auto"
        />
      </a>

      {/* Right Section */}
      <div className='flex items-center gap-5 relative'>

        {/* Credits */}
       <div className="relative">
  <Button
    className="bg-amber-500/10 text-amber-400 border border-amber-500/20 
    hover:bg-amber-500/20 hover:text-amber-300 flex items-center gap-2"
    onClick={() => {
      if (!userData) {
        setShowAuth(true)
        return
      }
      setShowCreditPopup(!showCreditPopup)
      setShowUserPopup(false)
    }}
  >
    <BsCoin size={18} />
    {userData?.credits || 0}
  </Button>

  {showCreditPopup && (
    <div className="absolute right-0 mt-3 w-64 bg-[#0f0f11] border border-amber-500/20 
    rounded-2xl p-5 shadow-2xl z-50 backdrop-blur-xl">

      <p className="text-xs text-stone-500 mb-1">Available Credits</p>

      <p className="text-3xl font-serif bg-gradient-to-br from-amber-300 to-amber-500 
      bg-clip-text text-transparent">
        {userData?.credits || 0}
      </p>

      <p className="text-xs text-stone-500 mt-1 mb-4">
        Use credits to start interviews
      </p>

      <button
        onClick={() => {
          navigate("/pricing")
          setShowCreditPopup(false)
        }}
        className="w-full py-2 rounded-lg bg-amber-500 text-black 
        hover:bg-amber-400 transition font-medium"
      >
        Buy More Credits
      </button>
    </div>
  )}
</div>
        {/* User */}
 <div className='relative'>
  <Button
    onClick={(e) => {
      e.stopPropagation()

      if (!userData) {
        setShowAuth(true)
        return
      }

      setShowUserPopup(!showUserPopup)
      setShowCreditPopup(false)
    }}
    className='w-9 h-9 bg-amber-500 text-black rounded-full flex items-center justify-center font-semibold hover:bg-amber-400 transition'
  >
    {userData
      ? userData?.name.slice(0, 1).toUpperCase()
      : <FaUserAstronaut size={16} />}
  </Button>

  {showUserPopup && (
    <div
      onClick={(e) => e.stopPropagation()}
      className='absolute right-0 mt-3 w-60 bg-[#0f0f11] border border-amber-500/20 
      rounded-2xl p-5 shadow-2xl backdrop-blur-xl z-50'
    >

      {/* User Name */}
      <p className='text-amber-400 font-semibold text-base mb-3 tracking-wide'>
        {userData?.name}
      </p>

      {/* Actions */}
      <button
        onClick={() => {
          navigate("/history")
          setShowUserPopup(false)
        }}
        className='w-full text-left text-sm py-2 px-2 rounded-lg text-stone-300 
        hover:bg-white/5 hover:text-amber-400 transition'
      >
        📜 Interview History
      </button>

      <button
        onClick={handleLogout}
        className='w-full text-left text-sm py-2 px-2 rounded-lg flex items-center gap-2 
        text-red-400 hover:bg-red-500/10 hover:text-red-300 transition mt-1'
      >
        <HiOutlineLogout size={16} />
        Logout
      </button>
    </div>
  )}
</div>

      </div>

      {showAuth && <AuthModel onClose={() => setShowAuth(false)} />}
    </div>
  )
}

export default Navbar