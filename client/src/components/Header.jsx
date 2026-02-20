import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
// removed unused icon import
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getLenis, subscribeToScroll } from '../lib/lenis';
import ContactModal from './ContactModal';

export default function Header({ onBack, light = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);

    // ✅ FIX 1: Initialize atTop from actual scroll position (not always true)
    const [atTop, setAtTop] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.scrollY < 50;
        }
        return true;
    });

    const navigate = useNavigate();
    const location = useLocation();

    const needsSolidHeader = ['/our-team', '/all-listings', '/testimonials', '/staging'].includes(location.pathname);
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

    // ✅ FIX 2: On mount, sync scroll position immediately
    useEffect(() => {
        const currentScroll = window.scrollY;
        lastScrollY.current = currentScroll;
        if (currentScroll >= 50) {
            setAtTop(false);
        } else {
            setAtTop(true);
        }
    }, []);

    useEffect(() => {
        const lenis = getLenis();

        const handleScroll = (e) => {
            if (menuOpen) return;
            const scroll = e?.scroll ?? e ?? 0;
            const direction = e?.direction ?? (scroll > lastScrollY.current ? 1 : -1);

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

            if (direction === 1 && showHeaderRef.current && scroll > 100) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (direction === -1 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }

            lastScrollY.current = scroll;
        };

        // ✅ FIX 3: Native scroll listener — most reliable for initial load & refresh
        const handleNativeScroll = () => {
            if (menuOpen) return;
            const scroll = window.scrollY;
            const direction = scroll > lastScrollY.current ? 1 : -1;

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

            if (direction === 1 && showHeaderRef.current && scroll > 100) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (direction === -1 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }

            lastScrollY.current = scroll;
        };

        const onWheel = (e) => {
            if (menuOpen) return;
            if (e.deltaY > 10 && showHeaderRef.current) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (e.deltaY < -5 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }
        };

        const onTouchStart = (e) => {
            touchStartY.current = e.touches[0].clientY;
        };
        const onTouchMove = (e) => {
            if (menuOpen) return;
            const touchY = e.touches[0].clientY;
            const diff = touchY - touchStartY.current;

            if (diff < -15 && showHeaderRef.current) {
                showHeaderRef.current = false;
                setShowHeader(false);
            } else if (diff > 15 && !showHeaderRef.current) {
                showHeaderRef.current = true;
                setShowHeader(true);
            }

            touchStartY.current = touchY;
        };

        if (lenis && typeof lenis.on === 'function') {
            lenis.on('scroll', handleScroll);
        }

        window.addEventListener('scroll', handleNativeScroll, { passive: true });
        window.addEventListener('wheel', onWheel, { passive: true });
        window.addEventListener('touchstart', onTouchStart, { passive: true });
        window.addEventListener('touchmove', onTouchMove, { passive: true });

        const onOpenContact = () => setContactOpen(true);
        window.addEventListener('openContactModal', onOpenContact);

        return () => {
            if (lenis && typeof lenis.off === 'function') {
                lenis.off('scroll', handleScroll);
            }
            window.removeEventListener('scroll', handleNativeScroll);
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
                        <div className="flex items-center z-10">
                            <Link to="/">
                                <img
                                    src="/images/logo1.png"
                                    alt="KM & co realty Logo"
                                    className="h-14 md:h-14 w-auto object-contain origin-left scale-[1.75]"
                                    style={{
                                        maxWidth: '560px',
                                        filter: 'brightness(0) saturate(100%) invert(12%) sepia(27%) saturate(860%) hue-rotate(357deg) brightness(76%) contrast(106%) drop-shadow(0 0.5px 0 rgba(0,0,0,0.35))'
                                    }}
                                />
                            </Link>
                        </div>

                        <nav className="hidden lg:flex items-center space-x-14 absolute left-1/2 transform -translate-x-1/2">
                            <button onClick={() => handleNav({ href: '/all-listings' })} className={linkClass}>Listings</button>
                            <button onClick={() => handleNav({ href: '/our-team' })} className={linkClass}>Our Team</button>
                            <button onClick={() => handleNav({ href: '/staging' })} className={linkClass}>Staging</button>
                            <button onClick={() => setContactOpen(true)} className={linkClass}>Contact</button>
                        </nav>

                        <div className="flex items-center z-10">
                            {onBack ? (
                                <button onClick={onBack} className={`tracking-wide ${linkClass} mr-6`}>Back</button>
                            ) : null}

                            <button
                                onClick={() => navigate('/admin/login')}
                                className="inline-flex items-center gap-3 group px-3 py-1.5 rounded-full border border-black/10 hover:border-black/25 hover:bg-black/[0.03] transition-all duration-300"
                                aria-label="Admin login"
                            >
                                <span className={`hidden md:inline ${linkClass}`}>Admin Login</span>
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Slide menu removed - replaced by Admin Login in header */}

            {/* Bottom Navigation Bar */}
            {createPortal(
                <nav
                    style={{
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        padding: '0 1rem 1rem',
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
                        <Link to="/" className={`flex flex-col items-center gap-1 px-5 py-2 rounded transition-all duration-300 ${location.pathname === '/' ? 'bg-pink-500 hover:bg-pink-400' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                            </svg>
                            <span className="text-[10px] text-white font-medium">Home</span>
                        </Link>

                        <Link to="/all-listings" className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition-all duration-300 ${location.pathname === '/all-listings' ? 'bg-pink-500' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Listings</span>
                        </Link>

                        <button onClick={() => setContactOpen(true)} className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition-all duration-300 ${location.pathname === '/contact' ? 'bg-pink-500' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Contact</span>
                        </button>

                        <Link to="/our-team" className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition-all duration-300 ${location.pathname === '/our-team' ? 'bg-pink-500' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Team</span>
                        </Link>

                        <Link to="/staging" className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition-all duration-300 ${location.pathname === '/staging' ? 'bg-pink-500' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 7.125C2.25 6.504 2.754 6 3.375 6h6c.621 0 1.125.504 1.125 1.125v3.75c0 .621-.504 1.125-1.125 1.125h-6a1.125 1.125 0 01-1.125-1.125v-3.75zM14.25 8.625c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v8.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-8.25zM3.75 16.125c0-.621.504-1.125 1.125-1.125h5.25c.621 0 1.125.504 1.125 1.125v2.25c0 .621-.504 1.125-1.125 1.125h-5.25a1.125 1.125 0 01-1.125-1.125v-2.25z" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Staging</span>
                        </Link>
                        
                        <Link to="/testimonials" className={`flex flex-col items-center gap-1 px-4 py-2 rounded transition-all duration-300 ${location.pathname === '/testimonials' ? 'bg-pink-500' : 'hover:bg-white/10'}`}>
                            <svg className="w-5 h-5 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9M7.5 12h4.5M7.5 15.75h6" />
                            </svg>
                            <span className="text-[10px] text-white/60 font-medium">Testimonials</span>
                        </Link>
                    </div>
                </nav>,
                document.body
            )}

            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}