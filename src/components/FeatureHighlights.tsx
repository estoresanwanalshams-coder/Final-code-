const featureItems = [
  {
    title: "UAE Delivery",
    description: "Reliable delivery across the UAE",
    icon: "🚚",
  },
  {
    title: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: "💵",
  },
  {
    title: "Easy Returns",
    description: "Simple and hassle-free returns",
    icon: "↩",
  },
  {
    title: "WhatsApp Support",
    description: "Quick help when you need it",
    icon: "💬",
  },
];

type FeatureHighlightsProps = {
  compact?: boolean;
};

export function FeatureHighlights({
  compact = false,
}: FeatureHighlightsProps) {
  return (
    <div
      className={
        compact
          ? "feature-highlights grid grid-cols-2 gap-3 sm:grid-cols-4"
          : "feature-highlights mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4"
      }
    >
      {featureItems.map((item) => (
        <div
          key={item.title}
          className="feature-highlight-item group rounded-xl bg-zinc-50 p-3 text-center transition duration-200 hover:bg-orange-50"
        >
          <div className="feature-highlight-icon mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-white text-lg shadow-sm">
            {item.icon}
          </div>

          <p className="feature-highlight-title mt-2 text-sm font-semibold text-zinc-900">
            {item.title}
          </p>

          <p className="feature-highlight-description mt-1 text-xs leading-5 text-zinc-600">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  );
}