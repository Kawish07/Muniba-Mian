import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Facebook, Instagram } from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { getLenis } from "./lib/lenis";
import { resolveImage, ensureProtocol, API } from "./lib/image";
import PageLoader from "./components/PageLoader";
import TransitionSplash from "./components/TransitionSplash";

export default function App() {
  const [globalLoading, setGlobalLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef(null);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [showHeader, setShowHeader] = useState(true);
  const isInitialMount = useRef(true); // Track if this is the first mount
  const [listingFilter, setListingFilter] = useState('sale'); // 'sale' or 'rent'

  const location = useLocation();

  // Scroll handling for header
  useEffect(() => {
    lastScrollY.current = typeof window !== "undefined" ? window.scrollY : 0;

    const handleScroll = (currentScrollY) => {
      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const delta = currentScrollY - lastScrollY.current;
          if (delta > 10) {
            setShowHeader(false);
          } else if (delta < -10) {
            setShowHeader(true);
          }
          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });
        ticking.current = true;
      }
    };

    const _nativeHandler = () => handleScroll(window.scrollY);
    window.addEventListener("scroll", _nativeHandler, { passive: true });
    return () => {
      try {
        window.removeEventListener("scroll", _nativeHandler);
      } catch (e) {
        /* noop */
      }
    };
  }, []);

  // Handle scroll to anchor from navigation state
  useEffect(() => {
    try {
      const target = location && location.state && location.state.scrollTo;
      if (target && typeof target === "string" && target.startsWith("#")) {
        const doScroll = () => {
          const el = document.querySelector(target);
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY;
            const lenis = getLenis();
            if (lenis && typeof lenis.scrollTo === "function") {
              lenis.scrollTo(top, { immediate: false });
            } else {
              window.scrollTo({ top, behavior: "smooth" });
            }
          }
          window.history.replaceState({}, "", target);
        };
        setTimeout(doScroll, 120);
      }
    } catch (e) {
      // noop
    }
  }, [location]);

  // INITIAL PAGE LOAD - Only runs once when app first mounts
  useEffect(() => {
    const onLoad = () => {
      setTimeout(() => setGlobalLoading(false), 1000);
    };

    if (document.readyState === "complete") {
      onLoad();
    } else {
      window.addEventListener("load", onLoad);
      return () => window.removeEventListener("load", onLoad);
    }
  }, []);

  // ROUTE CHANGES - Only runs on subsequent route changes, NOT initial mount
  useEffect(() => {
    // Skip the effect on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // Show loader for route changes
    setGlobalLoading(true);
    const t = setTimeout(() => setGlobalLoading(false), 1100);
    return () => clearTimeout(t);
  }, [location.pathname]);

  // LINK CLICKS - Show loader immediately when clicking internal links
  useEffect(() => {
    const onDocClick = (e) => {
      try {
        const el = e.target && e.target.closest && e.target.closest("a");
        if (!el) return;
        const href = el.getAttribute("href");
        if (!href) return;
        // resolve relative URLs and ignore clicks that point to the current page
        try {
          const targetUrl = new URL(href, window.location.href);
          const currentUrl = new URL(window.location.href);
          const samePath =
            targetUrl.pathname === currentUrl.pathname &&
            targetUrl.search === currentUrl.search;
          if (samePath) return; // clicking a link to the same page (e.g., logo) — don't show loader
        } catch (e) {
          // ignore URL parse errors and continue
        }
        if (href.startsWith("#")) return;
        if (el.target === "_blank" || el.hasAttribute("download")) return;
        if (href.startsWith("http") && !href.startsWith(window.location.origin))
          return;

        // Internal navigation — show loader immediately
        setGlobalLoading(true);
      } catch (err) {
        // noop
      }
    };

    document.addEventListener("click", onDocClick, true);
    return () => document.removeEventListener("click", onDocClick, true);
  }, []);

  // BROWSER BACK/FORWARD - Show loader on popstate
  useEffect(() => {
    const onPop = () => {
      setGlobalLoading(true);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // Listen for explicit startPageLoad events (from Header)
  useEffect(() => {
    const onStart = () => setGlobalLoading(true);
    window.addEventListener("startPageLoad", onStart);
    return () => window.removeEventListener("startPageLoad", onStart);
  }, []);

  const [allListings, setAllListings] = useState([]);
  const [visibleListings, setVisibleListings] = useState(6);
  const [testimonialStartIndex, setTestimonialStartIndex] = useState(0);

  // Reset visible listings when filter changes
  useEffect(() => {
    setVisibleListings(6);
  }, [listingFilter]);

  // Fetch all listings for homepage grid
  useEffect(() => {
    let mounted = true;
    const fetchListings = async () => {
      try {
        const res = await fetch(API + '/api/listings');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        if (Array.isArray(data)) {
          setAllListings(data);
        }
      } catch (e) { /* noop */ }
    };
    fetchListings();
    return () => { mounted = false; };
  }, [API]);

  const handleVideoPlay = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
        setVideoPlaying(false);
      } else {
        videoRef.current.play();
        setVideoPlaying(true);
      }
    }
  };

  const homepageTestimonials = [
    {
      name: "Missy Scaletta",
      preview:
        "We had the pleasure of working with Muniba to find our perfect home, and she went above and beyond to make sure we found everything we wanted and more. From the start, Muniba was attentive, patient, and incredibly knowledgeable.",
      role: "Client",
    },
    {
      name: "Gaurav Maheshwari",
      preview:
        "First time I worked with Muniba when I was looking for a rental house in 2022 and had a really pleasant experience working with her which eventually prompted me to reach out to her again when I was planning to buy a house.",
      role: "Client",
    },
    {
      name: "Chruz Cruz",
      preview:
        "As a first-time homeowner, I was quite nervous about the process, but working with Muniba made everything so much easier. She was incredibly responsive, always available to answer my questions and address any concerns I had.",
      role: "Client",
    },
    {
      name: "Tiara Leah",
      preview:
        "Having worked in real estate for several years, I have encountered both good and bad realtors. Muniba not only lived up to our expectations, but went far above and beyond.",
      role: "Client",
    },
    {
      name: "Jawad Khairkhwa",
      preview:
        "Muniba is a great agent. She was able to find us a house in only a few days, quicker than agents who had been working with us for months. She is very quick and smart with her work. Highly recommend working with her.",
      role: "Client",
    },
    {
      name: "Tammy McGinn",
      preview:
        "Muniba is a fantastic realtor to work with. She works very hard for her clients, and is an absolute joy to be around. She worked tirelessly to help me find a place in my desired location. Highly recommend.",
      role: "Client",
    },
    {
      name: "Galen Midwinter",
      preview:
        "Words have trouble capturing how much I recommend Muniba as a real estate professional. Her tireless dedication, immediate feedback, instant follow up and caring professionalism not only was appreciated but also landed my family a home.",
      role: "Client",
    },
    {
      name: "Fazena Abdul",
      preview:
        "Very professional, helpful and honest. Respond promptly to emails and telephone.",
      role: "Client",
    },
    {
      name: "Renganathan V Anand",
      preview: "Recommended and a true professional.",
      role: "Client",
    },
  ];

  const visibleHomepageTestimonials =
    homepageTestimonials.length > 1
      ? [0, 1].map(
          (offset) =>
            homepageTestimonials[
              (testimonialStartIndex + offset) % homepageTestimonials.length
            ]
        )
      : homepageTestimonials;

  const handlePreviousTestimonial = () => {
    setTestimonialStartIndex((prev) =>
      prev === 0 ? homepageTestimonials.length - 1 : prev - 1
    );
  };

  const handleNextTestimonial = () => {
    setTestimonialStartIndex(
      (prev) => (prev + 1) % homepageTestimonials.length
    );
  };

  return (
    <div className="min-h-screen bg-white relative">
      {/* Background Grid Lines Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ maxWidth: '1280px', margin: '0 auto', left: 0, right: 0 }}>
        <div className="absolute inset-y-0 left-[25%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[75%] w-px bg-gray-200/60" />
      </div>

      <div className="relative z-10">
      <PageLoader open={globalLoading} />
      <TransitionSplash />
      <Header />

      {/* Hero Section — Luxterra-inspired full-bleed */}
      <section id="hero" className="relative h-screen w-full overflow-hidden section-pattern-dark">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/heromuniba.jpg"
            alt="Luxury modern home exterior"
            className="hero-image w-full h-full object-cover object-center"          />
          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
          <div className="absolute inset-0 section-pattern-dark opacity-40" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-between px-8 md:px-16 lg:px-20 pb-10 pt-32">
          {/* Main Text */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            <p className="text-white/60 text-sm tracking-[0.25em] uppercase mb-6 font-light">Sales Representative · Greater Toronto Area</p>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] leading-snug font-light text-white mb-8" style={{ lineHeight: '1.35' }}>
              We help buyers and sellers navigate real estate with clarity—featuring curated listings and seamless support.
            </h1>
            <div className="flex items-center space-x-4">
              <Link
                to="/all-listings"
                className="inline-flex items-center px-8 py-3.5 bg-white text-black text-sm font-medium rounded-full hover:bg-pink-400 hover:text-white transition-all duration-300 hover:shadow-lg hover:shadow-pink-400/30"
              >
                View listings
              </Link>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                className="inline-flex items-center px-8 py-3.5 border border-white/40 text-white text-sm font-medium rounded-full hover:bg-white/10 transition-all duration-300"
              >
                Contact
              </button>
            </div>

            {/* Social Media Links */}
            <div className="flex space-x-3 mt-6">
              <a href="https://www.facebook.com/dealzinheelz.ca/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-pink-400 hover:border-pink-400 transition-all duration-300 hover:scale-110">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="https://www.instagram.com/dealzinheelz.realestate?igsh=MWRyYmlnbGIzMjk3cA==" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-pink-400 hover:border-pink-400 transition-all duration-300 hover:scale-110">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="https://www.tiktok.com/@dealzinheelz.realestate?_r=1&_t=ZS-93oQ3jmf18x" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-pink-400 hover:border-pink-400 transition-all duration-300 hover:scale-110">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.83 4.83 0 01-1-.11z"/></svg>
              </a>
            </div>
          </div>

          {/* Bottom: giant brand name + floating card */}
          <div className="relative">
            <h2 className="hero-brand-name text-[12vw] md:text-[10vw] lg:text-[9vw] font-bold text-white leading-none tracking-tight select-none" style={{ lineHeight: '0.85', opacity: 0.95 }}>
              KM & co Realty.
            </h2>

            {/* Floating Agent Card */}
            <div
              className="hidden md:flex absolute bottom-4 right-0 items-center space-x-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/15 transition-all duration-300 group"
              onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                M
              </div>
              <div>
                <p className="text-white/50 text-xs font-light">Let's help you</p>
                <p className="text-white text-sm font-medium group-hover:text-pink-300 transition-colors">Talk to an agent</p>
              </div>
              <span className="text-white/40 group-hover:text-pink-400 transition-colors ml-2">→</span>
            </div>
          </div>
        </div>
      </section>

      
      {/* About Us Section — Luxterra Style */}
      <section id="team" className="py-24 px-6 md:px-12 lg:px-20 bg-white section-pattern-light">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
          {/* Left Content */}
          <div>
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-2.5 h-2.5 rounded-full bg-pink-400"></div>
              <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>About us</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-[3.25rem] font-medium mb-6 leading-tight" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
              Our mission leads you to better living
            </h2>
            <p className="text-base text-gray-600 leading-relaxed mb-12 max-w-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
              We support buyers, sellers, and homeowners with tools that streamline decisions, improve results, and bring clarity to every step of your real estate journey.
            </p>

            {/* Feature Cards */}
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 flex items-start space-x-5 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 4.5h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Market Discovery</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">We review local trends, study pricing shifts, and analyze demand. Each insight is shaped to guide every decision.</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-6 flex items-start space-x-5 hover:shadow-md transition-shadow duration-300">
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                  <svg className="w-7 h-7 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Property Analysis</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">We assess home condition, evaluate location strengths, and compare recent sales. Every detail is reviewed to ensure accuracy.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Image */}
          <div className="relative w-full h-[500px] lg:h-[620px] overflow-hidden">
            <img
              src="images/aboutimage.jpg"
              alt="Modern luxury interior"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* Properties — Luxterra-style Listings Grid */}
      <section id="listings" className="py-24 px-6 md:px-12 lg:px-20 bg-white section-pattern-light">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-pink-400"></div>
              <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Properties</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Our recent listings</h2>
            {/* Filter Tabs */}
            <div className="flex items-center justify-center space-x-3 mt-6">
              <button 
                onClick={() => setListingFilter('sale')}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${listingFilter === 'sale' ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}`} 
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                For sale
              </button>
              <button 
                onClick={() => setListingFilter('rent')}
                className={`px-5 py-2 text-sm font-medium rounded-full border transition-all ${listingFilter === 'rent' ? 'border-black bg-black text-white' : 'border-gray-300 text-gray-500 hover:border-black hover:text-black'}`} 
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                For rent
              </button>
            </div>
          </div>

          {/* Listings Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {allListings
              .filter(listing => {
                const type = (listing.listingType || listing.status || '').toLowerCase();
                return listingFilter === 'sale' ? type.includes('sale') : type.includes('rent');
              })
              .slice(0, visibleListings)
              .map((listing) => (
              <Link
                key={listing._id}
                to={'/listing/' + listing._id}
                className="group block"
              >
                {/* Image */}
                <div className="relative rounded-xl overflow-hidden mb-4 aspect-[4/3]">
                  <img
                    src={listing.images && listing.images.length ? ensureProtocol(resolveImage(listing.images[0])) : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&auto=format&fit=crop&q=80'}
                    alt={listing.title || listing.address || 'Property'}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Tags */}
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-xs font-medium text-white rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {listingFilter === 'sale' ? 'For sale' : 'For rent'}
                    </span>
                    <span className="px-3 py-1 bg-black/80 backdrop-blur-sm text-xs font-medium text-white rounded-full" style={{ fontFamily: "'Inter', sans-serif" }}>{listing.type || 'Property'}</span>
                  </div>
                </div>
                {/* Info */}
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-lg font-semibold group-hover:text-pink-400 transition-colors" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>{listing.title || listing.address || 'Untitled'}</h3>
                  <p className="text-lg font-semibold whitespace-nowrap ml-4" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>{'$' + Number(listing.price || 0).toLocaleString()}</p>
                </div>
                <p className="text-sm text-gray-400 mb-3">{listing.address || ''}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" /></svg>
                    <span>{listing.livingArea || listing.sqft || 'N/A'} sq.ft</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                    <span>{listing.beds || 0} Bed</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>{listing.baths || 0} Bath</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* No listings message */}
          {allListings.filter(listing => {
            const type = (listing.listingType || listing.status || '').toLowerCase();
            return listingFilter === 'sale' ? type.includes('sale') : type.includes('rent');
          }).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg" style={{ fontFamily: "'Inter', sans-serif" }}>No listings available yet.</p>
            </div>
          )}

          {/* Load More Button */}
          {allListings.filter(listing => {
            const type = (listing.listingType || listing.status || '').toLowerCase();
            return listingFilter === 'sale' ? type.includes('sale') : type.includes('rent');
          }).length > visibleListings && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleListings((prev) => prev + 6)}
                className="px-10 py-3.5 border border-gray-300 text-black text-sm font-medium rounded-full hover:bg-black hover:text-white hover:border-black transition-all duration-300"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Us — Home Experts Section */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-white section-pattern-light">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-14">
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Why us</span>
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>GTA's home experts</h2>
          </div>

          {/* Bento Grid */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Left — Large image card */}
            <div className="relative overflow-hidden h-[580px] bg-black">
              <img
                src="images/whyus.jpg"
                alt="Real estate expert"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  <span className="text-sm text-pink-300 font-medium">GTA's best agency</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  2k clients choose our trusted agency
                </h3>
                <p className="text-white/60 text-xs mt-2 max-w-sm">
                  Choosing us matters — experience and clear guidance shape every real-estate decision. We help clients move forward with confidence.
                </p>
              </div>
            </div>

            {/* Right — 2x2 Stats Grid */}
            <div className="grid grid-cols-2 gap-5 h-[580px]">
              {/* Stat Card 1 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>84%</p>
                    <p className="text-sm font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Close faster</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" /></svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">Clients working with skilled agents complete their transactions faster.</p>
              </div>
              {/* Stat Card 2 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>3 in 5</p>
                    <p className="text-sm font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Win offers</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" /></svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">More than half of our clients secure their ideal home on the first or second offer.</p>
              </div>
              {/* Stat Card 3 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>$5M+</p>
                    <p className="text-sm font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Saved yearly</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z" /></svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">We help buyers avoid overpaying while securing value in the market.</p>
              </div>
              {/* Stat Card 4 */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col justify-between group hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>95%</p>
                    <p className="text-sm font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Refer friends</p>
                  </div>
                  <svg className="w-6 h-6 text-gray-300 group-hover:text-pink-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                </div>
                <p className="text-xs text-gray-500 mt-2">Most clients recommend our team after experiencing smooth closings.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services — What We Offer Section */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-[#111111] section-pattern-dark">
        <div className="max-w-7xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-16">
            {/* Horizontal line with label */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="flex-1 h-px bg-white/10"></div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <span className="text-sm text-gray-400 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>Our services</span>
              </div>
              <div className="flex-1 h-px bg-white/10"></div>
            </div>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white" style={{ fontFamily: "'Inter', sans-serif" }}>What we offer</h2>
            <p className="text-gray-400 text-base md:text-lg mt-5 max-w-2xl mx-auto" style={{ fontFamily: "'Inter', sans-serif" }}>
              We help simplify GTA property decisions with<br className="hidden md:block" />
              reliable service, speed & transparency
            </p>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Sale Card */}
            <div className="group relative rounded-2xl overflow-hidden bg-black">
              <div className="aspect-[4/5] relative">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80"
                  alt="Sale"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-semibold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Sale</h3>
                  <p className="text-white/60 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>We make finding your perfect property effortless and fast.</p>
                  <Link
                    to="/listings"
                    className="block w-full text-center py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    View listings
                  </Link>
                </div>
              </div>
            </div>

            {/* Rentals Card */}
            <div className="group relative rounded-2xl overflow-hidden bg-black">
              <div className="aspect-[4/5] relative">
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=80"
                  alt="Rentals"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-semibold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Rentals</h3>
                  <p className="text-white/60 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>We make finding your perfect rental effortless in GTA neighborhoods.</p>
                  <Link
                    to="/listings"
                    className="block w-full text-center py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    View listings
                  </Link>
                </div>
              </div>
            </div>

            {/* Valuation Card */}
            <div className="group relative rounded-2xl overflow-hidden bg-black">
              <div className="aspect-[4/5] relative">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80"
                  alt="Valuation"
                  className="w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <h3 className="text-3xl font-semibold text-white mb-2" style={{ fontFamily: "'Inter', sans-serif" }}>Valuation</h3>
                  <p className="text-white/60 text-sm mb-5" style={{ fontFamily: "'Inter', sans-serif" }}>We make understanding your home's value and best deals effortless.</p>
                  <button
                    onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                    className="block w-full text-center py-3 border border-white/30 text-white text-sm font-medium rounded-lg hover:bg-white hover:text-black transition-all duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    Get a valuation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials — What Our Users Say */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-[#f5f5f5] section-pattern-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Left — Heading + Nav Arrows */}
            <div className="flex flex-col justify-between min-h-[420px]">
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-2 h-2 rounded-full bg-pink-400 flex-shrink-0"></div>
                  <span className="text-sm text-gray-500 font-medium flex-shrink-0" style={{ fontFamily: "'Inter', sans-serif" }}>Testimonials</span>
                  <div className="flex-1 h-px bg-gray-300"></div>
                </div>
                <h2 className="text-4xl md:text-5xl font-medium leading-[1.15]" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
                  What our<br />users say
                </h2>
              </div>
              <div className="flex items-center space-x-3 mt-auto pt-12">
                <button
                  onClick={handlePreviousTestimonial}
                  className="w-11 h-11 rounded-full border border-gray-300 bg-transparent flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
                </button>
                <button
                  onClick={handleNextTestimonial}
                  className="w-11 h-11 rounded-full border border-gray-300 bg-transparent flex items-center justify-center text-gray-400 hover:border-black hover:text-black transition-all duration-200"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                </button>
              </div>
            </div>

            {visibleHomepageTestimonials.map((testimonial, index) => (
              <div
                key={`${testimonial.name}-${testimonialStartIndex}-${index}`}
                className="bg-white rounded-2xl p-8 md:p-10 flex flex-col justify-between min-h-[420px]"
              >
                <div>
                  <svg className="w-12 h-12 text-gray-200 mb-8" viewBox="0 0 24 24" fill="currentColor"><path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" /></svg>
                  <p className="text-lg md:text-xl leading-relaxed" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
                    {testimonial.preview}
                  </p>
                </div>
                <div className="mt-auto pt-8">
                  <div className="w-16 h-16 rounded-xl bg-pink-400/15 text-pink-500 flex items-center justify-center mb-3">
                    <span className="text-lg font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>
                      {testimonial.name
                        .split(" ")
                        .slice(0, 2)
                        .map((part) => part[0])
                        .join("")}
                    </span>
                  </div>
                  <p className="text-sm font-semibold" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
                    {testimonial.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 px-6 md:px-12 lg:px-20 bg-white section-pattern-light">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-12 items-start">
            {/* Left — Heading + Agent Card */}
            <div className="lg:col-span-4">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                <span className="text-sm text-gray-500 font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>FAQ</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium leading-[1.15] mb-16" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
                Frequent<br />questions
              </h2>

              {/* Agent Card */}
              <div className="mt-auto">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="Muniba Mian"
                  className="w-28 h-28 rounded-xl object-cover mb-4"
                />
                <p className="text-sm leading-relaxed mb-4" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>
                  Have more questions? Our team is<br />happy to help.
                </p>
                <button
                  onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
                  className="px-6 py-2.5 border border-gray-300 text-sm font-medium rounded-lg hover:bg-black hover:text-white hover:border-black transition-all duration-300"
                  style={{ fontFamily: "'Inter', sans-serif"}}
                >
                  Get in touch
                </button>
              </div>
            </div>

            {/* Right — Accordion */}
            <div className="lg:col-span-8">
              {[
                {
                  q: 'How does your buying process work?',
                  a: 'We begin with a consultation to understand your goals, preferred areas, and budget. Our team then curates tailored listings, arranges viewings, and guides you through offers, inspections, and closing. Every step is supported with clarity and transparency to ensure a smooth and informed experience from start to finish.'
                },
                {
                  q: 'Do you help with mortgage pre-approval?',
                  a: 'Yes, we connect you with trusted mortgage advisors who can help you get pre-approved quickly. This strengthens your buying position and ensures you know exactly what you can afford before you start viewing homes.'
                },
                {
                  q: 'Can you coordinate inspections and appraisals?',
                  a: 'Absolutely. We handle scheduling and coordinating all inspections and appraisals with licensed professionals. Our team ensures every detail is reviewed so you can make confident, informed decisions.'
                },
                {
                  q: 'Do you assist with selling my current home?',
                  a: 'Yes, we provide full-service support for sellers — from pricing strategy and staging advice to professional photography, marketing, and negotiation. We work to get you the best possible outcome.'
                },
                {
                  q: 'Are virtual tours available for out-of-province buyers?',
                  a: 'Yes, we offer virtual tours, video walkthroughs, and detailed photo packages for buyers who cannot visit in person. We make sure you have all the information needed to make a confident decision remotely.'
                }
              ].map((faq, i) => (
                <details key={i} className="group border-b border-gray-200" open={i === 0}>
                  <summary className="flex items-center justify-between py-7 cursor-pointer list-none">
                    <h3 className="text-lg md:text-xl font-medium pr-8" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>{faq.q}</h3>
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-gray-400 group-open:rotate-45 transition-transform duration-300">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
                    </span>
                  </summary>
                  <div className="pb-7 pr-12">
                    <p className="text-sm md:text-base text-gray-600 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>{faq.a}</p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>


      <Footer />

      </div>
    </div>
  );
}
