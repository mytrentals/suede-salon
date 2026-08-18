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
  const [adminEmail, setAdminEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [requestingLink, setRequestingLink] = useState(false);
  const [activeTab, setActiveTab] = useState('stylists');
  const [editingStylest, setEditingStylest] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [confirmDeactivate, setConfirmDeactivate] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', locationId: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ name: '', address: '', maxChairs: 7 });
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (token) {
      sessionStorage.setItem('adminToken', token);
      fetchData();
    } else {
      const saved = sessionStorage.getItem('adminToken');
      if (saved) {
        window.location.href = `/admin/dashboard/${saved}`;
      } else {
        setLoading(false);
      }
    }
  }, [token]);

  const fetchData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${token}`);
      if (!response.ok) { setError('Invalid or expired admin link'); setLoading(false); return; }
      const result = await response.json();
      setData(result);
      // Also fetch invites
      const inviteRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/invites/${token}`, {
        headers: { 'x-admin-token': token }
      });
      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInvites(inviteData.invites || []);
      }
    } catch (err) { setError('Failed to load admin data'); }
    setLoading(false);
  };

  const requestAdminLink = async (e) => {
    e.preventDefault();
    setRequestingLink(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-link`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: adminEmail }),
      });
      setError(response.ok ? 'Magic link sent! Check your email.' : 'Email not recognized.');
      if (response.ok) setShowEmailForm(false);
    } catch (err) { setError('Error requesting link.'); }
    setRequestingLink(false);
  };

  const showSuccess = (msg) => { setSuccessMessage(msg); setTimeout(() => setSuccessMessage(null), 4000); };

  const handleEdit = (stylist) => {
    setEditingStylest(stylist);
    setEditForm({ name: stylist.name, email: stylist.email, phone: stylist.phone, licenseNumber: stylist.license_number, tier: stylist.tier, locationId: stylist.location_id });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylist/${editingStylest.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify(editForm),
      });
      if (response.ok) { setEditingStylest(null); showSuccess('Stylist updated.'); await fetchData(); }
      else { const d = await response.json(); alert(d.error || 'Failed to update'); }
    } catch (err) { alert('Error updating stylist'); }
    setEditLoading(false);
  };

  const handleDeactivate = async (stylist) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylist/${stylist.id}/deactivate`, {
        method: 'POST', headers: { 'x-admin-token': token },
      });
      if (response.ok) { setConfirmDeactivate(null); showSuccess(`${stylist.name} deactivated. Billing stopped.`); await fetchData(); }
      else { const d = await response.json(); alert(d.error || 'Failed to deactivate'); }
    } catch (err) { alert('Error deactivating'); }
    setActionLoading(false);
  };

  const handleDelete = async (stylist) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylist/${stylist.id}`, {
        method: 'DELETE', headers: { 'x-admin-token': token },
      });
      if (response.ok) { setConfirmDelete(null); showSuccess(`${stylist.name} deleted.`); await fetchData(); }
      else { const d = await response.json(); alert(d.error || 'Failed to delete'); }
    } catch (err) { alert('Error deleting'); }
    setActionLoading(false);
  };

  const handleReactivate = async (stylist) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylist/${stylist.id}/reactivate`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({}),
      });
      if (response.ok) { showSuccess(`${stylist.name} reactivated.`); await fetchData(); }
      else { const d = await response.json(); alert(d.error || 'Failed to reactivate'); }
    } catch (err) { alert('Error reactivating'); }
    setActionLoading(false);
  };

  const inputClass = "w-full rounded-sm border border-border bg-background px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-navy transition-colors";
  const labelClass = "block mb-1.5 text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50";

  if (loading) return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 flex items-center justify-center">
        <p className="text-espresso/60 text-sm uppercase tracking-[0.2em]">Loading dashboard…</p>
      </div>
    </SiteLayout>
  );

  if (error || !token) return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[36rem] px-6 text-center">
          <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Admin Access</span>
          <h1 className="mt-4 font-display text-4xl font-semibold text-ink">{error || 'Sign In'}</h1>
          {!showEmailForm ? (
            <button onClick={() => setShowEmailForm(true)} className="mt-8 rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-0.5">
              Request Access Link
            </button>
          ) : (
            <form onSubmit={requestAdminLink} className="mt-8 text-left">
              <label className={labelClass}>Admin Email</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required placeholder="your@email.com" className={`${inputClass} mb-4`} />
              <button type="submit" disabled={requestingLink} className="w-full rounded-sm bg-ink py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">
                {requestingLink ? 'Sending…' : 'Send Magic Link'}
              </button>
            </form>
          )}
        </div>
      </div>
    </SiteLayout>
  );

  const stylists = data?.stylists || [];
  const activeCount = stylists.filter(s => s.status === 'active').length;
  const deactivatedCount = stylists.filter(s => s.status === 'deactivated').length;
  const pendingCancellations = stylists.filter(s => s.requested_cancellation_date).length;
  const monthlyRevenue = stylists.filter(s => s.status === 'active' && s.tier === 'monthly').length * 1100;
  const weeklyRevenue = stylists.filter(s => s.status === 'active' && s.tier === 'weekly').length * 300;
  const projectedMonthly = monthlyRevenue + (weeklyRevenue * 4);

  const filteredStylists = stylists.filter(s => {
    if (filterLocation !== 'all' && s.location_id !== parseInt(filterLocation)) return false;
    if (filterStatus === 'active' && s.status !== 'active') return false;
    if (filterStatus === 'deactivated' && s.status !== 'deactivated') return false;
    if (filterStatus === 'cancellation' && !s.requested_cancellation_date) return false;
    return true;
  });

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32 pb-24">
        <div className="mx-auto max-w-[90rem] px-6">
          <div className="mb-10 flex items-start justify-between">
            <div>
              <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Suede Salon</span>
              <h1 className="mt-2 font-display text-5xl font-semibold text-ink">Admin Dashboard</h1>
            </div>
            <button
              onClick={() => setShowInviteModal(true)}
              className="mt-4 rounded-sm bg-ink px-6 py-3 text-[0.72rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-0.5"
            >
              + Invite Stylist
            </button>
          </div>

          {successMessage && (
            <div className="mb-6 rounded-sm border border-camel/40 bg-card px-5 py-3 text-sm text-espresso">✓ {successMessage}</div>
          )}

          {/* Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-10">
            {[
              { label: 'Active Stylists', value: activeCount, accent: 'border-l-camel' },
              { label: 'Deactivated', value: deactivatedCount, accent: 'border-l-espresso/30' },
              { label: 'Pending Cancellation', value: pendingCancellations, accent: 'border-l-destructive' },
              { label: 'Monthly Chair Revenue', value: `$${monthlyRevenue.toLocaleString()}`, accent: 'border-l-navy' },
              { label: 'Projected Monthly', value: `$${projectedMonthly.toLocaleString()}`, accent: 'border-l-hunter' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-md border-l-4 ${stat.accent} bg-card px-5 py-5 border border-border`}>
                <p className="text-[0.65rem] uppercase tracking-[0.2em] text-espresso/50 mb-1">{stat.label}</p>
                <p className="font-display text-3xl font-semibold text-ink">{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-0 mb-8 border-b border-border">
            {[
              { id: 'stylists', label: 'Stylists' },
              { id: 'locations', label: 'Locations' },
              { id: 'revenue', label: 'Revenue' },
              { id: 'renewals', label: 'Upcoming Renewals' },
              { id: 'invites', label: `Invites${invites.length > 0 ? ` (${invites.filter(i => !i.used).length})` : ''}` },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 text-[0.72rem] uppercase tracking-[0.2em] transition-colors border-b-2 -mb-px ${
                  activeTab === tab.id ? 'border-navy text-navy' : 'border-transparent text-espresso/50 hover:text-espresso'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Stylists Tab */}
          {activeTab === 'stylists' && (
            <div>
              <div className="flex flex-wrap gap-4 mb-6">
                <div>
                  <label className={labelClass}>Status</label>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}
                    className="rounded-sm border border-border bg-card px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-navy">
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="deactivated">Deactivated</option>
                    <option value="cancellation">Pending Cancellation</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Location</label>
                  <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)}
                    className="rounded-sm border border-border bg-card px-4 py-2.5 text-sm text-espresso focus:outline-none focus:border-navy">
                    <option value="all">All Locations</option>
                    {(data?.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="rounded-md border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        {['Stylist', 'Location', 'Plan', 'Status', 'Next Billing', 'Joined', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStylists.length === 0 ? (
                        <tr><td colSpan="7" className="px-5 py-10 text-center text-espresso/40 text-sm italic">No stylists found</td></tr>
                      ) : filteredStylists.map((stylist, i) => (
                        <tr key={stylist.id} className={`border-b border-border ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                          <td className="px-5 py-4">
                            <p className="font-medium text-espresso">{stylist.name}</p>
                            <p className="text-xs text-espresso/50">{stylist.email}</p>
                            <p className="text-xs text-espresso/40">Lic: {stylist.license_number}</p>
                          </td>
                          <td className="px-5 py-4 text-sm text-espresso/70">{stylist.location_name}</td>
                          <td className="px-5 py-4">
                            <span className="inline-block rounded-sm border border-camel/40 px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-camel">
                              {stylist.tier === 'weekly' ? '$300/wk' : '$1,100/mo'}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span className={`inline-block rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] ${
                              stylist.status === 'deactivated' ? 'bg-espresso/10 text-espresso/50' :
                              stylist.requested_cancellation_date ? 'bg-destructive/10 text-destructive' :
                              stylist.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-border text-espresso/50'
                            }`}>
                              {stylist.status === 'deactivated' ? 'Deactivated' :
                               stylist.requested_cancellation_date ? 'Cancelling' : stylist.status}
                            </span>
                            {stylist.requested_cancellation_date && (
                              <p className="text-xs text-espresso/40 mt-1">Until {new Date(stylist.requested_cancellation_date).toLocaleDateString()}</p>
                            )}
                          </td>
                          <td className="px-5 py-4 text-xs text-espresso/70 whitespace-nowrap">
                            {stylist.current_period_end ? new Date(stylist.current_period_end).toLocaleDateString() : '—'}
                          </td>
                          <td className="px-5 py-4 text-xs text-espresso/70 whitespace-nowrap">
                            {new Date(stylist.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2 flex-wrap">
                              <button onClick={() => handleEdit(stylist)}
                                className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-navy hover:text-navy transition-colors whitespace-nowrap">
                                Edit
                              </button>
                              {stylist.status === 'active' && (
                                <button onClick={() => setConfirmDeactivate(stylist)}
                                  className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-camel hover:text-camel transition-colors whitespace-nowrap">
                                  Deactivate
                                </button>
                              )}
                              {stylist.status === 'deactivated' && (
                                <button onClick={() => handleReactivate(stylist)} disabled={actionLoading}
                                  className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-green-700 hover:text-green-700 transition-colors whitespace-nowrap">
                                  Reactivate
                                </button>
                              )}
                              <button onClick={() => setConfirmDelete(stylist)}
                                className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-destructive hover:text-destructive transition-colors whitespace-nowrap">
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

{/* Locations Tab */}
          {activeTab === 'locations' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-espresso/60">{(data?.locations || []).length} location{(data?.locations || []).length !== 1 ? 's' : ''} configured</p>
                <button
                  onClick={() => { setLocationForm({ name: '', address: '', maxChairs: 7 }); setShowAddLocation(true); }}
                  className="rounded-sm bg-ink px-6 py-2.5 text-[0.72rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-0.5"
                >
                  + Add Location
                </button>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {(data?.locations || []).map(location => {
                  const occupancy = Math.round((location.active_stylists / location.max_chairs) * 100);
                  return (
                    <div key={location.id} className="rounded-md border border-border bg-card p-8">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-display text-2xl font-semibold text-navy">{location.name}</h3>
                          <p className="mt-1 text-xs text-espresso/50">{location.address}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { setEditingLocation(location); setLocationForm({ name: location.name, address: location.address, maxChairs: location.max_chairs }); }}
                            className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-navy hover:text-navy transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => setConfirmDeleteLocation(location)}
                            className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-destructive hover:text-destructive transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Occupancy</span>
                            <span className="text-sm font-medium text-espresso">{occupancy}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-border">
                            <div className="h-2 rounded-full bg-camel transition-all" style={{ width: `${occupancy}%` }} />
                          </div>
                        </div>
                        <div className="flex justify-between border-t border-border pt-4">
                          <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Active</span>
                          <span className="text-sm font-medium text-espresso">{location.active_stylists} / {location.max_chairs}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[0.7rem] uppercase tracking-[0.15em] text-espresso/50">Available</span>
                          <span className="text-sm font-medium text-espresso">{location.max_chairs - location.active_stylists} chairs</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Revenue Tab */}
          {activeTab === 'revenue' && (
            <div>
              <div className="grid gap-4 sm:grid-cols-3 mb-8">
                <div className="rounded-md border border-border bg-card p-6">
                  <p className={labelClass}>Monthly Subscriptions</p>
                  <p className="font-display text-3xl font-semibold text-ink mt-1">
                    {stylists.filter(s => s.status === 'active' && s.tier === 'monthly').length}
                  </p>
                  <p className="text-xs text-espresso/50 mt-1">× $1,100 = ${monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="rounded-md border border-border bg-card p-6">
                  <p className={labelClass}>Weekly Subscriptions</p>
                  <p className="font-display text-3xl font-semibold text-ink mt-1">
                    {stylists.filter(s => s.status === 'active' && s.tier === 'weekly').length}
                  </p>
                  <p className="text-xs text-espresso/50 mt-1">× $300/wk = ${weeklyRevenue.toLocaleString()}/wk</p>
                </div>
                <div className="rounded-md border border-border bg-card p-6">
                  <p className={labelClass}>Projected Monthly Total</p>
                  <p className="font-display text-3xl font-semibold text-ink mt-1">${projectedMonthly.toLocaleString()}</p>
                  <p className="text-xs text-espresso/50 mt-1">Monthly + (Weekly × 4)</p>
                </div>
              </div>
              {(data?.revenue || []).length > 0 && (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="px-6 py-4 border-b border-border bg-card">
                    <h3 className="font-display text-xl font-semibold text-navy">Signup History</h3>
                  </div>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card/50">
                        <th className="px-6 py-3 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50">Month</th>
                        <th className="px-6 py-3 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50">New Signups</th>
                        <th className="px-6 py-3 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50">Est. Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.revenue || []).map((row, i) => (
                        <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                          <td className="px-6 py-4 text-espresso">{row.month}</td>
                          <td className="px-6 py-4 text-espresso/70">{row.new_signups}</td>
                          <td className="px-6 py-4 font-medium text-espresso">${parseInt(row.estimated_revenue).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Renewals Tab */}
          {activeTab === 'renewals' && (
            <div>
              <p className="text-sm text-espresso/60 mb-6">Subscriptions renewing in the next 14 days.</p>
              {(data?.upcomingRenewals || []).length === 0 ? (
                <div className="rounded-md border border-border bg-card p-10 text-center">
                  <p className="text-espresso/40 italic text-sm">No renewals in the next 14 days.</p>
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        {['Stylist', 'Location', 'Plan', 'Renewal Date', 'Days Away'].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(data?.upcomingRenewals || []).map((renewal, i) => {
                        const daysAway = Math.ceil((new Date(renewal.current_period_end) - new Date()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={i} className={`border-b border-border ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                            <td className="px-5 py-4">
                              <p className="font-medium text-espresso">{renewal.name}</p>
                              <p className="text-xs text-espresso/50">{renewal.email}</p>
                            </td>
                            <td className="px-5 py-4 text-sm text-espresso/70">{renewal.location_name}</td>
                            <td className="px-5 py-4">
                              <span className="inline-block rounded-sm border border-camel/40 px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] text-camel">
                                {renewal.tier === 'weekly' ? '$300/wk' : '$1,100/mo'}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-sm text-espresso/70">
                              {new Date(renewal.current_period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-sm font-medium ${daysAway <= 3 ? 'text-destructive' : 'text-espresso/70'}`}>
                                {daysAway} day{daysAway !== 1 ? 's' : ''}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Invites Tab */}
          {activeTab === 'invites' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <p className="text-sm text-espresso/60">Pending and past stylist invitations.</p>
                <button onClick={() => setShowInviteModal(true)}
                  className="rounded-sm bg-ink px-6 py-2.5 text-[0.72rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform hover:-translate-y-0.5">
                  + Invite Stylist
                </button>
              </div>
              {invites.length === 0 ? (
                <div className="rounded-md border border-border bg-card p-10 text-center">
                  <p className="text-espresso/40 italic text-sm">No invites sent yet.</p>
                </div>
              ) : (
                <div className="rounded-md border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-card">
                        {['Email', 'Location', 'Sent', 'Expires', 'Status', 'Actions'].map(h => (
                          <th key={h} className="px-5 py-4 text-left text-[0.65rem] uppercase tracking-[0.15em] text-espresso/50 font-medium whitespace-nowrap">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {invites.map((invite, i) => {
                        const isExpired = new Date(invite.expires_at) < new Date();
                        const status = invite.used ? 'Signed Up' : isExpired ? 'Expired' : 'Pending';
                        return (
                          <tr key={invite.id} className={`border-b border-border ${i % 2 === 0 ? 'bg-background' : 'bg-card'}`}>
                            <td className="px-5 py-4 font-medium text-espresso">{invite.email}</td>
                            <td className="px-5 py-4 text-sm text-espresso/70">{invite.location_name}</td>
                            <td className="px-5 py-4 text-xs text-espresso/70">{new Date(invite.created_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4 text-xs text-espresso/70">{new Date(invite.expires_at).toLocaleDateString()}</td>
                            <td className="px-5 py-4">
                              <span className={`inline-block rounded-sm px-2 py-1 text-[0.65rem] uppercase tracking-[0.1em] ${
                                invite.used ? 'bg-green-50 text-green-700' :
                                isExpired ? 'bg-destructive/10 text-destructive' :
                                'bg-camel/10 text-camel'
                              }`}>{status}</span>
                            </td>
                            <td className="px-5 py-4">
                              {!invite.used && (
                                <div className="flex gap-2">
                                  <button onClick={async () => {
                                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/invite/${invite.id}/resend`, {
                                      method: 'POST', headers: { 'x-admin-token': token }
                                    });
                                    if (response.ok) { showSuccess('Invite resent!'); await fetchData(); }
                                    else alert('Failed to resend invite');
                                  }} className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-navy hover:text-navy transition-colors whitespace-nowrap">
                                    Resend
                                  </button>
                                  <button onClick={async () => {
                                    if (!confirm('Revoke this invite?')) return;
                                    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/invite/${invite.id}`, {
                                      method: 'DELETE', headers: { 'x-admin-token': token }
                                    });
                                    if (response.ok) { showSuccess('Invite revoked.'); await fetchData(); }
                                    else alert('Failed to revoke invite');
                                  }} className="rounded-sm border border-border px-3 py-1.5 text-[0.65rem] uppercase tracking-[0.1em] text-espresso/60 hover:border-destructive hover:text-destructive transition-colors whitespace-nowrap">
                                    Revoke
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Notes */}}
          <div className="mt-10 rounded-md border border-camel/30 bg-card px-6 py-5">
            <p className="text-[0.7rem] uppercase tracking-[0.2em] text-camel mb-2">Admin Notes</p>
            <ul className="space-y-1.5 text-xs text-espresso/60 leading-relaxed">
              <li>— <strong>Deactivate</strong> stops billing immediately but retains the record for future rentals.</li>
              <li>— <strong>Delete</strong> permanently removes the record and stops billing immediately.</li>
              <li>— <strong>Reactivate</strong> creates a new Stripe subscription for a deactivated stylist.</li>
              <li>— 30 days written notice is required per rental agreement before cancellation takes effect.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStylest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4 overflow-y-auto py-8">
          <div className="w-full max-w-lg rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-6">Edit Stylist</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {[
                { label: 'Full Name', key: 'name', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Phone', key: 'phone', type: 'tel' },
                { label: 'License Number', key: 'licenseNumber', type: 'text' },
              ].map(field => (
                <div key={field.key}>
                  <label className={labelClass}>{field.label}</label>
                  <input type={field.type} value={editForm[field.key] || ''} onChange={(e) => setEditForm({...editForm, [field.key]: e.target.value})} required className={inputClass} />
                </div>
              ))}
              <div>
                <label className={labelClass}>Billing Plan</label>
                <select value={editForm.tier} onChange={(e) => setEditForm({...editForm, tier: e.target.value})} className={inputClass}>
                  <option value="weekly">Weekly — $300/week</option>
                  <option value="monthly">Monthly — $1,100/month</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <select value={editForm.locationId} onChange={(e) => setEditForm({...editForm, locationId: parseInt(e.target.value)})} className={inputClass}>
                  {(data?.locations || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingStylest(null)}
                  className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">
                  {editLoading ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deactivate Modal */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-3">Deactivate Stylist</h2>
            <p className="text-sm text-espresso/70 mb-2">You are about to deactivate <strong>{confirmDeactivate.name}</strong>.</p>
            <ul className="text-sm text-espresso/60 space-y-1 mb-6 list-disc list-inside">
              <li>Billing will stop immediately</li>
              <li>Record will be retained in the system</li>
              <li>Can be reactivated at any time</li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeactivate(null)}
                className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDeactivate(confirmDeactivate)} disabled={actionLoading}
                className="flex-1 rounded-sm bg-camel py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white disabled:opacity-40">
                {actionLoading ? 'Processing…' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-destructive mb-3">Delete Stylist</h2>
            <p className="text-sm text-espresso/70 mb-2">You are about to permanently delete <strong>{confirmDelete.name}</strong>.</p>
            <ul className="text-sm text-espresso/60 space-y-1 mb-3 list-disc list-inside">
              <li>Billing stops immediately</li>
              <li>All records permanently removed</li>
              <li>This cannot be undone</li>
            </ul>
            <p className="text-sm font-medium text-destructive mb-6">Are you absolutely sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
                Cancel
              </button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={actionLoading}
                className="flex-1 rounded-sm bg-destructive py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white disabled:opacity-40">
                {actionLoading ? 'Deleting…' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {showAddLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-6">Add Location</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLocationLoading(true);
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/location`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                  body: JSON.stringify(locationForm),
                });
                if (response.ok) { setShowAddLocation(false); showSuccess('Location added.'); await fetchData(); }
                else { const d = await response.json(); alert(d.error || 'Failed to add location'); }
              } catch (err) { alert('Error adding location'); }
              setLocationLoading(false);
            }} className="space-y-4">
              <div>
                <label className={labelClass}>Location Name</label>
                <input type="text" value={locationForm.name} onChange={(e) => setLocationForm({...locationForm, name: e.target.value})} required placeholder="e.g. Clayton" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" value={locationForm.address} onChange={(e) => setLocationForm({...locationForm, address: e.target.value})} placeholder="e.g. 123 Main St, St. Louis, MO" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Maximum Chairs</label>
                <input type="number" value={locationForm.maxChairs} onChange={(e) => setLocationForm({...locationForm, maxChairs: parseInt(e.target.value)})} min="1" max="50" required className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddLocation(false)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
                <button type="submit" disabled={locationLoading} className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">{locationLoading ? 'Adding...' : 'Add Location'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Location Modal */}
      {editingLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-6">Edit Location</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLocationLoading(true);
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/location/${editingLocation.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                  body: JSON.stringify(locationForm),
                });
                if (response.ok) { setEditingLocation(null); showSuccess('Location updated.'); await fetchData(); }
                else { const d = await response.json(); alert(d.error || 'Failed to update'); }
              } catch (err) { alert('Error updating location'); }
              setLocationLoading(false);
            }} className="space-y-4">
              <div>
                <label className={labelClass}>Location Name</label>
                <input type="text" value={locationForm.name} onChange={(e) => setLocationForm({...locationForm, name: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Address</label>
                <input type="text" value={locationForm.address} onChange={(e) => setLocationForm({...locationForm, address: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Maximum Chairs</label>
                <input type="number" value={locationForm.maxChairs} onChange={(e) => setLocationForm({...locationForm, maxChairs: parseInt(e.target.value)})} min="1" max="50" required className={inputClass} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingLocation(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
                <button type="submit" disabled={locationLoading} className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">{locationLoading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Location Modal */}
      {confirmDeleteLocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-destructive mb-3">Delete Location</h2>
            <p className="text-sm text-espresso/70 mb-2">You are about to delete <strong>{confirmDeleteLocation.name}</strong>.</p>
            <ul className="text-sm text-espresso/60 space-y-1 mb-3 list-disc list-inside">
              <li>This cannot be undone</li>
              <li>All active stylists must be moved or deactivated first</li>
            </ul>
            <p className="text-sm font-medium text-destructive mb-6">Are you absolutely sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeleteLocation(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
              <button onClick={async () => {
                setActionLoading(true);
                try {
                  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/location/${confirmDeleteLocation.id}`, {
                    method: 'DELETE', headers: { 'x-admin-token': token },
                  });
                  if (response.ok) { setConfirmDeleteLocation(null); showSuccess('Location deleted.'); await fetchData(); }
                  else { const d = await response.json(); alert(d.error || 'Failed to delete'); setConfirmDeleteLocation(null); }
                } catch (err) { alert('Error deleting location'); }
                setActionLoading(false);
              }} disabled={actionLoading} className="flex-1 rounded-sm bg-destructive py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white disabled:opacity-40">
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Invite Stylist Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-2">Invite Stylist</h2>
            <p className="text-sm text-espresso/60 mb-6">
              Send a 24-hour signup link to a prospective stylist. They will be pre-assigned to the selected location.
            </p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setInviteLoading(true);
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/invite`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
                  body: JSON.stringify({ email: inviteForm.email, locationId: parseInt(inviteForm.locationId) }),
                });
                if (response.ok) {
                  setShowInviteModal(false);
                  setInviteForm({ email: '', locationId: '' });
                  showSuccess(`Invite sent to ${inviteForm.email}`);
                  await fetchData();
                } else {
                  const d = await response.json();
                  alert(d.error || 'Failed to send invite');
                }
              } catch (err) { alert('Error sending invite'); }
              setInviteLoading(false);
            }} className="space-y-4">
              <div>
                <label className={labelClass}>Stylist Email *</label>
                <input type="email" value={inviteForm.email} onChange={(e) => setInviteForm({...inviteForm, email: e.target.value})}
                  required placeholder="stylist@email.com" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location *</label>
                <select value={inviteForm.locationId} onChange={(e) => setInviteForm({...inviteForm, locationId: e.target.value})}
                  required className={inputClass}>
                  <option value="">Select a location</option>
                  {(data?.locations || []).map(l => (
                    <option key={l.id} value={l.id}>{l.name} ({l.max_chairs - l.active_stylists} chairs available)</option>
                  ))}
                </select>
              </div>
              <div className="rounded-sm border border-camel/30 bg-card px-4 py-3">
                <p className="text-xs text-espresso/60 leading-relaxed">
                  ⏱ This link will expire in <strong>24 hours</strong>. The stylist will be asked to complete their profile and payment details.
                </p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowInviteModal(false); setInviteForm({ email: '', locationId: '' }); }}
                  className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={inviteLoading}
                  className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">
                  {inviteLoading ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </SiteLayout>
  );
}
