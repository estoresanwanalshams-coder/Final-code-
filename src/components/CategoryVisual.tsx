type CategoryVisualProps = {
  slug: string;
  className?: string;
};

function HomeKitchenIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M28 52L60 26L92 52V94H28V52Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M47 94V66H73V94"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M22 55L60 22L98 55"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ElectronicsIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <rect
        x="34"
        y="19"
        width="52"
        height="82"
        rx="9"
        stroke="currentColor"
        strokeWidth="5"
      />
      <path
        d="M50 29H70"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <circle cx="60" cy="89" r="4" fill="currentColor" />
      <path
        d="M94 35C101 42 101 54 94 61"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M103 27C115 39 115 57 103 69"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BabyToysIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <circle
        cx="60"
        cy="58"
        r="31"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="48" cy="54" r="4" fill="currentColor" />
      <circle cx="72" cy="54" r="4" fill="currentColor" />
      <path
        d="M49 69C55 75 65 75 71 69"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M39 32L31 22L46 25"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M81 32L89 22L74 25"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M34 87L24 98"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M86 87L96 98"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AutomotiveIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M25 70L33 47C35 41 40 38 47 38H73C80 38 85 41 87 47L95 70"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <rect
        x="20"
        y="65"
        width="80"
        height="25"
        rx="7"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="36" cy="82" r="6" fill="currentColor" />
      <circle cx="84" cy="82" r="6" fill="currentColor" />
      <path
        d="M39 53H81"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BeautyIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M60 18L66 40L88 46L66 52L60 74L54 52L32 46L54 40L60 18Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M87 62L91 75L104 79L91 83L87 96L83 83L70 79L83 75L87 62Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M33 66L37 77L48 81L37 85L33 96L29 85L18 81L29 77L33 66Z"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M77 25C68 19 56 20 49 27C42 34 41 45 46 53L22 77C17 82 17 90 22 95C27 100 35 100 40 95L64 71C72 76 83 75 90 68C97 61 99 49 93 40L81 52L70 49L67 38L77 25Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShoppingIcon() {
  return (
    <svg
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-full w-full"
      aria-hidden="true"
    >
      <path
        d="M34 45H86L82 94H38L34 45Z"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M45 46V38C45 29 52 22 60 22C68 22 75 29 75 38V46"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case "home-and-kitchen":
      return <HomeKitchenIcon />;

    case "electronic-gadgets":
      return <ElectronicsIcon />;

    case "baby-toys":
      return <BabyToysIcon />;

    case "automative":
    case "automotive":
      return <AutomotiveIcon />;

    case "health-beauty":
    case "health-and-beauty":
      return <BeautyIcon />;

    case "tools-home-improvement":
    case "tools-and-home-improvement":
      return <ToolsIcon />;

    default:
      return <ShoppingIcon />;
  }
}

export function CategoryVisual({
  slug,
  className = "",
}: CategoryVisualProps) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-orange-50 via-[#fffaf6] to-amber-50 ${className}`}
    >
      <div className="absolute -right-8 -top-10 h-28 w-28 rounded-full bg-orange-200/30 blur-2xl" />

      <div className="absolute -bottom-10 -left-8 h-28 w-28 rounded-full bg-amber-200/30 blur-2xl" />

      <div className="absolute right-5 top-5 h-2 w-2 rounded-full bg-orange-300/70" />

      <div className="absolute bottom-7 left-6 h-3 w-3 rounded-full border-2 border-orange-300/60" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="h-[46%] w-[46%] text-orange-600 transition duration-300 group-hover:scale-105 group-hover:text-orange-700">
          {getCategoryIcon(slug)}
        </div>
      </div>
    </div>
  );
}