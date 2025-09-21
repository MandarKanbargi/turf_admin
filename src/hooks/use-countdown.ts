"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

interface UseCountdownProps {
  seconds: number; // Countdown start time in seconds
  onComplete?: () => void; // Optional callback when countdown completes
}

const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const useCountdown = ({ seconds, onComplete }: UseCountdownProps) => {
  const [timeLeft, setTimeLeft] = useState<number>(seconds);
  const [isActive, setIsActive] = useState<boolean>(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      if (onComplete) onComplete();
    }

    return () => clearTimeout(timer);
  }, [isActive, timeLeft, onComplete]);

  const start = useCallback(() => {
    setTimeLeft(seconds);
    setIsActive(true);
  }, [seconds]);

  const reset = useCallback(() => {
    setTimeLeft(seconds);
    setIsActive(false);
  }, [seconds]);

  const formattedTime = useMemo(() => formatTime(timeLeft), [timeLeft]);

  return {
    timeLeft, // raw seconds remaining
    formattedTime, // formatted as mm:ss
    isActive,
    start,
    reset,
  };
};
