import React, { useState, useEffect } from 'react';

// Formats whole dollars: 1300 -> $1,300
const money = (n) => `$${Math.round(n || 0).toLocaleString('en-US')}`;

// 'YYYY-MM-DD' -> 'Oct 5' (built locally so it never shifts a day)
const shortDate = (ymd) => {
  if (!ymd) return '—';
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
// 'YYYY-MM' -> 'Sep'
const monthLabel = (ym) => {
  const [y, m] = ym.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
};

// Percent change, or null when there's nothing to compare against
const change = (current, previous) => (previous > 0 ? Math.round(((current - previous) / previous) * 100) : null);

function StatCard({ label, value, sub, delta }) {
  return (
    <div className="rounded-sm border border-border bg-card/40 p-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-espresso/50">{label}</p>
      <p className="mt-2 font-display text-3xl font-semibold text-navy">{value}</p>
      <div className="mt-1 flex items-center gap-2 text-xs text-espresso/60">
        {delta !== null && delta !== undefined && (
          <span className={delta >= 0 ? 'text-green-700 font-semibold' : 'text-red-700 font-semibold'}>
            {delta >= 0 ? '▲' : '▼'} {Math.abs(delta)}%
          </span>
        )}
        {sub && <span>{sub}</span>}
      </div>
    </div>
  );
}

function Section({ title, right, children }) {
  return (
    <div className="rounded-sm border border-border bg-card/40 p-6">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-navy">{title}</h3>
        {right}
      </div>
      {children}
    </div>
  );
}

function BarChart({ bars, highlightLast = true, compact = false }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  return (
    <div className="overflow-x-auto">
      <div className={`flex items-end gap-2 ${compact ? 'h-32' : 'h-48 min-w-[480px]'}`}>
        {bars.map((b, i) => {
          const pct = (b.value / max) * 100;
          const isLast = highlightLast && i === bars.length - 1;
          return (
            <div key={b.label + i} className="flex h-full flex-1 flex-col items-center justify-end" title={`${b.fullLabel || b.label}: ${b.display}`}>
              <span className="mb-1 text-[0.6rem] text-espresso/60 whitespace-nowrap">{b.value > 0 ? b.display : ''}</span>
              <div
                className={`w-full rounded-t-sm transition-all ${isLast ? 'bg-navy' : 'bg-navy/40'}`}
                style={{ height: `${Math.max(pct, b.value > 0 ? 3 : 0)}%` }}
              />
            </div>
          );
        })}
      </div>
      <div className={`mt-2 flex gap-2 ${compact ? '' : 'min-w-[480px]'}`}>
        {bars.map((b, i) => (
          <span key={b.label + i} className="flex-1 text-center text-[0.6rem] uppercase tracking-wider text-espresso/50">{b.label}</span>
        ))}
      </div>
    </div>
  );
}

function AttentionGroup({ title, items, render, tone = 'amber' }) {
  if (!items || items.length === 0) return null;
  const toneClass = tone === 'red' ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50';
  return (
    <div className={`rounded-sm border ${toneClass} p-4`}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-espresso/80">{title} ({items.length})</p>
      <ul className="space-y-1">
        {items.map((item, i) => <li key={i} className="text-sm text-espresso">{render(item)}</li>)}
      </ul>
    </div>
  );
}

export default function AdminReports({ token }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('monthly');

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/reports`, {
        headers: { 'x-admin-token': token },
      });
      const json = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(json.error || `Request failed (${response.status})`);
      setData(json);
    } catch (err) {
      setError(err.message || 'Failed to load reports');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [token]);

  if (loading && !data) return <p className="text-sm text-espresso/60">Loading reports…</p>;
  if (error && !data) {
    return (
      <div className="rounded-sm border border-red-200 bg-red-50 p-4">
        <p className="text-sm text-red-800">{error}</p>
        <button onClick={load} className="mt-3 text-xs font-semibold uppercase tracking-widest text-navy">Try again</button>
      </div>
    );
  }
  if (!data) return null;

  const { summary, revenue, signups, locations, upcoming_charges, anniversaries, upcoming_starts, attention } = data;

  const bars = period === 'weekly'
    ? revenue.weekly.map(w => ({ label: shortDate(w.start), fullLabel: `Week of ${shortDate(w.start)}`, value: w.total, display: money(w.total) }))
    : period === 'monthly'
      ? revenue.monthly.map(m => ({ label: monthLabel(m.label), fullLabel: m.label, value: m.total, display: money(m.total) }))
      : revenue.yearly.map(y => ({ label: y.label, value: y.total, display: money(y.total) }));
  const periodTotal = bars.reduce((t, b) => t + b.value, 0);

  const attentionCount = attention.past_due.length + attention.unsigned.length + attention.cancellations.length + attention.expired_invites.length;

  return (
    <div className="space-y-8">
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-sm text-espresso/70">
          Collected revenue is from payments received in Stripe. Projections are based on current subscriptions. All dates are Central time.
        </p>
        <button
          onClick={load}
          disabled={loading}
          className="rounded-sm border border-border px-4 py-2 text-[0.65rem] uppercase tracking-[0.15em] text-espresso/70 hover:border-navy hover:text-navy disabled:opacity-40"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Collected this month"
          value={money(summary.collected_this_month)}
          delta={change(summary.collected_this_month, summary.collected_last_month)}
          sub={`Last month ${money(summary.collected_last_month)}`}
        />
        <StatCard
          label="Collected year to date"
          value={money(summary.collected_ytd)}
          delta={change(summary.collected_ytd, summary.collected_last_ytd)}
          sub={`Same point last year ${money(summary.collected_last_ytd)}`}
        />
        <StatCard label="Collected this week" value={money(summary.collected_this_week)} sub="Monday – Sunday" />
        <StatCard
          label="Monthly recurring revenue"
          value={money(summary.mrr)}
          sub={`${money(summary.annual_run_rate)} / year run rate`}
        />
        <StatCard label="Scheduled next 30 days" value={money(summary.next_30_days)} sub={`${upcoming_charges.length} charges`} />
        <StatCard
          label="Chair occupancy"
          value={`${summary.occupancy_pct}%`}
          sub={`${summary.active_stylists} of ${summary.total_chairs} chairs · ${summary.tier_mix.weekly} weekly, ${summary.tier_mix.monthly} monthly`}
        />
      </div>

      {/* Needs attention */}
      {attentionCount > 0 && (
        <Section title={`Needs attention (${attentionCount})`}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AttentionGroup tone="red" title="Failed payments" items={attention.past_due}
              render={(s) => <>{s.stylist} <span className="text-espresso/60">· {s.location} · {s.tier}</span></>} />
            <AttentionGroup title="Agreement not signed" items={attention.unsigned}
              render={(s) => <>{s.stylist} <span className="text-espresso/60">· waiting {s.days_waiting ?? '?'} day{s.days_waiting === 1 ? '' : 's'}</span></>} />
            <AttentionGroup title="Cancellation requested" items={attention.cancellations}
              render={(s) => <>{s.stylist} <span className="text-espresso/60">· {s.location} · effective {shortDate(s.date)}</span></>} />
            <AttentionGroup title="Expired invites" items={attention.expired_invites}
              render={(i) => <>{i.email} <span className="text-espresso/60">· {i.location || '—'} · resend from Invites tab</span></>} />
          </div>
        </Section>
      )}

      {/* Revenue chart */}
      <Section
        title="Revenue collected"
        right={
          <div className="flex gap-1 rounded-sm border border-border p-1">
            {[['weekly', 'Week'], ['monthly', 'Month'], ['yearly', 'Year']].map(([key, label]) => (
              <button
                key={key}
                onClick={() => setPeriod(key)}
                className={`rounded-sm px-3 py-1 text-[0.65rem] uppercase tracking-[0.15em] transition-colors ${
                  period === key ? 'bg-navy text-white' : 'text-espresso/60 hover:text-navy'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        }
      >
        <BarChart bars={bars} />
        <p className="mt-4 text-xs text-espresso/60">
          {period === 'weekly' && `Last 12 weeks: ${money(periodTotal)}`}
          {period === 'monthly' && `Last 12 months: ${money(periodTotal)}`}
          {period === 'yearly' && `Last year and this year: ${money(periodTotal)}`}
        </p>
      </Section>

      {/* Location capacity */}
      <Section title="Location capacity">
        <div className="space-y-5">
          {locations.map(l => (
            <div key={l.id}>
              <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold text-navy">{l.name}</p>
                <p className="text-xs text-espresso/60">
                  {l.occupied} of {l.max_chairs} chairs · {l.open_chairs} open · {money(l.monthly_revenue)}/mo recurring
                </p>
              </div>
              <div className="h-3 w-full overflow-hidden rounded-sm bg-border/60">
                <div
                  className={`h-full ${l.occupancy_pct >= 85 ? 'bg-green-700' : l.occupancy_pct >= 50 ? 'bg-navy' : 'bg-amber-600'}`}
                  style={{ width: `${Math.min(l.occupancy_pct, 100)}%` }}
                />
              </div>
              <div className="mt-1 flex flex-wrap justify-between gap-2 text-xs text-espresso/60">
                <span>{l.occupancy_pct}% full · collected {money(l.collected_this_month)} this month</span>
                {l.open_chairs > 0 && <span>Filling open chairs ≈ +{money(l.open_chair_opportunity)}/mo at the monthly rate</span>}
              </div>
            </div>
          ))}
          {locations.length === 0 && <p className="text-sm text-espresso/60">No locations yet.</p>}
        </div>
      </Section>

      {/* Upcoming charges */}
      <Section title="Scheduled charges · next 30 days" right={<span className="text-xs text-espresso/60">Total {money(summary.next_30_days)}</span>}>
        {upcoming_charges.length === 0 ? (
          <p className="text-sm text-espresso/60">No charges scheduled in the next 30 days.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-[0.65rem] uppercase tracking-widest text-espresso/50">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Stylist</th>
                  <th className="py-2 pr-4">Location</th>
                  <th className="py-2 pr-4">Plan</th>
                  <th className="py-2 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {upcoming_charges.map((c, i) => (
                  <tr key={i} className="border-b border-border/60">
                    <td className="py-2 pr-4 text-espresso">{shortDate(c.date)}</td>
                    <td className="py-2 pr-4 text-espresso">
                      {c.stylist}
                      {c.status === 'pending_agreement' && <span className="ml-2 text-xs text-amber-700">(not signed)</span>}
                      {c.status === 'past_due' && <span className="ml-2 text-xs text-red-700">(past due)</span>}
                    </td>
                    <td className="py-2 pr-4 text-espresso/70">{c.location || '—'}</td>
                    <td className="py-2 pr-4 capitalize text-espresso/70">{c.tier}</td>
                    <td className="py-2 text-right text-espresso">{money(c.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>

      {/* Anniversaries, starts, growth */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Section title="Anniversaries · next 60 days">
          {anniversaries.length === 0 ? (
            <p className="text-sm text-espresso/60">None in the next 60 days.</p>
          ) : (
            <ul className="space-y-2">
              {anniversaries.map((a, i) => (
                <li key={i} className="text-sm text-espresso">
                  <span className="font-semibold">{shortDate(a.date)}</span> · {a.stylist}
                  <span className="text-espresso/60"> · {a.years} year{a.years === 1 ? '' : 's'}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="Upcoming start dates">
          {upcoming_starts.length === 0 ? (
            <p className="text-sm text-espresso/60">No new stylists starting soon.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming_starts.map((s, i) => (
                <li key={i} className="text-sm text-espresso">
                  <span className="font-semibold">{shortDate(s.date)}</span> · {s.stylist}
                  <span className="text-espresso/60"> · {s.location} · {s.tier}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title="New stylists · 12 months">
          <BarChart
            highlightLast={false}
            compact
            bars={signups.map(s => ({ label: monthLabel(s.label).slice(0, 1), fullLabel: s.label, value: s.count, display: String(s.count) }))}
          />
        </Section>
      </div>
    </div>
  );
}
