import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import axios from 'axios'
import { ServerUrl } from "../App"
import Step3Report from '@/components/Step3Report'

const InterviewReport = () => {
  const { id } = useParams()
  const [report, setReport] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true)

        const result = await axios.get(
          `${ServerUrl}/api/interview/report/${id}`,
          { withCredentials: true }
        )

        setReport(result.data)
        setLoading(false)

      } catch (error) {
        console.log(error)
        setError(true)
        setLoading(false)
      }
    }

    fetchReport()
  }, [id])   // ✅ FIXED

  // 🔥 LOADING STATE (dark theme)
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-400">Loading report...</p>
        </div>
      </div>
    )
  }

  // ❌ ERROR STATE
  if (error || !report) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-red-400">
          Failed to load report. Please try again.
        </p>
      </div>
    )
  }

  return <Step3Report report={report} />
}

export default InterviewReport