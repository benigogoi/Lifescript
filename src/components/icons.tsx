/**
 * LifeScript — line-art icon set for the report section cards.
 * Single shared stroke style (24x24, currentColor, 1.4 stroke) so every icon
 * reads as one family. Kept as inline SVG (not <img>) so they inherit color
 * from CSS and need no external asset requests.
 */
import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SunIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5 5l2.1 2.1M16.9 16.9 19 19M19 5l-2.1 2.1M7.1 16.9 5 19" />
    </svg>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M15.2 8.8 13 13l-4.2 2.2L11 11z" />
    </svg>
  );
}

export function GridIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
      <path d="M3.5 9.7h17M3.5 15.3h17M9.7 3.5v17M15.3 3.5v17" />
    </svg>
  );
}

export function SignatureIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M3.5 16.5c2-1 3.4-3 4-5.3.5-1.8.4-3.7-1-3.7-1.6 0-2 3.4-1.2 6.6.6 2.3 2 3 3.4 1.7 1-1 1.6-2.7 1.9-3.8.2 1 .8 2.6 2 2.6 1.3 0 2.2-1.6 2.6-2.6.4 1 1.2 2 2.5 1.6 1-.3 1.7-1.3 2.1-2.1" />
      <path d="M4 19.5h16" opacity="0.5" />
    </svg>
  );
}

export function CalendarForwardIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3.5" y="4.5" width="14" height="15" rx="1.5" />
      <path d="M3.5 9h14M7.5 2.5v4M13.5 2.5v4" />
      <path d="M16 14.5h5.5M19 12l2.5 2.5L19 17" />
    </svg>
  );
}

export function CalendarDoubleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="2.5" y="5" width="13" height="14.5" rx="1.5" />
      <path d="M2.5 9.5h13M6.5 2.5v4.5M12 2.5v4.5" />
      <path d="M18.5 11v8M21.5 13l-3 3-3-3" />
    </svg>
  );
}

export function GemIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 9 12 3l7 6-7 12z" />
      <path d="M5 9h14M8.5 9 12 3l3.5 6M9.5 9 12 21l2.5-12" />
    </svg>
  );
}

export function LotusIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 20c-4.5 0-8-2.7-8-7 2.6 0 5 1.3 6.4 3.3M12 20c4.5 0 8-2.7 8-7-2.6 0-5 1.3-6.4 3.3" />
      <path d="M12 20c-3-2-4.5-5-4.5-8.2C9 13 10.7 14.5 12 16.5c1.3-2 3-3.5 4.5-4.7C16.5 15 15 18 12 20z" />
      <path d="M12 16.5c0-5 0-9 0-12.5" opacity="0.5" />
    </svg>
  );
}

export function OmIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="17.6" cy="6" r="1.1" />
      <path d="M16 9.4c.8-.7 1.7-.6 2.2.2.6.9.2 2.1-.9 2.6" />
      <path d="M4.5 12.5c0-2.6 2-4.3 4.3-3.7 1.8.5 2.6 2.1 2.1 3.7-.4 1.3-1.6 2-2.8 1.7-1-.3-1.6-1.1-1.4-2 .2-.7.9-1.1 1.6-.9" />
      <path d="M9.8 13.3c1 1.6 2.6 2.6 4.5 2.6 2.7 0 4.9-2 4.9-4.6 0-1.8-1-3.2-2.4-3.9" />
      <path d="M11.5 16.5c1.2 1.3 1.2 3.3-.2 4.4-1.3 1-3.1.8-4-.5" />
    </svg>
  );
}

export function BlessingIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 21s-6-3.6-6-8.4C6 9 8.2 7 10.6 7c.6 0 1.2.1 1.4.4.2-.3.8-.4 1.4-.4C15.8 7 18 9 18 12.6 18 17.4 12 21 12 21z" />
      <path d="M12 7c0-1.8.8-3.3 2-4.5M12 7c0-1.8-.8-3.3-2-4.5" opacity="0.55" />
    </svg>
  );
}

export const SECTION_ICONS = [
  SunIcon,
  CompassIcon,
  GridIcon,
  SignatureIcon,
  CalendarForwardIcon,
  CalendarDoubleIcon,
  GemIcon,
  LotusIcon,
  OmIcon,
  BlessingIcon,
];

export function ShieldCheckIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3.5 19 6v5.5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2.2 2.2L15.5 9.5" />
    </svg>
  );
}

export function ClockIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

export function SparkleIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M12 3v4M12 17v4M3 12h4M17 12h4" />
      <path d="M12 8.5 14 12l-2 3.5L10 12z" />
    </svg>
  );
}

export function MailIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <rect x="3" y="5.5" width="18" height="13" rx="1.8" />
      <path d="M4 7l8 6 8-6" />
    </svg>
  );
}
