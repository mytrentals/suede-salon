import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Check } from 'lucide-react';
import SiteLayout from '@/components/SiteLayout';

const NOOK_IMG = 'https://images.hostinger.com/f7e8384f-a016-4e3c-a8f0-caf872aa6e91.png';

export default function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '' });
    const [errors, setErrors] = useState({});
    const [sent, setSent] = useState(false);

    const validate = () => {
        const next = {};
        if (!form.name.trim()) next.name = 'Please enter your name.';
        if (!form.email.trim()) next.email = 'Please enter your email.';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email.';
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validate()) return;
        setSent(true);
    };

    return (
        <SiteLayout>
            <Helmet>
                <title>Contact Us — Suede Salon</title>
                <meta name="description" content="Reach out to Suede Salon in Town and Country, St. Louis. Appointments are arranged by individual stylists only." />
            </Helmet>

            <section className="mx-auto grid min-h-[100dvh] max-w-[90rem] items-stretch gap-0 pt-20 lg:grid-cols-2">
                <div className="flex items-center px-6 py-20 sm:px-14">
                    <div className="w-full max-w-md suede-rise">
                        <span className="text-[0.72rem] uppercase tracking-[0.4em] text-camel">Get In Touch</span>
                        <h1 className="mt-5 font-display text-5xl font-semibold leading-none text-ink sm:text-6xl">
                            Say hello.
                        </h1>
                        <p className="mt-6 text-base leading-relaxed text-espresso/80">
                            Whether you are a stylist curious about chair space or a guest with a
                            question, leave your details below and we will be in touch. Please note —
                            appointments are booked directly through individual stylists, not here.
                        </p>

                        {sent ? (
                            <div className="mt-10 flex items-start gap-4 rounded-md border border-hunter/30 bg-card p-6">
                                <span className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-hunter text-background">
                                    <Check size={18} />
                                </span>
                                <div>
                                    <h3 className="font-display text-2xl font-semibold text-navy">Thank you, {form.name.split(' ')[0]}.</h3>
                                    <p className="mt-1 text-sm leading-relaxed text-espresso/75">
                                        We have received your note and will reach out to you at {form.email} shortly.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} noValidate className="mt-10 space-y-6">
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="name" className="text-[0.72rem] uppercase tracking-[0.22em] text-espresso/70">
                                        Name
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                                        className="rounded-sm border border-input bg-background px-4 py-3 text-espresso outline-none transition-colors focus:border-camel"
                                        placeholder="Your name"
                                    />
                                    {errors.name && <span className="text-xs text-destructive">{errors.name}</span>}
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label htmlFor="email" className="text-[0.72rem] uppercase tracking-[0.22em] text-espresso/70">
                                        Email
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                                        className="rounded-sm border border-input bg-background px-4 py-3 text-espresso outline-none transition-colors focus:border-camel"
                                        placeholder="you@email.com"
                                    />
                                    {errors.email && <span className="text-xs text-destructive">{errors.email}</span>}
                                </div>
                                <button
                                    type="submit"
                                    className="w-full rounded-sm bg-ink px-8 py-4 text-[0.74rem] uppercase tracking-[0.22em] text-primary-foreground transition-transform duration-300 hover:-translate-y-0.5"
                                >
                                    Send Message
                                </button>
                            </form>
                        )}

                        <p className="mt-8 text-sm leading-relaxed text-espresso/60">
                            Suede Salon &middot; Town and Country, St. Louis, Missouri
                            <br />
                            By appointment only, through your individual stylist.
                        </p>
                    </div>
                </div>
                <div className="relative hidden min-h-[400px] lg:block">
                    <img src={NOOK_IMG} alt="Suede Salon interior" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/30 to-transparent" />
                </div>
            </section>
        </SiteLayout>
    );
}
