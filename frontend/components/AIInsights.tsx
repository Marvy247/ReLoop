import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const mockInsights = {
  sustainabilityScore: 87,
  carbonFootprint: '12.5 kg CO2e',
  recyclingImpact: 'Estimated 75% reduction in landfill waste',
  recommendation: 'Consider using biodegradable packaging for next product iteration.',
};

export const AIInsights: React.FC = () => {
  return (
    <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300 mt-8">
      <CardHeader>
        <CardTitle>AI Sustainability Insights</CardTitle>
        <CardDescription>
          Simulated AI analysis of product lifecycle and environmental impact.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="font-semibold text-lg">Sustainability Score</p>
          <Badge variant="secondary" className="text-xl">{mockInsights.sustainabilityScore}%</Badge>
        </div>
        <div>
          <p><strong>Carbon Footprint:</strong> {mockInsights.carbonFootprint}</p>
        </div>
        <div>
          <p><strong>Recycling Impact:</strong> {mockInsights.recyclingImpact}</p>
        </div>
        <div>
          <p><strong>Recommendation:</strong> {mockInsights.recommendation}</p>
        </div>
      </CardContent>
    </Card>
  );
};
