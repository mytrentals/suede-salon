import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export function StylistSignupPage() {
  const [step, setStep] = useState('location');
  const [tier, setTier] = useState('monthly');
  const [locationId, setLocationId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      const data = await response.json();
      setLocations(data.locations);
      if (data.locations.length > 0) {
        setLocationId(data.locations[0].id);
      }
    } catch (err) {
      console.error('Error fetching locations:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading locations...</div>;
  }

  const selectedLocation = locations.find(l => l.id === locationId);
  const isLocationFull = selectedLocation && selectedLocation.available_chairs <= 0;

  return (
    <div className="signup-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '48px', marginBottom: '12px' }}>
          Join Suede Salon
        </h1>
        <p style={{ fontSize: '16px', color: '#666' }}>
          Private chair rental for independent licensed stylists
        </p>
      </div>

      {step === 'location' ? (
        <div>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', marginBottom: '24px' }}>
            Select Your Location
          </h2>
          {locations.map((location) => (
            <div
              key={location.id}
              onClick={() => { if (location.available_chairs > 0) setLocationId(location.id); }}
              style={{
                padding: '24px',
                border: locationId === location.id ? '2px solid #1a1a1a' : '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: location.available_chairs > 0 ? 'pointer' : 'not-allowed',
                backgroundColor: locationId === location.id ? '#f9f9f9' : 'white',
                marginBottom: '16px',
                opacity: location.available_chairs > 0 ? 1 : 0.5,
              }}
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '24px', marginBottom: '8px' }}>
                {location.name}
              </h3>
              <p style={{ fontSize: '14px', color: '#666', marginBottom: '12px' }}>{location.address}</p>
              <p style={{ fontSize: '16px', fontWeight: '600' }}>
                {location.available_chairs > 0 ? (
                  <span style={{ color: '#228B22' }}>✓ {location.available_chairs} chair{location.available_chairs !== 1 ? 's' : ''} available</span>
                ) : (
                  <span style={{ color: '#c00' }}>✕ Location full</span>
                )}
              </p>
            </div>
          ))}
          <button
            onClick={() => setStep('tier')}
            disabled={isLocationFull}
            style={{
              width: '100%', padding: '14px',
              backgroundColor: isLocationFull ? '#ccc' : '#1a1a1a',
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '16px', fontWeight: '600',
              cursor: isLocationFull ? 'default' : 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      ) : step === 'tier' ? (
        <div>
          <button onClick={() => setStep('location')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
            ← Back
          </button>
          <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', marginBottom: '24px' }}>
            Choose Your Tier
          </h2>
          {[
            { id: 'weekly', label: 'Weekly', price: '$300/week', desc: '✓ Best for part-time stylists', amount: 30000 },
            { id: 'monthly', label: 'Monthly', price: '$1,100/month', desc: '✓ Best for full-time stylists', amount: 110000 },
          ].map((t) => (
            <div
              key={t.id}
              onClick={() => setTier(t.id)}
              style={{
                padding: '32px',
                border: tier === t.id ? '2px solid #1a1a1a' : '2px solid #e0e0e0',
                borderRadius: '8px', cursor: 'pointer',
                backgroundColor: tier === t.id ? '#f9f9f9' : 'white',
                marginBottom: '20px',
              }}
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '28px', marginBottom: '8px' }}>{t.label}</h3>
              <p style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px' }}>{t.price}</p>
              <p style={{ fontSize: '14px', color: '#666' }}>{t.desc}</p>
            </div>
          ))}
          <button
            onClick={() => setStep('form')}
            style={{
              width: '100%', padding: '14px', backgroundColor: '#1a1a1a',
              color: 'white', border: 'none', borderRadius: '4px',
              fontSize: '16px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            Continue
          </button>
        </div>
      ) : (
        <div>
          <button onClick={() => setStep('tier')} style={{ background: 'none', border: 'none', color: '#666', cursor: 'pointer', marginBottom: '24px', fontSize: '14px' }}>
            ← Back
          </button>
          <Elements stripe={stripePromise} options={{ mode: 'subscription', currency: 'usd', amount: tier === 'weekly' ? 30000 : 110000, paymentMethodCreation: 'manual' }}>
            <SignupForm tier={tier} locationId={locationId} locationName={selectedLocation?.name} />
          </Elements>
        </div>
      )}
    </div>
  );
}

function SignupForm({ tier, locationId, locationName }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', licenseNumber: '', startDate: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Submit elements first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message);
        setIsLoading(false);
        return;
      }

      // Step 2: Create payment method
      const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
        elements,
        params: {
          billing_details: {
            name: formData.name,
            email: formData.email,
          },
        },
      });

      if (pmError) {
        setError(pmError.message);
        setIsLoading(false);
        return;
      }

      // Step 3: Submit to backend
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

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Signup failed');
        setIsLoading(false);
        return;
      }

      alert('Signup complete! Check your email for next steps.');
      setFormData({ name: '', email: '', phone: '', licenseNumber: '', startDate: '' });
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    }

    setIsLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '10px',
    border: '1px solid #ccc', borderRadius: '4px',
    fontSize: '14px', boxSizing: 'border-box',
    marginBottom: '16px',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', marginBottom: '24px' }}>
        Complete Your Profile
      </h2>

      <div style={{ padding: '16px', backgroundColor: '#f9f9f9', borderRadius: '4px', marginBottom: '24px' }}>
        <p style={{ fontSize: '12px', color: '#666', marginBottom: '4px', textTransform: 'uppercase' }}>Location</p>
        <p style={{ fontSize: '16px', fontWeight: '600' }}>{locationName}</p>
        <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>{tier === 'weekly' ? '$300/week' : '$1,100/month'}</p>
      </div>

      {[
        { label: 'Full Name', name: 'name', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Phone', name: 'phone', type: 'tel' },
        { label: 'License Number', name: 'licenseNumber', type: 'text' },
        { label: 'Start Date', name: 'startDate', type: 'date' },
      ].map((field) => (
        <div key={field.name}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '600' }}>
            {field.label}
          </label>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            required
            style={inputStyle}
          />
        </div>
      ))}

      <div style={{ marginBottom: '24px' }}>
        <label style={{ display: 'block', marginBottom: '12px', fontSize: '14px', fontWeight: '600' }}>
          Payment Method
        </label>
        <PaymentElement />
      </div>

      {error && (
        <div style={{ padding: '12px', backgroundColor: '#ffe6e6', color: '#c00', borderRadius: '4px', marginBottom: '16px', fontSize: '14px' }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          width: '100%', padding: '14px',
          backgroundColor: isLoading ? '#ccc' : '#1a1a1a',
          color: 'white', border: 'none', borderRadius: '4px',
          fontSize: '16px', fontWeight: '600',
          cursor: isLoading ? 'default' : 'pointer',
        }}
      >
        {isLoading ? 'Processing...' : 'Complete Signup'}
      </button>

      <p style={{ fontSize: '12px', color: '#999', marginTop: '16px', textAlign: 'center' }}>
        By signing up, you agree to our chair rental agreement terms.
      </p>
    </form>
  );
}
