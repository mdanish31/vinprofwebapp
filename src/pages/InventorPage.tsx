import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, Lightbulb, ArrowRight, CheckCircle, Rocket, HandCoins,
  UserCheck, Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { PublicNavbar } from '../components/layout/PublicNavbar';

const benefits = [
  { icon: HandCoins, title: 'Investor Connections', description: 'Showcase your invention to a curated pool of active investors who are genuinely seeking innovative projects.' },
  { icon: UserCheck, title: 'Expert Advisors', description: 'Get matched with advisors who have domain expertise to refine your idea and guide your path to market.' },
  { icon: Rocket, title: 'Business Acceleration', description: 'Access resources, mentorship, and network support to transform your concept into a scalable business.' },
  { icon: Globe, title: 'Global Exposure', description: 'Your innovation reaches a worldwide audience of investors, partners, and industry professionals on Vinprof.' },
];

const highlights = [
  'Create a rich inventor profile that tells your story',
  'Submit your invention for review and investor matching',
  'Receive structured feedback from experienced advisors',
  'Connect directly with investors aligned to your sector',
  'Protect your IP with guidance from our network',
  'Turn your invention into a fundable business opportunity',
];

export default function InventorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-b from-amber-700 via-orange-700 to-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-orange-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <Lightbulb size={12} className="text-amber-300" />
            Inventor Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Inventor Portal
          </h1>

          <p className="text-xl sm:text-2xl text-amber-200 font-medium mb-5">
            Do you have innovative ideas and want to monetize your invention?
          </p>

          <p className="text-lg text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            Come and join Vinprof. Connect with investors who share your vision, find advisors who can guide your journey, and transform your breakthrough idea into a real business opportunity.
          </p>

          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-amber-500 hover:bg-amber-400 text-white border-0"
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Join Inventor Portal
          </Button>
        </div>
      </section>

      {/* Photo */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <img
            src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Inventors collaborating"
            className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">Why inventors choose Vinprof</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              More than a platform — a launchpad for ideas that deserve to exist in the world.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="w-11 h-11 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights + Form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What inventors get on Vinprof</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Whether your idea is a sketch on a napkin or a working prototype, Vinprof gives you the network, guidance, and exposure to take it to the next level.
              </p>
              <ul className="space-y-4">
                {highlights.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={17} className="text-amber-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/register')}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  className="bg-amber-500 hover:bg-amber-600 border-0 text-white"
                >
                  Join Inventor Portal
                </Button>
              </div>
            </div>

            <EnquiryForm
              defaultCategory="Inventor"
              title="Apply to Join"
              subtitle="Share your invention and we'll connect you with the right people."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white/60 py-10">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-navy-700 rounded-lg flex items-center justify-center">
              <TrendingUp size={15} className="text-white" />
            </div>
            <span className="font-bold text-white text-lg">Vinprof</span>
          </Link>
          <p className="text-xs">&copy; 2026 Vinprof. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
