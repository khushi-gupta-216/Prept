import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'

import 'react-circular-progressbar/dist/styles.css';
const Timer = ({timeLeft,totalTime}) => {
  const percentage = (timeLeft / totalTime) * 100;
  return (
    <div className='w-20 h-20'>
        <CircularProgressbar value={percentage} text={`${timeLeft}s`} 
        styles={buildStyles({
          strokeLinecap: "round",
          trailColor: "#e0e7ff",  // light blue for background trail
pathColor: "#3b82f6",   // medium blue for the path
textSize: "20px",
textColor: "#1e3a8a"    // dark blue for the text
        })}
        />
    </div>
  )
}

export default Timer