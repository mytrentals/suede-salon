import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';

export function StylistBioPage() {
  const { id } = useParams();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStylist = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylists/${id}`);
        if (!response.ok) throw new Error('Stylist not found');
        const data = await response.json();
        setStylist(data.stylist);
      } catch (err) {
        console.error('Error loading stylist:', err);
        setError('Stylist not found');
      } finally {
        setLoading(false);
      }
    };

    fetchStylist();
  }, [id]);

  if (loading) {
    return (
      <SiteLayout>
        <div className="flex h-screen items-center justify-center">
          <p className="text-navy text-lg">Loading...</p>
        </div>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="text-center">
            <h1 className="font-display text-3xl font-semibold text-navy mb-2">Stylist Not Found</h1>
            <p className="text-espresso/70 mb-6">This stylist's profile is not available.</p>
            <Link
              to="/meet-the-team"
              className="inline-block rounded-sm bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors"
            >
              Back to Meet the Team
            </Link>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background pt-32">
        {/* Back Link */}
        <div className="border-b border-border bg-card px-6 py-4">
          <div className="mx-auto max-w-6xl">
            <Link to="/meet-the-team" className="text-xs font-semibold text-navy uppercase tracking-widest hover:text-hunter transition-colors">
              ← Back to Meet the Team
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="py-12 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Left Column: Headshot & QR Code */}
              <div className="lg:col-span-2">
                {/* Headshot */}
                <div className="aspect-[3/4] rounded-lg overflow-hidden mb-8 border border-border bg-card">
                  {stylist.headshot_url ? (
                    <img
                      src={stylist.headshot_url}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-camel/20 to-hunter/10">
                      <div className="text-center">
                        <div className="text-6xl text-camel/30 mb-2">✨</div>
                        <p className="text-sm text-espresso/40">No photo</p>
                      </div>
                    </div>
                  )}
                </div>

              {/* Right Column: Bio Content */}
              <div className="lg:col-span-3">
                {/* Top Booking CTA */}
                {stylist.glossgenius_link && (
                  <div className="mb-12 rounded-lg border border-border bg-ink/5 p-6">
                    <a
                      href={stylist.glossgenius_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full rounded-sm bg-ink px-6 py-4 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors text-center"
                    >
                      Book an Appointment
                    </a>
                  </div>
                )}

                {/* Name */}
                <h1 className="font-display text-5xl font-semibold text-navy mb-8">{stylist.name}</h1>

                {/* Introduction */}
                {stylist.introduction && (
                  <div className="mb-12">
                    <h2 className="font-display text-2xl font-semibold text-navy mb-4">About</h2>
                    <p className="text-lg text-espresso/80 leading-relaxed">
                      {stylist.introduction}
                    </p>
                  </div>
                )}

                {/* Experience */}
                {stylist.experience && (
                  <div className="mb-12">
                    <h2 className="font-display text-2xl font-semibold text-navy mb-4">Experience & Specialties</h2>
                    <p className="text-base text-espresso/80 leading-relaxed whitespace-pre-line">
                      {stylist.experience}
                    </p>
                  </div>
                )}

                {/* Services */}
                {stylist.services_offered && (
                  <div className="mb-12">
                    <h2 className="font-display text-2xl font-semibold text-navy mb-4">Services Offered</h2>
                    <div className="prose prose-sm text-espresso/80 max-w-none">
                      {stylist.services_offered.split(',').map((service, idx) => (
                        <div key={idx} className="flex items-start mb-3">
                          <span className="text-navy mr-3">✓</span>
                          <span className="text-base">{service.trim()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Instagram Link */}
                {stylist.instagram_handle && (
                  <div className="mb-12">
                    <a
                      href={`https://instagram.com/${stylist.instagram_handle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-navy hover:text-hunter transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.07 1.645.07 4.849 0 3.205-.012 3.584-.07 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"/>
                      </svg>
                      @{stylist.instagram_handle}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Stylists */}
        <div className="border-t border-border py-16 px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="font-display text-3xl font-semibold text-navy mb-8">Other Talented Stylists</h2>
            <div className="text-center">
              <Link
                to="/meet-the-team"
                className="inline-block rounded-sm border border-border px-8 py-3 text-xs font-semibold uppercase tracking-widest text-navy hover:bg-card transition-colors"
              >
                View All Stylists
              </Link>
            </div>
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
