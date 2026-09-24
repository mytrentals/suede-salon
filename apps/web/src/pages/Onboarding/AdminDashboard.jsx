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
  const [resendingLink, setResendingLink] = useState(null);
  const [resendLinkLoading, setResendLinkLoading] = useState(false);
  const [invites, setInvites] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: '', locationId: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [confirmDeleteLocation, setConfirmDeleteLocation] = useState(null);
  const [locationForm, setLocationForm] = useState({ name: '', address: '', maxChairs: 7 });
  const [locationLoading, setLocationLoading] = useState(false);
  
  // Bio editor state
  const [editingBio, setEditingBio] = useState(null);
  const [bioForm, setBioForm] = useState({
    introduction: '',
    experience: '',
    servicesOffered: '',
    glossgeniusLink: '',
    instagramHandle: '',
    headshotUrl: '',
  });
  const [bioLoading, setBioLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

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
      if (!response.ok) { 
        console.error('Admin subscriptions response not ok:', response.status);
        setError('Invalid or expired admin link'); 
        setLoading(false); 
        return; 
      }
      const result = await response.json();
      console.log('Admin data loaded:', result);
      
      // Fetch locations
      const locResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      let locations = [];
      if (locResponse.ok) {
        const locData = await locResponse.json();
        locations = locData.locations || [];
      }
      
      // Merge locations into data
      setData({ ...result, locations });
      
      // Also fetch invites
      const inviteRes = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/invites/${token}`, {
        headers: { 'x-admin-token': token }
      });
      if (inviteRes.ok) {
        const inviteData = await inviteRes.json();
        setInvites(inviteData.invites || []);
      }
    } catch (err) { 
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data'); 
    }
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

  const handleResendSigningLink = async (stylist) => {
    setResendLinkLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/resend-signing-link/${stylist.id}`, {
        method: 'POST',
        headers: { 'x-admin-token': token },
      });
      if (response.ok) {
        showSuccess(`Signing link resent to ${stylist.name}`);
        setResendingLink(null);
      } else {
        alert('Failed to resend signing link');
      }
    } catch (err) {
      alert('Error resending signing link');
    }
    setResendLinkLoading(false);
  };

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

  const handleEditBio = (stylist) => {
    setEditingBio(stylist);
    setBioForm({
      introduction: stylist.introduction || '',
      experience: stylist.experience || '',
      servicesOffered: stylist.services_offered || '',
      glossgeniusLink: stylist.glossgenius_link || '',
      instagramHandle: stylist.instagram_handle || '',
      headshotUrl: stylist.headshot_url || '',
    });
  };

  const handleHeadshotUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Data = event.target?.result;
        // Store base64 directly (Railway will serve it)
        setBioForm({ ...bioForm, headshotUrl: base64Data });
        setUploadingImage(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert('Error uploading image');
      setUploadingImage(false);
    }
  };

  const handleBioSubmit = async (e) => {
    e.preventDefault();
    setBioLoading(true);
    try {
      console.log('Submitting bio update for stylist:', editingBio.id, bioForm);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylists/${editingBio.id}/bio`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({
          introduction: bioForm.introduction,
          experience: bioForm.experience,
          servicesOffered: bioForm.servicesOffered,
          glossgeniusLink: bioForm.glossgeniusLink,
          instagramHandle: bioForm.instagramHandle,
          headshotUrl: bioForm.headshotUrl,
        }),
      });
      console.log('Bio update response status:', response.status);
      if (response.ok) {
        const result = await response.json();
        console.log('Bio update successful:', result);
        setEditingBio(null);
        showSuccess('Bio updated successfully.');
        await fetchData();
      } else {
        const d = await response.json();
        console.error('Bio update failed:', d);
        alert(d.error || 'Failed to update bio');
      }
    } catch (err) {
      console.error('Error updating bio:', err);
      alert('Error updating bio: ' + err.message);
    }
    setBioLoading(false);
  };

  const handleTogglePublish = async (stylist) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/stylists/${stylist.id}/publish`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-admin-token': token },
        body: JSON.stringify({ isPublished: !stylist.is_published }),
      });
      if (response.ok) {
        showSuccess(`${stylist.name} ${!stylist.is_published ? 'published' : 'unpublished'}.`);
        await fetchData();
      } else {
        alert('Failed to update publish status');
      }
    } catch (err) {
      alert('Error updating publish status');
    }
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

  if (loading) return <div className="flex h-screen items-center justify-center"><p className="text-navy">Loading...</p></div>;
  if (!token && error) return (
    <SiteLayout><div className="mx-auto max-w-2xl px-6 py-12">
      <div className="rounded-md border border-border bg-card p-8">
        <h1 className="font-display text-3xl font-semibold text-navy mb-4">Admin Access</h1>
        <form onSubmit={requestAdminLink} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-navy uppercase tracking-widest">Admin Email</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} required
              className="mt-2 w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-espresso focus:border-navy focus:outline-none" />
          </div>
          <button type="submit" disabled={requestingLink}
            className="w-full rounded-sm bg-ink py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-40">
            {requestingLink ? 'Sending...' : 'Request Magic Link'}
          </button>
        </form>
      </div>
    </div></SiteLayout>
  );

  const stylists = data?.stylists || [];
  const locations = data?.locations || [];
  
  const inputClass = 'w-full rounded-sm border border-border bg-background px-4 py-3 text-sm text-espresso focus:border-navy focus:outline-none';
  const labelClass = 'text-sm font-semibold text-navy uppercase tracking-widest';

  const filteredStylists = stylists.filter(s => {
    if (filterStatus !== 'all' && s.agreement_status !== filterStatus) return false;
    if (filterLocation !== 'all' && s.location_id !== parseInt(filterLocation)) return false;
    return true;
  });

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-12 pt-32">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-4xl font-semibold text-navy">Admin Dashboard</h1>
          <button onClick={() => setShowEmailForm(!showEmailForm)} className="text-xs font-semibold uppercase tracking-widest text-navy hover:text-hunter transition-colors">Request New Link</button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-border flex gap-8">
          {['stylists', 'locations', 'invites', 'bios'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeTab === tab ? 'border-b-2 border-navy text-navy' : 'text-espresso/60 hover:text-navy'
              }`}
            >
              {tab === 'stylists' && 'Stylists'}
              {tab === 'locations' && 'Locations'}
              {tab === 'invites' && 'Invites'}
              {tab === 'bios' && 'Meet the Team'}
            </button>
          ))}
        </div>

        {/* STYLISTS TAB */}
        {activeTab === 'stylists' && (
          <div>
            <div className="mb-6 flex gap-4">
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={inputClass + ' max-w-xs'}>
                <option value="all">All Statuses</option>
                <option value="pending">Pending Agreement</option>
                <option value="signed">Agreement Signed</option>
              </select>
              <select value={filterLocation} onChange={(e) => setFilterLocation(e.target.value)} className={inputClass + ' max-w-xs'}>
                <option value="all">All Locations</option>
                {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
              </select>
            </div>

            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-card">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Name</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Location</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Tier</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStylists.map(s => (
                    <tr key={s.id} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4 text-espresso">{s.name}</td>
                      <td className="px-6 py-4 text-espresso/70">{s.email}</td>
                      <td className="px-6 py-4 text-espresso/70">{s.location_name || '—'}</td>
                      <td className="px-6 py-4 capitalize text-espresso">{s.tier}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-sm ${
                          s.agreement_status === 'signed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {s.agreement_status === 'signed' ? 'Active' : 'Pending Agreement'}
                        </span>
                      </td>
                      <td className="px-6 py-4 space-x-2">
                        <button onClick={() => handleEdit(s)} className="text-xs font-semibold text-navy hover:text-hunter transition-colors">Edit</button>
                        {s.agreement_status !== 'signed' && (
                          <button onClick={() => setResendingLink(s)} className="text-xs font-semibold text-navy hover:text-hunter transition-colors">Resend Link</button>
                        )}
                        <button onClick={() => setConfirmDeactivate(s)} className="text-xs font-semibold text-destructive hover:text-red-700 transition-colors">Deactivate</button>
                        <button onClick={() => setConfirmDelete(s)} className="text-xs font-semibold text-destructive hover:text-red-700 transition-colors">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <div>
            <button onClick={() => { setShowAddLocation(true); setLocationForm({ name: '', address: '', maxChairs: 7 }); }}
              className="mb-6 rounded-sm bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors">
              + Add Location
            </button>
            <div className="grid gap-4">
              {locations.map(l => (
                <div key={l.id} className="rounded-md border border-border bg-card p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-navy">{l.name}</h3>
                      <p className="text-sm text-espresso/70 mt-1">{l.address}</p>
                      <p className="text-sm text-espresso/70 mt-2">{l.active_stylists}/{l.max_chairs} chairs occupied</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingLocation(l); setLocationForm({ name: l.name, address: l.address, maxChairs: l.max_chairs }); }}
                        className="text-xs font-semibold text-navy hover:text-hunter transition-colors">Edit</button>
                      <button onClick={() => setConfirmDeleteLocation(l)} className="text-xs font-semibold text-destructive hover:text-red-700 transition-colors">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* INVITES TAB */}
        {activeTab === 'invites' && (
          <div>
            <button onClick={() => setShowInviteModal(true)} className="mb-6 rounded-sm bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors">
              + Send Invite
            </button>
            <div className="overflow-x-auto rounded-md border border-border">
              <table className="w-full text-sm">
                <thead className="border-b border-border bg-card">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Email</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Location</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Status</th>
                    <th className="px-6 py-4 text-left font-semibold text-navy">Sent</th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(i => (
                    <tr key={i.id} className="border-b border-border hover:bg-card/50 transition-colors">
                      <td className="px-6 py-4 text-espresso">{i.email}</td>
                      <td className="px-6 py-4 text-espresso/70">{i.location_name || '—'}</td>
                      <td className="px-6 py-4"><span className={`text-xs font-semibold uppercase tracking-widest px-2 py-1 rounded-sm ${i.used ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>{i.used ? 'Accepted' : 'Pending'}</span></td>
                      <td className="px-6 py-4 text-espresso/70 text-xs">{new Date(i.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MEET THE TEAM / BIOS TAB */}
        {activeTab === 'bios' && (
          <div>
            <p className="text-sm text-espresso/70 mb-6">Manage stylist bios and decide which stylists appear on your "Meet the Team" page.</p>
            <div className="grid gap-4">
              {stylists.map(s => {
                console.log('Rendering stylist:', s.name, {
                  introduction: s.introduction,
                  experience: s.experience,
                  services: s.services_offered,
                  instagram: s.instagram_handle,
                  glossgenius: s.glossgenius_link,
                  headshot: s.headshot_url,
                });
                return (
                <div key={s.id} className="rounded-md border border-border bg-card p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-display text-xl font-semibold text-navy">{s.name}</h3>
                      <div className="mt-4 space-y-2 text-sm text-espresso/70">
                        <p><strong>Email:</strong> {s.email}</p>
                        <p><strong>Headshot:</strong> {s.headshot_url ? '✓ Uploaded' : '—'}</p>
                        <p><strong>Introduction:</strong> {s.introduction ? `"${s.introduction.substring(0, 60)}${s.introduction.length > 60 ? '...' : ''}"` : '—'}</p>
                        <p><strong>Experience:</strong> {s.experience ? '✓ Added' : '—'}</p>
                        <p><strong>Services:</strong> {s.services_offered ? '✓ Added' : '—'}</p>
                        <p><strong>Instagram:</strong> {s.instagram_handle ? `@${s.instagram_handle}` : '—'}</p>
                        <p><strong>GlossGenius Link:</strong> {s.glossgenius_link ? '✓ Set' : '—'}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button
                        onClick={() => handleEditBio(s)}
                        className="rounded-sm bg-ink px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors"
                      >
                        Edit Bio
                      </button>
                      <button
                        onClick={() => handleTogglePublish(s)}
                        className={`rounded-sm px-4 py-2 text-xs font-semibold uppercase tracking-widest transition-colors ${
                          s.is_published
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'border border-border text-espresso/60 hover:border-navy'
                        }`}
                      >
                        {s.is_published ? '✓ Published' : 'Publish'}
                      </button>
                      {s.is_published && (
                        <a
                          href={`/meet-the-team/${s.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-semibold text-navy hover:text-hunter transition-colors text-center"
                        >
                          View Page →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Edit Stylist Modal */}
      {editingStylest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-6">Edit Stylist</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={labelClass}>Name *</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Email *</label>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm({...editForm, email: e.target.value})} required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input type="tel" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>License Number</label>
                <input type="text" value={editForm.licenseNumber} onChange={(e) => setEditForm({...editForm, licenseNumber: e.target.value})} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tier</label>
                <select value={editForm.tier} onChange={(e) => setEditForm({...editForm, tier: e.target.value})} className={inputClass}>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="test">Test</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <select value={editForm.locationId} onChange={(e) => setEditForm({...editForm, locationId: parseInt(e.target.value)})} className={inputClass}>
                  {locations.map(l => (<option key={l.id} value={l.id}>{l.name}</option>))}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditingStylest(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
                <button type="submit" disabled={editLoading} className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40">{editLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Bio Modal */}
      {editingBio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-2xl rounded-md border border-border bg-background p-8 shadow-xl max-h-[90vh] overflow-y-auto">
            <h2 className="font-display text-2xl font-semibold text-navy mb-2">{editingBio.name} — Bio</h2>
            <p className="text-sm text-espresso/70 mb-6">This information will appear on the "Meet the Team" page when published.</p>
            <form onSubmit={handleBioSubmit} className="space-y-4">
              {/* Headshot Upload */}
              <div>
                <label className={labelClass}>Headshot Photo</label>
                {bioForm.headshotUrl && (
                  <div className="mb-3 relative">
                    <img src={bioForm.headshotUrl} alt="Headshot preview" className="h-40 w-40 rounded-md object-cover border border-border" />
                    <button
                      type="button"
                      onClick={() => setBioForm({ ...bioForm, headshotUrl: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleHeadshotUpload}
                  disabled={uploadingImage}
                  className="block text-sm text-espresso/70 file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-border file:text-xs file:font-semibold file:bg-card file:text-navy hover:file:bg-card/80 cursor-pointer"
                />
                <p className="text-xs text-espresso/60 mt-2">Recommended: 400x500px, square aspect ratio</p>
              </div>

              {/* Introduction */}
              <div>
                <label className={labelClass}>Introduction *</label>
                <p className="text-xs text-espresso/60 mb-2">A brief paragraph about this stylist (shown in the card grid)</p>
                <textarea
                  value={bioForm.introduction}
                  onChange={(e) => setBioForm({...bioForm, introduction: e.target.value})}
                  required
                  rows="3"
                  placeholder="Hello! I'm passionate about creating beautiful hair..."
                  className={inputClass}
                />
              </div>

              {/* Experience */}
              <div>
                <label className={labelClass}>Experience</label>
                <p className="text-xs text-espresso/60 mb-2">Years in the industry, specialties, certifications, etc.</p>
                <textarea
                  value={bioForm.experience}
                  onChange={(e) => setBioForm({...bioForm, experience: e.target.value})}
                  rows="3"
                  placeholder="10+ years of experience in hair color, specializing in balayage and lived-in blonde..."
                  className={inputClass}
                />
              </div>

              {/* Services Offered */}
              <div>
                <label className={labelClass}>Services Offered</label>
                <p className="text-xs text-espresso/60 mb-2">Services this stylist provides</p>
                <textarea
                  value={bioForm.servicesOffered}
                  onChange={(e) => setBioForm({...bioForm, servicesOffered: e.target.value})}
                  rows="3"
                  placeholder="Cuts, Color, Balayage, Keratin treatments, Styling..."
                  className={inputClass}
                />
              </div>

              {/* GlossGenius Link */}
              <div>
                <label className={labelClass}>GlossGenius Booking Link *</label>
                <p className="text-xs text-espresso/60 mb-2">Unique link for this stylist's booking page</p>
                <input
                  type="url"
                  value={bioForm.glossgeniusLink}
                  onChange={(e) => setBioForm({...bioForm, glossgeniusLink: e.target.value})}
                  required
                  placeholder="https://glossgenius.com/book/..."
                  className={inputClass}
                />
              </div>

              {/* Instagram Handle */}
              <div>
                <label className={labelClass}>Instagram Handle</label>
                <p className="text-xs text-espresso/60 mb-2">Optional: @username (without the @)</p>
                <input
                  type="text"
                  value={bioForm.instagramHandle}
                  onChange={(e) => setBioForm({...bioForm, instagramHandle: e.target.value})}
                  placeholder="stylername"
                  className={inputClass}
                />
              </div>

              <div className="rounded-sm border border-camel/30 bg-card px-4 py-3">
                <p className="text-xs text-espresso/60 leading-relaxed">
                  Once you save these changes, toggle "Published" on the main list to make this stylist appear on your public "Meet the Team" page.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingBio(null)}
                  className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bioLoading || !bioForm.introduction || !bioForm.glossgeniusLink}
                  className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40"
                >
                  {bioLoading ? 'Saving...' : 'Save Bio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resend Signing Link Modal */}
      {resendingLink && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-navy mb-3">Resend Signing Link</h2>
            <p className="text-sm text-espresso/70 mb-6">
              Send a new agreement signing link to <strong>{resendingLink.name}</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setResendingLink(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">
                Cancel
              </button>
              <button
                onClick={() => handleResendSigningLink(resendingLink)}
                disabled={resendLinkLoading}
                className="flex-1 rounded-sm bg-ink py-3 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground disabled:opacity-40"
              >
                {resendLinkLoading ? 'Sending...' : 'Resend'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Stylist Modal */}
      {confirmDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-destructive mb-3">Deactivate Stylist</h2>
            <p className="text-sm text-espresso/70 mb-2">You are about to deactivate <strong>{confirmDeactivate.name}</strong>.</p>
            <ul className="text-sm text-espresso/60 space-y-1 mb-6 list-disc list-inside">
              <li>Their subscription will be canceled immediately</li>
              <li>All billing will stop</li>
              <li>Their account will remain in the system</li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDeactivate(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
              <button onClick={() => handleDeactivate(confirmDeactivate)} disabled={actionLoading} className="flex-1 rounded-sm bg-destructive py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white disabled:opacity-40">
                {actionLoading ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Stylist Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-md border border-border bg-background p-8 shadow-xl">
            <h2 className="font-display text-2xl font-semibold text-destructive mb-3">Delete Stylist</h2>
            <p className="text-sm text-espresso/70 mb-2">You are about to delete <strong>{confirmDelete.name}</strong>.</p>
            <ul className="text-sm text-espresso/60 space-y-1 mb-6 list-disc list-inside">
              <li>This cannot be undone</li>
              <li>All stylist data will be permanently removed</li>
              <li>Subscription will be canceled</li>
            </ul>
            <p className="text-sm font-medium text-destructive mb-6">Are you absolutely sure?</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-sm border border-border py-3 text-[0.74rem] uppercase tracking-[0.22em] text-espresso/60 hover:border-navy transition-colors">Cancel</button>
              <button onClick={() => handleDelete(confirmDelete)} disabled={actionLoading} className="flex-1 rounded-sm bg-destructive py-3 text-[0.74rem] uppercase tracking-[0.22em] text-white disabled:opacity-40">
                {actionLoading ? 'Deleting...' : 'Yes, Delete'}
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
                else { const d = await response.json(); alert(d.error || 'Failed to add'); }
              } catch (err) { alert('Error adding location'); }
              setLocationLoading(false);
            }} className="space-y-4">
              <div>
                <label className={labelClass}>Location Name *</label>
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
                  {locations.map(l => (
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
      </div>
    </SiteLayout>
  );
}
