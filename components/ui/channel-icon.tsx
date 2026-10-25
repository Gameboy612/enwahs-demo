import { Mail, Users } from "lucide-react";
import type { Channel } from "@/lib/types";
import { cn } from "@/lib/utils";

const channelColors: Record<Channel, string> = {
  whatsapp: "#25D366",
  wechat: "#07C160",
  email: "#64748b",
  internal: "#1a5f7a",
};

export function ChannelIcon({
  channel,
  size = 16,
  className,
  muted = false,
}: {
  channel: Channel;
  size?: number;
  className?: string;
  muted?: boolean;
}) {
  const color = muted ? "currentColor" : channelColors[channel];
  if (channel === "whatsapp") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M20.3 11.6a8.3 8.3 0 0 1-12.2 7.3L3.5 20l1.1-4.5A8.3 8.3 0 1 1 20.3 11.6Z"
          fill={color}
        />
        <path
          d="M8.2 7.7c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .6.4.7 1.1 1.4 1.9 1.9.3.2.5.2.7 0l.7-.8c.2-.2.4-.2.6-.1l1.7.8c.2.1.3.2.3.4 0 .2 0 1.1-.5 1.7-.5.5-1.2.8-2 .7-1-.2-2.3-.8-3.6-1.9-1-.9-1.9-2.2-2.1-3.2-.3-1 .1-2 .5-2.5Z"
          fill="white"
        />
      </svg>
    );
  }
  if (channel === "wechat") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path
          d="M10 3.5c-4 0-7.2 2.6-7.2 5.9 0 1.9 1.1 3.6 2.8 4.7l-.7 2.2 2.5-1.3c.8.2 1.7.4 2.6.4 4 0 7.2-2.7 7.2-6S14 3.5 10 3.5Z"
          fill={color}
        />
        <path
          d="M11.5 15.1c.6 2.7 3.4 4.7 6.7 4.7.8 0 1.5-.1 2.2-.3l2 1-.6-1.8c1.3-.9 2.2-2.3 2.2-3.9 0-2.7-2.6-4.9-5.8-4.9-3.1 0-5.6 2-5.8 4.5"
          fill={color}
          opacity="0.75"
        />
        <circle cx="7.6" cy="8.5" r="1" fill="white" />
        <circle cx="12.2" cy="8.5" r="1" fill="white" />
        <circle cx="16" cy="15.4" r="0.9" fill="white" />
        <circle cx="19.9" cy="15.4" r="0.9" fill="white" />
      </svg>
    );
  }
  if (channel === "email") {
    return <Mail width={size} height={size} className={className} aria-hidden="true" />;
  }
  return <Users width={size} height={size} className={className} aria-hidden="true" />;
}

export function ChannelPill({
  channel,
  label,
  className,
}: {
  channel: Channel;
  label: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-600",
        className,
      )}
    >
      <ChannelIcon channel={channel} size={12} />
      {label}
    </span>
  );
}
