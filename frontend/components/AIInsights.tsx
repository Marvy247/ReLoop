'use client';

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DonutChart } from '@/components/ui/DonutChart'; // Assuming the new component is here

interface ProductHistory {
  timestamp: bigint;
  eventDescription: string;
  actor: string;
}

interface AIInsightsProps {
  history: ProductHistory[] | null;
  retired: boolean | null;
  metadata: { [key: string]: unknown } | null;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ history, retired, metadata }) => {
  const insights = useMemo(() => {
    if (!history || retired === null) {
      return {
        sustainabilityScore: 0,
        carbonFootprint: 'Calculating...',
        recyclingImpact: 'Awaiting data...',
        recommendation: 'Connect wallet to analyze product lifecycle.',
        timeline: [],
      };
    }

    let score = 30;
    if ((metadata?.materials as string)?.toLowerCase().includes('recycled')) score += 20;
    if (history.length > 1) score += 15;
    if (retired) score = 95;

    const carbonFootprint = retired ? '0.5 kg CO2e' : '12.5 kg CO2e';
    const recyclingImpact = retired
      ? 'Contributed to ~80% reduction in landfill waste for this item.'
      : 'Recycling this item could reduce landfill waste by up to 80%.';
    const recommendation = retired
      ? 'Great job! Look for other products with Digital Twins to continue your sustainable journey.'
      : 'Once you are done with this product, find a verified partner to recycle it and earn B3TR rewards!';

    return { sustainabilityScore: Math.min(score, 100), carbonFootprint, recyclingImpact, recommendation, timeline: history };
  }, [history, retired, metadata]);

  return (
    <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8 w-full">
      <CardHeader>
        <CardTitle>AI-Powered Sustainability Analysis</CardTitle>
        <CardDescription>
          Real-time analysis of the product&apos;s lifecycle and environmental impact.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid md:grid-cols-2 gap-8 items-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <DonutChart score={insights.sustainabilityScore} />
          <div className="text-center">
            <p className="font-semibold text-lg">Overall Sustainability Score</p>
            <p className="text-sm text-gray-500">Based on materials, lifecycle events, and end-of-life status.</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <p className="font-semibold">Carbon Footprint Estimate</p>
            <p className="text-green-600 dark:text-green-400">{insights.carbonFootprint}</p>
          </div>
          <div>
            <p className="font-semibold">Recycling Impact</p>
            <p className="text-green-600 dark:text-green-400">{insights.recyclingImpact}</p>
          </div>
          <div>
            <p className="font-semibold">AI Recommendation</p>
            <p className="text-blue-600 dark:text-blue-400">{insights.recommendation}</p>
          </div>
        </div>
      </CardContent>
      <CardContent>
        <h3 className="text-lg font-semibold mb-4">AI-Analyzed Lifecycle Timeline</h3>
        <div className="relative border-l-2 border-gray-200 dark:border-gray-700 ml-2">
          {insights.timeline && insights.timeline.length > 0 ? (
            insights.timeline.map((event, index) => (
              <div key={index} className="mb-8 ml-6">
                <span className="absolute flex items-center justify-center w-6 h-6 bg-blue-100 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900 dark:bg-blue-900">
                  <svg className="w-2.5 h-2.5 text-blue-800 dark:text-blue-300" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z"/>
                    <path d="M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                  </svg>
                </span>
                <h4 className="flex items-center mb-1 text-base font-semibold text-gray-900 dark:text-white">
                  {event.eventDescription}
                  {index === 0 && <Badge variant="secondary" className="ml-3">Genesis Event</Badge>}
                </h4>
                <time className="block mb-2 text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
                  {new Date(Number(event.timestamp) * 1000).toLocaleString()}
                </time>
                <p className="text-xs text-gray-500 dark:text-gray-400">Actor: {event.actor}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 ml-6">No lifecycle events recorded yet.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};