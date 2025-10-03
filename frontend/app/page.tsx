import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="bg-gradient-to-br from-green-50 via-white to-blue-50 dark:from-green-900 dark:via-background dark:to-blue-900 min-h-screen">
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold text-foreground mb-6 leading-tight">
            Circular Economy on VeChain
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto">
            Empowering a sustainable future with Digital Twins
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-transform">
              <Link href="/mint">Mint Digital Twin</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3 hover:scale-105 transition-transform">
              <Link href="/recycle">Recycle Product</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Digital Twins</CardTitle>
              <CardDescription>
                Link physical products to NFTs for transparent lifecycle tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Every product gets a unique digital identity on the blockchain.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>Immutable History</CardTitle>
              <CardDescription>
                Track repairs, transfers, and recycling events forever
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Build trust in secondary markets with verifiable product history.</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
            <CardHeader>
              <CardTitle>B3TR Rewards</CardTitle>
              <CardDescription>
                Earn tokens for sustainable recycling actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Incentivize circular economy participation with blockchain rewards.</p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center animate-slide-up">
          <h3 className="text-2xl font-semibold mb-6">How It Works</h3>
          <div className="grid md:grid-cols-4 gap-6 text-sm max-w-4xl mx-auto">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl mb-3">🏭</div>
              <p>Brand mints Digital Twin NFT</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl mb-3">🛒</div>
              <p>Consumer purchases product</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl mb-3">♻️</div>
              <p>Product is used and recycled</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="text-3xl mb-3">🎁</div>
              <p>Rewards distributed via B3TR</p>
            </div>
          </div>
        </div>

        <div className="bg-primary text-primary-foreground py-16 mt-20 rounded-lg shadow-lg max-w-4xl mx-auto px-8 animate-fade-in">
          <h3 className="text-3xl font-bold mb-4 text-center">Join the Circular Economy Revolution</h3>
          <p className="text-lg max-w-2xl mx-auto mb-8 text-center">
            Be part of the sustainable future by minting your Digital Twin and participating in the B3TR rewards program.
          </p>
          <div className="flex justify-center gap-6">
            <Button asChild size="lg" className="px-10 py-4 text-xl hover:scale-105 transition-transform">
              <Link href="/mint">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="px-10 py-4 text-xl hover:scale-105 transition-transform">
              <Link href="/recycle">Learn More</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
