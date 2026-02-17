import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import { resolveImage, ensureProtocol, placeholderDataUrl, API } from './lib/image';

const formatPrice = (price) => {
  if (!price) return '0';
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export default function AllListings({ onBack }) {
  const [filterStatus, setFilterStatus] = useState('all');
  const [listings, setListings] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    mountedRef.current = true;
    fetch(`${API}/api/listings`)
      .then((r) => {
        if (!r.ok) throw new Error(`API returned ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (!mountedRef.current) return;
        setListings(data);
      })
      .catch((err) => {
        console.error('Failed to load listings:', err);
        setListings([]);
      });
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => { mountedRef.current = false; clearTimeout(timer); };
  }, []);

  const filteredListings = filterStatus === 'all'
    ? listings
    : filterStatus === 'for-sale'
      ? listings.filter(l => l.status === 'active' || l.status === 'under-contract')
      : listings.filter(l => l.status === 'sold');

  const getPropertyType = (listing) => {
    if (listing.propertyType) return listing.propertyType;
    if (listing.type) return listing.type;
    return 'Residential';
  };

  const getStatusLabel = (listing) => {
    if (listing.status === 'sold') return 'Sold';
    if (listing.status === 'under-contract') return 'Under contract';
    return 'For sale';
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Grid Lines — Luxterra Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ maxWidth: '1280px', margin: '0 auto', left: 0, right: 0 }}>
        <div className="absolute inset-y-0 left-[25%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[75%] w-px bg-gray-200/60" />
      </div>

      <div className="relative z-10">
      <Header onBack={onBack} light={true} />

      {/* Hero Section — Luxterra Style Centered */}
      <section className="pt-40 pb-8 md:pt-48 md:pb-12 px-6 md:px-12 lg:px-20">
        <div
          className={`max-w-3xl mx-auto text-center transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Pink dot label */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#ff66c4]" />
            <span
              className="text-xs tracking-[0.2em] uppercase text-gray-500 font-light"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Our properties
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold leading-[1.05] tracking-tight mb-6"
            style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}
          >
            Our featured
            <br />
            listings
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg text-gray-500 max-w-xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            Discover curated properties for sale and rent, selected to help you compare options.
          </p>
        </div>
      </section>

      {/* Horizontal Line */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="w-full h-px bg-gray-200" />
      </div>

      {/* Filter Tabs — Luxterra Style */}
      <section className="py-10 md:py-14 px-6 md:px-12 lg:px-20">
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-6 py-2.5 text-sm tracking-wide transition-all duration-300 rounded-full border ${
              filterStatus === 'all'
                ? 'bg-[#111112] text-white border-[#111112]'
                : 'bg-white text-[#111112] border-gray-300 hover:border-[#111112]'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            All
          </button>
          <button
            onClick={() => setFilterStatus('for-sale')}
            className={`px-6 py-2.5 text-sm tracking-wide transition-all duration-300 rounded-full border ${
              filterStatus === 'for-sale'
                ? 'bg-[#111112] text-white border-[#111112]'
                : 'bg-white text-[#111112] border-gray-300 hover:border-[#111112]'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            For sale
          </button>
          <button
            onClick={() => setFilterStatus('for-rent')}
            className={`px-6 py-2.5 text-sm tracking-wide transition-all duration-300 rounded-full border ${
              filterStatus === 'for-rent'
                ? 'bg-[#111112] text-white border-[#111112]'
                : 'bg-white text-[#111112] border-gray-300 hover:border-[#111112]'
            }`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            For rent
          </button>
        </div>
      </section>

      {/* Listings Grid — Luxterra Style */}
      <main className="max-w-7xl mx-auto pb-20 px-6 md:px-12 lg:px-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
          {filteredListings.map((listing, idx) => {
            const idValue = listing._id || listing.id || idx;
            return (
              <article
                key={idValue}
                className={`group transition-all duration-700 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${150 + idx * 80}ms` }}
              >
                <Link to={idValue ? `/listing/${idValue}` : '#'} className="block">
                  {/* Image */}
                  <div className="relative overflow-hidden rounded-sm aspect-[4/3] mb-5 bg-gray-100">
                    <img
                      src={ensureProtocol(resolveImage(listing.image || (listing.images && listing.images[0]) || placeholderDataUrl()))}
                      alt={listing.title}
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = placeholderDataUrl(); }}
                    />

                    {/* Tags — top left */}
                    <div className="absolute top-4 left-4 flex items-center gap-2">
                      <span
                        className="px-3 py-1.5 bg-black/80 text-white text-[11px] tracking-wide rounded-sm"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {getStatusLabel(listing)}
                      </span>
                      <span
                        className="px-3 py-1.5 bg-black/80 text-white text-[11px] tracking-wide rounded-sm"
                        style={{ fontFamily: "'Inter', sans-serif" }}
                      >
                        {getPropertyType(listing)}
                      </span>
                    </div>
                  </div>

                  {/* Title + Price Row */}
                  <div className="flex items-start justify-between mb-1.5">
                    <h3
                      className="text-base font-semibold tracking-tight text-[#111112] leading-snug pr-4"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {listing.title}
                    </h3>
                    <span
                      className="text-base font-semibold text-[#111112] whitespace-nowrap flex-shrink-0"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      ${formatPrice(listing.price)}
                    </span>
                  </div>

                  {/* Location */}
                  <p
                    className="text-sm text-gray-500 mb-3"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {listing.address}
                  </p>

                  {/* Stats Row with Icons */}
                  <div className="flex items-center gap-5 text-sm text-gray-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {listing.sqft && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
                        </svg>
                        <span>{listing.sqft} sq.ft</span>
                      </div>
                    )}
                    {listing.beds && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                        </svg>
                        <span>{listing.beds} Bed</span>
                      </div>
                    )}
                    {listing.baths && (
                      <div className="flex items-center gap-1.5">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{listing.baths} Bath</span>
                      </div>
                    )}
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        {filteredListings.length === 0 && (
          <div className="text-center py-20">
            <p
              className="text-gray-400 text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              No properties found in this category.
            </p>
          </div>
        )}
      </main>

      {/* Horizontal Line before CTA */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="w-full h-px bg-gray-200" />
      </div>

      {/* CTA Section — Clean Luxterra Style */}
      <section className="py-20 md:py-28 px-6 md:px-12 lg:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className={`transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="w-2 h-2 rounded-full bg-[#ff66c4]" />
              <span
                className="text-xs tracking-[0.2em] uppercase text-gray-500 font-light"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Get started
              </span>
            </div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}
            >
              Ready to find your
              <br />
              dream home?
            </h2>
            <p
              className="text-base md:text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Get in touch with our team and let us help you navigate the real estate market with confidence.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
              className="px-10 py-4 bg-[#111112] text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-black transition-colors duration-300 rounded-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Contact us
            </button>
          </div>
        </div>
      </section>

      <Footer />
      </div>
    </div>
  );
}