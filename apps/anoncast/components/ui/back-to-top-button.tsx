'use client';

const BackToTopButton = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
<button
  onClick={scrollToTop}
  className="fixed bottom-6 right-6 z-10 w-14 h-14 flex items-center justify-center bg-black/70 text-white rounded-full shadow-xl transition-transform duration-300 hover:scale-105 gradient-border-wrapper"
  style={{
    background: "rgba(0, 0, 0, 0.7) !important",
    backdropFilter: "blur(8px)", // Adjust blur intensity as needed
    WebkitBackdropFilter: "blur(8px)", // Ensures support in Safari
  }}
  aria-label="Back to Top"
>
      <svg
        width="31"
        height="31"
        viewBox="0 0 31 31"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12.1001 5.47736C12.8001 5.47736 13.4001 5.77736 13.8001 6.27736L23.5001 17.2774C24.2001 17.9774 24.1001 19.1774 23.4001 19.8774C22.7001 20.5774 21.5001 20.4774 20.8001 19.7774L20.7001 19.6774L12.2001 10.0774C12.1001 9.97736 12.0001 9.97736 11.8001 10.0774L3.30009 19.6774C2.60009 20.4774 1.5001 20.5774 0.700095 19.8774C-0.099905 19.1774 -0.199905 18.0774 0.500095 17.2774L0.600095 17.1774L10.3001 6.17736C10.8001 5.77736 11.4001 5.47736 12.1001 5.47736Z"
          fill="white"
        />
      </svg>
    </button>
  );
};

export default BackToTopButton;
