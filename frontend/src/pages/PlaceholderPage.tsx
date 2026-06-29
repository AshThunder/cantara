import { Link } from 'react-router-dom';
import { Header, Footer } from '@/components/layout';
import { Button, Card } from '@/components/ui';

export function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-cantara-mint to-white">
      <Header />
      <main className="flex-1 container mx-auto px-6 max-w-xl py-16">
        <Card className="p-10 text-center">
          <h1 className="text-2xl font-bold text-cantara-deep mb-2">{title}</h1>
          <p className="text-gray-500 mb-8">{desc}</p>
          <p className="text-sm text-cantara-teal mb-6">Coming soon — Daml contracts ready, backend integration next.</p>
          <Link to="/dashboard"><Button>Back to Dashboard</Button></Link>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
