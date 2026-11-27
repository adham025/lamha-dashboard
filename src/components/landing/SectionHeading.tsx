export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'start',
}: {
  eyebrow?: string
  title: string
  description?: string
  align?: 'start' | 'center'
}) {
  const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-start'
  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      {eyebrow ? (
        <p className="text-sm font-bold uppercase tracking-wide text-[var(--color-accent)]">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-extrabold leading-snug text-[var(--color-ink)] md:text-3xl">{title}</h2>
      {description ? <p className="max-w-xl text-[15px] leading-relaxed text-[var(--color-muted)]">{description}</p> : null}
    </div>
  )
}