import { ArrowRight, Sparkles } from 'lucide-react';
import Button from './ui/Button';
import { FadeIn } from './ui/Motion';
import { SITE } from '../config/siteConfig';

export default function CtaBanner({
  heading = 'Ready to discover a brighter, more confident you?',
  body = 'Submit a quick enquiry and get instant WhatsApp & Email confirmation with our upcoming batch details.',
}) {
  return (
    <section className="py-16 sm:py-22">
      <div className="container-x">
        <FadeIn>
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-indigo-700 via-violet-600 to-rose-500 px-7 py-14 text-center text-white shadow-lift sm:px-14 sm:py-18">
            <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-amber-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-teal-300/25 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-200 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" /> {SITE.tagline}
              </span>
              <h2 className="mt-5 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">{heading}</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">{body}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Button to="/admissions" variant="amber" size="lg">
                  Enquire Now <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/programs" variant="outlineLight" size="lg">
                  Explore Programs
                </Button>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
