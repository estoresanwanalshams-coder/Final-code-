export function ProductTrustPanel() {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50">
      <div className="grid grid-cols-1 divide-y divide-zinc-200 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
        <TrustItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <path d="M7 10h4" />
              <circle cx="17" cy="12" r="2" />
            </svg>
          }
          title="Cash on Delivery"
          description="Pay when your order arrives."
        />

        <TrustItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M3 7h11v9H3z" />
              <path d="M14 10h4l3 3v3h-7z" />
              <circle cx="7" cy="18" r="2" />
              <circle cx="18" cy="18" r="2" />
            </svg>
          }
          title="UAE Delivery"
          description="Reliable delivery across the UAE."
        />

        <TrustItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M4 11a8 8 0 1 0 2-5" />
              <path d="M4 4v7h7" />
            </svg>
          }
          title="Easy Returns"
          description="Simple return support when eligible."
        />

        <TrustItem
          icon={
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-5 w-5"
              aria-hidden="true"
            >
              <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9.2 9.2 0 0 1-4-.9L3 20l1.3-4a8 8 0 1 1 16.7-4.5Z" />
              <path d="M8.5 9.5c1 2.1 2 3.1 4.1 4.1" />
            </svg>
          }
          title="WhatsApp Support"
          description="Quick help before or after ordering."
        />
      </div>

      <div className="border-t border-zinc-200 bg-white px-4 py-3 text-center text-xs leading-5 text-zinc-500">
        Shop with confidence at{" "}
        <span className="font-semibold text-zinc-700">
          HMshoponline.com
        </span>
      </div>
    </div>
  );
}

function TrustItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex min-w-0 gap-3 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-hm-orange">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-sm font-bold text-zinc-950">
          {title}
        </p>

        <p className="mt-1 text-xs leading-5 text-zinc-600">
          {description}
        </p>
      </div>
    </div>
  );
}