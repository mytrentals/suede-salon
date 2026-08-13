import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function StylistDashboardPage() {
  const { token } = useParams();
  const [stylist, setStylest] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelConfirmed, setCancelConfirmed] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, [token]);

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/dashboard/${token}`);
      if (!response.ok) {
        setError('Invalid or expired link. Please request a new one.');
        setLoading(false);
        return;
      }
      const data = await response.json();
      setStylest(data.stylist);
      setSubscription(data.subscription);
    } catch (err) {
      setError('Failed to load dashboard');
      console.error(err);
    }
    setLoading(false);
  };

  const handlePortalRedirect = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/payment-portal/${token}`);
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      alert('Failed to open payment portal');
    }
  };

  const handleRequestCancellation = async () => {
    if (!cancelConfirmed) {
      alert('Please confirm that you have given 30 days notice');
      return;
    }

    setCancelLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylist/request-cancellation/${token}`, {
        method: 'POST',
      });
      if (response.ok) {
        alert('Cancellation request submitted. Admin has been notified.');
        setShowCancelModal(false);
        fetchDashboard();
      } else {
        alert('Failed to submit cancellation request');
      }
    } catch (err) {
      alert('Error submitting cancellation request');
      console.error(err);
    }
    setCancelLoading(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#c00', marginBottom: '16px' }}>{error}</h2>
        <p style={{ color: '#666' }}>Contact the salon at admin@suede-salon.com for assistance.</p>
      </div>
    );
  }

  if (!stylist || !subscription) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const nextBillingDate = subscription.currentPeriodEnd 
    ? new Date(subscription.currentPeriodEnd).toLocaleDateString() 
    : 'N/A';

  const isSubscriptionActive = subscription.status === 'active';
  const hasCancellationRequest = !!subscription.requestedCancellationDate;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '48px', marginBottom: '12px' }}>
        Welcome, {stylist.name}
      </h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
        Manage your Suede Salon chair rental subscription
      </p>

      {/* Profile Card */}
      <div style={{
        padding: '32px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '32px',
      }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', marginBottom: '24px' }}>
          Your Profile
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Name
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{stylist.name}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Email
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{stylist.email}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Phone
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{stylist.phone}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              License Number
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{stylist.licenseNumber}</p>
          </div>
        </div>
      </div>

      {/* Subscription Card */}
      <div style={{
        padding: '32px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        marginBottom: '32px',
        borderLeft: '4px solid ' + (isSubscriptionActive ? '#228B22' : '#c00'),
      }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', marginBottom: '24px' }}>
          Subscription
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Status
            </p>
            <p style={{
              fontSize: '16px',
              fontWeight: '600',
              color: isSubscriptionActive ? '#228B22' : '#c00',
            }}>
              {isSubscriptionActive ? '✓ Active' : '✕ Inactive'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Plan
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>
              {subscription.tier === 'weekly' ? '$300/week' : '$1,100/month'}
            </p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Next Billing
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>{nextBillingDate}</p>
          </div>
          <div>
            <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '4px' }}>
              Payment Method
            </p>
            <p style={{ fontSize: '16px', fontWeight: '600' }}>
              {subscription.paymentMethodLast4 ? `•••• ${subscription.paymentMethodLast4}` : 'On file'}
            </p>
          </div>
        </div>

        {hasCancellationRequest && (
          <div style={{
            padding: '16px',
            backgroundColor: '#fff3cd',
            borderRadius: '4px',
            marginBottom: '24px',
            border: '1px solid #ffc107',
          }}>
            <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>
              ⚠️ Cancellation Pending
            </p>
            <p style={{ fontSize: '13px', color: '#664d03' }}>
              Your subscription will be cancelled on {new Date(subscription.requestedCancellationDate).toLocaleDateString()}.
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '32px' }}>
        <button
          onClick={handlePortalRedirect}
          style={{
            padding: '14px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
          }}
        >
          Manage Payment Method
        </button>

        {isSubscriptionActive && !hasCancellationRequest && (
          <button
            onClick={() => setShowCancelModal(true)}
            style={{
              padding: '14px',
              backgroundColor: 'white',
              color: '#c00',
              border: '2px solid #c00',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Request Cancellation
          </button>
        )}
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '32px',
            borderRadius: '8px',
            maxWidth: '400px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', marginBottom: '16px' }}>
              Request Cancellation
            </h2>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '20px' }}>
              <strong>Important:</strong> Per your rental agreement, 30 days written notice is required. By submitting this request, you confirm that you have already provided 30 days notice.
            </p>

            <label style={{ display: 'flex', alignItems: 'center', marginBottom: '24px' }}>
              <input
                type="checkbox"
                checked={cancelConfirmed}
                onChange={(e) => setCancelConfirmed(e.target.checked)}
                style={{ marginRight: '12px', width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '14px', cursor: 'pointer' }}>
                I confirm that I have given 30 days written notice to the salon
              </span>
            </label>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => setShowCancelModal(false)}
                style={{
                  padding: '12px',
                  backgroundColor: '#e0e0e0',
                  color: '#333',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontWeight: '600',
                }}
              >
                Close
              </button>
              <button
                onClick={handleRequestCancellation}
                disabled={!cancelConfirmed || cancelLoading}
                style={{
                  padding: '12px',
                  backgroundColor: cancelConfirmed ? '#c00' : '#ccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: cancelConfirmed ? 'pointer' : 'default',
                  fontWeight: '600',
                }}
              >
                {cancelLoading ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div style={{
        padding: '24px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        textAlign: 'center',
        borderTop: '1px solid #e0e0e0',
      }}>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
          Questions or issues?
        </p>
        <p style={{ fontSize: '14px' }}>
          Contact us at <strong>admin@suede-salon.com</strong>
        </p>
      </div>
    </div>
  );
}
