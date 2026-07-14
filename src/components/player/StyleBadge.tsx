import { STYLES, type StyleKey } from "@/lib/disc";

export function StyleBadge({
  style,
  size = "md",
}: {
  style: StyleKey;
  size?: "sm" | "md";
}) {
  const s = STYLES[style];
  const px = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${px}`}
      style={{
        backgroundColor: s.softVar,
        color: "var(--foundation)",
        border: `1px solid ${s.colorVar}`,
      }}
    >
      <span
        aria-hidden
        className="inline-block h-2 w-2 rounded-full"
        style={{ backgroundColor: s.colorVar }}
      />
      {s.name}
    </span>
  );
}