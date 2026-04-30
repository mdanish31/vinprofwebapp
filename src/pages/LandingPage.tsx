import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  TrendingUp, Users, Star, Shield, Globe, Award,
  ArrowRight, CheckCircle, ChevronRight, Building2, Zap, Lightbulb, HandCoins,
  UserCheck
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { PublicNavbar } from '../components/layout/PublicNavbar';

const features = [
  {
    icon: HandCoins,
    title: 'Investor Network',
    description: 'Connect with curated investment opportunities. Evaluate promising projects from verified founders across industries.',
    color: 'bg-blue-50 text-blue-600',
  },
  {
    icon: Lightbulb,
    title: 'Inventor Hub',
    description: 'Showcase breakthrough ideas. Connect with investors, receive expert guidance, and turn innovation into opportunity.',
    color: 'bg-amber-50 text-amber-600',
  },
  {
    icon: UserCheck,
    title: 'Advisor Ecosystem',
    description: 'Experienced advisors guiding the next generation of ventures. Share expertise and shape tomorrow\'s success stories.',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: Users,
    title: 'Smart Networking',
    description: 'Intelligent matching connects you with the right professionals. Every connection is a door to new possibilities.',
    color: 'bg-sky-50 text-sky-600',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description: 'Every member is verified for authenticity. Build trust-first relationships in a credible, professional environment.',
    color: 'bg-navy-50 text-navy-700',
  },
  {
    icon: Globe,
    title: 'Global Reach',
    description: 'Connect across industries and geographies. Your professional vision, amplified on a worldwide stage.',
    color: 'bg-teal-50 text-teal-600',
  },
];

const stats = [
  { value: '50K+', label: 'Visionary Professionals' },
  { value: '8K+', label: 'Active Investors' },
  { value: '12K+', label: 'Innovative Projects' },
  { value: '96%', label: 'Satisfaction Rate' },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Angel Investor',
    company: 'Apex Ventures',
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=80',
    quote: 'Vinprof gave me access to a quality deal flow I could never find elsewhere. The inventor profiles are detailed and the advisory community is exceptional.',
  },
  {
    name: 'Marcus Johnson',
    role: 'Serial Inventor',
    company: 'NovaTech Labs',
    avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=80',
    quote: 'Within weeks of joining Vinprof, I had connected with three investors and two advisors who genuinely understood my vision. This platform is transformative.',
  },
  {
    name: 'Priya Sharma',
    role: 'Business Advisor',
    company: 'Growth Partners',
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=80',
    quote: 'Vinprof is where serious professionals come to make a real impact. The quality of founders I advise here is outstanding — ambitious, prepared, and driven.',
  },
];

const portalCards = [
  {
    icon: HandCoins,
    title: 'For Investors',
    subtitle: 'Investor Portal',
    description: 'Discover curated, high-potential projects. Connect directly with vetted founders and build a portfolio of visionary ideas.',
    cta: 'Explore Investor Portal',
    link: '/investor',
    bg: 'bg-gradient-to-br from-blue-600 to-blue-800',
    iconBg: 'bg-blue-500/30',
  },
  {
    icon: Lightbulb,
    title: 'For Inventors',
    subtitle: 'Inventor Portal',
    description: 'Present your innovation to the right audience. Connect with investors and advisors who can help you monetize your ideas.',
    cta: 'Explore Inventor Portal',
    link: '/inventor',
    bg: 'bg-gradient-to-br from-amber-500 to-orange-700',
    iconBg: 'bg-amber-400/30',
  },
  {
    icon: UserCheck,
    title: 'For Advisors',
    subtitle: 'Advisor Network',
    description: 'Lend your expertise to emerging ventures. Guide inventors and investors toward confident, well-informed decisions.',
    cta: 'Join Advisor Network',
    link: '/advisors',
    bg: 'bg-gradient-to-br from-emerald-600 to-teal-800',
    iconBg: 'bg-emerald-400/30',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-24 pb-16 lg:pt-32 lg:pb-24 bg-gradient-to-b from-navy-900 via-navy-800 to-royal-800 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-royal-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 -left-20 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-navy-700/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-medium px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <Zap size={12} className="text-emerald-400" />
            The Premium Network for Visionary Professionals
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight tracking-tight mb-5">
            Welcome to the Network of{' '}
            <span className="text-emerald-400">Visionary Professionals</span>
          </h1>

          <p className="text-lg sm:text-xl text-white/70 max-w-2xl mx-auto mb-4 leading-relaxed">
            Vinprof brings together investors, inventors, advisors, and entrepreneurs in one trusted ecosystem built for meaningful collaboration and growth.
          </p>

          <p className="text-base text-white/50 max-w-xl mx-auto mb-10">
            Stop networking. Start building real relationships that move ideas forward.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Button
              size="lg"
              variant="emerald"
              onClick={() => navigate('/register')}
              icon={<ArrowRight size={18} />}
              iconPosition="right"
            >
              Join Vinprof — It's Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate('/login')}
              className="border-white/30 text-white hover:bg-white/10 focus:ring-white/30"
            >
              Sign In
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto">
            {stats.map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl sm:text-3xl font-bold text-white">{value}</div>
                <div className="text-sm text-white/60 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section className="bg-gray-50 py-12 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex gap-4 justify-center flex-wrap">
            {[
              'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=300',
              'https://images.pexels.com/photos/3184298/pexels-photo-3184298.jpeg?auto=compress&cs=tinysrgb&w=300',
            ].map((src, i) => (
              <img
                key={i}
                src={src}
                alt="professionals"
                className="w-64 h-40 object-cover rounded-xl shadow-card"
              />
            ))}
          </div>
        </div>
      </section>

      {/* Portal Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Your role in the Vinprof ecosystem
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Whether you fund ideas, create them, or guide them — there is a dedicated space for you.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {portalCards.map(({ icon: Icon, title, subtitle, description, cta, link, bg, iconBg }) => (
              <div key={title} className={`${bg} rounded-2xl p-7 text-white flex flex-col gap-5 shadow-lg hover:-translate-y-1 transition-transform duration-200`}>
                <div className={`w-12 h-12 ${iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1">{subtitle}</p>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-sm text-white/75 leading-relaxed">{description}</p>
                </div>
                <button
                  onClick={() => navigate(link)}
                  className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors px-4 py-2.5 rounded-lg w-fit"
                >
                  {cta} <ArrowRight size={15} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Built for serious professionals
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Powerful capabilities designed to facilitate real collaboration between the people who shape the future.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description, color }) => (
              <div
                key={title}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4`}>
                  <Icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-navy-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Professionals & Businesses */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-card">
              <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mb-5">
                <Users size={22} className="text-navy-700" />
              </div>
              <h3 className="text-2xl font-bold text-navy-900 mb-2">For Individuals</h3>
              <p className="text-gray-500 mb-6">Accelerate your vision with the tools that matter.</p>
              <ul className="space-y-3">
                {[
                  'Build a verified professional profile',
                  'Connect with investors who believe in your ideas',
                  'Find advisors with relevant domain expertise',
                  'Share your work and grow your influence',
                  'Discover opportunities that match your goals',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                    <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/register')}
                className="mt-8 w-full"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Start Your Journey
              </Button>
            </div>

            <div className="bg-navy-800 rounded-2xl border border-navy-700 p-8 shadow-card">
              <div className="w-12 h-12 bg-navy-700 rounded-xl flex items-center justify-center mb-5">
                <Building2 size={22} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">For Organizations</h3>
              <p className="text-white/60 mb-6">Discover talent, fund innovation, shape the future.</p>
              <ul className="space-y-3">
                {[
                  'Access a curated pipeline of innovation',
                  'Connect with pre-screened inventors and founders',
                  'Build your investment or advisory portfolio',
                  'Strengthen your brand among visionary professionals',
                  'Participate in shaping emerging industries',
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-sm text-white/80">
                    <CheckCircle size={16} className="text-emerald-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => navigate('/register')}
                variant="emerald"
                className="mt-8 w-full"
                icon={<ChevronRight size={16} />}
                iconPosition="right"
              >
                Join as an Organization
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-navy-900 mb-4">
              Trusted by visionary professionals
            </h2>
            <p className="text-lg text-gray-500">
              Real stories from the Vinprof community.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {testimonials.map(({ name, role, company, avatar, quote }) => (
              <div key={name} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-5 italic">"{quote}"</p>
                <div className="flex items-center gap-3">
                  <img src={avatar} alt={name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold text-navy-900">{name}</p>
                    <p className="text-xs text-gray-500">{role} at {company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-navy-800 to-royal-700">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Award size={40} className="text-emerald-400 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to join the network of visionary professionals?
          </h2>
          <p className="text-lg text-white/70 mb-10">
            Vinprof is where great minds meet great opportunities. Your next breakthrough connection is waiting.
          </p>
          <Button
            size="lg"
            variant="emerald"
            onClick={() => navigate('/register')}
            icon={<ArrowRight size={18} />}
            iconPosition="right"
          >
            Get Started for Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-900 text-white/60 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-navy-700 rounded-lg flex items-center justify-center">
                <TrendingUp size={15} className="text-white" />
              </div>
              <span className="font-bold text-white text-lg">Vinprof</span>
            </div>
            <div className="flex flex-wrap justify-center gap-5 text-sm">
              <Link to="/investor" className="hover:text-white transition-colors">Investors</Link>
              <Link to="/inventor" className="hover:text-white transition-colors">Inventors</Link>
              <Link to="/advisors" className="hover:text-white transition-colors">Advisors</Link>
              <span className="hover:text-white cursor-pointer transition-colors">About</span>
              <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
              <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
            </div>
            <p className="text-xs">&copy; 2026 Vinprof. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
