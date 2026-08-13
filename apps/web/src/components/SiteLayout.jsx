import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navItems = [
    { to: '/', label: 'Home' },
    { to: '/about', label: 'About Us' },
    { to: '/contact', label: 'Contact Us' },
];

function Logo({ className = '' }) {
    return (
        <Link to="/" className={`flex items-center leading-none ${className}`}>
            <img
                src="/suede-logo.png"
                alt="Suede Salon crest"
                className="h-14 w-14 object-contain"
            />
        </Link>
    );
}

export function SiteHeader() {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const location = useLocation();

    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 24);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 z-50 w-full transition-colors duration-500 ${
                scrolled ? 'bg-background/90 shadow-sm backdrop-blur-md' : 'bg-transparent'
            }`}
        >
            <div className="mx-auto flex max-w-[90rem] items-center justify-between px-5 py-4 sm:px-8">
                <Logo />

                <nav className="hidden items-center gap-10 md:flex">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === '/'}
                            className={({ isActive }) =>
                                `relative text-[0.78rem] uppercase tracking-[0.22em] transition-colors duration-300 ${
                                    isActive ? 'text-camel' : 'text-espresso/80 hover:text-navy'
                                }`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <button
                    type="button"
                    onClick={() => setOpen((v) => !v)}
                    className="text-navy md:hidden"
                    aria-label="Toggle menu"
                >
                    {open ? <X size={26} /> : <Menu size={26} />}
                </button>
            </div>

            {open && (
                <div className="border-t border-border bg-background/95 backdrop-blur-md md:hidden">
                    <nav className="flex flex-col px-6 py-4">
                        {navItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.to === '/'}
                                className={({ isActive }) =>
                                    `py-3 text-sm uppercase tracking-[0.2em] ${
                                        isActive ? 'text-camel' : 'text-espresso'
                                    }`
                                }
                            >
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}

export function SiteFooter() {
    return (
        <footer className="border-t border-border bg-navy text-primary-foreground">
            <div className="mx-auto grid max-w-[72rem] gap-10 px-6 py-16 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <img
                        src="/suede-logo.png"
                        alt="Suede Salon crest"
                        className="mb-4 h-20 w-20 object-contain"
                    />
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-background/70">
                        A boutique chair-rental salon in Town and Country, Missouri — locally owned,
                        personally maintained, and appointment-only through independent stylists.
                    </p>
                </div>
                <div>
                    <h4 className="text-[0.72rem] uppercase tracking-[0.28em] text-camel">Visit</h4>
                    <p className="mt-4 text-sm leading-relaxed text-background/80">
                        Town and Country
                        <br />
                        St. Louis, Missouri
                        <br />
                        <span className="mt-3 inline-block text-background/60">By appointment only</span>
                    </p>
                </div>
                <div>
                    <h4 className="text-[0.72rem] uppercase tracking-[0.28em] text-camel">Explore</h4>
                    <ul className="mt-4 space-y-2 text-sm">
                        {navItems.map((item) => (
                            <li key={item.to}>
                                <Link to={item.to} className="text-background/80 transition-colors hover:text-camel">
                                    {item.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            <div className="border-t border-background/10 py-6 text-center text-xs tracking-[0.12em] text-background/50">
                &copy; {new Date().getFullYear()} Suede Salon. All rights reserved. Appointments by individual stylists only.
            </div>
        </footer>
    );
}

export default function SiteLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col bg-background">
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
        </div>
    );
}
