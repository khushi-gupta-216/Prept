import React from 'react'
import { buildStyles, CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css';

const Timer = ({ timeLeft, totalTime }) => {
  const percentage = (timeLeft / totalTime) * 100;

  // 🔥 Dynamic color based on time left
  let color = "#f59e0b"; // amber (default)

  if (percentage < 50) color = "#f97316"; // orange
  if (percentage < 25) color = "#ef4444"; // red (urgent)

  return (
    <div className="w-24 h-24">
      <CircularProgressbar
        value={percentage}
        text={`${timeLeft}s`}
        styles={buildStyles({
          strokeLinecap: "round",
          trailColor: "#1f1f23", // dark background
          pathColor: color,
          textColor: color,
          textSize: "18px",
        })}
      />
    </div>
  )
}

export default Timer