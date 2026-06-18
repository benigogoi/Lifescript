/**
 * LifeScript — decorative mandala/yantra motif, the same visual language as
 * the report's thank-you page star pattern. Pure inline SVG: no external
 * image request, scales losslessly, and tints via currentColor + CSS.
 */
export function Mandala(props: { className?: string }) {
  const rings = [220, 180, 140];
  const spokes = Array.from({ length: 12 }, (_, i) => (i * 360) / 12);

  return (
    <svg
      className={props.className}
      viewBox="0 0 440 440"
      fill="none"
      aria-hidden
    >
      <g stroke="currentColor" strokeWidth="0.75" opacity="0.55">
        {rings.map((r) => (
          <circle key={r} cx="220" cy="220" r={r} />
        ))}
        {spokes.map((deg) => {
          const rad = (deg * Math.PI) / 180;
          const x = 220 + 220 * Math.sin(rad);
          const y = 220 - 220 * Math.cos(rad);
          return <line key={deg} x1="220" y1="220" x2={x} y2={y} />;
        })}
      </g>
      <g stroke="currentColor" strokeWidth="1">
        <polygon points="220,80 339,290 101,290" opacity="0.7" />
        <polygon points="220,360 101,150 339,150" opacity="0.7" />
      </g>
      <circle cx="220" cy="220" r="44" stroke="currentColor" strokeWidth="1.1" />
      <circle cx="220" cy="220" r="3.5" fill="currentColor" stroke="none" />
      {spokes.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x = 220 + 220 * Math.sin(rad);
        const y = 220 - 220 * Math.cos(rad);
        return <circle key={`dot-${deg}`} cx={x} cy={y} r="2.2" fill="currentColor" stroke="none" opacity="0.8" />;
      })}
    </svg>
  );
}
