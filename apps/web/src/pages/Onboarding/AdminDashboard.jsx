import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';

export function AdminDashboardPage() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterLocation, setFilterLocation] = useState('all');
  const [requestingLink, setRequestingLink] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);

  useEffect(() => {
    if (token) fetchData();
    else setLoading(false);
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

  const requestAdminLink = async (e) => {
    e.preventDefault();
    setRequestingLink(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });
      if (response.ok) {
        setError('Magic link sent! Check your email.');
        setShowEmailForm(false);
      } else {
        setError('Email not recognized. Please use your admin email address.');
      }
    } catch (err) {
      setError('Error requesting link. Please try again.');
    }
    setRequestingLink(false);
  };

  if (loading) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
          <p className="text-espresso/60 text-sm uppercase tracking-[0.2em]">Loading dashboard…</p>
        </div>
      </SiteLayout>
    );
  }

  if (error || !token) {
    return (
      <SiteLayout>
        <div className="min-h-screen bg-background pt-32 pb-24">
          <div className="mx-auto max-w-[36rem] px-6 text-center">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Admin Access</span>
            <h1 className="mt-4 font-display text-4xl font-semibold text-ink">
              {error || 'Sign in to continue'}
            </h1>
            <p className="mt-4 text-base text-espresso/70">
              Enter your admin email to receive a secure login link.
            </p>

            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="mt-8 rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
              >
                Request Access Link
              </button>
            ) : (
              <form onSubmit={requestAdminLink} className="mt-8 text-left">
                <label className="block mb-2 text-[0.72rem] uppercase tracking-[0.15em] text-espresso/60">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={(e) => setAdminEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full rounded-sm border border-border bg-card px-4 py-3 text-sm text-espresso placeholder-espresso/40 focus:outline-none focus:border-navy transition-colors duration-200 mb-4"
                />
                <button
                  type="submit"
                  disabled={requestingLink}
                  className="w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5 disabled:opacity-40"
                >
                  {requestingLink ? 'Sending…' : 'Send Magic Link'}
                </button>
              </form>
            )}
          </div>
        </div>
      </SiteLayout>
    );
  }

  const filteredStylists = (data?.stylists || []).filter(s => {
    if (filterLocation !== 'all' && s.location_id !== parseInt(filterLocation)) return false;
    if (filterStatus === 'active' && s.status !== 'active') return false;
    if (filterStatus === 'cancellation' && !s.requested_cancellation_date) return false;
    return true;
  });

  const activeCount = (data?.stylists || []).filter(s => s.status === 'active').length;
  const pendingCancellations = (data?.stylists || []).filter(s => s.requested_cancellation_date).length;
  const monthlyRevenue = (data?.stylists || []).filter(s => s.status === 'active' && s.tier === 'monthly').length * 1100;
  const weeklyRevenue = (data?.stylists || []).filter(s => s.status === 'active' && s.tier === 'weekly').length * 300 * 4;

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[90rem] px-6">

          {/* Header */}
          <div className="mb-12">
            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Suede Salon</span>
            <h1 className="mt-2 font-display text-5xl font-semibold text-ink">Admin Dashboard</h1>
            <p className="mt-3 text-base text-espresso/60">Manage stylists and chair rental subscriptions</p>
          </div>

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-12">
            {[
              { label: 'Active Stylists', value: activeCount, accent: 'border-camel' },
              { label: 'Pending Cancellations', value: pendingCancellations, accent: 'border-destructive' },
              { label: 'Monthly Chair Revenue', value: `$${monthlyRevenue.toLocaleString()}`, accent: 'border-navy' },
              { label: 'Est. Weekly Revenue', value: `$${weeklyRevenue.toLocaleString()}`, accent: 'border-hunter' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-md border-l-4 ${stat.accent} bg-card px-6 py-6 border border-border`}>
                <p className="text-[0.7rem] uppercase tracking-[0.2em] text-espresso/50 mb-2">{stat.label}</p>
                <p className="font-display text-4xl font-semibold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Locations */}
          <div className="mb-12">
            <h2 className="font-display text-2xl font-semibold text-navy mb-4">Locations</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {(data?.locations || []).map(location => (
                <div
                  key={location.id}
                  onClick={() => setFilterLocation(filterLocation === location.id.toString() ? 'all' : location.id.toString())}
                  className={`rounded-md border p-6 cursor-pointer transition-all duration-200 ${
                    filterLocation === location.id.toString()
                      ? 'border-navy bg-card shadow-sm'
                      : 'border-border bg-card hover:border-camel/60'
                  }`}
                >
                  <h3 className="font-display text-xl font-semibold text-navy">{location.name}</h3>
                  <p className="mt-1 text-xs text-espresso/50">{location.address}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 rounded-full bg-border h-1.5">
                      <div
                        className="rounded-full bg-camel h-1.5 transition-all"
                        style={{ width: `${(location.active_stylists / location.max_chairs) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-espresso/60 whitespace-nowrap">
                      {location.active_stylists} / {location.max_chairs} chairs
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            <div>
              <label className="block mb-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-sm border border-border bg-card px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-navy"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="cancellation">Pending Cancellation</option>
              </select>
            </div>
            <div>
              <label className="block mb-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Location</label>
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="rounded-sm border border-border bg-card px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-navy"
              >
                <option value="all">All Locations</option>
                {(data?.locations || []).map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border border-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-card">
                    {['Stylist', 'Location', 'Plan', 'Status', 'Next Billing', 'Joined'].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50 font-medium">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredStylists.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-5 py-10 text-center text-espresso/40 text-sm italic">
                        No stylists found
                      </td>
                    </tr>
                  ) : (
                    filteredStylists.map((stylist, i) => (
                      <tr key={stylist.id} className={`border-b border-border transition-colors ${i % 2 === 0 ? 'bg-background' : 'bg-card'} hover:bg-card`}>
                        <td className="px-5 py-4">
                          <p className="font-medium text-espresso">{stylist.name}</p>
                          <p className="text-xs text-espresso/50 mt-0.5">{stylist.email}</p>
                          <p className="text-xs text-espresso/40 mt-0.5">Lic: {stylist.license_number}</p>
                        </td>
                        <td className="px-5 py-4 text-espresso/70">{stylist.location_name}</td>
                        <td className="px-5 py-4">
                          <span className="inline-block rounded-sm border border-camel/40 px-2 py-1 text-[0.7rem] uppercase tracking-[0.1em] text-camel">
                            {stylist.tier === 'weekly' ? '$300/wk' : '$1,100/mo'}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-block rounded-sm px-2 py-1 text-[0.7rem] uppercase tracking-[0.1em] ${
                            stylist.requested_cancellation_date
                              ? 'bg-destructive/10 text-destructive'
                              : stylist.status === 'active'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-border text-espresso/50'
                          }`}>
                            {stylist.requested_cancellation_date ? 'Cancelling' : stylist.status}
                          </span>
                          {stylist.requested_cancellation_date && (
                            <p className="text-xs text-espresso/40 mt-1">
                              {new Date(stylist.requested_cancellation_date).toLocaleDateString()}
                            </p>
                          )}
                        </td>
                        <td className="px-5 py-4 text-espresso/70 text-xs">
                          {stylist.current_period_end ? new Date(stylist.current_period_end).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4 text-espresso/70 text-xs">
                          {new Date(stylist.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8 rounded-md border border-camel/30 bg-card px-6 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-camel mb-2">Admin Notes</p>
            <ul className="space-y-1.5 text-xs text-espresso/60 leading-relaxed">
              <li>— Stylists with pending cancellations will be auto-cancelled on the scheduled date.</li>
              <li>— Maximum 7 stylists per location. Monitor chair capacity carefully.</li>
              <li>— 30 days written notice is required per rental agreement before cancellation takes effect.</li>
            </ul>
          </div>

        </div>
      </div>
    </SiteLayout>
  );
}
