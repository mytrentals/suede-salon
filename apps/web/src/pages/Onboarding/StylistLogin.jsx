import React, { useState } from 'react';
import SiteLayout from '@/components/SiteLayout';

export function StylistLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        const d = await response.json();
        setError(d.error || 'Failed to send link. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }

    setLoading(false);
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[36rem] px-6">

          <div className="mb-12 text-center suede-rise">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">
              Stylist Portal
            </span>
            <h1 className="mt-4 font-display text-5xl font-semibold text-ink">
              Access Your Dashboard
            </h1>
            <p className="mt-4 text-base leading-relaxed text-espresso/70">
              Enter your email address and we'll send you a secure link to your stylist dashboard.
            </p>
          </div>

          {sent ? (
            <div className="rounded-md border border-camel/40 bg-card px-8 py-10 text-center">
              <p className="font-display text-2xl font-semibold text-navy mb-3">Check your email</p>
              <p className="text-sm text-espresso/70 leading-relaxed">
                If <strong>{email}</strong> is registered with Suede Salon, you'll receive a dashboard link shortly.
              </p>
              <p className="mt-4 text-xs italic text-espresso/50">
                The link expires in 48 hours. Check your spam folder if you don't see it.
              </p>
              <button
                onClick={() => { setSent(false); setEmail(''); }}
                className="mt-6 text-[0.72rem] uppercase tracking-[0.2em] text-espresso/50 hover:text-navy transition-colors"
              >
                Try a different email
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="rounded-md border border-border bg-card px-8 py-10">
              <div className="mb-6">
                <label className="block mb-2 text-[0.72rem] uppercase tracking-[0.15em] text-espresso/60">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-espresso placeholder-espresso/40 focus:outline-none focus:border-navy transition-colors"
                />
              </div>

              {error && (
                <div className="mb-6 rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40"
              >
                {loading ? 'Sending…' : 'Send My Dashboard Link'}
              </button>

              <p className="mt-6 text-center text-xs italic text-espresso/50">
                Not a Suede Salon stylist? Contact us at{' '}
                <a href="mailto:info@suedesalonstl.com" className="text-navy underline">
                  info@suedesalonstl.com
                </a>
              </p>
            </form>
          )}

        </div>
      </div>
    </SiteLayout>
  );
}
