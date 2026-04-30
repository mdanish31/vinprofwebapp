import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { error: toastError, success } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    else if (fullName.trim().length < 2) e.fullName = 'Name must be at least 2 characters';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email address';
    if (!password) e.password = 'Password is required';
    else if (password.length < 8) e.password = 'Password must be at least 8 characters';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    const { error } = await signUp(email, password, fullName.trim());
    if (error) {
      setLoading(false);
      toastError('Registration failed', error.message);
    } else {
      success('Account created!', "Welcome to iampro. Let's complete your profile.");
      // Redirect to profile edit on first signup so user can set up their profile
      navigate('/profile/edit', { replace: true });
    }
  };

  const strengthInfo = () => {
    if (!password) return null;
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', textColor: 'text-red-500', width: 'w-1/4' };
    if (password.length < 8) return { label: 'Fair', color: 'bg-amber-500', textColor: 'text-amber-500', width: 'w-2/4' };
    if (password.length < 12) return { label: 'Good', color: 'bg-blue-500', textColor: 'text-blue-500', width: 'w-3/4' };
    return { label: 'Strong', color: 'bg-emerald-500', textColor: 'text-emerald-500', width: 'w-full' };
  };

  const strength = strengthInfo();

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-royal-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-modal p-8">
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 bg-navy-700 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" />
            </div>
            <span className="text-2xl font-bold text-navy-800 tracking-tight">Vinprof</span>
          </div>

          <h1 className="text-2xl font-bold text-navy-900 mb-1">Create your account</h1>
          <p className="text-sm text-gray-500 mb-7">Join the Network of Visionary Professionals</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full name"
              type="text"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Jane Smith"
              icon={<User size={16} />}
              error={errors.fullName}
              autoComplete="name"
            />

            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              icon={<Mail size={16} />}
              error={errors.email}
              autoComplete="email"
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  icon={<Lock size={16} />}
                  error={errors.password}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 bottom-2.5 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2">
                  <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.textColor}`}>
                    {strength.label} password
                  </p>
                </div>
              )}
            </div>

            <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="text-royal-600 hover:text-royal-700 font-semibold transition-colors">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-white/50 mt-4 px-4">
          By creating an account, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}