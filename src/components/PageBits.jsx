export function PageHeader({ kicker, title, description, action, }) {
    return (<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-medium tracking-[0.2em] text-amber-800/80 uppercase">{kicker}</p>
        <h1 className="font-serif mt-1 text-4xl leading-none text-ink">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">{description}</p>
      </div>
      {action}
    </div>);
}
