type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-signal">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold tracking-normal text-ink">{title}</h1>
      {description ? <p className="max-w-3xl text-sm leading-6 text-slate-600">{description}</p> : null}
    </div>
  );
}
