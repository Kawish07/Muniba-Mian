import React, { useState, useRef } from "react";
import Footer from "./components/Footer";
import Header from "./components/Header";
// BeforeAfterSlider Component
const BeforeAfterSlider = ({ before, after, title }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (e.touches.length > 0) {
      handleMove(e.touches[0].clientX);
    }
  };

  return (
    <div className="mb-20">
      <h2
        className="text-3xl md:text-4xl font-medium text-center mb-8"
        style={{ fontFamily: "'Inter', sans-serif", color: "#111112" }}
      >
        {title}
      </h2>

      <div
        ref={containerRef}
        className="relative w-full h-[420px] md:h-[560px] overflow-hidden cursor-ew-resize select-none rounded-2xl shadow-2xl"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      >
        {/* Before Image (Empty Room) - Base Layer */}
        <div className="absolute inset-0">
          <img
            src={before}
            alt="Before staging"
            className="w-full h-full object-cover"
            draggable="false"
          />
        </div>

        {/* After Image (Staged Room with Furniture) - Reveals as you drag right */}
        <div
          className="absolute inset-0 top-0 left-0 overflow-hidden"
          style={{
            width: `${sliderPosition}%`,
          }}
        >
          <img
            src={after}
            alt="After staging"
            className="h-full object-cover"
            style={{
              width: containerRef.current
                ? `${containerRef.current.offsetWidth}px`
                : "100vw",
              maxWidth: "none",
            }}
            draggable="false"
          />
        </div>

        {/* Slider Line */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-pink-400 shadow-lg cursor-ew-resize z-10"
          style={{ left: `${sliderPosition}%` }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* Slider Handle */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-14 h-14 bg-pink-400 rounded-full shadow-2xl flex items-center justify-center border-4 border-white">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M8 9l4-4 4 4m0 6l-4 4-4-4"
              />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

// Properties Data
const properties = [
  {
    title: "Elegant Living Room Transformation",
    before: "images/Living Room.jpeg",
    after: "images/living room after.jpeg",
  },
];

// Main Staging Component
export default function Staging() {
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
                  Staging
                </span>
              </div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.05] tracking-tight mb-6"
                style={{ fontFamily: "'Inter', sans-serif", color: "#111112" }}
              >
                Staging before
                <br />
                and after
              </h1>
              <p
                className="text-base md:text-lg text-gray-500 max-w-xl leading-relaxed"
                style={{ fontFamily: "'Inter', sans-serif" }}
              >
                We prepare homes to stand out in the market with clean, strategic
                presentation that improves first impressions and listing results.
              </p>
            </div>
            <div className="relative overflow-hidden rounded-2xl bg-gray-100 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1920&auto=format&fit=crop&q=80"
                alt="Staging showcase"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="py-20 md:py-24 px-6 md:px-12 lg:px-20 bg-[#f5f5f5] section-pattern-light">
          <div className="max-w-6xl mx-auto">
            {properties.map((property, index) => (
              <BeforeAfterSlider
                key={index}
                before={property.before}
                after={property.after}
                title={property.title}
              />
            ))}
          </div>
        </section>

        <section className="bg-[#111112] py-20 md:py-24 text-white section-pattern-dark">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h2
              className="text-4xl md:text-5xl font-medium mb-6"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Ready to transform your space?
            </h2>
            <p
              className="text-gray-300 mb-8 text-base md:text-lg"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              Let us showcase your property’s full potential with professional
              staging support.
            </p>
            <button
              type="button"
              onClick={() =>
                window.dispatchEvent(new CustomEvent("openContactModal"))
              }
              className="btn-pink-gradient px-10 py-4 rounded-full font-medium text-lg hover:-translate-y-0.5"
            >
              Get Started Today
            </button>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
