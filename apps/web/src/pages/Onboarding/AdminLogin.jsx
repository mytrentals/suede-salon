import React, { useState } from 'react';
import SiteLayout from '@/components/SiteLayout';

export function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setMessage(`Magic link sent to ${email}. Check your email and click the link to access the admin dashboard.`);
        setEmail('');
      } else {
        const data = await response.json();
        setError(data.error || 'Email not recognized as admin.');
      }
    } catch (err) {
      setError('Error sending link. Please try again.');
    }
    setLoading(false);
  };

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="max-w-md mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] text-espresso/50 mb-4">Admin Access</p>
            <h1 className="font-display text-4xl font-semibold text-ink">Sign In</h1>
          </div>

          <div className="rounded-lg border border-border bg-card p-8">
            {message && (
              <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3">
                <p className="text-sm text-green-700">{message}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 rounded-sm border border-destructive/20 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block mb-2 text-xs uppercase tracking-[0.2em] text-espresso/50 font-medium">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@example.com"
                  required
                  className="w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-espresso focus:outline-none focus:border-navy transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-sm bg-ink py-3 text-sm font-medium uppercase tracking-[0.2em] text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-ink/90 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>

            <div className="mt-8 rounded-sm border border-camel/30 bg-card px-4 py-3">
              <p className="text-xs text-espresso/60 leading-relaxed">
                We'll send you a secure magic link via email. Click the link to access your admin dashboard.
              </p>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
