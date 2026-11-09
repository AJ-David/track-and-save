import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import Button from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#07070a] text-zinc-100 flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-7xl font-black text-red-500 mb-4 tracking-tight shadow-red-950">404</p>
        <h1 className="text-2xl font-black text-white mb-2">Page not found</h1>
        <p className="text-zinc-400 mb-8">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Link to="/dashboard">
          <Button icon={Home}>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

