
'use client';

import React, { useEffect, useState } from 'react';

interface DonutChartProps {
  score: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({ score }) => {
  const [offset, setOffset] = useState(251.2); // Initial offset for 0%
  const [displayScore, setDisplayScore] = useState(0);

  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2

  useEffect(() => {
    const progress = score / 100;
    const newOffset = circumference * (1 - progress);
    setOffset(newOffset);

    // Animate score counting up
    let start = 0;
    const end = score;
    if (start === end) return;

    const duration = 1500; // 1.5 seconds
    const incrementTime = (duration / end) || 50;
    const timer = setInterval(() => {
      start += 1;
      setDisplayScore(start);
      if (start === end) {
        clearInterval(timer);
      }
    }, incrementTime);

    return () => clearInterval(timer);
  }, [score, circumference]);

  const getStrokeColor = (s: number) => {
    if (s < 40) return '#ef4444'; // red-500
    if (s < 75) return '#f59e0b'; // amber-500
    return '#22c55e'; // green-500
  };

  return (
    <div className="relative flex items-center justify-center w-48 h-48">
      <svg className="w-full h-full" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth="10"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        {/* Progress circle */}
        <circle
          className="transition-all duration-1000 ease-out"
          strokeWidth="10"
          stroke={getStrokeColor(score)}
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-3xl font-bold" style={{ color: getStrokeColor(score) }}>
          {displayScore}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">Score</span>
      </div>
    </div>
  );
};
