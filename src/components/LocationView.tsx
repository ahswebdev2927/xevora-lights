import React from "react";

interface LocationViewProps {
  city?: string;
}

export default function LocationView({ city = "" }: LocationViewProps) {
  const normalizedCity = (city || "")
    .toLowerCase()
    .replace(/^dry-fish-in-/, "")
    .replace(/^dry-fish-/, "")
    .replace(/-/g, " ")
    .trim();

  // Hyderabad Content
  if (normalizedCity.includes("hyderabad")) {
    return (
      <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
            Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <h1 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11] flex items-center gap-2">
                <span>🐟</span> Premium Dry Fish in Hyderabad – Order Online
              </h1>
              <p className="text-sm sm:text-base leading-relaxed">
                Searching for authentic <strong>dry fish in Hyderabad</strong>? Godavari Dry Fish offers high-quality coastal dry seafood delivered across Hyderabad at affordable price.
              </p>
              <p className="text-sm sm:text-base font-medium">Whether you need:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
                <li>Dry fish wholesale in Hyderabad</li>
                <li>Dry fish market price Hyderabad</li>
                <li>Buy dry fish online Hyderabad</li>
                <li>Dry fish shop near me</li>
              </ul>
              <p className="text-sm sm:text-base pt-1">We provide reliable and hygienic supply.</p>
            </section>

            <div className="border-b border-[#8c6239]/20" />

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11] flex items-center gap-2">
                <span>💰</span> Affordable Dry Fish Market Price in Hyderabad
              </h2>
              <p className="text-sm sm:text-base leading-relaxed">
                Many Hyderabad dry fish markets have fluctuating prices due to middlemen and supply variation.
              </p>
              <p className="text-sm sm:text-base font-medium">We provide:</p>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Low price dry fish
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Transparent wholesale pricing
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Bulk order discounts
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Direct sourcing advantage
                </li>
              </ul>
            </section>

            <div className="border-b border-[#8c6239]/20" />

            {/* Section 3 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11] flex items-center gap-2">
                <span>🏬</span> Wholesale Dry Fish Supplier in Hyderabad
              </h2>
              <p className="text-sm sm:text-base font-medium">We supply to:</p>
              <ul className="space-y-2 text-sm sm:text-base">
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Retailers
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Restaurants
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Resellers
                </li>
                <li className="flex items-center gap-2 font-medium">
                  <span className="font-bold">✓</span> Bulk buyers
                </li>
              </ul>
              <p className="text-sm sm:text-base pt-2">Contact us for wholesale dry fish price list.</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  // Delhi Content
  if (normalizedCity.includes("delhi")) {
    return (
      <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
            Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
          </p>

          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11]">
              Order Dry Fish Online in Delhi at Best Price
            </h1>
            <p className="text-sm sm:text-base leading-relaxed">
              Finding quality <strong>dry fish in Delhi</strong> can be challenging. Many markets have high prices and inconsistent quality.
            </p>
            <p className="text-sm sm:text-base font-medium">Godavari Dry Fish offers:</p>
            <ul className="space-y-2 text-sm sm:text-base">
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Affordable dry fish price in Delhi
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Online ordering
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Wholesale supply
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Hygienic packaging
              </li>
            </ul>
            <p className="text-sm sm:text-base pt-2">We deliver premium coastal dry fish across Delhi.</p>
          </div>
        </div>
      </main>
    );
  }

  // Chennai Content
  if (normalizedCity.includes("chennai")) {
    return (
      <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
            Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
          </p>

          <div className="space-y-8">
            {/* Section 1 */}
            <section className="space-y-4">
              <h1 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11]">
                Buy Premium Dry Fish in Chennai Online
              </h1>
              <p className="text-sm sm:text-base leading-relaxed">
                Looking for traditional <strong>karuvadu and dry fish in Chennai</strong>? We supply authentic sun-dried fish at competitive market price.
              </p>
              <p className="text-sm sm:text-base font-medium">If you are searching:</p>
              <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
                <li>Dry fish near me in Chennai</li>
                <li>Chennai dry fish market price</li>
                <li>Dry fish wholesale Chennai</li>
              </ul>
              <p className="text-sm sm:text-base pt-1">We deliver directly to your location.</p>
            </section>

            <div className="border-b border-[#8c6239]/20" />

            {/* Section 2 */}
            <section className="space-y-4">
              <h2 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11]">
                Popular Varieties in Chennai
              </h2>
              <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
                <li>Karuvadu</li>
                <li>Nethili Fish</li>
                <li>Bombay Duck</li>
                <li>Dry Prawns</li>
              </ul>
              <p className="text-sm sm:text-base pt-2">All rich in protein and naturally preserved.</p>
            </section>
          </div>
        </div>
      </main>
    );
  }

  // Kolkata Content
  if (normalizedCity.includes("kolkata")) {
    return (
      <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
            Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
          </p>

          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11]">
              Buy Dry Fish in Kolkata – Low Cost & Premium Quality
            </h1>
            <p className="text-sm sm:text-base leading-relaxed">
              Searching for trusted <strong>dry fish supplier in Kolkata</strong>? We provide high-quality dry fish at competitive market rates.
            </p>
            <p className="text-sm sm:text-base font-medium">Order:</p>
            <ul className="list-disc pl-6 space-y-1.5 text-sm sm:text-base">
              <li>Dry Prawns</li>
              <li>Bombay Duck Dry Fish</li>
              <li>Ribbon Fish</li>
              <li>Mackerel</li>
            </ul>
            <p className="text-sm sm:text-base pt-2">With secure delivery and transparent pricing.</p>
          </div>
        </div>
      </main>
    );
  }

  // Bangalore Content
  if (normalizedCity.includes("bangalore") || normalizedCity.includes("bengaluru")) {
    return (
      <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
            Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
          </p>

          <div className="space-y-6">
            <h1 className="text-xl sm:text-2xl font-playfair font-bold text-[#2C1D11]">
              Buy Fresh Coastal Dry Fish in Bangalore Online
            </h1>
            <p className="text-sm sm:text-base leading-relaxed">
              Looking for premium quality <strong>dry fish in Bangalore</strong>? Godavari Dry Fish delivers traditional sun-dried seafood straight to your home across Bangalore.
            </p>
            <p className="text-sm sm:text-base font-medium">We provide:</p>
            <ul className="space-y-2 text-sm sm:text-base">
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Authentic coastal sourcing
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Best market price in Bangalore
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Vacuum-sealed hygienic packaging
              </li>
              <li className="flex items-center gap-2 font-medium">
                <span className="font-bold">✓</span> Doorstep delivery across Bangalore
              </li>
            </ul>
            <p className="text-sm sm:text-base pt-2">Enjoy pure coastal flavours delivered right to your doorstep.</p>
          </div>
        </div>
      </main>
    );
  }

  // Default / Mumbai / Price / Wholesale Content
  const locationLabel =
    normalizedCity.includes("wholesale")
      ? "Wholesale"
      : normalizedCity.includes("price")
      ? "Market"
      : "Mumbai";

  return (
    <main className="min-h-[80vh] bg-[#F4E2C7] py-14 px-4 sm:px-6 md:px-12 font-sans text-[#2C1D11]">
      <div className="max-w-3xl mx-auto">
        <p className="text-center text-xs sm:text-sm font-medium text-[#2C1D11] mb-8">
          Why Godavari Dry Fish is the Most Authentic & Healthy Choice for Your Kitchen
        </p>

        <div className="space-y-5 text-sm sm:text-base leading-relaxed">
          <p>
            Dry fish price in {locationLabel} markets often varies depending on quality and supply chain. Many local markets include middlemen, increasing prices.
          </p>

          <p className="font-medium pt-1">At Godavari Dry Fish, we offer:</p>

          <ul className="space-y-2.5 pl-1">
            <li className="flex items-center gap-2 font-medium">
              <span className="font-bold">✓</span> Competitive dry fish price
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span className="font-bold">✓</span> Low cost dry fish wholesale
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span className="font-bold">✓</span> Direct coastal sourcing
            </li>
            <li className="flex items-center gap-2 font-medium">
              <span className="font-bold">✓</span> Bulk discounts available
            </li>
          </ul>

          <p className="pt-2">
            Compare our price with {locationLabel} dry fish market — you will see the value difference
          </p>
        </div>
      </div>
    </main>
  );
}
