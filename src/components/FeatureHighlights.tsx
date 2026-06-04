const featureItems = [
  {
    title: "Easy Return",
    description: "Hassle-free return process",
    icon: "↺",
  },
  {
    title: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "₹",
  },
  {
    title: "Secure Payment",
    description: "Trusted and encrypted checkout",
    icon: "🔒",
  },
  {
    title: "Fast Delivery",
    description: "Quick shipping across GCC",
    icon: "⚡",
  },
];

type FeatureHighlightsProps = {
  compact?: boolean;
};

export function FeatureHighlights({ compact = false }: FeatureHighlightsProps) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-3 sm:grid-cols-4"
          : "mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      }
    >
      {featureItems.map((item) => (
        <div
          key={item.title}
          className="rounded-xl border border-zinc-200 bg-white/80 p-3 text-center shadow-sm"
        >
          <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-pink-100 text-lg text-pink-600">
            {item.icon}
          </div>
          <p className="mt-2 text-sm font-semibold text-zinc-900">{item.title}</p>
          <p className="mt-1 text-xs text-zinc-600">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
