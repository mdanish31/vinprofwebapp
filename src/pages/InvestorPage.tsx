import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, HandCoins, ArrowRight, CheckCircle, BarChart3, Shield,
  Users, Globe
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { PublicNavbar } from '../components/layout/PublicNavbar';

const benefits = [
  { icon: BarChart3, title: 'Curated Deal Flow', description: 'Access a continuously updated pipeline of vetted, high-potential projects across industries.' },
  { icon: Users, title: 'Direct Founder Access', description: 'Connect one-on-one with founders who have been verified and are actively seeking investment.' },
  { icon: Shield, title: 'Due Diligence Support', description: 'Our advisory network helps you evaluate opportunities with confidence and clarity.' },
  { icon: Globe, title: 'Diverse Portfolio', description: 'From deep tech to sustainable ventures — explore opportunities across sectors and geographies.' },
];

const highlights = [
  'Explore innovative projects from verified inventors',
  'Filter opportunities by sector, stage, and geography',
  'Connect directly with founders for conversations',
  'Receive regular curated investment briefings',
  'Join an elite community of forward-thinking investors',
  'Build lasting partnerships with visionary entrepreneurs',
];

export default function InvestorPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-b from-blue-900 via-blue-800 to-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <HandCoins size={12} className="text-blue-300" />
            Investor Portal
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Investor Portal
          </h1>

          <p className="text-xl sm:text-2xl text-blue-200 font-medium mb-5">
            Are you interested and willing to invest in promising projects?
          </p>

          <p className="text-lg text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            Join our Investor Portal and discover curated opportunities. Connect with visionary founders, evaluate innovative projects, and become part of a network that shapes tomorrow.
          </p>

          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-blue-500 hover:bg-blue-400 text-white border-0"
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Join Investor Portal
          </Button>
        </div>
      </section>

      {/* Photo */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <img
            src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Investors collaborating"
            className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">Why join the Investor Portal?</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Everything you need to discover, evaluate, and act on investment opportunities — all in one place.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="w-11 h-11 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-4">
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
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What you get as an investor member</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Vinprof's Investor Portal is designed to give serious investors the access, tools, and community they need to make confident decisions and impactful investments.
              </p>
              <ul className="space-y-4">
                {highlights.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={17} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/register')}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  className="bg-blue-600 hover:bg-blue-700 border-0 text-white"
                >
                  Join Investor Portal
                </Button>
              </div>
            </div>

            <EnquiryForm
              defaultCategory="Investor"
              title="Apply to Join"
              subtitle="Tell us about your investment focus and we'll get you started."
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
