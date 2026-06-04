type OrderSuccessModalProps = {
  orderNumber: string;
  onClose: () => void;
};

export function OrderSuccessModal({ orderNumber, onClose }: OrderSuccessModalProps) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-success-title"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <p className="text-sm font-semibold uppercase tracking-wider text-emerald-600">
          Success
        </p>
        <h2 id="order-success-title" className="mt-3 text-2xl font-bold text-zinc-950">
          Order successfully placed
        </h2>
        <p className="mt-4 text-sm text-zinc-600">
          Your order number is{" "}
          <span className="font-bold text-zinc-950">{orderNumber}</span>
        </p>
        <p className="mt-3 text-sm text-zinc-600">
          Please check your inbox and spam folder for order details.
        </p>
        <p className="mt-2 text-sm text-zinc-600">
          You can also track your order here:{" "}
          <a
            href="https://www.hmshoponline.com/track-order"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#FF6B00]"
          >
            https://www.hmshoponline.com/track-order
          </a>
        </p>
        <button
          type="button"
          onClick={onClose}
          className="animated-button mt-7 w-full rounded-md bg-zinc-950 px-6 py-3 text-sm font-bold text-white transition hover:bg-zinc-700"
        >
          Close
        </button>
      </div>
    </div>
  );
}
