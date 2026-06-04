type ProductGridSkeletonProps = {
  count?: number;
};

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div className="product-grid" aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-md border border-zinc-200 bg-white"
        >
          <div className="aspect-[4/3] animate-pulse bg-zinc-200" />
          <div className="space-y-3 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-zinc-200" />
            <div className="h-4 w-1/3 animate-pulse rounded bg-zinc-200" />
            <div className="h-9 w-full animate-pulse rounded bg-zinc-200" />
          </div>
        </div>
      ))}
    </div>
  );
}
