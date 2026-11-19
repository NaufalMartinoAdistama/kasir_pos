import React from 'react';
import { Link } from '@inertiajs/react';

export default function ApplicationLogo({
    className = '',
    iconOnly = false,
    variant = 'dark', // 'dark' | 'light' | 'primary'
    size = 'md', // 'sm' | 'md' | 'lg'
    href = '/',
}) {
    const isLight = variant === 'light';

    const iconSizeClasses = {
        sm: 'w-7 h-7 text-xs rounded-lg',
        md: 'w-9 h-9 text-sm rounded-xl',
        lg: 'w-12 h-12 text-base rounded-2xl',
    }[size] || 'w-9 h-9 text-sm rounded-xl';

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-xl',
    }[size] || 'text-base';

    const subtextSizeClasses = {
        sm: 'text-[9px]',
        md: 'text-[10px]',
        lg: 'text-xs',
    }[size] || 'text-[10px]';

    const content = (
        <div className={`inline-flex items-center space-x-2.5 select-none ${className}`}>
            {/* Logo Icon Box */}
            <div
                className={`${iconSizeClasses} flex items-center justify-center font-black shadow-md transition-transform group-hover:scale-105 shrink-0 ${
                    isLight
                        ? 'bg-white text-blue-600 shadow-blue-900/20'
                        : 'bg-gradient-to-tr from-blue-600 to-sky-400 text-white shadow-blue-500/25'
                }`}
            >
                <svg
                    className="w-5 h-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Modern Shopping Bag / Store Icon */}
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
            </div>

            {/* Brand Typography */}
            {!iconOnly && (
                <div className="flex flex-col leading-tight">
                    <span
                        className={`font-black tracking-tight ${textSizeClasses} ${
                            isLight ? 'text-white' : 'text-slate-900'
                        }`}
                    >
                        MARTIN MART
                    </span>
                    <span
                        className={`font-bold uppercase tracking-wider ${subtextSizeClasses} ${
                            isLight ? 'text-sky-200' : 'text-blue-600'
                        }`}
                    >
                        Supermarket & POS
                    </span>
                </div>
            )}
        </div>
    );

    if (href) {
        return (
            <Link href={href} className="inline-block group focus:outline-hidden">
                {content}
            </Link>
        );
    }

    return content;
}
