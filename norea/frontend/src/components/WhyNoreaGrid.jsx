import { BookOpenCheck, Users, HeartHandshake, Sparkles, Award } from 'lucide-react';
import { Stagger, StaggerItem } from './ui/Motion';

export const WHY_PILLARS = [
  {
    icon: BookOpenCheck,
    title: 'Practical Learning',
    bg: 'from-indigo-500 to-blue-500',
    tint: 'bg-indigo-50/70 border-indigo-100',
    description:
      'Every session is built around real-world conversations, presentations and fun everyday scenarios — never boring memorisation.',
  },
  {
    icon: Users,
    title: 'Interactive Sessions',
    bg: 'from-rose-500 to-pink-500',
    tint: 'bg-rose-50/70 border-rose-100',
    description:
      'Lively group discussions, guided role-plays and collaborative games keep students actively participating from day one.',
  },
  {
    icon: HeartHandshake,
    title: 'Personal Attention',
    bg: 'from-amber-500 to-orange-500',
    tint: 'bg-amber-50/70 border-amber-100',
    description:
      'Friendly, small-group batches ensure every learner gets individual feedback, encouragement and space to shine.',
  },
  {
    icon: Sparkles,
    title: 'Confidence-Building Activities',
    bg: 'from-teal-500 to-emerald-500',
    tint: 'bg-teal-50/70 border-teal-100',
    description:
      'Step-by-step speaking practice, stage presence exercises and creative milestones help students overcome shyness naturally.',
  },
  {
    icon: Award,
    title: 'Experienced Trainers',
    bg: 'from-violet-600 to-purple-500',
    tint: 'bg-violet-50/70 border-violet-100',
    description:
      'Warm, supportive mentors bring patience, structure and enthusiasm to every class — nurturing both skill and self-belief.',
  },
];

export default function WhyNoreaGrid() {
  return (
    <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {WHY_PILLARS.map((item, i) => {
        const Icon = item.icon;
        return (
          <StaggerItem key={item.title} className={i === 4 ? 'sm:col-span-2 lg:col-span-1' : ''}>
            <div className={`h-full rounded-3xl border p-7 transition duration-300 hover:-translate-y-1 hover:shadow-lift ${item.tint}`}>
              <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${item.bg} text-white shadow-soft`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 font-serif text-2xl font-bold text-ink">{item.title}</h3>
              <p className="mt-2.5 text-sm leading-relaxed text-slate-600">{item.description}</p>
            </div>
          </StaggerItem>
        );
      })}
    </Stagger>
  );
}
