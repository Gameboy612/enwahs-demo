import { cn, initials } from "@/lib/utils";

const sizes = {
  xs: "h-6 w-6 text-[9px]",
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
  xl: "h-16 w-16 text-lg",
  "2xl": "h-20 w-20 text-xl",
};

export type AvatarSize = keyof typeof sizes;

export function Avatar({
  name,
  color,
  size = "md",
  className,
  ring = false,
}: {
  name: string;
  color?: string;
  size?: AvatarSize;
  className?: string;
  ring?: boolean;
}) {
  const background = color ?? "#1a5f7a";
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
        sizes[size],
        ring && "ring-2 ring-white",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${background}, ${background}cc)`,
      }}
      aria-hidden="true"
      title={name}
    >
      {initials(name)}
    </span>
  );
}
