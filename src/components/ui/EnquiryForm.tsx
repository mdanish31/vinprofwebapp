import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Button } from './Button';
import { Input } from './Input';
import { CheckCircle, User, Mail, Phone, MessageSquare } from 'lucide-react';

type Category = 'Investor' | 'Inventor' | 'Advisor';

interface Props {
  defaultCategory?: Category;
  title?: string;
  subtitle?: string;
}

export function EnquiryForm({ defaultCategory, title = 'Get in Touch', subtitle = 'Fill in your details and our team will reach out shortly.' }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState<Category>(defaultCategory || 'Investor');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!fullName.trim()) e.fullName = 'Full name is required';
    if (!email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!phone.trim()) e.phone = 'Phone number is required';
    if (!message.trim()) e.message = 'Please tell us a bit about yourself';
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);

    const payload = {
      full_name: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      category,
      message: message.trim(),
    };

    const { error } = await supabase.from('enquiries').insert(payload);

    if (!error) {
      // Fire-and-forget email notification
      fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-enquiry-email`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify(payload),
        }
      ).catch(() => {/* best-effort */});

      setLoading(false);
      setSubmitted(true);
    } else {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-card">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-navy-900 mb-2">Thank you, {fullName.split(' ')[0]}!</h3>
        <p className="text-gray-500 text-sm leading-relaxed">
          Your enquiry has been received. Our team will get back to you at <strong className="text-navy-800">{email}</strong> within 24–48 hours.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-card">
      <h3 className="text-xl font-bold text-navy-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-6">{subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          type="text"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          placeholder="Jane Smith"
          icon={<User size={16} />}
          error={errors.fullName}
        />
        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="you@company.com"
          icon={<Mail size={16} />}
          error={errors.email}
        />
        <Input
          label="Phone Number"
          type="tel"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="+1 (555) 000-0000"
          icon={<Phone size={16} />}
          error={errors.phone}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value as Category)}
            className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all"
          >
            <option value="Investor">Investor</option>
            <option value="Inventor">Inventor</option>
            <option value="Advisor">Advisor</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Message</label>
          <div className="relative">
            <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Tell us about your goals and how Vinprof can help..."
              rows={4}
              className={`w-full pl-9 pr-3 py-2.5 text-sm border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-navy-400 focus:border-navy-400 transition-all resize-none ${errors.message ? 'border-red-400' : 'border-gray-300'}`}
            />
          </div>
          {errors.message && <p className="text-xs text-red-500 mt-1">{errors.message}</p>}
        </div>

        <Button type="submit" loading={loading} fullWidth size="lg" className="mt-2">
          Submit Enquiry
        </Button>
      </form>
    </div>
  );
}
