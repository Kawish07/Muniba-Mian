import React, { useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
const teamMembers = [
  {
    name: 'Kayode Adekoya',
    title: 'KM&co Realty',
    image: '/images/team member male 1.jpeg',
    email: 'kay21real@gmail.com',
    socials: [
      { label: 'Instagram', href: 'https://www.instagram.com/kadekoya/?hl=en' },
      { label: 'Facebook', href: 'https://www.facebook.com/kayode.adekoya.75/' },
    ],
    bio: 'Kayode Adekoya is an award-winning real estate professional dedicated to helping clients confidently buy, sell, and lease property. He holds multiple industry designations, including Accredited Buyer’s Representative (ABR®), Seller Representative Specialist (SRS), Real Estate Negotiation Expert (RENE), and Seniors Real Estate Specialist® (SRES®)—equipping him with specialized expertise in buyer and seller representation, negotiation strategy, and senior-focused transitions. With a background in finance and early exposure to construction and development, Kayode brings strong market insight and analytical skills to every transaction. He works with individuals, families, and investors locally and internationally, helping them make informed real estate decisions with clarity and confidence. A proud husband and father of two, Kayode approaches real estate with energy, dedication, and a genuine passion for helping clients find a place they can truly call home.',
  },
  {
    name: 'Muniba Mian',
    title: 'Real Estate Agent',
    image: '/images/team member female 2.jpg',
    socials: [
      { label: 'Facebook', href: 'https://www.facebook.com/dealzinheelz.ca/' },
      { label: 'Instagram', href: 'https://www.instagram.com/dealzinheelz.realestate?igsh=MWRyYmlnbGIzMjk3cA==' },
      { label: 'TikTok', href: 'https://www.tiktok.com/@dealzinheelz.realestate?_r=1&_t=ZS-93oQ3jmf18x' },
    ],
    bio: 'Real estate isn’t just transactions to me — it’s about people, timing, and helping someone make one of the biggest financial decisions of their life with confidence. I work with first-time home buyers, investors, renters, and sellers across the Greater Toronto Area, with a strong focus on the Durham Region. Whether you’re stepping into the market for the first time, growing your portfolio, or preparing to sell, I bring clear guidance, honest conversations, and practical strategy to the table. No jargon. No pressure. Just real support from start to finish. I believe the best results come from understanding your goals first — not pushing a quick deal. Every client’s situation is different, and I take the time to tailor the process so it actually works for you. Real estate can feel overwhelming, but with the right plan and the right partner, it becomes manageable — and even exciting. My path into real estate is rooted in resilience and independence. As a single mom building a career on my own terms, I learned firsthand the value of financial stability, smart decision-making, and creating opportunities rather than waiting for them. That experience shapes how I work today — with empathy, determination, and a genuine commitment to helping others move forward and build something of their own. At the end of the day, my goal is simple: help you make smart, confident moves that set you up for long-term success.',
  },
];

export default function OurTeam() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="pt-40 pb-16 md:pt-48 md:pb-20 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div
          className={`transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
        >
          {/* Small label */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-2 h-2 rounded-full bg-[#ff66c4]" />
            <span
              className="text-xs tracking-[0.2em] uppercase text-gray-500 font-light"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Our Team
            </span>
          </div>

          {/* Main Heading */}
          <h1
            className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-8"
            style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}
          >
            Your trusted
            <br />
            real estate team
          </h1>

          {/* Subtitle */}
          <p
            className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            We guide buyers and sellers through every step with clarity,
            offering curated listings, market insight, and personalized
            service across the Greater Toronto Area.
          </p>
        </div>
      </section>

      {/* Separator */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
        <div className="w-full h-px bg-gray-200" />
      </div>

      {/* Team Cards Section */}
      <section className="py-16 md:py-24 px-6 md:px-12 lg:px-20 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-10 md:gap-16 lg:gap-24">
          {teamMembers.map((member, idx) => (
            <div
              key={member.name}
              className={`group transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
              style={{ transitionDelay: `${300 + idx * 200}ms` }}
            >
              {/* Photo Container */}
              <div className="relative overflow-hidden rounded-sm bg-[#f5f5f5] mb-6 aspect-[4/5] max-w-[360px] mx-auto">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  onError={(e) => {
                    // Fallback: show initials if image fails
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                {/* Fallback initials */}
                <div
                  className="absolute inset-0 items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 hidden"
                >
                  <span
                    className="text-7xl md:text-8xl font-bold text-gray-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
              </div>

              {/* Details */}
              <div className="mb-4 text-center">
                <h3
                  className="text-xl md:text-2xl font-semibold tracking-tight mb-1"
                  style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-sm text-gray-500 mb-0.5"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {member.title}
                </p>
                {member.email && (
                  <a
                    href={`mailto:${member.email}`}
                    className="text-sm text-gray-400 hover:text-[#111112] transition-colors duration-300"
                    style={{ fontFamily: "'Inter', sans-serif" }}
                  >
                    {member.email}
                  </a>
                )}
              </div>

              {/* Social Links */}
              {member.socials && member.socials.length > 0 && (
                <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
                  {member.socials.map((social) => (
                    <a
                      key={social.href}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs tracking-[0.2em] uppercase text-gray-400 hover:text-[#111112] transition-colors duration-300"
                      style={{ fontFamily: "'Inter', sans-serif" }}
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              )}

              {/* Bio */}
              <p
                className="text-sm text-gray-500 leading-relaxed mb-6 text-center"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                {member.bio}
              </p>

            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="bg-[#f5f5f5] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 text-center">
          <div
            className={`transition-all duration-1000 ease-out ${loaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '600ms' }}
          >
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mb-6"
              style={{ fontFamily: "'Inter', sans-serif", color: '#111112' }}
            >
              Ready to find your dream home?
            </h2>
            <p
              className="text-base md:text-lg text-gray-500 max-w-lg mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Get in touch with our team and let us help you navigate the
              real estate market with confidence.
            </p>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('openContactModal'))}
              className="px-10 py-4 bg-[#111112] text-white text-sm tracking-[0.15em] uppercase font-medium hover:bg-black transition-colors duration-300 rounded-sm"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Get in touch
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
