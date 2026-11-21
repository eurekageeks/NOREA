import { BookOpenCheck, Users, HeartHandshake, Sparkles, Award } from 'lucide-react';
import { Stagger, StaggerItem } from './ui/Motion';

export const WHY_PILLARS = [
  {
    icon: BookOpenCheck,
    title: 'Practical Learning',
    description:
      'Every session is built around real-world conversations, presentations and everyday scenarios rather than rote memorisation.',
  },
  {
    icon: Users,
    title: 'Interactive Sessions',
    description:
      'Lively group discussions, guided role-plays and collaborative exercises keep learners actively engaged from day one.',
  },
  {
    icon: HeartHandshake,
    title: 'Personal Attention',
    description:
      'Thoughtfully structured cohorts ensure every learner receives individual guidance, constructive feedback and space to grow.',
  },
  {
    icon: Sparkles,
    title: 'Confidence-Building Activities',
    description:
      'Step-by-step speaking practice, stage presence exercises and reflective milestones help learners overcome hesitation naturally.',
  },
  {
    icon: Award,
    title: 'Experienced Trainers',
    description:
      'Dedicated mentors bring patience, structure and deep empathy to every class — nurturing both skill and self-belief.',
  },
];

export default function WhyNoreaGrid({ dark = false }) {
  return (
    <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {WHY_PILLARS.map((item, i) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.title} className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <div
              className={`h-full rounded-2xl border p-6 sm:p-7 transition duration-300 hover:-translate-y-0.5 ${
                dark
                  ? 'border-ivory/12 bg-navy-700/50 text-ivory hover:border-gold/45'
                  : 'border-beige/80 bg-white shadow-soft hover:border-gold/60 hover:shadow-lift'
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                  dark ? 'bg-gold/15 text-gold-light' : 'bg-sand text-gold-dark'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h3 className={`mt-5 font-serif text-2xl ${dark ? 'text-ivory' : 'text-navy'}`}>{item.title}</h3>
              <p className={`mt-2.5 text-sm leading-relaxed ${dark ? 'text-ivory/75' : 'text-muted'}`}>
                {item.description}
              </p>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
