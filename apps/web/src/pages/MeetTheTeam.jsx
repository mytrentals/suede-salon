import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SiteLayout from '@/components/SiteLayout';

export function MeetTheTeamPage() {
  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStylists = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stylists`);
        if (!response.ok) throw new Error('Failed to load stylists');
        const data = await response.json();
        setStylists(data.stylists || []);
      } catch (err) {
        console.error('Error loading stylists:', err);
        setError('Failed to load stylists');
      } finally {
        setLoading(false);
      }
    };

    fetchStylists();
  }, []);

  return (
    <SiteLayout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="border-b border-border bg-card py-16 px-6">
          <div className="mx-auto max-w-7xl">
            <h1 className="font-display text-5xl font-semibold text-navy mb-3">Meet the Team</h1>
            <p className="text-lg text-espresso/70 max-w-2xl">
              Get to know the talented stylists at Suede Salon. Each brings their own artistry and expertise to create the perfect experience.
            </p>
          </div>
        </div>

        {/* Stylists Grid */}
        <div className="py-16 px-6">
          <div className="mx-auto max-w-7xl">
            {loading && (
              <div className="text-center py-12">
                <p className="text-navy text-lg">Loading stylists...</p>
              </div>
            )}

            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 p-6 text-center">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {!loading && stylists.length === 0 && (
              <div className="text-center py-12">
                <p className="text-espresso/70 text-lg">No stylists available at this time.</p>
              </div>
            )}

            {!loading && stylists.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stylists.map(stylist => (
                  <Link
                    key={stylist.id}
                    to={`/meet-the-team/${stylist.id}`}
                    className="group rounded-lg border border-border bg-white overflow-hidden hover:shadow-lg transition-all duration-300"
                  >
                    {/* Headshot */}
                    <div className="aspect-[3/4] overflow-hidden bg-card">
                      {stylist.headshot_url ? (
                        <img
                          src={stylist.headshot_url}
                          alt={stylist.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-camel/20 to-hunter/10">
                          <div className="text-center">
                            <div className="text-4xl text-camel/30 mb-2">✨</div>
                            <p className="text-sm text-espresso/40">No photo</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold text-navy mb-2">{stylist.name}</h3>
                      <p className="text-sm text-espresso/70 line-clamp-3 mb-4">
                        {stylist.introduction || 'Coming soon...'}
                      </p>
                      <div className="flex items-center text-xs font-semibold text-navy uppercase tracking-widest group-hover:text-hunter transition-colors">
                        View Full Bio
                        <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA Section */}
        {!loading && stylists.length > 0 && (
          <div className="border-t border-border bg-card py-12 px-6">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-semibold text-navy mb-4">Ready to Book?</h2>
              <p className="text-espresso/70 mb-6">
                Visit any stylist's profile to book your appointment or get more information about their services.
              </p>
              <a
                href="#"
                className="inline-block rounded-sm bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors"
              >
                Browse Stylists
              </a>
            </div>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
