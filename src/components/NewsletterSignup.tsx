import React from 'react';
import { Send, CheckCircle2 } from 'lucide-react';
import { getUiTranslation } from '../lib/translations.ts';

interface NewsletterSignupProps {
  language: 'en' | 'hi';
  triggerToast: (msg: string, type: 'success' | 'err' | 'info') => void;
}

export default function NewsletterSignup({ language, triggerToast }: NewsletterSignupProps) {
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      triggerToast(
        language === 'hi' 
          ? "कृपया एक वैध ईमेल पता दर्ज करें।" 
          : "Please enter a valid email address.", 
        'err'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      let data: any = {};
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          throw new Error('Subscription failed (invalid response format)');
        }
      } else {
        const text = await res.text();
        throw new Error(text.substring(0, 100) || 'Subscription failed (server error)');
      }
      if (!res.ok) {
        throw new Error(data.error || 'Subscription failed');
      }

      setSuccess(true);
      setEmail('');
      triggerToast(getUiTranslation(language, 'thankYouNews'), 'success');
    } catch (err: any) {
      triggerToast(
        err.message === 'This email address is already subscribed to our list!'
          ? getUiTranslation(language, 'alreadySubbed')
          : err.message,
        'err'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="bg-[#121417]/80 border-y border-white/5 py-12 md:py-16 font-sans relative overflow-hidden" id="newsletter-signup-block">
      {/* Background radial highlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        <div className="max-w-2xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white tracking-tight">
            {getUiTranslation(language, 'newsletterTitle')}
          </h2>
          <p className="text-[#999] text-xs sm:text-sm leading-relaxed">
            {getUiTranslation(language, 'newsletterSub')}
          </p>

          {success ? (
            <div className="flex items-center justify-center gap-2 bg-[#D4AF37]/10 border border-[#D4AF37]/20 p-4 rounded-xl max-w-md mx-auto mt-6 text-[#D4AF37] animate-fade-in">
              <CheckCircle2 size={18} />
              <span className="text-xs font-bold leading-none">
                {getUiTranslation(language, 'thankYouNews')}
              </span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-6">
              <input
                type="email"
                required
                disabled={loading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={getUiTranslation(language, 'enterEmail')}
                className="flex-grow bg-[#0C0D0E] border border-white/10 hover:border-white/20 focus:border-[#D4AF37]/50 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-gray-500 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-[#D4AF37] hover:bg-[#B48F27] active:scale-95 text-[#0C0D0E] font-bold py-3 px-6 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50 border-none"
              >
                <span>{getUiTranslation(language, 'subscribe')}</span>
                <Send size={14} className={loading ? 'animate-pulse' : ''} />
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
