import React from 'react';

export default function ShoppingHeroIllustration({ className = 'w-44 h-44' }) {
    return (
        <svg
            className={className}
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            {/* Background Circle */}
            <circle cx="100" cy="100" r="70" fill="#2563EB" fillOpacity="0.45" />

            {/* Shopping Cart Grid Lines & Basket */}
            <g transform="translate(10, 10)">
                {/* Wheels */}
                <circle cx="75" cy="148" r="7" fill="#1E293B" />
                <circle cx="75" cy="148" r="3" fill="#FFFFFF" />
                <circle cx="120" cy="148" r="7" fill="#1E293B" />
                <circle cx="120" cy="148" r="3" fill="#FFFFFF" />

                {/* Cart Lower Support Chassis */}
                <path
                    d="M62 138H132L125 148H72L62 138Z"
                    fill="#CBD5E1"
                />

                {/* Shopping Cart Basket Wireframe */}
                <path
                    d="M60 85H142L128 135H68L60 85Z"
                    fill="#FFFFFF"
                    fillOpacity="0.85"
                    stroke="#FFFFFF"
                    strokeWidth="3.5"
                    strokeLinejoin="round"
                />
                <path d="M142 85L152 70" stroke="#FFFFFF" strokeWidth="3.5" strokeLinecap="round" />

                {/* Basket Grid Lines */}
                <path d="M63 97H138M65 110H134M67 123H130" stroke="#93C5FD" strokeWidth="1.8" />
                <path d="M80 87V133M98 87V133M116 87V133" stroke="#93C5FD" strokeWidth="1.8" />

                {/* Character Sitting in Cart */}
                {/* Legs (crossed over cart) */}
                <path
                    d="M68 95L48 115L38 110"
                    stroke="#7C3AED"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Shoe 1 */}
                <path d="M35 110L42 118" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />

                <path
                    d="M80 98L60 128L50 138"
                    stroke="#6D28D9"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Shoe 2 */}
                <path d="M46 138L55 145" stroke="#EC4899" strokeWidth="6" strokeLinecap="round" />

                {/* Body / Torso (white shirt) */}
                <path
                    d="M82 62C82 62 76 90 85 96C94 96 112 94 112 78C112 62 100 60 82 62Z"
                    fill="#FFFFFF"
                />

                {/* Head */}
                <circle cx="94" cy="44" r="11" fill="#FDE68A" />
                {/* Hair */}
                <path
                    d="M84 44C84 37 90 32 98 32C106 32 108 38 107 43C104 43 100 45 97 45C91 45 86 48 84 44Z"
                    fill="#1E293B"
                />
                {/* Hair Bun */}
                <circle cx="106" cy="41" r="5" fill="#1E293B" />

                {/* Left Arm holding Smartphone */}
                <path
                    d="M84 68L60 80L52 75"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                <rect
                    x="46"
                    y="69"
                    width="12"
                    height="18"
                    rx="2.5"
                    transform="rotate(-20 46 69)"
                    fill="#1E293B"
                />
                <rect
                    x="48"
                    y="71"
                    width="8"
                    height="14"
                    rx="1.5"
                    transform="rotate(-20 48 71)"
                    fill="#38BDF8"
                />

                {/* Right Arm Waving */}
                <path
                    d="M102 68L120 56L126 42"
                    stroke="#FFFFFF"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
                {/* Hand waving */}
                <circle cx="127" cy="40" r="4" fill="#FDE68A" />
            </g>
        </svg>
    );
}
