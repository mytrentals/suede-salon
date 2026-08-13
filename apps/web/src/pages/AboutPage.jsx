import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import SiteLayout from '@/components/SiteLayout';

const HERO_IMG = 'https://images.hostinger.com/512af5aa-0e68-4b75-aee1-c806abb0d61c.png';
const NOOK_IMG = 'https://images.hostinger.com/f7e8384f-a016-4e3c-a8f0-caf872aa6e91.png';

const values = [
    {
        title: 'Locally Owned',
        body: 'Suede is owned and run by people who live here, know this community, and answer for every detail personally.',
    },
    {
        title: 'Craftsmanship',
        body: 'From the fixtures to the finish, the space is built and maintained with care — a quiet respect for the work that happens inside it.',
    },
    {
        title: 'Professionalism',
        body: 'We hold a high bar. The stylists who call Suede home are established professionals who take pride in their craft.',
    },
    {
        title: 'Appointment Only',
        body: 'There is no walk-in front desk. Every visit is arranged directly with an individual stylist, keeping the experience calm and personal.',
    },
];

export default function AboutPage() {
    return (
        <SiteLayout>
            <Helmet>
                <title>About Us — Suede Salon</title>
                <meta name="description" content="The story of Suede Salon — a locally owned, boutique, appointment-only chair-rental salon in Town and Country, St. Louis." />
            </Helmet>

            <section className="relative flex min-h-[62vh] items-end">
                <div className="absolute inset-0">
                    <img src={HERO_IMG} alt="Suede Salon station" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/10" />
                </div>
                <div className="relative mx-auto w-full max-w-[72rem] px-6 pb-16 suede-rise">
                    <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Our Story</span>
                    <h1 className="mt-5 font-display text-5xl font-semibold leading-none text-ink sm:text-7xl">
                        Built by hand,
                        <span className="block italic text-navy">kept with care.</span>
                    </h1>
                </div>
            </section>

            <section className="mx-auto max-w-[56rem] px-6 py-24">
                <div className="space-y-6 text-lg leading-relaxed text-espresso/85">
                    <p>
                        Suede Salon began with a simple conviction: that beauty professionals deserve
                        a space as considered as the work they do. Rather than another busy salon
                        floor, we imagined a boutique home — locally owned, personally maintained, and
                        shaped around the independent stylists who work here.
                    </p>
                    <p>
                        Tucked into Town and Country, St. Louis, the room is warm and unhurried by
                        design. Every chair belongs to a professional running their own business, and
                        every client relationship stays exactly where it should — between the stylist
                        and the person in their chair.
                    </p>
                    <p>
                        That is why appointments are made by individual stylists only, never a salon
                        front desk. It keeps things intimate, intentional, and true to the boutique,
                        appointment-only model we believe in.
                    </p>
                </div>
            </section>

            <section className="bg-navy text-background">
                <div className="mx-auto max-w-[72rem] px-6 py-24">
                    <div className="grid gap-12 lg:grid-cols-2">
                        {values.map((v) => (
                            <div key={v.title} className="border-t border-background/20 pt-6">
                                <h3 className="font-display text-3xl font-semibold text-background">{v.title}</h3>
                                <p className="mt-3 max-w-md text-base leading-relaxed text-background/75">{v.body}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-[72rem] px-6 py-24">
                <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
                    <img src={NOOK_IMG} alt="Salon interior detail" className="h-full w-full rounded-md object-cover" />
                    <div>
                        <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">The Model</span>
                        <h2 className="mt-5 font-display text-4xl font-semibold leading-tight text-navy sm:text-5xl">
                            Boutique, stylist-driven, appointment-only.
                        </h2>
                        <p className="mt-6 max-w-lg text-base leading-relaxed text-espresso/80">
                            Suede exists for professionals who want to do their best work in a place
                            that reflects it. If that sounds like you — or if you simply want to learn
                            more before booking with your stylist — we would love to hear from you.
                        </p>
                        <Link
                            to="/contact"
                            className="mt-8 inline-block rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                        >
                            Contact Us
                        </Link>
                    </div>
                </div>
            </section>
        </SiteLayout>
    );
}
