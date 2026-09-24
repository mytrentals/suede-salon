import React, { useState, useEffect } from 'react';
import SiteLayout from '@/components/SiteLayout';

export function AdminDashboardPage() {
  const [token, setToken] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stylists');
  const [successMessage, setSuccessMessage] = useState('');
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

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash) {
      setToken(hash);
      localStorage.setItem('adminToken', hash);
      window.history.replaceState(null, '', window.location.pathname);
      fetchData(hash);
    } else {
      const savedToken = localStorage.getItem('adminToken');
      if (savedToken) {
        setToken(savedToken);
        fetchData(savedToken);
      }
    }
  }, []);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const fetchData = async (authToken) => {
    try {
      console.log('Fetching admin data with token...');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/subscriptions/${authToken}`);
      if (!response.ok) {
        setError('Invalid or expired admin link');
        setLoading(false);
        return;
      }
      const result = await response.json();
      console.log('Admin data loaded:', result);
      
      const locResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/locations`);
      let locations = [];
      if (locResponse.ok) {
        const locData = await locResponse.json();
        locations = locData.locations || [];
      }
      
      setData({ ...result, locations });
      setLoading(false);
    } catch (err) {
      console.error('Error loading admin data:', err);
      setError('Failed to load admin data');
      setLoading(false);
    }
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
    const reader = new FileReader();
    reader.onload = (ev) => {
      setBioForm({...bioForm, headshotUrl: ev.target.result});
    };
    reader.readAsDataURL(file);
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
        await fetchData(token);
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
        showSuccess(stylist.is_published ? 'Stylist unpublished.' : 'Stylist published.');
        await fetchData(token);
      } else {
        alert('Failed to update publish status');
      }
    } catch (err) {
      alert('Error updating publish status');
    }
  };

  if (!token) {
    return (
      <SiteLayout>
        <div className="mx-auto max-w-7xl px-6 py-12 pt-32">
          <h1 className="font-display text-4xl font-semibold text-navy mb-8">Admin Login</h1>
          <div className="max-w-md">
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/request-link`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: adminEmail }),
                });
                if (response.ok) {
                  showSuccess('Check your email for the admin link!');
                  setAdminEmail('');
                } else {
                  alert('Email not recognized');
                }
              } catch (err) {
                alert('Error requesting link');
              }
            }} className="space-y-4">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                required
                placeholder="admin@email.com"
                className="w-full rounded-sm border border-border px-4 py-2"
              />
              <button type="submit" className="w-full rounded-sm bg-ink px-4 py-2 text-white font-semibold">
                Request Admin Link
              </button>
            </form>
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (loading) return <SiteLayout><div className="flex items-center justify-center min-h-screen">Loading...</div></SiteLayout>;
  if (error) return <SiteLayout><div className="flex items-center justify-center min-h-screen text-red-600">{error}</div></SiteLayout>;

  const stylists = data?.stylists || [];

  return (
    <SiteLayout>
      <div className="mx-auto max-w-7xl px-6 py-12 pt-32">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-display text-4xl font-semibold text-navy">Admin Dashboard</h1>
          <button onClick={() => { localStorage.removeItem('adminToken'); setToken(''); }} className="text-xs font-semibold uppercase tracking-widest text-navy hover:text-hunter">Logout</button>
        </div>

        {successMessage && (
          <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3">
            <p className="text-sm text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 border-b border-border flex gap-8">
          {['stylists', 'bios'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 text-xs font-semibold uppercase tracking-widest transition-colors ${
                activeTab === tab
                  ? 'border-b-2 border-navy text-navy'
                  : 'text-espresso/60 hover:text-navy'
              }`}
            >
              {tab === 'stylists' ? 'Stylists' : 'Meet the Team'}
            </button>
          ))}
        </div>

        {/* Bios Tab */}
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

        {/* Bio Editor Modal */}
        {editingBio && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto p-8">
              <h2 className="font-display text-2xl font-semibold text-navy mb-2">{editingBio.name} — Bio</h2>
              <p className="text-sm text-espresso/60 mb-6">This information will appear on the "Meet the Team" page when published.</p>

              <form onSubmit={handleBioSubmit} className="space-y-6">
                {/* Headshot */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">HEADSHOT PHOTO</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleHeadshotUpload}
                    className="block w-full text-sm text-espresso/60"
                  />
                  <p className="text-xs text-espresso/60 mt-2">Recommended: 400x500px, square aspect ratio</p>
                </div>

                {/* Introduction */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">INTRODUCTION *</label>
                  <p className="text-xs text-espresso/60 mb-2">A brief paragraph about this stylist (shown in the card grid)</p>
                  <textarea
                    value={bioForm.introduction}
                    onChange={(e) => setBioForm({...bioForm, introduction: e.target.value})}
                    required
                    placeholder="Hello! I'm passionate about creating beautiful hair..."
                    className="w-full rounded-sm border border-border px-4 py-2 text-sm"
                    rows="4"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">EXPERIENCE</label>
                  <p className="text-xs text-espresso/60 mb-2">Years in the industry, specialties, certifications, etc.</p>
                  <textarea
                    value={bioForm.experience}
                    onChange={(e) => setBioForm({...bioForm, experience: e.target.value})}
                    placeholder="10+ years of experience in hair color, specializing in balayage and lived-in blonde..."
                    className="w-full rounded-sm border border-border px-4 py-2 text-sm"
                    rows="4"
                  />
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">SERVICES OFFERED</label>
                  <p className="text-xs text-espresso/60 mb-2">Services this stylist provides</p>
                  <textarea
                    value={bioForm.servicesOffered}
                    onChange={(e) => setBioForm({...bioForm, servicesOffered: e.target.value})}
                    placeholder="Cuts, Color, Balayage, Keratin treatments, Styling..."
                    className="w-full rounded-sm border border-border px-4 py-2 text-sm"
                    rows="3"
                  />
                </div>

                {/* GlossGenius Link */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">GLOSSGENIUS BOOKING LINK *</label>
                  <p className="text-xs text-espresso/60 mb-2">Unique link for this stylist's booking page</p>
                  <input
                    type="url"
                    value={bioForm.glossgeniusLink}
                    onChange={(e) => setBioForm({...bioForm, glossgeniusLink: e.target.value})}
                    required
                    placeholder="https://glossgenius.com/book/..."
                    className="w-full rounded-sm border border-border px-4 py-2 text-sm"
                  />
                </div>

                {/* Instagram */}
                <div>
                  <label className="block text-sm font-semibold text-navy mb-2">INSTAGRAM HANDLE</label>
                  <p className="text-xs text-espresso/60 mb-2">Optional: @username (without the @)</p>
                  <input
                    type="text"
                    value={bioForm.instagramHandle}
                    onChange={(e) => setBioForm({...bioForm, instagramHandle: e.target.value})}
                    placeholder="stylername"
                    className="w-full rounded-sm border border-border px-4 py-2 text-sm"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setEditingBio(null)}
                    className="flex-1 rounded-sm border border-border py-3 text-xs font-semibold uppercase tracking-widest text-espresso/60 hover:border-navy transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={bioLoading}
                    className="flex-1 rounded-sm bg-ink py-3 text-xs font-semibold uppercase tracking-widest text-white disabled:opacity-40"
                  >
                    {bioLoading ? 'Saving...' : 'Save Bio'}
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
