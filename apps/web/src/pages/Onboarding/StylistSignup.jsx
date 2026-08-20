import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import SiteLayout from '@/components/SiteLayout';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function StylistSignupPage() {
  const [step, setStep] = useState('location');
  const [tier, setTier] = useState('monthly');
  const [locationId, setLocationId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteToken, setInviteToken] = useState(null);
  const [inviteError, setInviteError] = useState(null);
  const [inviteValidating, setInviteValidating] = useState(true);
  const [confirmation, setConfirmation] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const invite = params.get('invite');
    if (invite) {
      setInviteToken(invite);
      validateInvite(invite);
    } else {
      setInviteError('This signup page is by invitation only. Please contact Suede Salon to request an invitation.');
      setInviteValidating(false);
    }
  }, []);

  const validateInvite = async (invite) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/invite/${invite}`);
      if (!response.ok) {
        const d = await response.json();
        setInviteError(d.error || 'This invitation link is invalid or has expired.');
        setInviteValidating(false);
        return;
      }
      const data = await response.json();
      // Pre-fill location from invite
      setLocations([{ ...data.invite, available_chairs: 7, max_chairs: 7 }]);
      setLocationId(data.invite.location_id);
      setInviteValidating(false);
      setLoading(false);
    } catch (err) {
      setInviteError('Failed to validate invitation. Please try again.');
      setInviteValidating(false);
    }
  };

  const fetchLocations = async () => {
    // Locations are loaded via invite validation
  };

  const selectedLocation = locations.find(l => l.id === locationId);
  const isLocationFull = selectedLocation && selectedLocation.available_chairs <= 0;

  if (confirmation) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-background pt-32 pb-24">
          <div className="mx-auto max-w-[40rem] px-6 text-center">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Welcome to Suede</span>
            <h1 className="mt-6 font-display text-5xl font-semibold text-ink">
              You're confirmed.
            </h1>
            {confirmation.paymentFailed ? (
              <div className="mt-6 rounded-md border border-destructive/40 bg-destructive/5 px-6 py-4">
                <p className="text-sm font-semibold text-destructive mb-1">⚠️ Payment Failed</p>
                <p className="text-sm text-espresso/70">Your account was created but payment didn't go through. Check your email for a dashboard link where you can update your payment method.</p>
              </div>
            ) : (
              <p className="mt-6 text-base leading-relaxed text-espresso/80">
                Your chair rental at <strong>{confirmation.location}</strong> is now active.
              </p>
            )}

            <div className="mt-10 rounded-lg border border-camel/40 bg-card px-8 py-10 text-left">
              <h2 className="font-display text-2xl font-semibold text-navy mb-6">Subscription Details</h2>
              <div className="space-y-4">
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-sm text-espresso/60 uppercase tracking-[0.15em]">Location</span>
                  <span className="text-sm font-medium text-espresso">{confirmation.location}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-sm text-espresso/60 uppercase tracking-[0.15em]">Plan</span>
                  <span className="text-sm font-medium text-espresso">{confirmation.tier === 'weekly' ? '$300 / week' : '$1,100 / month'}</span>
                </div>
                <div className="flex justify-between border-b border-border pb-4">
                  <span className="text-sm text-espresso/60 uppercase tracking-[0.15em]">Status</span>
                  <span className="text-sm font-medium text-camel">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-espresso/60 uppercase tracking-[0.15em]">Name</span>
                  <span className="text-sm font-medium text-espresso">{confirmation.name}</span>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-lg bg-card border border-border px-8 py-8 text-left">
              <h3 className="font-display text-xl font-semibold text-navy mb-3">What happens next?</h3>
              <ul className="space-y-3 text-sm leading-relaxed text-espresso/80">
                <li className="flex gap-3">
                  <span className="text-camel font-semibold">1.</span>
                  <span>Check your email — we've sent a confirmation with your dashboard link.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-camel font-semibold">2.</span>
                  <span>Your dashboard lets you manage your subscription, update payment, or request cancellation.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-camel font-semibold">3.</span>
                  <span>Your first billing date is today. Subsequent charges will follow your {confirmation.tier === 'weekly' ? 'weekly' : 'monthly'} cycle.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-camel font-semibold">4.</span>
                  <span>Remember: per your rental agreement, 30 days written notice is required to cancel.</span>
                </li>
              </ul>
            </div>

            <p className="mt-8 text-sm italic text-espresso/60">
              Questions? Contact us at <a href="mailto:admin@suedesalonstl.com" className="text-navy underline">admin@suedesalonstl.com</a>
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (inviteValidating) {
    return (
      <SiteLayout>
        <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
        <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
          <p className="text-espresso/60 text-sm uppercase tracking-[0.2em]">Validating invitation…</p>
        </div>
      </SiteLayout>
    );
  }

  if (inviteError) {
    return (
      <SiteLayout>
        <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
        <div className="min-h-screen bg-background pt-32 pb-24">
          <div className="mx-auto max-w-[36rem] px-6 text-center">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Invitation Required</span>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink">Private Access Only</h1>
            <p className="mt-4 text-base text-espresso/70">{inviteError}</p>
            <p className="mt-6 text-sm italic text-espresso/50">
              Contact us at <a href="mailto:info@suedesalonstl.com" className="text-navy underline">info@suedesalonstl.com</a>
            </p>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (loading) {
    return (
      <SiteLayout>
        <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
        <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
          <p className="text-espresso/60 text-sm uppercase tracking-[0.2em]">Loading…</p>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[40rem] px-6">

          {/* Header */}
          <div className="mb-12 text-center suede-rise">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">
              Stylist Application
            </span>
            <h1 className="mt-4 font-display text-5xl font-semibold text-ink">
              Join Suede Salon
            </h1>
            <p className="mt-4 text-base leading-relaxed text-espresso/75">
              Private chair rental for independent licensed stylists
            </p>
          </div>

          {/* Step: Location */}
          {step === 'location' && (
            <div>
              <h2 className="font-display text-3xl font-semibold text-navy mb-6">
                Select Your Location
              </h2>
              {locations.length === 0 ? (
                <p className="text-espresso/60">No locations available.</p>
              ) : (
                locations.map((location) => (
                  <div
                    key={location.id}
                    onClick={() => { if (location.available_chairs > 0) setLocationId(location.id); }}
                    className={`mb-4 rounded-md border p-6 transition-all duration-200 cursor-pointer ${
                      locationId === location.id
                        ? 'border-navy bg-card shadow-sm'
                        : 'border-border bg-card hover:border-camel/60'
                    } ${location.available_chairs <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <h3 className="font-display text-2xl font-semibold text-navy">{location.name}</h3>
                    <p className="mt-1 text-sm text-espresso/60">{location.address}</p>
                    <p className="mt-3 text-sm font-medium">
                      {location.available_chairs > 0 ? (
                        <span className="text-green-700">✓ {location.available_chairs} chair{location.available_chairs !== 1 ? 's' : ''} available</span>
                      ) : (
                        <span className="text-destructive">✕ Location full</span>
                      )}
                    </p>
                  </div>
                ))
              )}
              <button
                onClick={() => setStep('tier')}
                disabled={isLocationFull || !locationId}
                className="mt-6 w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: Tier */}
          {step === 'tier' && (
            <div>
              <button onClick={() => setStep('location')} className="mb-6 text-[0.72rem] uppercase tracking-[0.2em] text-espresso/60 hover:text-navy transition-colors">
                ← Back
              </button>
              <h2 className="font-display text-3xl font-semibold text-navy mb-6">
                Choose Your Plan
              </h2>
              {[
                { id: 'weekly', label: 'Weekly', price: '$300', period: '/week', desc: 'Ideal for part-time or building stylists', amount: 30000 },
                { id: 'monthly', label: 'Monthly', price: '$1,100', period: '/month', desc: 'Best value for full-time professionals', amount: 110000 },
              ].map((t) => (
                <div
                  key={t.id}
                  onClick={() => setTier(t.id)}
                  className={`mb-4 rounded-md border p-8 transition-all duration-200 cursor-pointer ${
                    tier === t.id
                      ? 'border-navy bg-card shadow-sm'
                      : 'border-border bg-card hover:border-camel/60'
                  }`}
                >
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-display text-2xl font-semibold text-navy">{t.label}</h3>
                    <p className="font-display text-3xl font-semibold text-ink">
                      {t.price}<span className="text-base font-normal text-espresso/60">{t.period}</span>
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-espresso/60">{t.desc}</p>
                  {tier === t.id && (
                    <p className="mt-3 text-[0.7rem] uppercase tracking-[0.2em] text-camel">✓ Selected</p>
                  )}
                </div>
              ))}
              <button
                onClick={() => setStep('form')}
                className="mt-6 w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
              >
                Continue
              </button>
            </div>
          )}

          {/* Step: Form */}
          {step === 'form' && (
            <div>
              <button onClick={() => setStep('tier')} className="mb-6 text-[0.72rem] uppercase tracking-[0.2em] text-espresso/60 hover:text-navy transition-colors">
                ← Back
              </button>
              <Elements
                stripe={stripePromise}
                options={{
                  mode: 'subscription',
                  currency: 'usd',
                  amount: tier === 'weekly' ? 30000 : 110000,
                  paymentMethodCreation: 'manual',
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#1c2b47',
                      colorBackground: '#f5efe6',
                      colorText: '#3d2b1f',
                      fontFamily: 'DM Sans, sans-serif',
                      borderRadius: '4px',
                    },
                  },
                }}
              >
                <SignupForm
                  tier={tier}
                  locationId={locationId}
                  locationName={selectedLocation?.name}
                  onSuccess={setConfirmation}
                  inviteToken={inviteToken}
                  prefilledEmail={locations[0]?.email || ''}
                />
              </Elements>
            </div>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}

function SignupForm({ tier, locationId, locationName, onSuccess, inviteToken, prefilledEmail }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '', email: prefilledEmail || '', phone: '', licenseNumber: '', insuranceCarrier: '', startDate: '',
  });

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^(\d{3}[-.\s]?)?\d{3}[-.\s]?\d{4}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(formData.phone)) {
      errors.phone = 'Please enter a valid phone number (e.g., 314-555-0100)';
    }
    if (!formData.licenseNumber.trim()) errors.licenseNumber = 'License number is required';
    if (!formData.insuranceCarrier.trim()) errors.insuranceCarrier = 'Insurance carrier is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors({ ...fieldErrors, [name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form before submitting
    if (!validateForm()) {
      setError('Please fix the errors above and try again.');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      setIsLoading(false);
      return;
    }

    try {
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setIsLoading(false);
        return;
      }

      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: { name: formData.name, email: formData.email, phone: formData.phone },
        },
      });

      if (pmError) {
        setError(pmError.message);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          locationId,
          tier,
          paymentMethod: paymentMethod.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Mark invite as used
      if (inviteToken) {
        await fetch(`${import.meta.env.VITE_API_URL}/api/invite/${inviteToken}/use`, { method: 'POST' });
      }
      onSuccess({ ...data, tier, name: formData.name, paymentFailed: data.requiresPaymentUpdate });
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }

    setIsLoading(false);
  };

  const inputClass = "w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-espresso placeholder-espresso/40 focus:outline-none focus:border-navy transition-colors duration-200";
  const labelClass = "block mb-2 text-[0.72rem] uppercase tracking-[0.15em] text-espresso/60";

  return (
    <form onSubmit={handleSubmit}>
      <h2 className="font-display text-3xl font-semibold text-navy mb-2">
        Complete Your Profile
      </h2>

      {/* Summary */}
      <div className="mb-8 rounded-md border border-camel/40 bg-card px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-espresso/50">Location</p>
            <p className="text-sm font-medium text-espresso mt-0.5">{locationName}</p>
          </div>
          <div className="text-right">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-espresso/50">Plan</p>
            <p className="text-sm font-medium text-espresso mt-0.5">{tier === 'weekly' ? '$300/week' : '$1,100/month'}</p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass}>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Jane Smith" className={inputClass} />
          {fieldErrors.name && <p className="mt-1 text-xs text-destructive">{fieldErrors.name}</p>}
        </div>
        <div>
          <label className={labelClass}>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" className={inputClass} />
          {fieldErrors.email && <p className="mt-1 text-xs text-destructive">{fieldErrors.email}</p>}
        </div>
        <div>
          <label className={labelClass}>Phone Number</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="314-555-0100" className={inputClass} />
          {fieldErrors.phone && <p className="mt-1 text-xs text-destructive">{fieldErrors.phone}</p>}
        </div>
        <div>
          <label className={labelClass}>Missouri License Number</label>
          <input type="text" name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} placeholder="MO-XXXXXXX" className={inputClass} />
          {fieldErrors.licenseNumber && <p className="mt-1 text-xs text-destructive">{fieldErrors.licenseNumber}</p>}
        </div>
        <div>
          <label className={labelClass}>Liability Insurance Carrier</label>
          <input type="text" name="insuranceCarrier" value={formData.insuranceCarrier} onChange={handleChange} placeholder="e.g., State Farm, Allstate" className={inputClass} />
          {fieldErrors.insuranceCarrier && <p className="mt-1 text-xs text-destructive">{fieldErrors.insuranceCarrier}</p>}
        </div>
        <div>
          <label className={labelClass}>Desired Start Date</label>
          <input type="date" name="startDate" value={formData.startDate} onChange={handleChange} className={inputClass} />
          {fieldErrors.startDate && <p className="mt-1 text-xs text-destructive">{fieldErrors.startDate}</p>}
        </div>

        <div>
          <label className={labelClass}>Payment Method</label>
          <p className="mb-3 text-xs text-espresso/50 leading-relaxed">
            ACH bank transfer recommended. Card also accepted.
          </p>

            <PaymentElement
              options={{
                restrict: {
                  allowedPaymentMethodTypes: ['card', 'us_bank_account'],
                },
                wallets: {
                  applePay: 'never',
                  googlePay: 'never',
                },
              }}
            />

          </div>
        </div>
      </div>

      {error && (
        <div className="mt-6 rounded-sm border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="mt-8 w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        {isLoading ? 'Processing…' : 'Complete Signup'}
      </button>

      <p className="mt-4 text-center text-xs italic text-espresso/50">
        By signing up, you agree to our chair rental agreement. 30 days written notice required to cancel.
      </p>
    </form>
  );
}
