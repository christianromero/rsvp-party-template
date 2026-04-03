"use client";

import { useMemo } from "react";

// Emojis temáticos de cumpleaños/fiesta
const PARTY_EMOJIS = ["🎈", "🎉", "✨", "⭐", "🎊", "🥳", "💫", "🌟", "🎁", "🎀", "🏆", "🎆", "🎇", "🪅"];

// Variantes de la animación (definidas en globals.css)
const ANIM_VARIANTS = ["emojiFloat", "emojiFloatDrift", "emojiFloatSpin"];

interface EmojiParticle {
  id:       number;
  emoji:    string;
  left:     number;
  bottom:   number;
  size:     number;
  duration: number;
  delay:    number;
  anim:     string;
}

interface FloatingEmojisProps {
  count?:     number;
  className?: string;
}

export default function FloatingEmojis({ count = 8, className = "" }: FloatingEmojisProps) {
  const particles = useMemo<EmojiParticle[]>(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id:       i,
        emoji:    PARTY_EMOJIS[i % PARTY_EMOJIS.length],
        left:     ((i * 67 + 11) % 88) + 4,
        bottom:   (i * 17) % 70,
        size:     14 + (i % 4) * 6,
        duration: 12 + (i * 2.3) % 16,
        delay:    (i * 1.9) % 14,
        anim:     ANIM_VARIANTS[i % ANIM_VARIANTS.length],
      })),
    [count]
  );

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none select-none ${className}`}>
      {particles.map((p) => (
        <span
          key={p.id}
          role="presentation"
          style={{
            position:       "absolute",
            left:           `${p.left}%`,
            bottom:         `${p.bottom}%`,
            fontSize:       `${p.size}px`,
            lineHeight:     "1",
            animation:      `${p.anim} ${p.duration}s ease-in-out infinite`,
            animationDelay: `${p.delay}s`,
            opacity:        0,
            filter:         "drop-shadow(0 0 5px rgba(255,210,0,0.35))",
          }}
        >
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
