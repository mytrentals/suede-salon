import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
import { useParams } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';

const SALON_TZ = 'America/Chicago';
const PLAN_LABELS = { weekly: '$300 / week', monthly: '$1,100 / month' };
const PLAN_NAMES = { weekly: 'Weekly', monthly: 'Monthly' };

// Timestamp -> 'October 7, 2026' in salon (Central) time
const formatDate = (value) => value
  ? new Date(value).toLocaleDateString('en-US', { timeZone: SALON_TZ, month: 'long', day: 'numeric', year: 'numeric' })
  : '—';
const todayCentral = () => new Intl.DateTimeFormat('en-CA', { timeZone: SALON_TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const STATUS_LABELS = {
  active: '✓ Active',
  pending_agreement: 'Awaiting Signature',
  past_due: 'Payment Past Due',
  payment_pending: 'Payment Required',
  deactivated: 'Inactive',
  cancelled: 'Cancelled',
};

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
  const [showPaymentRetry, setShowPaymentRetry] = useState(false);
  const [notice, setNotice] = useState(null);
  // Profile editing
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', licenseNumber: '', insuranceCarrier: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState(null);
  // Plan change
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [selectedTier, setSelectedTier] = useState(null);
  const [planSaving, setPlanSaving] = useState(false);
  const [planError, setPlanError] = useState(null);

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

  const showNotice = (msg) => { setNotice(msg); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  const startEditProfile = () => {
    setProfileForm({
      name: stylist?.name || '',
      phone: stylist?.phone || '',
      licenseNumber: stylist?.licenseNumber || '',
      insuranceCarrier: stylist?.insuranceCarrier || '',
    });
    setProfileError(null);
    setEditingProfile(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/profile/${token}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setProfileError(data.error || 'Could not save your changes.'); setProfileSaving(false); return; }
      setEditingProfile(false);
      showNotice('✓ Your profile has been updated.');
      await fetchDashboard();
    } catch (err) {
      setProfileError('Could not save your changes. Please try again.');
    }
    setProfileSaving(false);
  };

  const openPlanModal = () => {
    setSelectedTier(subscription?.pendingTier || subscription?.tier || 'weekly');
    setPlanError(null);
    setShowPlanModal(true);
  };

  const submitPlanChange = async (tier) => {
    setPlanSaving(true);
    setPlanError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/change-plan/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setPlanError(data.error || 'Could not change your plan.'); setPlanSaving(false); return false; }
      setShowPlanModal(false);
      showNotice(`✓ ${data.message}`);
      await fetchDashboard();
      setPlanSaving(false);
      return true;
    } catch (err) {
      setPlanError('Could not change your plan. Please try again.');
    }
    setPlanSaving(false);
    return false;
  };

  const handleRequestCancellation = async () => {
    if (!cancelConfirmed) return;
    setCancelLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/request-cancellation/${token}`, {
        method: 'POST',
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) {
        setCancelSuccess(data.message || true);
        setShowCancelModal(false);
        setCancelConfirmed(false);
        fetchDashboard();
      } else {
        alert(data.error || 'Failed to submit cancellation. Please contact the salon directly.');
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
  const nextBilling = formatDate(subscription?.currentPeriodEnd);
  const startDate = stylist?.start_date ? String(stylist.start_date).slice(0, 10) : null;
  // Stripe's billing status wins; the start date is only a fallback if it's unavailable
  const notStartedYet = subscription?.billingStarted === false
    || (subscription?.billingStarted == null && !!startDate && startDate > todayCentral());
  const pendingTier = subscription?.pendingTier;
  const pendingEffective = formatDate(subscription?.pendingTierEffective);
  const canChangePlan = ['active', 'pending_agreement'].includes(subscription?.status) && !hasCancellationRequest;
  const paymentMethodText = subscription?.paymentMethodLabel
    || (subscription?.paymentMethodLast4 ? `•••• ${subscription.paymentMethodLast4}` : 'On file');

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

          {/* Payment Pending Banner */}
          {subscription?.status === 'payment_pending' && (
            <div className="mb-8 rounded-md border border-destructive/40 bg-destructive/5 px-6 py-5">
              <p className="text-sm font-semibold text-destructive mb-1">⚠️ Payment Required</p>
              <p className="text-sm text-espresso/70 mb-4">
                Your subscription was created but your payment didn't go through. Please update your payment method to activate your chair rental.
              </p>
              <button
                onClick={() => setShowPaymentRetry(true)}
                className="rounded-sm bg-destructive px-6 py-2.5 text-[0.72rem] uppercase tracking-[0.22em] text-white transition-opacity hover:opacity-90"
              >
                Update Payment & Retry
              </button>
            </div>
          )}

          {/* General notice (profile saved, plan changed) */}
          {notice && (
            <div className="mb-8 flex items-start justify-between gap-4 rounded-md border border-green-200 bg-green-50 px-6 py-4">
              <p className="text-sm text-green-900">{notice}</p>
              <button onClick={() => setNotice(null)} className="text-xs uppercase tracking-widest text-green-900/60 hover:text-green-900">Dismiss</button>
            </div>
          )}

          {/* Pending plan change */}
          {pendingTier && (
            <div className="mb-8 rounded-md border border-camel/40 bg-card px-6 py-5">
              <p className="text-sm font-semibold text-navy mb-1">Plan change scheduled</p>
              <p className="text-sm text-espresso/70 mb-4">
                You're switching to the <strong>{PLAN_NAMES[pendingTier]}</strong> plan ({PLAN_LABELS[pendingTier]}).
                Your current plan continues through your paid period, and your first {PLAN_NAMES[pendingTier].toLowerCase()} charge is on <strong>{pendingEffective}</strong>.
              </p>
              <button
                onClick={() => submitPlanChange(subscription.tier)}
                disabled={planSaving}
                className="rounded-sm border border-espresso/30 px-5 py-2 text-[0.7rem] uppercase tracking-[0.2em] text-espresso/70 hover:border-navy hover:text-navy transition-colors disabled:opacity-40"
              >
                {planSaving ? 'Updating…' : `Keep my ${PLAN_NAMES[subscription.tier]?.toLowerCase()} plan`}
              </button>
            </div>
          )}

          {/* Cancellation success */}
          {cancelSuccess && (
            <div className="mb-8 rounded-md border border-camel/40 bg-card px-6 py-4">
              <p className="text-sm text-espresso">
                ✓ Your cancellation request has been submitted and the salon has been notified.{' '}
                {typeof cancelSuccess === 'string' ? cancelSuccess : ''} A confirmation email is on its way.
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
                    {hasCancellationRequest ? 'Cancellation Pending' : STATUS_LABELS[subscription?.status] || subscription?.status}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Plan</span>
                  <span className="text-right text-sm font-medium text-espresso">
                    {PLAN_LABELS[subscription?.tier] || '—'}
                    {pendingTier && <span className="block text-xs font-normal text-camel">→ {PLAN_LABELS[pendingTier]} on {pendingEffective}</span>}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">{notStartedYet ? 'First Charge' : 'Next Billing'}</span>
                  <span className="text-sm font-medium text-espresso">{nextBilling}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Payment Method</span>
                  <span className="text-sm font-medium text-espresso">
                    {paymentMethodText}
                  </span>
                </div>
              </div>

              {hasCancellationRequest && (
                <div className="mt-6 rounded-sm border border-camel/30 bg-background px-4 py-3">
                  <p className="text-xs text-espresso/70">
                    Your chair rental ends on{' '}
                    <strong>{formatDate(subscription.requestedCancellationDate)}</strong>. You'll be billed as normal until then, and billing stops automatically after that date.
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
                {canChangePlan && (
                  <button
                    onClick={openPlanModal}
                    className="w-full rounded-sm border border-navy/40 py-3.5 text-[0.74rem] uppercase tracking-[0.22em] text-navy transition-colors hover:border-navy hover:bg-navy/5"
                  >
                    Change Plan
                  </button>
                )}
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
              <div className="mb-6 flex items-center justify-between">
                <h2 className="font-display text-2xl font-semibold text-navy">Your Profile</h2>
                {!editingProfile && (
                  <button onClick={startEditProfile} className="text-[0.7rem] uppercase tracking-[0.2em] text-navy hover:text-camel transition-colors">
                    Edit
                  </button>
                )}
              </div>

              {editingProfile ? (
                <form onSubmit={handleSaveProfile} className="space-y-4">
                  {[
                    { key: 'name', label: 'Full Name', type: 'text', required: true },
                    { key: 'phone', label: 'Phone', type: 'tel' },
                    { key: 'licenseNumber', label: 'License Number', type: 'text' },
                    { key: 'insuranceCarrier', label: 'Insurance Carrier', type: 'text' },
                  ].map(({ key, label, type, required }) => (
                    <div key={key}>
                      <label className="mb-1 block text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">{label}{required ? ' *' : ''}</label>
                      <input
                        type={type}
                        required={required}
                        value={profileForm[key]}
                        onChange={(e) => setProfileForm({ ...profileForm, [key]: e.target.value })}
                        className="w-full rounded-sm border border-border bg-background px-3 py-2.5 text-sm text-espresso focus:border-navy focus:outline-none"
                      />
                    </div>
                  ))}
                  <div>
                    <p className="mb-1 text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Email</p>
                    <p className="text-sm text-espresso">{stylist?.email}</p>
                    <p className="mt-1 text-xs text-espresso/50">To change your email, contact the salon.</p>
                  </div>
                  {profileError && (
                    <div className="rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{profileError}</div>
                  )}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button type="button" onClick={() => setEditingProfile(false)} className="rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy hover:text-navy transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={profileSaving} className="rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">
                      {profileSaving ? 'Saving…' : 'Save'}
                    </button>
                  </div>
                </form>
              ) : (
              <div className="space-y-4">
                {[
                  { label: 'Full Name', value: stylist?.name },
                  { label: 'Email', value: stylist?.email },
                  { label: 'Phone', value: stylist?.phone },
                  { label: 'License Number', value: stylist?.licenseNumber },
                  { label: 'Insurance Carrier', value: stylist?.insuranceCarrier },
                ].map(({ label, value }) => (
                  <div key={label} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <p className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50 mb-1">{label}</p>
                    <p className="text-sm text-espresso">{value || '—'}</p>
                  </div>
                ))}
              </div>
              )}
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
              Per your rental agreement, <strong>30 days written notice</strong> is required and there is no prorating.
              Your notice period starts today. Your rental ends at the end of the billing {subscription?.tier === 'weekly' ? 'week' : 'month'} in
              which your 30-day notice ends, and you'll be billed as normal until then. You'll see the exact end date after submitting.
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

      {/* Change Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4" onClick={() => !planSaving && setShowPlanModal(false)}>
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-2xl font-semibold text-navy mb-2">Change Your Plan</h2>
            <p className="text-sm text-espresso/70 leading-relaxed mb-6">
              {notStartedYet
                ? `Your chair rental hasn't started yet, so your plan switches right away. Your first charge will still be on your start date.`
                : `No partial charges or credits. Your current plan continues through the period you've already paid for (ending ${nextBilling}), and your new plan's first charge happens that day. You'll then be billed on that date each week or month.`}
            </p>

            <div className="space-y-3 mb-6">
              {['weekly', 'monthly'].map(tier => {
                const isCurrent = subscription?.tier === tier;
                const isSelected = selectedTier === tier;
                return (
                  <button
                    key={tier}
                    type="button"
                    onClick={() => setSelectedTier(tier)}
                    className={`w-full rounded-sm border px-5 py-4 text-left transition-colors ${
                      isSelected ? 'border-navy bg-navy/5' : 'border-border hover:border-navy/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-navy">{PLAN_NAMES[tier]}</span>
                      <span className="text-sm text-espresso">{PLAN_LABELS[tier]}</span>
                    </div>
                    {isCurrent && <span className="mt-1 block text-xs text-espresso/50">Your current plan</span>}
                    {pendingTier === tier && <span className="mt-1 block text-xs text-camel">Scheduled for {pendingEffective}</span>}
                  </button>
                );
              })}
            </div>

            {selectedTier && selectedTier !== subscription?.tier && selectedTier !== pendingTier && (
              <div className="mb-6 rounded-sm border border-camel/30 bg-card px-4 py-3 text-xs text-espresso/70 leading-relaxed">
                {notStartedYet
                  ? <>You'll be charged <strong>{PLAN_LABELS[selectedTier]}</strong> starting on your start date.</>
                  : <>Your first {PLAN_NAMES[selectedTier].toLowerCase()} charge will be on <strong>{nextBilling}</strong>, then every {selectedTier === 'weekly' ? 'week' : 'month'} from that date.</>}
              </div>
            )}

            {planError && (
              <div className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{planError}</div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowPlanModal(false)}
                disabled={planSaving}
                className="rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy hover:text-navy transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => submitPlanChange(selectedTier)}
                disabled={planSaving || !selectedTier || selectedTier === (pendingTier || subscription?.tier)}
                className="rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40"
              >
                {planSaving ? 'Updating…' : selectedTier === subscription?.tier && pendingTier ? 'Keep Current Plan' : 'Confirm Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Retry Modal */}
      {showPaymentRetry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-3">Update Payment Method</h2>
            <p className="text-sm text-espresso/70 mb-6">
              Enter a new payment method to activate your subscription.
            </p>
            <Elements stripe={stripePromise} options={{ mode: 'subscription', currency: 'usd', amount: subscription?.tier === 'weekly' ? 30000 : 110000, paymentMethodCreation: 'manual' }}>
              <RetryPaymentForm token={token} onSuccess={() => { setShowPaymentRetry(false); fetchDashboard(); }} onCancel={() => setShowPaymentRetry(false)} />
            </Elements>
          </div>
        </div>
      )}

    </SiteLayout>
  );
}

function RetryPaymentForm({ token, onSuccess, onCancel }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) { setError(submitError.message); setLoading(false); return; }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: { billing_details: {} },
      });
      if (pmError) { setError(pmError.message); setLoading(false); return; }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/retry-payment/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethod: paymentMethod.id }),
      });

      const data = await response.json();
      if (!response.ok) { setError(data.error || 'Payment failed'); setLoading(false); return; }

      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="rounded-sm border border-border bg-card p-4 mb-4">
        <PaymentElement />
      </div>
      {error && (
        <div className="mb-4 rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
      )}
      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
          Cancel
        </button>
        <button type="submit" disabled={loading} className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">
          {loading ? 'Processing...' : 'Pay Now'}
        </button>
      </div>
    </form>
  );
}
