export default function Card({ title, value, color, icon, chip }) {
  return (
    <div className={`rounded-2xl border border-white/70 p-6 ${color}`}>
      <div className="mb-4 flex items-start justify-between">
        <div className="rounded-2xl bg-white/70 p-3 text-slate-700">{icon}</div>
        {chip ? (
          <span className="rounded-full px-3 py-1 text-sm font-semibold text-white/95 bg-slate-500/90">
            {chip}
          </span>
        ) : null}
      </div>
      <p className="text-4xl font-bold leading-none text-slate-900">{value}</p>
      <p className="mt-3 text-lg text-slate-600">{title}</p>
    </div>
  );
}