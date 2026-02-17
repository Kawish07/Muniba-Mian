import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Facebook, Instagram } from 'lucide-react';
import { API } from '../lib/image';

export default function ContactModal({ open = false, onClose = () => { } }) {
    const [closing, setClosing] = useState(false);
    const timeoutRef = useRef(null);
    const submitTimeoutRef = useRef(null);

    const [form, setForm] = useState({ name: '', email: '', phone: '', bestTime: '', message: '' });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);

        useEffect(() => {
            if (open) setClosing(false);
        }, [open]);

    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') handleClose();
        };
        if (open) document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    const handleClose = () => {
        setClosing(true);
        timeoutRef.current = setTimeout(() => {
            setClosing(false);
            onClose();
        }, 400);
    };

    useEffect(() => {
        return () => {
            if (submitTimeoutRef.current) clearTimeout(submitTimeoutRef.current);
        };
    }, []);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        if (!form.name || !form.email || !form.bestTime) {
            setError('Please provide your name, email and a preferred date/time.');
            return;
        }
        setLoading(true);
        try {
            // construct payload for backend
            const payload = {
                name: form.name,
                email: form.email,
                phone: form.phone,
                bestTime: form.bestTime,
                message: form.message || (form.bestTime ? `Preferred time: ${form.bestTime}` : '')
            };

            // submit to backend (sends email via SendGrid and persists data)
            const response = await fetch(`${API}/api/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorText = await response.text().catch(() => 'Failed to send message');
                throw new Error(errorText || 'Failed to send message. Please try again.');
            }

            setSuccess(true);
            setForm({ name: '', email: '', phone: '', bestTime: '', message: '' });
            // auto-close after a short delay
            submitTimeoutRef.current = setTimeout(() => {
                handleClose();
            }, 1800);
        } catch (err) {
            console.error('Contact submit failed', err);
            setError('Failed to send message. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!open && !closing) return null;

    const modal = (
        <div className={`fixed inset-0 z-[9999] flex items-start md:items-center justify-center`}>
            {/* hide native scrollbar for the modal panel while keeping scroll functionality
                    and make the datetime-local picker icon appear white */}
            <style>{`
                .no-scrollbar::-webkit-scrollbar{display:none;} 
                .no-scrollbar{ -ms-overflow-style:none; scrollbar-width:none; }
                /* Chrome / WebKit: make the calendar/time picker icon white */
                input[type="datetime-local"]::-webkit-calendar-picker-indicator {
                    filter: invert(1) grayscale(1) contrast(1.2) !important;
                    opacity: 1;
                }
                /* Ensure the input text is white */
                input[type="datetime-local"] { color: #ffffff; }
            `}</style>
            {/* Backdrop */}
            <div className={`absolute inset-0 bg-black/70 transition-opacity ${closing ? 'opacity-0' : 'opacity-100'}`} onClick={handleClose} />

            {/* Panel */}
            <div className={`relative w-[95vw] max-w-[1600px] mx-4 md:mx-8 my-4 md:my-0 max-h-[90vh] overflow-y-auto no-scrollbar bg-transparent transform transition-all duration-400 ${closing ? 'opacity-0 translate-y-6' : 'opacity-100 translate-y-0'}`}>
                <div className="relative bg-black/60 backdrop-blur-xl rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                    {/* Background image for entire modal */}
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=1920&auto=format&fit=crop&q=80')" }} />
                    <div className="absolute inset-0 bg-black/70" />

                    {/* close button */}
                    <button onClick={handleClose} aria-label="Close contact" className="absolute top-4 right-4 z-20 text-white hover:opacity-80 transition">
                        <X className="w-8 h-8" />
                    </button>

                    <div className="grid grid-cols-1 md:grid-cols-2 min-h-[95vh]">
                        {/* Left details */}
                        <div className="relative py-8 md:py-16">
                            <div className="p-8 md:p-16 relative z-10 flex items-start">
                                <div className="max-w-md">
                                    <h2 className="text-white text-3xl md:text-4xl font-light mb-6">CONTACT DETAILS</h2>
                                    <p className="text-white/80 mb-6">Reach out to us for inquiries, showings, and partnerships.</p>

                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-white text-sm">PHONE</p>
                                            <p className="text-white">+1 (416) 909-5662</p>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">EMAIL</p>
                                            <p className="text-white">muniba.mian@century21.ca</p>
                                        </div>
                                        <div>
                                            <p className="text-white text-sm">ADDRESS</p>
                                            <p className="text-white">2855 Markham Rd Suite 300, Scarborough, ON L1T 0H6, Canada</p>
                                        </div>
                                    </div>

                                    <div className="mt-8 flex gap-4">
                                        <a href='https://www.facebook.com/dealzinheelz.ca/' target='_blank' rel='noopener noreferrer' className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C9A96E]/20">
                                            <Facebook className="w-4 h-4 text-white" />
                                        </a>
                                        <a href='https://www.instagram.com/dealzinheelz.realestate?igsh=MWRyYmlnbGIzMjk3cA==' target='_blank' rel='noopener noreferrer' className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C9A96E]/20">
                                            <Instagram className="w-4 h-4 text-white" />
                                        </a>
                                        <a href='https://www.tiktok.com/@dealzinheelz.realestate?_r=1&_t=ZS-93oQ3jmf18x' target='_blank' rel='noopener noreferrer' className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center hover:bg-[#C9A96E] hover:border-[#C9A96E] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#C9A96E]/20">
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V8.73a8.19 8.19 0 004.76 1.52V6.8a4.83 4.83 0 01-1-.11z"/></svg>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right form */}
                        <div className="p-6 md:p-16 py-8 md:py-16 flex items-center relative z-10">
                            <div className="max-w-md mx-auto w-full">
                                {success ? (
                                    <div className="text-center py-12">
                                        <h3 className="text-2xl text-white mb-4">Message Sent</h3>
                                        <p className="text-white/80">Thanks â€” we received your message. We'll respond shortly.</p>
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-white text-3xl md:text-4xl font-light mb-4">SUBMIT A MESSAGE</h2>

                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div>
                                                <label className="text-white/80 text-xs">Name</label>
                                                <input name="name" value={form.name} onChange={handleChange} className="w-full bg-white/5 border border-white/15 rounded-xl text-white py-3 px-4 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all duration-300 placeholder-white/40" placeholder="Your name" />
                                            </div>
                                            <div>
                                                <label className="text-white/70 text-xs tracking-wide">Email</label>
                                                <input name="email" value={form.email} onChange={handleChange} className="w-full bg-white/5 border border-white/15 rounded-xl text-white py-3 px-4 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all duration-300 placeholder-white/40" placeholder="your@email.com" />
                                            </div>
                                            <div>
                                                <label className="text-white/70 text-xs tracking-wide">Phone</label>
                                                <input name="phone" value={form.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/15 rounded-xl text-white py-3 px-4 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all duration-300 placeholder-white/40" placeholder="+1 (xxx) xxx-xxxx" />
                                            </div>
                                            <div>
                                                <label className="text-white/70 text-xs tracking-wide">Best time to get in touch (Eastern Time Zone)</label>
                                                <input name="bestTime" type="datetime-local" value={form.bestTime} onChange={handleChange} className="w-full bg-white/5 border border-white/15 rounded-xl text-white py-3 px-4 focus:outline-none focus:border-[#C9A96E] focus:ring-2 focus:ring-[#C9A96E]/20 transition-all duration-300 h-12" />
                                            </div>

                                            {error && <p className="text-red-400 text-sm">{error}</p>}

                                            <div>
                                                <button type="submit" disabled={loading} className="w-full btn-pink-gradient py-3.5 rounded-full font-medium tracking-wide transition-all duration-300 disabled:opacity-50 hover:-translate-y-0.5">{loading ? 'SENDING...' : 'Send Message'}</button>
                                            </div>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    if (typeof document === 'undefined') return null;
    return createPortal(modal, document.body);
}