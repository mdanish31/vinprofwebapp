import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  TrendingUp, UserCheck, ArrowRight, CheckCircle, Star, BookOpen,
  Network, Award
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { EnquiryForm } from '../components/ui/EnquiryForm';
import { PublicNavbar } from '../components/layout/PublicNavbar';

const benefits = [
  { icon: BookOpen, title: 'Mentor Inventors', description: 'Share your expertise with driven innovators. Help them refine ideas and navigate the path from concept to company.' },
  { icon: Star, title: 'Support Investors', description: 'Provide sector-specific insights that help investors evaluate opportunities with greater confidence and accuracy.' },
  { icon: Network, title: 'Expand Your Network', description: 'Join a curated community of professionals where your advice creates real, measurable impact.' },
  { icon: Award, title: 'Build Your Legacy', description: 'Be recognized as a trusted authority. Your advisory track record on Vinprof speaks for itself.' },
];

const highlights = [
  'Create a verified advisor profile showcasing your expertise',
  'Get matched with inventors and founders who need your guidance',
  'Set your own advisory terms and availability',
  'Earn recognition within the Vinprof community',
  'Support investors with independent due diligence insights',
  'Help shape the next generation of groundbreaking companies',
];

const advisorTypes = [
  { title: 'Domain Experts', description: 'Deep technical or industry expertise in a specific field.' },
  { title: 'Serial Entrepreneurs', description: 'Founders who have built and scaled companies and want to give back.' },
  { title: 'Investment Advisors', description: 'Finance professionals who help evaluate and structure deals.' },
  { title: 'Strategy Consultants', description: 'Business strategists who help ventures reach product-market fit.' },
];

export default function AdvisorsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-20 bg-gradient-to-b from-emerald-900 via-teal-800 to-navy-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <UserCheck size={12} className="text-emerald-300" />
            Advisor Network
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Advisor Network
          </h1>

          <p className="text-xl sm:text-2xl text-emerald-200 font-medium mb-5">
            Guide emerging ventures, support innovators, and become part of a trusted advisory ecosystem.
          </p>

          <p className="text-lg text-white/65 max-w-2xl mx-auto mb-10 leading-relaxed">
            The world's best ideas need the right guidance to succeed. On Vinprof, your expertise becomes the catalyst that transforms ambition into achievement.
          </p>

          <Button
            size="lg"
            onClick={() => navigate('/register')}
            className="bg-emerald-500 hover:bg-emerald-400 text-white border-0"
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Join Advisor Network
          </Button>
        </div>
      </section>

      {/* Photo */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-5xl mx-auto px-4">
          <img
            src="https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=1200"
            alt="Advisors mentoring"
            className="w-full h-64 sm:h-80 object-cover rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">Why experienced professionals advise on Vinprof</h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Your knowledge has value. Put it to work in a place where it creates lasting impact.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map(({ icon: Icon, title, description }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                <div className="w-11 h-11 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon size={20} />
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advisor types */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">Who can be an advisor?</h2>
            <p className="text-gray-500">The Vinprof Advisor Network welcomes a wide range of expertise.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {advisorTypes.map(({ title, description }) => (
              <div key={title} className="bg-white rounded-xl border border-gray-200 p-5 shadow-card text-center">
                <h3 className="font-semibold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights + Form */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold text-navy-900 mb-4">What you get as a Vinprof Advisor</h2>
              <p className="text-gray-500 mb-8 leading-relaxed">
                Vinprof's Advisor Network is a community of accomplished professionals who believe in the power of shared knowledge to build better futures.
              </p>
              <ul className="space-y-4">
                {highlights.map(item => (
                  <li key={item} className="flex items-start gap-3 text-sm text-gray-700">
                    <CheckCircle size={17} className="text-emerald-500 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Button
                  onClick={() => navigate('/register')}
                  icon={<ArrowRight size={16} />}
                  iconPosition="right"
                  className="bg-emerald-600 hover:bg-emerald-700 border-0 text-white"
                >
                  Join Advisor Network
                </Button>
              </div>
            </div>

            <EnquiryForm
              defaultCategory="Advisor"
              title="Apply to Join"
              subtitle="Tell us about your expertise and the areas where you'd like to advise."
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
