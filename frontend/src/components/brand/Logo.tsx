import { LogoIcon } from "./LogoIcon";
import { LogoText } from "./LogoText";

type LogoVariant = "icon" | "full" | "text";
type LogoSize = "sm" | "md" | "lg";

interface LogoProps {
  variant?: LogoVariant;
  size?: LogoSize;
  color?: string;
  className?: string;
}

// Heights for each size (icon uses its own aspect ratio; full/text scale from these)
const textHeights: Record<LogoSize, number> = { sm: 20, md: 28, lg: 40 };
const iconHeights: Record<LogoSize, number> = { sm: 24, md: 32, lg: 48 };

export function Logo({ variant = "full", size = "md", color, className }: LogoProps) {
  if (variant === "icon") {
    return <LogoIcon height={iconHeights[size]} className={className} />;
  }

  if (variant === "text") {
    return <LogoText height={textHeights[size]} color={color} className={className} />;
  }

  // variant === "full": viewBox 446×106 — margem extra à direita para o 't' de Agent não ser cortado
  const height = iconHeights[size];
  const width = Math.round((height * 446) / 106);

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 446 106"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SplitAgent"
      display="block"
      className={className}
    >
      {/* Icon paths */}
      <path
        d="M6.5062 32.048C-2.73679 38.2268 -1.58146 56.3769 6.5062 62.1696L54.6486 35.9097L79.2975 22.0072C79.2975 22.0072 83.9192 18.9172 82.7635 13.1254C81.6077 7.33364 74.6759 2.69723 70.0543 0.767016C66.0791 -0.893215 58.8853 0.381237 54.6488 2.31227C52.7607 3.17284 6.5062 32.048 6.5062 32.048Z"
        fill="url(#logo_full_grad0)"
      />
      <path
        d="M78.5273 46.3356L53.493 59.0801L29.2293 71.8239C29.2293 71.8239 5.35113 82.636 3.42544 88.0424C2.2553 91.3276 3.64487 98.3202 10.0136 102.522C14.1258 105.235 24.1814 106.961 29.2293 105.421C34.2773 103.881 77.7978 78.7795 79.2975 77.2304C81.6492 74.8009 87 70.6654 87 60.6248C87 52.129 78.5273 46.3356 78.5273 46.3356Z"
        fill="url(#logo_full_grad1)"
      />
      <path
        d="M54.6486 35.9097L6.5062 62.1696C6.5062 62.1696 9.70621 64.4328 11.8985 65.6443C14.0789 66.8493 17.2904 68.3475 17.2904 68.3475C17.2904 68.3475 21.1218 69.976 23.4526 70.6645C25.6595 71.3165 29.2293 71.8239 29.2293 71.8239L53.493 59.0801L78.5273 46.3356C78.5273 46.3356 76.2935 44.4047 74.6759 43.4139C73.0583 42.4231 66.9732 39.7706 66.9732 39.7706C66.9732 39.7706 62.5676 38 60.811 37.4536C58.4418 36.7167 54.6486 35.9097 54.6486 35.9097Z"
        fill="url(#logo_full_grad2)"
      />

      <text
        fill={color ?? "#022139"}
        style={{ whiteSpace: "pre" }}
        xmlSpace="preserve"
        fontFamily="Nunito Sans, sans-serif"
        fontSize="64"
        fontWeight="900"
        letterSpacing="0em"
      >
        <tspan x="98" y="79.556">Split</tspan>
      </text>
      <text
        fill={color ?? "#022139"}
        style={{ whiteSpace: "pre" }}
        xmlSpace="preserve"
        fontFamily="Nunito Sans, sans-serif"
        fontSize="64"
        fontWeight="bold"
        letterSpacing="0em"
      >
        <tspan x="257" y="79.556">Agent</tspan>
      </text>

      <defs>
        <linearGradient id="logo_full_grad0" x1="1.11458" y1="52.5144" x2="79.3995" y2="8.28483" gradientUnits="userSpaceOnUse">
          <stop stopColor="#053D51" />
          <stop offset="0.413462" stopColor="#0DA0A0" />
          <stop offset="0.581731" stopColor="#0DA0A0" />
          <stop offset="1" stopColor="#053D51" />
        </linearGradient>
        <linearGradient id="logo_full_grad1" x1="3.81057" y1="52.6389" x2="69.58" y2="11.1842" gradientUnits="userSpaceOnUse">
          <stop stopColor="#066A74" />
          <stop offset="0.216346" stopColor="#0DA0A0" />
          <stop offset="0.408654" stopColor="#0DA0A0" />
          <stop offset="1" stopColor="#065363" />
        </linearGradient>
        <linearGradient id="logo_full_grad2" x1="43.5" y1="0" x2="43.5" y2="106" gradientUnits="userSpaceOnUse">
          <stop offset="0.283654" stopColor="#E99604" />
          <stop offset="0.533654" stopColor="#FCC919" />
          <stop offset="0.831731" stopColor="#E99604" />
        </linearGradient>
      </defs>
    </svg>
  );
}
