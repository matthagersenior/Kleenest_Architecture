export default function WorkspaceTierHero({ label, meta, message }) {
 return <section className="tier-hero" aria-label={`${label} experience`}><div className="tier-hero-card"><div className="tier-hero-kicker">{label} experience</div><h2 className="tier-hero-title">{meta.label} · built around what you need next</h2><p className="tier-hero-copy">{message}</p></div></section>;
}
