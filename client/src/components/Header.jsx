import React, { useEffect, useState, useRef } from 'react';
import { Menu, X, Instagram, Facebook } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getLenis } from '../lib/lenis';
import ContactModal from './ContactModal';

export default function Header({ onBack, light = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const [atTop, setAtTop] = useState(true);

    // conditional classes for left/right sides: left is on black background
    // make header link text slightly larger and bolder
    const leftLinkClass = 'text-white font-semibold text-base md:text-lg hover:opacity-80 transition-opacity';
    const leftIconClass = 'w-5 h-5 text-white';

    const navigate = useNavigate();
    const location = useLocation();
    const isAllListings = location && location.pathname === '/all-listings';
    // when header sits on a dark/black background (all listings) or when the split black bg is visible after scrolling, invert the logo to white
    const useWhite = isAllListings;
    const logoOnDarkBg = useWhite || !atTop;
    const rightLinkClass = useWhite ? 'text-white font-semibold text-base md:text-lg hover:opacity-80 transition-opacity' : 'text-black font-semibold text-base md:text-lg hover:opacity-70 transition-opacity';
    // icon: white on small screens only, black on sm+ (medium and large)
    const rightIconClass = useWhite ? 'w-5 h-5 text-white' : 'w-5 h-5 text-white sm:text-black';
    const timeoutRef = useRef(null);
    const [contactOpen, setContactOpen] = useState(false);

    useEffect(() => {
        // Inject small animation CSS used across the site
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes slideInRight {
                from { opacity: 0; transform: translateX(30px); }
                to { opacity: 1; transform: translateX(0); }
            }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes scaleIn { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
            @keyframes pulse { 0%,100%{ transform: scale(1); opacity:1 } 50%{ transform: scale(1.05); opacity:0.8 } }
            @keyframes ripple { 0%{ transform: scale(1); opacity:0.6 } 100%{ transform: scale(1.5); opacity:0 } }
            .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
            .animate-slideInRight { animation: slideInRight 0.6s ease-out forwards; }
            .animate-fadeInUp { animation: fadeInUp 0.6s ease-out forwards; }
            .animate-scaleIn { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards; }
            .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
            .animate-ripple { animation: ripple 1.5s ease-out infinite; }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    useEffect(() => {
        lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;

            const handleScroll = (currentScrollY) => {
                // track whether we're at the top of the page (used to hide split background)
                setAtTop(currentScrollY <= 10);
                if (!ticking.current) {
                    window.requestAnimationFrame(() => {
                        const delta = currentScrollY - lastScrollY.current;
                        if (delta > 10) setShowHeader(false);
                        else if (delta < -10) setShowHeader(true);
                        lastScrollY.current = currentScrollY;
                        ticking.current = false;
                    });
                    ticking.current = true;
                }
            };
            const _nativeHandler = () => handleScroll(window.scrollY);
            window.addEventListener('scroll', _nativeHandler, { passive: true });
            // listen for global open contact modal events
            const onOpenContact = () => setContactOpen(true);
            window.addEventListener('openContactModal', onOpenContact);
            return () => {
                try { window.removeEventListener('scroll', _nativeHandler); } catch (e) { }
                window.removeEventListener('openContactModal', onOpenContact);
            };
    }, []);

    // helper: smooth-scroll to an anchor hash using Lenis when available
    const scrollToHash = (hash) => {
        try {
                const el = document.querySelector(hash);
                if (el) {
                    const top = el.getBoundingClientRect().top + window.scrollY;
                    const lenis = getLenis();
                    if (lenis && typeof lenis.scrollTo === 'function') {
                        lenis.scrollTo(top, { immediate: false });
                    } else {
                        window.scrollTo({ top, behavior: 'smooth' });
                    }
                    // clear any temporary hash in history
                    window.history.replaceState({}, '', hash);
                } else {
                    // element not found yet; still set hash
                    window.history.replaceState({}, '', hash);
                }
        } catch (e) {
            // noop
        }
    };

    const handleNav = (item) => {
        setMenuOpen(false);
        if (!item || !item.href) return;

        if (item.href.startsWith('#')) {
            // special-case contact anchor -> open modal
            if (item.href === '#contact') {
                setMenuOpen(false);
                setContactOpen(true);
                return;
            }

            // anchor on homepage
            if (location.pathname === '/' || location.pathname === '') {
                // already on home — scroll after a tiny delay so menu close anim completes
                timeoutRef.current = setTimeout(() => scrollToHash(item.href), 120);
            } else {
                // navigate to home and pass scroll target in state — App will handle the scroll
                try { window.dispatchEvent(new CustomEvent('startPageLoad')); } catch (e) { }
                try {
                    document.body.classList.add('force-page-loading');
                    setTimeout(() => document.body.classList.remove('force-page-loading'), 2200);
                } catch (e) { }
                navigate('/', { state: { scrollTo: item.href } });
            }
            return;
        }

        // normal route
        // dispatch an event so App can show the page loader immediately
        try { window.dispatchEvent(new CustomEvent('startPageLoad')); } catch (e) { }
        // also add a body class as a fallback to ensure the loader shows (removed shortly after)
        try {
            document.body.classList.add('force-page-loading');
            setTimeout(() => document.body.classList.remove('force-page-loading'), 2200);
        } catch (e) { }
        navigate(item.href);
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 shadow-sm transform transition-transform duration-300 ${showHeader ? 'translate-y-0' : '-translate-y-full'}`}>
                {/* split background: left black, right white — always present but fades in/out smoothly */}
                <div className={`absolute inset-0 pointer-events-none flex transition-opacity duration-500 ease-out ${atTop ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="w-1/2 bg-black" />
                    <div className="w-1/2 bg-white" />
                </div>
                <div className="relative flex items-center justify-between px-8 py-6">
                    <div className="flex items-center">
                        <Link to="/">
                            <img
                                src="/images/Donlogo.png"
                                alt="Concepcion Pena Logo"
                                className="h-28 md:h-32 max-w-[260px] md:max-w-[320px] w-auto object-contain"
                                style={{ filter: logoOnDarkBg ? 'brightness(0) invert(1)' : 'none', transition: 'filter 200ms ease' }}
                            />
                        </Link>
                    </div>
                    <div className="flex items-center">
                        {onBack ? (
                            <button
                                onClick={onBack}
                                className={`tracking-wide ${rightLinkClass} mr-8`}
                            >
                                Back to Home
                            </button>
                        ) : null}

                        {/* Menu icon for small/medium screens (hidden on large) */}
                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className={`flex items-center tracking-wide ${rightLinkClass} lg:hidden ml-2`}
                            aria-label="Open menu"
                        >
                            <Menu className={rightIconClass} />
                        </button>

                        {/* Links visible on large screens only; placed before the large Menu button */}
                        <div className="hidden lg:flex items-center space-x-8 z-50">
                            <button onClick={() => handleNav({ href: '/all-listings' })} className={`tracking-wide ${rightLinkClass}`}>Portfolio</button>
                            <button onClick={() => setContactOpen(true)} className={`tracking-wide ${rightLinkClass}`}>Contact</button>
                        </div>

                        {/* Menu button for large screens (hidden on small/medium).
                            Absolutely position it at 50% so it aligns with the split background edge (where white begins). */}
                        <div className="hidden lg:flex absolute left-1/2 transform -translate-x-1/2 lg:translate-x-4 z-50">
                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className={`inline-flex items-center space-x-2 tracking-wide ${rightLinkClass}`}
                                aria-label="Open menu"
                                style={{ backdropFilter: 'none' }}
                            >
                                <Menu className={rightIconClass} />
                                <span className="font-semibold">Menu</span>
                            </button>
                        </div>
                        
                    </div>
                </div>
            </header>

            {/* Slide Menu */}
            <div className={`fixed top-0 right-0 h-screen w-96 z-50 transform transition-all duration-500 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!menuOpen}>
                {/* Premium Background with Gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-auto">
                    {/* Subtle Accent Line */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-400 via-yellow-500 to-transparent opacity-30" />
                    
                    {/* Soft Glowing Orbs */}
                    <div className="absolute top-1/4 -right-32 w-80 h-80 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute bottom-1/4 -left-32 w-96 h-96 bg-white/3 rounded-full blur-3xl pointer-events-none" />
                </div>

                <div className="relative h-full p-8 flex flex-col">
                    {/* Close Button - Enhanced */}
                    <button
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full border border-yellow-400/30 hover:border-yellow-400/60 hover:bg-yellow-400/10 transition-all duration-300 group"
                    >
                        <X className="w-5 h-5 text-white/70 group-hover:text-yellow-400 transition-colors group-hover:rotate-90 duration-500" />
                    </button>

                    {/* Brand Section */}
                    <div className="mt-8 mb-16">
                        <div className="h-1 w-12 bg-gradient-to-r from-yellow-400 to-transparent rounded-full mb-2" />
                        <p className="text-xs tracking-[0.2em] text-white/40 uppercase font-light">Menu</p>
                    </div>

                    {/* Scrollable Nav Section */}
                    <nav className="flex-1 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                        {[
                            { href: '#contact', label: 'Contact', icon: '02' },
                            { href: '/all-listings', label: 'Portfolio', icon: '03' },
                            { href: '/testimonials', label: 'Testimonials', icon: '04' },
                            { href: '/staging', label: 'Staging Before & After', icon: '05' }
                        ].map((item, idx) => (
                            <button
                                key={item.href + idx}
                                onClick={() => handleNav(item)}
                                className={`group block w-full text-left transform transition-all duration-700 will-change-transform ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                                style={{ transitionDelay: `${idx * 60 + 120}ms` }}
                            >
                                <div className="relative overflow-hidden rounded-lg">
                                    {/* Hover Background - Yellow Accent */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    
                                    {/* Animated Bottom Border */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-center" />

                                    <div className="relative px-6 py-4 flex items-center justify-between">
                                        {/* Number Badge */}
                                        <div className="flex items-center space-x-4">
                                            <span className="text-xs font-mono text-white/25 group-hover:text-yellow-400/70 transition-all duration-500">
                                                {item.icon}
                                            </span>
                                            <span className="text-base font-light tracking-wide text-white/80 group-hover:text-white transition-all duration-500 group-hover:translate-x-1">
                                                {item.label}
                                            </span>
                                        </div>

                                        {/* Arrow Icon */}
                                        <span className="text-white/20 group-hover:text-yellow-400 transform transition-all duration-500 group-hover:translate-x-1">→</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </nav>

                    {/* Admin Login Button - Fixed at Bottom */}
                    <div className="flex-shrink-0 space-y-3 pt-6 border-t border-white/10">
                        <button
                            onClick={() => { setMenuOpen(false); navigate('/admin/login'); }}
                            className="w-full px-6 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black font-semibold rounded-lg hover:shadow-lg hover:shadow-yellow-400/30 transition-all duration-500 transform hover:scale-105 hover:-translate-y-1"
                        >
                            Admin Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Overlay */}
            <div className={`fixed inset-0 z-40 transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
                <div className="w-full h-full bg-black/60 backdrop-blur-sm" />
            </div>
            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}