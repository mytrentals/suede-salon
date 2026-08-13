import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export function AdminDashboardPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [requestingLink, setRequestingLink] = useState(false);

  useEffect(() => {
    fetchData();
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${token}`);
      if (!response.ok) {
        setError('Invalid or expired admin link');
        setLoading(false);
        return;
      }
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError('Failed to load admin data');
      console.error(err);
    }
    setLoading(false);
  };

  const requestAdminLink = async () => {
    const email = prompt('Enter your admin email:');
    if (!email) return;

    setRequestingLink(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        alert('Magic link sent to your email!');
      } else {
        alert('Failed to send link. Check that you used the correct admin email.');
      }
    } catch (err) {
      alert('Error requesting link');
    }
    setRequestingLink(false);
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading admin dashboard...</div>;
  }

  if (error) {
    return (
      <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px', textAlign: 'center' }}>
        <h2 style={{ color: '#c00', marginBottom: '16px' }}>{error}</h2>
        <button
          onClick={requestAdminLink}
          disabled={requestingLink}
          style={{
            padding: '12px 24px',
            backgroundColor: '#1a1a1a',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
          }}
        >
          {requestingLink ? 'Sending...' : 'Request New Link'}
        </button>
      </div>
    );
  }

  if (!data || !data.locations || !data.stylists) {
    return <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>;
  }

  const filteredStylists = data.stylists.filter(s => {
    if (filterLocation !== 'all' && s.location_id !== parseInt(filterLocation)) {
      return false;
    }
    if (filterStatus === 'active' && s.status !== 'active') {
      return false;
    }
    if (filterStatus === 'cancellation' && !s.requested_cancellation_date) {
      return false;
    }
    return true;
  });

  const activeCount = data.stylists.filter(s => s.status === 'active').length;
  const pendingCancellations = data.stylists.filter(s => s.requested_cancellation_date).length;
  const monthlyRevenue = data.stylists
    .filter(s => s.status === 'active' && s.tier === 'monthly')
    .reduce((sum) => sum + 1100, 0);
  const weeklyRevenue = data.stylists
    .filter(s => s.status === 'active' && s.tier === 'weekly')
    .reduce((sum) => sum + 300, 0);

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
      <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: '48px', marginBottom: '12px' }}>
        Admin Dashboard
      </h1>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '40px' }}>
        Manage stylists and subscriptions
      </p>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        <div style={{
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #228B22',
        }}>
          <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
            Active Stylists
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700' }}>{activeCount}</p>
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #ffc107',
        }}>
          <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
            Pending Cancellations
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700' }}>{pendingCancellations}</p>
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #1a1a1a',
        }}>
          <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
            Monthly Revenue
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700' }}>${monthlyRevenue.toLocaleString()}</p>
        </div>

        <div style={{
          padding: '24px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #1a1a1a',
        }}>
          <p style={{ fontSize: '12px', color: '#999', textTransform: 'uppercase', marginBottom: '8px' }}>
            Weekly Revenue
          </p>
          <p style={{ fontSize: '32px', fontWeight: '700' }}>${(weeklyRevenue * 4).toLocaleString()}</p>
        </div>
      </div>

      {/* Location Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: '28px', marginBottom: '20px' }}>
          Locations
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {data.locations.map(location => (
            <div
              key={location.id}
              onClick={() => setFilterLocation(filterLocation === location.id.toString() ? 'all' : location.id.toString())}
              style={{
                padding: '20px',
                border: filterLocation === location.id.toString() ? '2px solid #1a1a1a' : '2px solid #e0e0e0',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: filterLocation === location.id.toString() ? '#f9f9f9' : 'white',
              }}
            >
              <h3 style={{ fontFamily: 'Cormorant Garamond', fontSize: '20px', marginBottom: '8px' }}>
                {location.name}
              </h3>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '12px' }}>
                {location.address}
              </p>
              <p style={{ fontSize: '14px', fontWeight: '600' }}>
                {location.active_stylists} / {location.max_chairs} chairs occupied
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginBottom: '24px',
      }}>
        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Filter by Status
          </label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="cancellation">Pending Cancellation</option>
          </select>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
            Filter by Location
          </label>
          <select
            value={filterLocation}
            onChange={(e) => setFilterLocation(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              fontSize: '14px',
            }}
          >
            <option value="all">All Locations</option>
            {data.locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Stylists Table */}
      <div style={{
        overflowX: 'auto',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px',
        }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Name</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Location</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Plan</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600' }}>Next Billing</th>
            </tr>
          </thead>
          <tbody>
            {filteredStylists.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                  No stylists found
                </td>
              </tr>
            ) : (
              filteredStylists.map(stylist => (
                <tr key={stylist.id} style={{ borderBottom: '1px solid #e0e0e0' }}>
                  <td style={{ padding: '16px' }}>
                    <p style={{ fontWeight: '600' }}>{stylist.name}</p>
                    <p style={{ fontSize: '12px', color: '#999' }}>License: {stylist.license_number}</p>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {stylist.location_name}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <a href={`mailto:${stylist.email}`} style={{ color: '#1a1a1a', textDecoration: 'none' }}>
                      {stylist.email}
                    </a>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {stylist.tier === 'weekly' ? '$300/week' : '$1,100/month'}
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600',
                      backgroundColor: stylist.status === 'active' ? '#d4edda' : '#f8d7da',
                      color: stylist.status === 'active' ? '#155724' : '#721c24',
                    }}>
                      {stylist.status === 'active' ? '✓ Active' : '✕ ' + stylist.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {stylist.current_period_end ? new Date(stylist.current_period_end).toLocaleDateString() : 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Notes */}
      <div style={{
        marginTop: '40px',
        padding: '24px',
        backgroundColor: '#fffbea',
        borderRadius: '8px',
        borderLeft: '4px solid #ffc107',
      }}>
        <p style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
          📋 Admin Notes
        </p>
        <ul style={{ fontSize: '13px', color: '#666', paddingLeft: '20px', margin: 0 }}>
          <li style={{ marginBottom: '6px' }}>
            Stylists with pending cancellations will be auto-cancelled on the scheduled date.
          </li>
          <li style={{ marginBottom: '6px' }}>
            Monitor chair capacity per location. Max 7 stylists per location.
          </li>
          <li>
            Monthly subscriptions renew on the stylist's signup date each month.
          </li>
        </ul>
      </div>
    </div>
  );
}
