export default function AboutUsPage() {
  return (
    <section className="bg-white py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    <div className="text-center mb-16">
      <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#FA710C]/10 text-[#FA710C] text-sm font-semibold">
        Welcome to HM Shop Online
      </span>

      <h1 className="mt-6 text-4xl md:text-6xl font-bold text-[#111111]">
        Discover Trending Products 
        <span className="text-[#FA710C]"> At Amazing Prices</span>
      </h1>

      <p className="mt-6 max-w-3xl mx-auto text-lg text-[#333333] leading-relaxed">
        HM Shop Online is your trusted destination for innovative, practical,
        and trending products that make everyday life easier, smarter, and more enjoyable.
        From gadgets and home essentials to beauty products, toys, lifestyle accessories,
        and unique problem-solving products, we carefully select items that offer quality,
        value, and convenience.
      </p>
    </div>
    <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
      <div>
        <h2 className="text-3xl font-bold text-[#111111] mb-6">
          Who We Are
        </h2>

        <p className="text-[#333333] mb-5 leading-relaxed">
          At HM Shop Online, we are passionate about helping customers discover
          products that improve everyday living. We continuously research market
          trends and customer needs to bring you innovative products that are useful,
          affordable, and in demand.
        </p>

        <p className="text-[#333333] leading-relaxed">
          Our goal is to provide a reliable and enjoyable shopping experience,
          offering carefully selected products backed by excellent customer service,
          secure shopping, and competitive prices.
        </p>
      </div>

      <div className="bg-[#F5F5F5] rounded-3xl p-8">
        <h3 className="text-2xl font-bold text-[#111111] mb-4">
          Our Mission
        </h3>

        <p className="text-[#333333] leading-relaxed">
          To make online shopping simple, affordable, and enjoyable by providing
          innovative products, exceptional customer support, and a seamless
          shopping experience for every customer.
        </p>

        <div className="border-t mt-6 pt-6">
          <h3 className="text-2xl font-bold text-[#111111] mb-4">
            Our Vision
          </h3>

          <p className="text-[#333333] leading-relaxed">
            To become a trusted global ecommerce destination recognized for quality,
            innovation, customer satisfaction, and value-driven shopping.
          </p>
        </div>
      </div>

    </div>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-20">

      <div className="text-center">
        <h3 className="text-4xl font-bold text-[#FA710C]">100%</h3>
        <p className="text-[#333333] mt-2">Secure Shopping</p>
      </div>

      <div className="text-center">
        <h3 className="text-4xl font-bold text-[#FA710C]">24/7</h3>
        <p className="text-[#333333] mt-2">Customer Support</p>
      </div>

      <div className="text-center">
        <h3 className="text-4xl font-bold text-[#FA710C]">Fast</h3>
        <p className="text-[#333333] mt-2">Order Processing</p>
      </div>

      <div className="text-center">
        <h3 className="text-4xl font-bold text-[#FA710C]">New</h3>
        <p className="text-[#333333] mt-2">Products Added Regularly</p>
      </div>

    </div>
    <div className="mb-20">

      <h2 className="text-3xl font-bold text-center text-[#111111] mb-12">
        Why Shop With Us?
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

        <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">🔥</div>
          <h3 className="font-semibold text-lg mb-2">Trending Products</h3>
          <p className="text-[#333333] text-sm">
            Discover the latest and most popular products from around the world.
          </p>
        </div>

        <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="font-semibold text-lg mb-2">Best Value</h3>
          <p className="text-[#333333] text-sm">
            Competitive pricing with excellent value for every purchase.
          </p>
        </div>

        <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="font-semibold text-lg mb-2">Secure Shopping</h3>
          <p className="text-[#333333] text-sm">
            Safe and secure transactions for complete peace of mind.
          </p>
        </div>

        <div className="border rounded-2xl p-6 text-center hover:shadow-lg transition">
          <div className="text-4xl mb-4">⭐</div>
          <h3 className="font-semibold text-lg mb-2">Customer Support</h3>
          <p className="text-[#333333] text-sm">
            Dedicated support whenever you need assistance.
          </p>
        </div>

      </div>

    </div>

    <div className="bg-[#FA710C] rounded-3xl text-white p-10 text-center">

      <h2 className="text-3xl font-bold mb-4">
        Why Customers Trust HM Shop Online
      </h2>

      <p className="max-w-3xl mx-auto mb-8 text-white/90">
        We are committed to providing quality products, reliable service,
        and an exceptional shopping experience from order placement
        to doorstep delivery.
      </p>

      <div className="grid md:grid-cols-5 gap-4">

        <div className="bg-white/10 rounded-xl p-4">
          ✓ Quality Checked Products
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          ✓ Secure Payments
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          ✓ Fast Processing
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          ✓ Responsive Support
        </div>

        <div className="bg-white/10 rounded-xl p-4">
          ✓ New Arrivals Weekly
        </div>

      </div>

      <div className="mt-10">
        <h3 className="text-2xl font-bold">
          HM Shop Online
        </h3>

        <p className="mt-2 text-white/90">
          Smart Products. Better Living. Everyday Value.
        </p>
      </div>

    </div>

  </div>
</section>
  );
}
