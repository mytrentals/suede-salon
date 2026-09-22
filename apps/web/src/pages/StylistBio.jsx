import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode.react';
import SiteLayout from '@/components/SiteLayout';

export function StylistBioPage() {
  const { id } = useParams();
  const [stylist, setStylist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const qrRef = React.useRef();

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

  const downloadQR = () => {
    if (qrRef.current) {
      const canvas = qrRef.current.querySelector('canvas');
      if (canvas) {
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${stylist.name}-booking.png`;
        link.click();
      }
    }
  };

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
      <div className="min-h-screen bg-background">
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

                {/* QR Code Section */}
                {stylist.glossgenius_link && (
                  <div className="rounded-lg border border-border bg-white p-6 text-center">
                    <h3 className="font-display text-lg font-semibold text-navy mb-4">Quick Book</h3>
                    <p className="text-xs text-espresso/60 mb-6">Scan to view availability and book an appointment</p>
                    
                    <div ref={qrRef} className="flex justify-center mb-6">
                      <QRCode
                        value={stylist.glossgenius_link}
                        size={200}
                        level="H"
                        includeMargin={true}
                        fgColor="#1a3a3a"
                        bgColor="#f5f5f5"
                      />
                    </div>

                    <button
                      onClick={downloadQR}
                      className="w-full text-xs font-semibold text-navy border border-border rounded-sm py-2 hover:bg-card transition-colors mb-4"
                    >
                      Download QR Code
                    </button>

                    <a
                      href={stylist.glossgenius_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block w-full rounded-sm bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors"
                    >
                      Book Now
                    </a>
                  </div>
                )}
              </div>

              {/* Right Column: Bio Content */}
              <div className="lg:col-span-3">
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

                {/* Call to Action */}
                {stylist.glossgenius_link && (
                  <div className="rounded-lg border border-border bg-card p-8 text-center">
                    <h3 className="font-display text-2xl font-semibold text-navy mb-3">Ready to Book?</h3>
                    <p className="text-espresso/70 mb-6">
                      Visit {stylist.name}'s GlossGenius profile to check availability and schedule your appointment.
                    </p>
                    <a
                      href={stylist.glossgenius_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-sm bg-ink px-8 py-3 text-xs font-semibold uppercase tracking-widest text-white hover:bg-navy transition-colors"
                    >
                      Book an Appointment
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
