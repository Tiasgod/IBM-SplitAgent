import type { CSSProperties } from "react";
import "./Skeleton.css";

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  className?: string;
  style?: CSSProperties;
}

/** Single shimmer block. Compose multiples to build page skeletons. */
export function Skeleton({ width = "100%", height = "1rem", borderRadius = "6px", className, style }: SkeletonProps) {
  return (
    <span
      className={`skeleton${className ? ` ${className}` : ""}`}
      style={{ width, height, borderRadius, ...style }}
      aria-hidden="true"
    />
  );
}
