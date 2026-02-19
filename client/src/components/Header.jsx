import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getLenis, subscribeToScroll } from '../lib/lenis';
import ContactModal from './ContactModal';

export default function Header({ onBack, light = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);
    const [atTop, setAtTop] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    // Pages with white backgrounds need a solid dark header
    const needsSolidHeader = ['/our-team', '/all-listings', '/testimonials', '/staging'].includes(location.pathname);

    // Header style matching centered white bar design
    const isHome = location.pathname === '/' || location.pathname === '';
    const linkClass = 'text-[#111112] text-[15px] tracking-[0.02em] font-normal hover:-translate-y-1 hover:opacity-80 transition-all duration-300 ease-out';
    const iconClass = 'w-4 h-4 text-[#111112]';
    const timeoutRef = useRef(null);
    const [contactOpen, setContactOpen] = useState(false);

    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes slideInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
            @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `;
        document.head.appendChild(style);
        return () => document.head.removeChild(style);
    }, []);

    const showHeaderRef = useRef(true);
    const hideTimer = useRef(null);
    const touchStartY = useRef(0);

    useEffect(() => {
        // Use Lenis scroll events for accurate detection
        const lenis = getLenis();

        const handleScroll = (e) => {
            if (menuOpen) return;

            const scroll = e?.scroll ?? e ?? 0;
            const direction = e?.direction ?? (scroll > lastScrollY.current ? 1 : -1);

            // At top - always show header
            if (scroll < 50) {
                setAtTop(true);
                if (!showHeaderRef.current) {
                    showHeaderRef.current = true;
                    setShowHeader(true);
                }
                lastScrollY.current = scroll;
                return;
            }

            setAtTop(false);

            // direction: 1 = scrolling down, -1 = scrolling up
            if (direction === 1 && showHeaderRef.current && scroll > 100) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (direction === -1 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }

            lastScrollY.current = scroll;
        };

        // Fallback: Detect scroll direction from wheel events (for non-Lenis or if Lenis fails)
        const onWheel = (e) => {
            if (menuOpen) return;

            // deltaY > 0 = scrolling down, deltaY < 0 = scrolling up
            if (e.deltaY > 10 && showHeaderRef.current) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (e.deltaY < -5 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }
        };

        // Touch support for mobile
        const onTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
        };
        const onTouchMove = (e) => {
            if (menuOpen) return;
            const touchY = e.touches[0].clientY;
            const diff = touchY - touchStartY.current;

            if (diff < -15 && showHeaderRef.current) {
                // Swiping up (scroll down)
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (diff > 15 && !showHeaderRef.current) {
                // Swiping down (scroll up)
                showHeaderRef.current = true;
                setShowHeader(true);
            }

            touchStartY.current = touchY;
        };

        // Subscribe to Lenis scroll events
        if (lenis && typeof lenis.on === 'function') {
            lenis.on('scroll', handleScroll);
        }

        // Always add wheel listener as backup
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        const onOpenContact = () => setContactOpen(true);
        window.addEventListener('openContactModal', onOpenContact);

        return () => {
            if (lenis && typeof lenis.off === 'function') {
                lenis.off('scroll', handleScroll);
            }
            window.removeEventListener('wheel', onWheel);
            window.removeEventListener('touchstart', onTouchStart);
            window.removeEventListener('touchmove', onTouchMove);
            window.removeEventListener('openContactModal', onOpenContact);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (menuOpen) {
            showHeaderRef.current = true;
            setShowHeader(true);
        }
    }, [menuOpen]);

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
                window.history.replaceState({}, '', hash);
            } else {
                window.history.replaceState({}, '', hash);
            }
        } catch (e) { }
    };

    const handleNav = (item) => {
        setMenuOpen(false);
        if (!item || !item.href) return;

        if (item.href.startsWith('#')) {
            if (item.href === '#contact') {
                setMenuOpen(false);
                setContactOpen(true);
                return;
            }
            if (location.pathname === '/' || location.pathname === '') {
                timeoutRef.current = setTimeout(() => scrollToHash(item.href), 120);
            } else {
                try { window.dispatchEvent(new CustomEvent('startPageLoad')); } catch (e) { }
                try {
                    document.body.classList.add('force-page-loading');
                    setTimeout(() => document.body.classList.remove('force-page-loading'), 2200);
                } catch (e) { }
                navigate('/', { state: { scrollTo: item.href } });
            }
            return;
        }

        try { window.dispatchEvent(new CustomEvent('startPageLoad')); } catch (e) { }
        try {
            document.body.classList.add('force-page-loading');
            setTimeout(() => document.body.classList.remove('force-page-loading'), 2200);
        } catch (e) { }
        navigate(item.href);
    };

    // Bottom nav is visible when:
    // - NOT at the very top of the page (atTop is false)
    // - AND menu is closed
    // This means it stays visible even when scrolling up mid-page (top header reappears)
    // It only hides when user reaches the actual top of the page
    const showBottomNav = !atTop && !menuOpen;

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 z-50 px-5 md:px-8 pt-5`}
                style={{
                    transform: showHeader ? 'translateY(0)' : 'translateY(-110%)',
                    opacity: showHeader ? 1 : 0,
                    transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s ease',
                    willChange: 'transform, opacity',
                }}
            >
                <div className="relative max-w-[1240px] mx-auto">
                    {/* Floating White Bar */}
                    <div
                        className="absolute inset-0 rounded-md pointer-events-none transition-all duration-500 opacity-100"
                        style={{
                            background: 'rgba(255,255,255,0.97)',
                            backdropFilter: 'blur(10px)',
                            WebkitBackdropFilter: 'blur(10px)',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}
                    />

                    <div className="relative flex items-center justify-between px-6 md:px-10 h-[56px]">
                        {/* Logo */}
                        <div className="flex items-center z-10">
                            <Link to="/">
                                <img
                                    src="/images/logo1.png"
                                    alt="Muniba Mian Logo"
                                    className="h-14 md:h-14 w-auto object-contain origin-left scale-[1.75]"
                                    style={{
                                        maxWidth: '560px',
                                        filter: 'brightness(0) saturate(100%) invert(12%) sepia(27%) saturate(860%) hue-rotate(357deg) brightness(76%) contrast(106%) drop-shadow(0 0.5px 0 rgba(0,0,0,0.35))'
                                    }}
                                />
                            </Link>
                        </div>

                        {/* Center Nav — Desktop */}
                        <nav className="hidden lg:flex items-center space-x-14 absolute left-1/2 transform -translate-x-1/2">
                            <button onClick={() => handleNav({ href: '/all-listings' })} className={linkClass}>Listings</button>
                            <button onClick={() => handleNav({ href: '/our-team' })} className={linkClass}>Our Team</button>
                            <button onClick={() => handleNav({ href: '/staging' })} className={linkClass}>Staging</button>
                            <button onClick={() => setContactOpen(true)} className={linkClass}>Contact</button>
                        </nav>

                        {/* Right side — Menu button */}
                        <div className="flex items-center z-10">
                            {onBack ? (
                                <button onClick={onBack} className={`tracking-wide ${linkClass} mr-6`}>
                                    Back
                                </button>
                            ) : null}

                            <button
                                onClick={() => setMenuOpen(!menuOpen)}
                                className="inline-flex items-center gap-3 group px-3 py-1.5 rounded-full border border-black/10 hover:border-black/25 hover:bg-black/[0.03] transition-all duration-300"
                                aria-label="Open menu"
                            >
                                <span className="relative w-6 h-4 inline-flex flex-col justify-between">
                                    <span className="block h-[1.5px] w-6 bg-[#111112] rounded-full transition-all duration-300 group-hover:w-4" />
                                    <span className="block h-[1.5px] w-4 bg-[#111112] rounded-full self-end transition-all duration-300 group-hover:w-6" />
                                </span>
                                <span className={`hidden md:inline ${linkClass}`}>Menu</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Slide Menu */}
            <div className={`fixed top-0 right-0 h-screen w-96 z-50 transform transition-all duration-500 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`} aria-hidden={!menuOpen}>
                <div className="absolute inset-0 bg-black/95 backdrop-blur-xl pointer-events-auto">
                    <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-white/10 via-white/5 to-transparent" />
                </div>

                <div className="relative h-full p-8 flex flex-col">
                    <button
                        onClick={() => setMenuOpen(false)}
                        aria-label="Close menu"
                        className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center rounded-full border border-white/20 hover:border-white/60 hover:bg-white/5 transition-all duration-300 group"
                    >
                        <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors group-hover:rotate-90 duration-500" />
                    </button>

                    <div className="mt-8 mb-12">
                        <p className="text-[10px] tracking-[0.3em] text-white/40 uppercase font-light">Navigation</p>
                    </div>

                    <nav className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-hide">
                        {[
                            { href: '/all-listings', label: 'Listings', icon: '01' },
                            { href: '/our-team', label: 'Our Team', icon: '02' },
                            { href: '/testimonials', label: 'Testimonials', icon: '05' },
                            { href: '/staging', label: 'Staging Before & After', icon: '06' }
                        ].map((item, idx) => (
                            <button
                                key={item.href + idx}
                                onClick={() => handleNav(item)}
                                className={`group block w-full text-left transform transition-all duration-700 will-change-transform ${menuOpen ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}
                                style={{ transitionDelay: `${idx * 60 + 120}ms` }}
                            >
                                <div className="relative overflow-hidden rounded-lg">
                                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/5 transition-colors duration-500" />
                                    <div className="relative px-2 py-4 flex items-center justify-between border-b border-white/5">
                                        <div className="flex items-center space-x-4">
                                            <span className="text-[10px] font-mono text-white/25 group-hover:text-white/50 transition-colors duration-500">{item.icon}</span>
                                            <span className="text-sm font-light tracking-wide text-white/80 group-hover:text-white transition-colors duration-500">{item.label}</span>
                                        </div>
                                        <span className="text-white/20 group-hover:text-white transform transition-all duration-500 group-hover:translate-x-1">→</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </nav>

                    <div className="flex-shrink-0 space-y-3 pt-6 border-t border-white/10">
                        <button
                            onClick={() => { setMenuOpen(false); navigate('/admin/login'); }}
                            className="w-full px-6 py-3 bg-white text-black text-xs tracking-[0.2em] uppercase font-medium rounded hover:bg-white/90 transition-all duration-300"
                        >
                            Admin Login
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay */}
            <div className={`fixed inset-0 z-40 transition-all duration-500 ${menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`} onClick={() => setMenuOpen(false)}>
                <div className="w-full h-full bg-black/70 backdrop-blur-sm" />
            </div>

            {/* Bottom Navigation Bar — appears ONLY when top header is hidden (scrolled down) */}
            {createPortal(
                <nav
                    className="fixed bottom-0 left-0 right-0 z-[9999] px-4 pb-4"
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        transform: showBottomNav ? 'translateY(0)' : 'translateY(120%)',
                        opacity: showBottomNav ? 1 : 0,
                        transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                        willChange: 'transform, opacity',
                        pointerEvents: showBottomNav ? 'auto' : 'none',
                    }}
                >
                    <div
                        className="max-w-md mx-auto px-2 py-2 flex items-center justify-around"
                        style={{
                            background: 'rgba(17, 17, 18, 0.95)',
                            backdropFilter: 'blur(12px)',
                            WebkitBackdropFilter: 'blur(12px)',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.1)'
                        }}
                    >
                        {/* Home — pink accent (active/default) */}
                        <Link
                            to="/"
                            className="flex flex-col items-center gap-1 px-5 py-2 rounded bg-pink-500 hover:bg-pink-400 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span className="text-[10px] text-white font-medium">Home</span>
                        </Link>

                        {/* Listings */}
                        <Link
                            to="/all-listings"
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded hover:bg-white/10 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Listings</span>
                        </Link>

                        {/* Contact */}
                        <button
                            onClick={() => setContactOpen(true)}
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded hover:bg-white/10 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Contact</span>
                        </button>

                        {/* Team */}
                        <Link
                            to="/our-team"
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded hover:bg-white/10 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Team</span>
                        </Link>

                        {/* Staging (replaces Menu) */}
                        <Link
                            to="/staging"
                            className="flex flex-col items-center gap-1 px-4 py-2 rounded hover:bg-white/10 transition-all duration-300"
                        >
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Staging</span>
                        </Link>
                    </div>
                </nav>,
                document.body
            )}

            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}