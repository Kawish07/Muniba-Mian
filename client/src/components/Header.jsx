import React, { useEffect, useState, useRef } from 'react';
import { X } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getLenis } from '../lib/lenis';
import ContactModal from './ContactModal';

export default function Header({ onBack, light = false }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const [showHeader, setShowHeader] = useState(true);
    const lastScrollY = useRef(0);
    const ticking = useRef(false);
    const [atTop, setAtTop] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    // Pages with white backgrounds need a solid dark header
    const needsSolidHeader = ['/our-team', '/all-listings', '/testimonials', '/staging'].includes(location.pathname);

    // Header style matching centered white bar design
    const isHome = location.pathname === '/' || location.pathname === '';
    const linkClass = 'text-[#111112] text-[15px] tracking-[0.02em] font-normal hover:opacity-70 transition-opacity duration-300';
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

    useEffect(() => {
        lastScrollY.current = typeof window !== 'undefined' ? window.scrollY : 0;

        const handleScroll = (currentScrollY) => {
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
        const onOpenContact = () => setContactOpen(true);
        window.addEventListener('openContactModal', onOpenContact);
        return () => {
            try { window.removeEventListener('scroll', _nativeHandler); } catch (e) { }
            window.removeEventListener('openContactModal', onOpenContact);
        };
    }, []);

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

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-50 transform transition-all duration-500 ${showHeader ? 'translate-y-0' : '-translate-y-full'} px-5 md:px-8 pt-5`}>
                <div className="relative max-w-[1240px] mx-auto">
                    {/* Floating White Bar for inner pages / Transparent for home */}
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
                                className="h-14 md:h-14 w-auto object-contain origin-left scale-[1.15]"
                                style={{
                                    maxWidth: '380px',
                                    filter: 'brightness(0) saturate(100%) invert(12%) sepia(27%) saturate(860%) hue-rotate(357deg) brightness(76%) contrast(106%) drop-shadow(0 0.5px 0 rgba(0,0,0,0.35))'
                                }}
                            />
                        </Link>
                    </div>

                    {/* Center Nav — Desktop (Exactly matching layout) */}
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
            <ContactModal open={contactOpen} onClose={() => setContactOpen(false)} />
        </>
    );
}