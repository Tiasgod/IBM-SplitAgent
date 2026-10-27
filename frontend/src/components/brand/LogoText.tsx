interface LogoTextProps {
  height?: number;
  color?: string;
  className?: string;
}

export function LogoText({ height = 32, color = "#022139", className }: LogoTextProps) {
  return (
    <svg
      height={height}
      viewBox="0 0 325 87"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="SplitAgent"
      className={className}
    >
      <text
        fill={color}
        style={{ whiteSpace: "pre" }}
        xmlSpace="preserve"
        fontFamily="Nunito Sans, sans-serif"
        fontSize="64"
        fontWeight="900"
        letterSpacing="0em"
      >
        <tspan x="0" y="64.556">Split</tspan>
      </text>
      <text
        fill={color}
        style={{ whiteSpace: "pre" }}
        xmlSpace="preserve"
        fontFamily="Nunito Sans, sans-serif"
        fontSize="64"
        fontWeight="bold"
        letterSpacing="0em"
      >
        <tspan x="148" y="64.556">Agent</tspan>
      </text>
    </svg>
  );
}
