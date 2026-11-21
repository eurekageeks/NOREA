import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import { useSeo } from '../../hooks/useSeo';

export default function NotFoundPage() {
  useSeo({ title: 'Page Not Found', noindex: true });
  return (
    <div className="container-x flex min-h-[65vh] flex-col items-center justify-center py-20 text-center">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-dark">404</p>
      <h1 className="display mt-3 text-5xl sm:text-6xl">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-muted">
        The page you are looking for may have been moved or no longer exists.
      </p>
      <div className="mt-8 flex gap-3">
        <Button to="/" variant="primary">
          <ArrowLeft className="h-4 w-4" /> Back to Home
        </Button>
        <Button to="/programs" variant="outline">
          Explore Programs
        </Button>
      </div>
    </div>
  );
}
