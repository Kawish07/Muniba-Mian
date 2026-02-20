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

  // Dummy listing to showcase the theme
  const dummyListing = {
    _id: 'dummy-1',
    title: 'Luxury Modern Home in Prime Location',
    address: '123 Main Street, Toronto, ON',
    price: 899000,
    type: 'Detached',
    listingType: 'For Sale',
    beds: 4,
    baths: 3,
    livingArea: 2500,
    sqft: 2500,
    images: ['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=80']
  };

  const [allListings, setAllListings] = useState([dummyListing]);
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
          // Add real listings after the dummy listing
          setAllListings([dummyListing, ...data]);
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
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      {/* Background Grid Lines Pattern */}
      <div className="fixed inset-0 pointer-events-none z-0" style={{ maxWidth: '1280px', margin: '0 auto', left: 0, right: 0 }}>
        <div className="absolute inset-y-0 left-[25%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[75%] w-px bg-gray-200/60" />
      </div>

      <div className="relative z-10 overflow-x-hidden">
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
            <p className="text-white/60 text-sm tracking-[0.25em] uppercase mb-6 font-light">Real Estate Team · Greater Toronto Area</p>
            <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] leading-snug font-light text-white mb-8" style={{ lineHeight: '1.35' }}>
              We help buyers and sellers navigate real estate with clarity featuring curated listings and seamless support.
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
          </div>

          {/* Bottom: giant brand name + floating card */}
          <div className="relative">
            <h2 className="hero-brand-name text-[12vw] md:text-[10vw] lg:text-[9vw] font-bold text-white leading-none tracking-tight select-none pb-3" style={{ lineHeight: '1', opacity: 0.95 }}>
              KM & co Realty.
            </h2>

            {/* Floating Agent Card */}
            <div
              className="hidden md:flex absolute bottom-4 right-0 items-center space-x-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-5 py-4 cursor-pointer hover:bg-white/15 transition-all duration-300 group"
              onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
            >
              <img
                src="/images/team member female 2.jpg"
                alt="Muniba Mian"
                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border border-white/30"
              />
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
                

                {/* <h2 className="text-4xl md:text-5xl font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Why Choose Our Agency</h2> */}
              </div>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>
            <h2 className="text-4xl md:text-5xl font-medium" style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}>Why Choose Our Agency</h2>
            <p className="text-gray-500 mt-3" style={{ fontFamily: "'Inter', sans-serif" }}>Trusted, Experienced, Client-Focused</p>
          </div>

          {/* Bento Grid */}
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Left — Large image card */}
            <div className="relative overflow-hidden h-[580px] bg-black">
              <img
                src="images/team member male 1.jpeg"
                alt="Real estate expert"
                className="w-full h-full object-cover opacity-70"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 p-6">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-pink-400"></div>
                  <span className="text-sm text-pink-300 font-medium">best agency</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-white leading-tight" style={{ fontFamily: "'Inter', sans-serif" }}>
                  Trusted guidance for every real estate journey
                </h3>
                <p className="text-white/60 text-xs mt-2 max-w-sm">
                  With award-winning expertise, deep market knowledge, and personalized strategies, we empower clients to make confident decisions, achieve their goals, and build lasting relationships
                </p>
              </div>
            </div>

            {/* Right — Stats grid (coded) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8 h-[580px]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 h-full">
                <div className="rounded-xl border border-gray-100 p-6 flex flex-col justify-between bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-[#111112]" style={{ fontFamily: "'Inter', sans-serif" }}>GTA & Durham Region</div>
                      {/* <div className="text-sm text-gray-500 font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Close faster</div> */}
                    </div>
                    <div className="text-gray-200">
                      <svg className="w-7 h-7 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 12h8" /></svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">We serve buyers, sellers, renters, and investors across the Greater Toronto Area with a strong presence in the Durham Region.</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-6 flex flex-col justify-between bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-[#111112]" style={{ fontFamily: "'Inter', sans-serif" }}>4 Expert Designations</div>
                      {/* <div className="text-sm text-gray-500 font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Win offers</div> */}
                    </div>
                    <div className="text-gray-200">
                      <svg className="w-7 h-7 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /></svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Kayode holds ABR®, SRS, RENE, and SRES® credentials, bringing specialized expertise in buyer representation, negotiation, and senior transitions.</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-6 flex flex-col justify-between bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-[#111112]" style={{ fontFamily: "'Inter', sans-serif" }}>Finance & Development Roots</div>
                      {/* <div className="text-sm text-gray-500 font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Saved yearly</div> */}
                    </div>
                    <div className="text-gray-200">
                      <svg className="w-7 h-7 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1v22" /><path d="M5 7h14" /></svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">With a background in finance and early exposure to construction and development, Kayode brings sharp analytical skills and market insight to every transaction.</p>
                </div>

                <div className="rounded-xl border border-gray-100 p-6 flex flex-col justify-between bg-white shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xl md:text-2xl font-extrabold text-[#111112]" style={{ fontFamily: "'Inter', sans-serif" }}>People-First Approach</div>
                      {/* <div className="text-sm text-gray-500 font-medium mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>Refer friends</div> */}
                    </div>
                    <div className="text-gray-200">
                      <svg className="w-7 h-7 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="7" r="3" /><path d="M5 21v-2a4 4 0 014-4h6a4 4 0 014 4v2" /></svg>
                    </div>
                  </div>
                  <p className="text-xs text-gray-400 mt-4">Muniba's client-first philosophy is rooted in empathy, transparency, and resilience ensuring every client's goals shape the process, never the other way around.</p>
                </div>
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
                  src="https://media.istockphoto.com/id/1409298953/photo/real-estate-agents-shake-hands-after-the-signing-of-the-contract-agreement-is-complete.jpg?s=612x612&w=0&k=20&c=SFybbpGMB0wIoI0tJotFqptzAYK_mICVITNdQIXqnyc="
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
          <div className="grid lg:grid-cols-3 gap-8 items-stretch">
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
                className="bg-white rounded-2xl p-8 md:p-10 flex flex-col justify-between h-full min-h-[420px]"
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
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src="/images/team member female 2.jpg"
                    alt="Muniba Mian"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover"
                  />
                  <img
                    src="/images/team member male 1.jpeg"
                    alt="Kayode Adekoya"
                    className="w-24 h-24 md:w-28 md:h-28 rounded-xl object-cover"
                  />
                </div>
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
                  a: 'Yes, we provide full-service support for sellers from pricing strategy and staging advice to professional photography, marketing, and negotiation. We work to get you the best possible outcome.'
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
