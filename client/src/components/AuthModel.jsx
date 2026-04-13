import Auth from '@/pages/Auth'
import React, { useEffect } from 'react'
import { FaTimes } from 'react-icons/fa'
import { useSelector } from 'react-redux'
import ReactDOM from 'react-dom'

const AuthModal = ({ onClose }) => {
    const { userData } = useSelector((state) => state.user)

    useEffect(() => {
        if (userData) {
            onClose()
        }
    }, [userData])

    return ReactDOM.createPortal(
        <div 
            className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm px-4'
            onClick={onClose} // click outside to close
        >
            <div 
                className='relative w-full max-w-md'
                onClick={(e) => e.stopPropagation()} // prevent closing inside
            >
                <button 
                    onClick={onClose} 
                    className='absolute top-4 right-4 text-gray-700 hover:text-black'>
                    <FaTimes size={18} />
                </button>

                <Auth isModel={true}/>
            </div>
        </div>,
        document.body
    )
}

export default AuthModal