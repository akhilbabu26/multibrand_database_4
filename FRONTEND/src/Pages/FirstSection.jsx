import React from "react";

function FirstSection() {
  return (
    <section className="relative w-full h-120 overflow-hidden">
      {/* Background Video */}
      <video
        src="https://www.pexels.com/download/video/4228658/"
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-120 object-cover"
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Centered Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-lg">
          Step Into Style
        </h1>
        <p className="mt-4 text-lg md:text-xl text-gray-200 max-w-xl">
          Discover premium footwear from top brands — comfort, quality, and style combined.
        </p>

       
      </div>
    </section>
  );
}

export default FirstSection;
