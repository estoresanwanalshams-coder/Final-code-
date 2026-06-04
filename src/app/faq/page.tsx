export default function FaqPage() {
  return (
    <section className="page-shell">
      <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-zinc-950">Customer FAQ</h1>
        <div className="mt-6 space-y-5 text-zinc-700 leading-7">
          <p>
            This is placeholder FAQ content. Replace with your real customer questions and answers.
          </p>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">How can I track my order?</h2>
            <p className="mt-2">
              You can track your order from the Track Order page using email or order/phone number.
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">What payment methods are available?</h2>
            <p className="mt-2">Currently, Cash on Delivery (COD) is available.</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">How long does delivery take?</h2>
            <p className="mt-2">
              Delivery timelines vary by region. Add your finalized SLA information here.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
