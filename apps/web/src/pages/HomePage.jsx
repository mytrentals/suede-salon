import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { ArrowUpRight, Scissors, Sparkles, MapPin } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';

const HERO_IMG = 'https://images.hostinger.com/0d3502da-ea37-41fb-901c-0cf9e4626ae0.png';
const HANDS_IMG = 'https://images.hostinger.com/b06ba30c-4a7b-491a-ae21-1d25b99138ca.png';
const STATION_IMG = 'https://images.hostinger.com/512af5aa-0e68-4b75-aee1-c806abb0d61c.png';
const NOOK_IMG = 'https://images.hostinger.com/f7e8384f-a016-4e3c-a8f0-caf872aa6e91.png';

const pillars = [
    {
        icon: Scissors,
        title: 'Stylist-Driven',
        body: 'Every chair belongs to an independent professional. Your relationship is with your stylist — start to finish.',
    },
    {
        icon: Sparkles,
        title: 'Personally Maintained',
        body: 'Locally owned and cared for by hand. A calm, curated space kept to a boutique standard, day after day.',
    },
    {
        icon: MapPin,
        title: 'Town & Country',
        body: 'Quietly tucked into St. Louis, Missouri — an intimate setting designed for focus, comfort, and craft.',
    },
];

export default function HomePage() {
    return (
        <SiteLayout>
            <Helmet>
                <title>Suede Salon — Boutique Chair-Rental Salon in Town & Country, St. Louis</title>
                <meta
                    name="description"
                    content="Suede Salon is a locally owned, appointment-only boutique chair-rental salon in Town and Country, St. Louis, Missouri."
                />
            </Helmet>

            {/* Hero */}
            <section className="relative flex min-h-[100dvh] items-center">
                <div className="absolute inset-0">
                    <img src={HERO_IMG} alt="Suede Salon interior" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/20" />
                </div>
                <div className="relative mx-auto w-full max-w-[90rem] px-5 sm:px-8">
                    <div className="max-w-xl suede-rise">
                        <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">
                            Town &amp; Country &middot; St. Louis, MO
                        </span>
                        <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.02] text-ink sm:text-7xl">
                            A boutique salon,
                            <span className="block italic text-navy">quietly done well.</span>
                        </h1>
                        <p className="mt-7 max-w-md text-lg leading-relaxed text-espresso/85">
                            Suede Salon is a locally owned, personally maintained chair-rental space for
                            beauty professionals and the clients who trust them. Refined, unhurried, and
                            entirely appointment-only.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-4">
                            <Link
                                to="/about"
                                className="rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                            >
                                About Us
                            </Link>
                            <Link
                                to="/contact"
                                className="group inline-flex items-center gap-2 text-[0.74rem] uppercase tracking-[0.22em] text-navy"
                            >
                                Contact Us
                                <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                            </Link>
                        </div>
                        <p className="mt-8 text-sm italic text-espresso/60">
                            Appointments are booked by individual stylists only — never a salon front desk.
                        </p>
                    </div>
                </div>
            </section>

            {/* Pillars */}
            <section className="mx-auto max-w-[72rem] px-6 py-24">
                <div className="grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3">
                    {pillars.map(({ icon: Icon, title, body }) => (
                        <div key={title} className="bg-card p-8">
                            <Icon size={26} strokeWidth={1.4} className="text-camel" />
                            <h3 className="mt-6 font-display text-2xl font-semibold text-navy">{title}</h3>
                            <p className="mt-3 text-sm leading-relaxed text-espresso/75">{body}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Editorial split */}
            <section className="bg-hunter text-background">
                <div className="mx-auto grid max-w-[90rem] items-stretch gap-0 lg:grid-cols-2">
                    <div className="order-2 flex items-center px-6 py-20 sm:px-14 lg:order-1">
                        <div className="max-w-lg">
                            <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">The Suede Difference</span>
                            <h2 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                                Space made for professionals, felt by their clients.
                            </h2>
                            <p className="mt-6 text-base leading-relaxed text-background/80">
                                We built Suede as a home for beauty professionals who care about their
                                craft and the experience around it. No crowded floors, no rushed
                                turnovers — just a considered environment where independent stylists do
                                their finest work.
                            </p>
                            <p className="mt-4 text-base leading-relaxed text-background/80">
                                Clients feel the difference the moment they arrive: a warm, curated room
                                that belongs to the person styling their hair.
                            </p>
                        </div>
                    </div>
                    <div className="order-1 min-h-[360px] lg:order-2">
                        <img src={HANDS_IMG} alt="Stylist at work" className="h-full w-full object-cover" />
                    </div>
                </div>
            </section>

            {/* Stylist invitation */}
            <section className="mx-auto max-w-[72rem] px-6 py-24">
                <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
                    <div>
                        <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">For Stylists</span>
                        <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
                            A chair worth settling into.
                        </h2>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-espresso/80">
                            If you are an established professional looking for a refined, well-kept
                            place to build your business, we would love to hear from you. There is no
                            pressure here — only an open door and an honest conversation about whether
                            Suede is the right fit.
                        </p>
                        <Link
                            to="/contact"
                            className="mt-8 inline-flex items-center gap-2 rounded-sm border border-navy px-7 py-3.5 text-[0.74rem] uppercase tracking-[0.22em] text-navy transition-colors duration-300 hover:bg-navy hover:text-primary-foreground"
                        >
                            Inquire About Chair Space
                            <ArrowUpRight size={16} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <img src={STATION_IMG} alt="Salon styling station" className="h-full w-full rounded-md object-cover" />
                        <img src={NOOK_IMG} alt="Salon detail" className="mt-8 h-full w-full rounded-md object-cover" />
                    </div>
                </div>
            </section>

            {/* Closing CTA */}
            <section className="bg-background">
                <div className="mx-auto max-w-[56rem] px-6 pb-28 text-center">
                    <div className="rounded-lg border border-camel/40 bg-card px-8 py-16">
                        <h2 className="font-display text-4xl font-semibold text-ink sm:text-5xl">
                            Come see the space.
                        </h2>
                        <p className="mx-auto mt-5 max-w-md text-base leading-relaxed text-espresso/75">
                            Learn our story or reach out directly. Remember — appointments are always
                            arranged through your individual stylist.
                        </p>
                        <div className="mt-9 flex flex-wrap justify-center gap-4">
                            <Link
                                to="/about"
                                className="rounded-sm border border-espresso/30 px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-espresso transition-colors duration-300 hover:border-camel hover:text-camel"
                            >
                                Our Story
                            </Link>
                            <Link
                                to="/contact"
                                className="rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                            >
                                Contact Us
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
