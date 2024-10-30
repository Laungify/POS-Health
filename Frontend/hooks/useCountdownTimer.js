import { useEffect, useState } from 'react'
import { formatDistance } from 'date-fns'

function useCountdownTimer(appointmentDate) {
  const [remainingTime, setRemainingTime] = useState(() => {
    const currentTime = new Date()
    const timeDifference = appointmentDate - currentTime

    // Handle past dates
    if (timeDifference < 0) {
      return Math.abs(timeDifference) // Use the absolute difference for past dates
    }

    return timeDifference
  })

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime(prevRemainingTime => {
        if (prevRemainingTime <= 1000) {
          clearInterval(intervalId)
          return 0
        }
        return prevRemainingTime - 1000
      })
    }, 1000)

    return () => clearInterval(intervalId)
  }, [remainingTime])

  const formattedRemainingTime = formatDistance(appointmentDate, new Date(), {
    addSuffix: true,
  })

  return {
    remainingTime,
    formattedRemainingTime,
  }
}

export default useCountdownTimer
