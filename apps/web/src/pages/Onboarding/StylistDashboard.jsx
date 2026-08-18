import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';

export function StylistDashboardPage() {
  const { token } = useParams();
  const [stylist, setStylist] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelSuccess, setCancelSuccess] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/dashboard/${token}`);
      if (!response.ok) {
        setError('This link is invalid or has expired. Please request a new one from the salon.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setStylist(data.stylist);
      setSubscription(data.subscription);
    } catch (err) {
      setError('Failed to load your dashboard. Please try again.');
      console.error(err);
    }
    setLoading(false);
  };

  const handlePortalRedirect = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/payment-portal/${token}`);
      const data = await response.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      alert('Failed to open payment portal. Please try again.');
    }
  };

  const handleRequestCancellation = async () => {
    if (!cancelConfirmed) return;
    setCancelLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/request-cancellation/${token}`, {
        method: 'POST',
      });
      if (response.ok) {
        setCancelSuccess(true);
        setShowCancelModal(false);
        fetchDashboard();
      } else {
        alert('Failed to submit cancellation. Please contact the salon directly.');
      }
    } catch (err) {
      alert('Error submitting cancellation. Please try again.');
    }
    setCancelLoading(false);
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
          <p className="text-espresso/60 text-sm uppercase tracking-[0.2em]">Loading your dashboard…</p>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-background pt-32 pb-24">
          <div className="mx-auto max-w-[36rem] px-6 text-center">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Dashboard Access</span>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Link Expired</h1>
            <p className="mt-4 text-base text-espresso/70">{error}</p>
            <p className="mt-6 text-sm italic text-espresso/50">
              Contact us at{' '}
              <a href="mailto:admin@suedesalonstl.com" className="text-navy underline">
                admin@suedesalonstl.com
              </a>{' '}
              to receive a new dashboard link.
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  const isActive = subscription?.status === 'active';
  const hasCancellationRequest = !!subscription?.requestedCancellationDate;
  const nextBilling = subscription?.currentPeriodEnd
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[56rem] px-6">

          {/* Header */}
          <div className="mb-12 suede-rise">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Stylist Portal</span>
            <h1 className="mt-2 font-display text-5xl font-semibold text-ink">
              Welcome, {stylist?.name?.split(' ')[0]}.
            </h1>
            <p className="mt-3 text-base text-espresso/60">
              Manage your Suede Salon chair rental subscription
            </p>
          </div>

          {/* Cancellation success */}
          {cancelSuccess && (
            <div className="mb-8 rounded-md border border-camel/40 bg-card px-6 py-4">
              <p className="text-sm text-espresso">
                ✓ Your cancellation request has been submitted. The salon has been notified and your subscription will remain active for 30 days.
              </p>
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">

            {/* Subscription Card */}
            <div className="rounded-md border border-border bg-card p-8">
              <h2 className="font-display text-2xl font-semibold text-navy mb-6">Your Subscription</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Status</span>
                  <span className={`text-sm font-medium ${
                    hasCancellationRequest ? 'text-destructive' : isActive ? 'text-green-700' : 'text-espresso/50'
                  }`}>
                    {hasCancellationRequest ? 'Cancellation Pending' : isActive ? '✓ Active' : subscription?.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Plan</span>
                  <span className="text-sm font-medium text-espresso">
                    {subscription?.tier === 'weekly' ? '$300 / week' : '$1,100 / month'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Next Billing</span>
                  <span className="text-sm font-medium text-espresso">{nextBilling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Payment Method</span>
                  <span className="text-sm font-medium text-espresso">
                    {subscription?.paymentMethodLast4 ? `•••• ${subscription.paymentMethodLast4}` : 'On file'}
                  </span>
                </div>
              </div>

              {hasCancellationRequest && (
                <div className="mt-6 rounded-sm border border-camel/30 bg-background px-4 py-3">
                  <p className="text-xs text-espresso/70">
                    Your subscription will remain active until{' '}
                    <strong>{new Date(subscription.requestedCancellationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</strong>.
                  </p>
                </div>
              )}

              <div className="mt-8 space-y-3">
                <button
                  onClick={handlePortalRedirect}
                  className="w-full rounded-sm bg-ink py-3.5 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                >
                  Manage Payment Method
                </button>
                {isActive && !hasCancellationRequest && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full rounded-sm border border-espresso/30 py-3.5 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 transition-colors hover:border-destructive hover:text-destructive"
                  >
                    Request Cancellation
                  </button>
                )}
              </div>
            </div>

            {/* Profile Card */}
            <div className="rounded-md border border-border bg-card p-8">
              <h2 className="font-display text-2xl font-semibold text-navy mb-6">Your Profile</h2>
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: stylist?.name },
                  { label: 'Email', value: stylist?.email },
                  { label: 'Phone', value: stylist?.phone },
                  { label: 'License Number', value: stylist?.licenseNumber },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50 mb-1">{label}</p>
                    <p className="text-sm text-espresso">{value || '—'}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Rental Agreement Reminder */}
          <div className="mt-8 rounded-md border border-camel/30 bg-card px-6 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-camel mb-2">Rental Agreement</p>
            <p className="text-xs text-espresso/60 leading-relaxed">
              Per your chair rental agreement, <strong>30 days written notice</strong> is required before cancellation. 
              Cancellation requests submitted here notify the salon and begin your 30-day notice period.
              No refunds or prorations are issued.
            </p>
          </div>

          {/* Contact */}
          <div className="mt-6 text-center">
            <p className="text-sm text-espresso/50">
              Questions? Contact us at{' '}
              <a href="mailto:admin@suedesalonstl.com" className="text-navy hover:text-camel transition-colors">
                admin@suedesalonstl.com
              </a>
            </p>
          </div>

        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-3">Request Cancellation</h2>
            <p className="text-sm text-espresso/70 leading-relaxed mb-6">
              Per your rental agreement, <strong>30 days written notice</strong> is required. 
              By submitting this request, you confirm that you have already provided written notice to the salon.
              Your subscription will remain active for 30 more days.
            </p>

            <label className="flex items-start gap-3 cursor-pointer mb-8">
              <input
                type="checkbox"
                checked={cancelConfirmed}
                onChange={(e) => setCancelConfirmed(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-navy"
              />
              <span className="text-sm text-espresso leading-relaxed">
                I confirm I have given 30 days written notice to Suede Salon and understand no refunds will be issued.
              </span>
            </label>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => { setShowCancelModal(false); setCancelConfirmed(false); }}
                className="rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy hover:text-navy transition-colors"
              >
                Keep My Chair
              </button>
              <button
                onClick={handleRequestCancellation}
                disabled={!cancelConfirmed || cancelLoading}
                className="rounded-sm bg-destructive py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white transition-opacity disabled:opacity-40"
              >
                {cancelLoading ? 'Submitting…' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </SiteLayout>
  );
}
