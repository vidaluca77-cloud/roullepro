"use client";

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Link from "next/link";
import { ArrowRight, BookHeart, Scale, ShieldCheck } from "lucide-react";
import {
  getOrderedPartners,
  type PartnerBannerAudience,
  type PartnerBannerId,
  type PartnerBannerItem,
} from "@/lib/partner-banner";

const ROTATION_MS = 6000;
const FADE_MS = 500;

const PARTNER_THEMES: Record<
  PartnerBannerId,
  {
    iconWrap: string;
    icon: string;
    badge: string;
    button: string;
  }
> = {
  giva: {
    iconWrap: "border-blue-200 bg-blue-100/80",
    icon: "text-blue-700",
    badge: "bg-blue-700 text-white",
    button:
      "border-blue-200 bg-white text-blue-700 hover:border-blue-300 hover:bg-blue-50",
  },
  allopoints: {
    iconWrap: "border-amber-200 bg-amber-100/80",
    icon: "text-amber-700",
    badge: "bg-amber-700 text-white",
    button:
      "border-amber-200 bg-white text-amber-800 hover:border-amber-300 hover:bg-amber-50",
  },
  "notre-livre": {
    iconWrap: "border-rose-200 bg-rose-100/80",
    icon: "text-rose-700",
    badge: "bg-rose-700 text-white",
    button:
      "border-rose-200 bg-white text-rose-800 hover:border-rose-300 hover:bg-rose-50",
  },
};

const PARTNER_ICONS = {
  giva: ShieldCheck,
  allopoints: Scale,
  "notre-livre": BookHeart,
} satisfies Record<PartnerBannerId, typeof ShieldCheck>;

function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("matchMedia" in window)) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    const legacyMediaQuery = mediaQuery as MediaQueryList & {
      addListener?: (listener: (event: MediaQueryListEvent) => void) => void;
      removeListener?: (listener: (event: MediaQueryListEvent) => void) => void;
    };

    legacyMediaQuery.addListener?.(updatePreference);
    return () => legacyMediaQuery.removeListener?.(updatePreference);
  }, []);

  return prefersReducedMotion;
}

function DiscoverLink({
  partner,
  tabIndex,
  className,
}: {
  partner: PartnerBannerItem;
  tabIndex: number;
  className: string;
}) {
  if (partner.external) {
    return (
      <a
        href={partner.href}
        target="_blank"
        rel="sponsored noopener"
        tabIndex={tabIndex}
        className={className}
      >
        Découvrir
        <ArrowRight className="h-3.5 w-3.5" />
      </a>
    );
  }

  return (
    <Link href={partner.href} tabIndex={tabIndex} className={className}>
      Découvrir
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}

function Slide({
  partner,
  visible,
  reducedMotion,
}: {
  partner: PartnerBannerItem;
  visible: boolean;
  reducedMotion: boolean;
}) {
  const theme = PARTNER_THEMES[partner.id];
  const Icon = PARTNER_ICONS[partner.id];
  const tabIndex = visible ? 0 : -1;

  return (
    <div
      aria-hidden={!visible}
      className={`absolute inset-0 flex flex-col justify-center gap-3 py-3 ${
        reducedMotion ? "" : "transition-opacity"
      } md:flex-row md:items-center md:justify-between md:gap-4 ${
        visible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      style={reducedMotion ? undefined : { transitionDuration: `${FADE_MS}ms` }}
    >
      <div className="min-w-0 flex items-center gap-3">
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${theme.iconWrap}`}
        >
          <Icon className={`h-4 w-4 ${theme.icon}`} />
        </div>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-5 text-slate-600">
            <span className="font-semibold text-slate-900">{partner.name}</span>
            <span className="hidden text-slate-300 md:inline" aria-hidden="true">
              •
            </span>
            <span>{partner.headline}</span>
            {partner.badge ? (
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}
              >
                {partner.badge}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <DiscoverLink
          partner={partner}
          tabIndex={tabIndex}
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${theme.button}`}
        />
        <Link
          href="/partenaires"
          tabIndex={tabIndex}
          className="text-sm font-medium text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2"
        >
          Voir les partenaires
        </Link>
      </div>
    </div>
  );
}

export default function PartnerBanner({
  audience,
}: {
  audience: PartnerBannerAudience;
}) {
  const partners = getOrderedPartners(audience);
  const prefersReducedMotion = usePrefersReducedMotion();
  const transitionTimeoutRef = useRef<number | null>(null);

  const [activeIndex, setActiveIndex] = useState(0);
  const [previousIndex, setPreviousIndex] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    setActiveIndex(0);
    setPreviousIndex(null);
  }, [audience]);

  useEffect(() => {
    if (!prefersReducedMotion) {
      return;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
      transitionTimeoutRef.current = null;
    }

    setPreviousIndex(null);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || partners.length < 2 || isPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      const nextIndex = (activeIndex + 1) % partners.length;
      setPreviousIndex(activeIndex);
      setActiveIndex(nextIndex);
    }, ROTATION_MS);

    return () => window.clearInterval(intervalId);
  }, [activeIndex, isPaused, partners.length, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion || previousIndex === null) {
      return;
    }

    if (transitionTimeoutRef.current !== null) {
      window.clearTimeout(transitionTimeoutRef.current);
    }

    transitionTimeoutRef.current = window.setTimeout(() => {
      setPreviousIndex(null);
      transitionTimeoutRef.current = null;
    }, FADE_MS);

    return () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
        transitionTimeoutRef.current = null;
      }
    };
  }, [prefersReducedMotion, previousIndex]);

  useEffect(
    () => () => {
      if (transitionTimeoutRef.current !== null) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    },
    [],
  );

  const activate = (nextIndex: number) => {
    if (nextIndex === activeIndex) {
      return;
    }

    if (prefersReducedMotion) {
      setPreviousIndex(null);
      setActiveIndex(nextIndex);
      return;
    }

    setPreviousIndex(activeIndex);
    setActiveIndex(nextIndex);
  };

  const handleMouseEnter = (_event: ReactMouseEvent<HTMLElement>) => {
    setIsPaused(true);
  };

  const handleMouseLeave = (_event: ReactMouseEvent<HTMLElement>) => {
    setIsPaused(false);
  };

  const handleFocusCapture = () => {
    setIsPaused(true);
  };

  const handleBlurCapture = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsPaused(false);
    }
  };

  const slideIndexes =
    previousIndex === null ? [activeIndex] : [previousIndex, activeIndex];

  return (
    <section
      aria-label="Partenaires RoullePro"
      aria-live="off"
      className="border-t border-slate-200 bg-gradient-to-r from-slate-50 via-blue-50/80 to-white"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div
          className="relative py-2.5"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onFocusCapture={handleFocusCapture}
          onBlurCapture={handleBlurCapture}
        >
          <div className="relative min-h-[124px] pr-0 sm:min-h-[96px] md:min-h-[76px] md:pr-28">
            {slideIndexes.map((index, position) => {
              const partner = partners[index];
              const visible = position === slideIndexes.length - 1;

              return (
                <Slide
                  key={`${partner.id}-${visible ? "active" : "previous"}`}
                  partner={partner}
                  visible={visible}
                  reducedMotion={prefersReducedMotion}
                />
              );
            })}
          </div>

          <div className="mt-1 flex items-center justify-end gap-2 md:absolute md:right-0 md:top-1/2 md:mt-0 md:-translate-y-1/2">
            {partners.map((partner, index) => {
              const isActive = index === activeIndex;

              return (
                <button
                  key={partner.id}
                  type="button"
                  aria-label={`Afficher ${partner.name}`}
                  aria-pressed={isActive}
                  onClick={() => activate(index)}
                  className={`h-2.5 w-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-slate-800"
                      : "bg-slate-300 hover:bg-slate-400"
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
