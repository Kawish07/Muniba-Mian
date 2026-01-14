import React from "react";
import { Facebook, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer id="contact" className="bg-black text-white pt-10 pb-3 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <h3 className="text-3xl tracking-widest mb-1 font-light">
            Don Ashworth
          </h3>
          <div className="mb-8 relative">
            <h2 className="text-sm md:text-lg font-light text-white tracking-[0.3em] uppercase">
              Real Estate Agent
            </h2>
            <h2 className="text-sm md:text-lg font-light text-white tracking-[0.3em] uppercase">
              Watts Auction Realty Appr, Inc
            </h2>

            <div className="w-24 h-1 bg-yellow-400 mt-2"></div>
          </div>
          <div className="grid md:grid-cols-2 mb-3 gap-16">
            <div className="space-y-8">
              <div>
                <p className="text-sm tracking-widest mb-4 font-light">
                  LICENSED IN
                </p>
                <p className="text-sm tracking-widest font-light">
                  Virginia, United States
                </p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <div className="mb-8">
                  <div className="flex items-start space-x-3 mb-2">
                    <svg
                      className="w-5 h-5 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs tracking-widest mb-1 font-light">
                        EMAIL
                      </p>
                      <a
                        href="mailto:jus2c@hotmail.com"
                        className="text-sm underline hover:opacity-70 font-light break-all"
                      >
                        jus2c@hotmail.com
                      </a>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 mt-1"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-xs tracking-widest mb-1 font-light">
                        ADDRESS
                      </p>
                      <p className="text-sm font-light">
                        7661 Wards Rd, Rustburg, VA 24588, United States
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-start space-x-3">
                  <svg
                    className="w-5 h-5 mt-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <div>
                    <p className="text-xs tracking-widest mb-1 font-light">
                      PHONE NUMBER
                    </p>
                    <a
                      href="tel:+14342217560"
                      className="text-sm underline hover:opacity-70 font-light"
                    >
                      +1 (434) 221-7560
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-12 pb-8">
            <div className="mb-6">
              <a
                href="https://www.nar.realtor/fair-housing/what-everyone-should-know-about-equal-opportunity-housing"
                className="text-sm underline hover:opacity-70 mr-8 font-light"
              >
                Fair Housing Notice
              </a>
            </div>
            <p className="text-xs leading-relaxed text-gray-400 max-w-5xl mb-8 font-light">
              Virginia-licensed real estate agent and auctioneer specializing in
              homes, auctions, and investment properties. I put your needs first
              and guide you every step of the way. Contact me today to explore
              your real estate options!
            </p>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm mb-4 md:mb-0 font-light">
              Powered by <span className="font-medium">Realizty Inc</span>
            </p>
            <div className="flex items-center space-x-6">
              <p className="text-sm font-light">Copyright © 2025 | </p>
              <div className="flex space-x-3">
                <a
                  href="https://www.linkedin.com/in/don-ashworth-4b2364135/"
                  className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
                <a
                  href="https://www.facebook.com/downtoearthdon/"
                  className="w-10 h-10 border border-white rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
