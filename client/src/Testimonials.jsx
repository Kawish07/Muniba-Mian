import React from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      title: "Down to Earth & Stress Free",
      preview:
        "Don was the listing agent for our home. He is knowledgeable of the real estate market. We greatly appreciated his effort to get us the best price for our home. Don stayed in contact from the day our home was listed to the day our home closed. Most importantly, Don is a down to earth guy who makes a real estate transaction stress free.",
    },
    {
      id: 2,
      title: "Very Helpful and Kind",
      preview:
        "Don was very helpful when selling our home. He explained the process was very kind, patient, and polite. We have been able to even ask questions about buying and he has done his best to answer. He went out of his way to make this sale happen and it was done quickly! I always go by reviews and the previous reviewers were spot on with how great he is! The company he works for is lucky to have him on their team! Would highly recommend especially if you are like me and my husband new to this process.",
    },
    {
      id: 3,
      title: "Highly Recommend Don!",
      preview:
        "We highly recommend Don! Very dedicated to finding us our home! Very patient with great advise. If we need realtor services in the future, we will definitely contact Don again.",
    },
    {
      id: 4,
      title: "Exceptional Service",
      preview:
        "Don, Don, Don. Where do I start. Would not have purchased my home from anyone other than Don. He was exceptional. He is very knowledgeable and helpful. Highly recommend his services in real estate. When your looking for a home in his area pick Don. You will see what I mean. It's hard to explain how great he is unless you experience him one on one.",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative">
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{ maxWidth: "1280px", margin: "0 auto", left: 0, right: 0 }}
      >
        <div className="absolute inset-y-0 left-[25%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[50%] w-px bg-gray-200/60" />
        <div className="absolute inset-y-0 left-[75%] w-px bg-gray-200/60" />
      </div>

      <div className="relative z-10">
        <Header />

        <section className="pt-40 pb-12 md:pt-48 md:pb-16 px-6 md:px-12 lg:px-20 section-pattern-light">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <div className="w-2 h-2 rounded-full bg-pink-400" />
                <span
                  className="text-xs tracking-[0.2em] uppercase text-gray-500 font-light"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  Testimonials
                </span>
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Inter', sans-serif", color: "#111112" }}
              >
                Client success
                <br />
                stories
              </h1>
              <p
                className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed mb-8"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Read what our clients say about the service, guidance, and
                results they experienced working with Muniba Mian.
              </p>
              <button
                onClick={() =>
                  window.dispatchEvent(new CustomEvent("openContactModal"))
                }
                className="px-8 py-3 border border-gray-300 text-[#111112] text-sm tracking-wide hover:bg-[#111112] hover:text-white hover:border-[#111112] transition-all duration-300 rounded-full"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                Contact Muniba
              </button>
            </div>

            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1920&auto=format&fit=crop&q=80"
                alt="Happy homeowner"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 px-6 md:px-12 lg:px-20 bg-[#f5f5f5] section-pattern-light">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
            {testimonials.map((t) => (
              <article
                key={t.id}
                className="p-8 md:p-10 bg-white rounded-2xl border border-gray-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center space-x-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-pink-400/15 text-pink-500 flex items-center justify-center">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4.583 17.321C3.553 16.227 3 15 3 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179zm10 0C13.553 16.227 13 15 13 13.011c0-3.5 2.457-6.637 6.03-8.188l.893 1.378c-3.335 1.804-3.987 4.145-4.247 5.621.537-.278 1.24-.375 1.929-.311 1.804.167 3.226 1.648 3.226 3.489a3.5 3.5 0 01-3.5 3.5c-1.073 0-2.099-.49-2.748-1.179z" />
                    </svg>
                  </div>
                  <h2
                    className="text-2xl md:text-3xl font-semibold leading-tight"
                    style={{ fontFamily: "'Inter', sans-serif", color: "#111112" }}
                  >
                    {t.title}
                  </h2>
                </div>
                <p
                  className="text-[15px] leading-relaxed text-gray-600"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                >
                  {t.preview}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#111112] py-20 md:py-24 text-white section-pattern-dark">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2
              className="text-4xl md:text-5xl font-medium mb-4"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Work with Muniba Mian
            </h2>
            <p
              className="text-white/75 text-base md:text-lg mb-8"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Schedule a private consultation and take the next step with
              confidence.
            </p>
            <button
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openContactModal"))
              }
              className="btn-pink-gradient px-10 py-3.5 rounded-full font-medium"
            >
              Contact
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
