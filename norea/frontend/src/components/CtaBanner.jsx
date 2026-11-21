import { ArrowRight } from 'lucide-react';
import Button from './ui/Button';
import { FadeIn } from './ui/Motion';
import { useSettings } from '../context/SettingsContext';

export default function CtaBanner({
  eyebrow = 'Begin Your Journey',
  heading = 'Ready to discover a more confident you?',
  body = 'Speak with our admissions team to find the program and learning mode that fits your goals.',
}) {
  const { settings } = useSettings();
  return (
    <section className="py-20 sm:py-24">
      <div className="container-x">
        <FadeIn>
          <div className="grain relative overflow-hidden rounded-3xl bg-navy px-7 py-14 text-center sm:px-14 sm:py-20">
            <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-3 text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-gold-light">
                <span className="h-px w-7 bg-gold/70" />
                {eyebrow}
                <span className="h-px w-7 bg-gold/70" />
              </span>
              <h2 className="mt-5 font-serif text-4xl leading-tight text-ivory sm:text-5xl">{heading}</h2>
              <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory/75 sm:text-base">{body}</p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
                <Button to="/admissions" variant="gold" size="lg">
                  Enquire Now <ArrowRight className="h-4 w-4" />
                </Button>
                <Button to="/programs" variant="outlineLight" size="lg">
                  Explore Programs
                </Button>
              </div>
              <p className="mt-7 text-xs uppercase tracking-[0.3em] text-gold-light/70">{settings.tagline}</p>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
