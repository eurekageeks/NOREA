import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSeo } from '../../hooks/useSeo';

export default function NotFoundPage() {
  useSeo({ title: 'Page Not Found' });
  return (
    <div className="container-x flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <span className="pill-eyebrow">404</span>
      <h1 className="display mt-4 text-5xl font-bold sm:text-6xl">Page not found</h1>
      <p className="mt-3 max-w-md text-sm text-slate-600">
        The page you are looking for may have moved. Let&apos;s get you back to exploring NŌRÉA!
      </p>
      <div className="mt-8 flex gap-3">
        <Button to="/" variant="primary">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
        <Button to="/programs" variant="outline">
          Our Programs
        </Button>
      </div>
    </div>
  );
}
