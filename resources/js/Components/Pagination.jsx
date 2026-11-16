import React from 'react';
import { Link } from '@inertiajs/react';

export default function Pagination({ links = [] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 bg-white border-t-2 border-slate-200 sm:px-6">
            <div className="flex justify-between flex-1 sm:hidden">
                {links[0]?.url ? (
                    <Link
                        href={links[0].url}
                        className="relative inline-flex items-center px-4 py-2 text-sm font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                        Sebelumnya
                    </Link>
                ) : (
                    <span className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-100 border-2 border-slate-200 rounded-xl cursor-not-allowed">
                        Sebelumnya
                    </span>
                )}
                {links[links.length - 1]?.url ? (
                    <Link
                        href={links[links.length - 1].url}
                        className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-bold text-slate-800 bg-white border-2 border-slate-300 rounded-xl hover:bg-slate-50"
                    >
                        Berikutnya
                    </Link>
                ) : (
                    <span className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-semibold text-slate-400 bg-slate-100 border-2 border-slate-200 rounded-xl cursor-not-allowed">
                        Berikutnya
                    </span>
                )}
            </div>

            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-center">
                <nav className="relative z-0 inline-flex rounded-xl shadow-xs -space-x-px overflow-hidden border border-slate-300" aria-label="Pagination">
                    {links.map((link, index) => {
                        const isPrev = link.label.includes('Previous') || link.label.includes('&laquo;');
                        const isNext = link.label.includes('Next') || link.label.includes('&raquo;');
                        const cleanLabel = isPrev ? '«' : isNext ? '»' : link.label;

                        if (!link.url) {
                            return (
                                <span
                                    key={index}
                                    className="relative inline-flex items-center px-3.5 py-2 text-sm font-bold text-slate-400 bg-slate-100 border-r border-slate-300 last:border-r-0 cursor-not-allowed"
                                    dangerouslySetInnerHTML={{ __html: cleanLabel }}
                                />
                            );
                        }

                        return (
                            <Link
                                key={index}
                                href={link.url}
                                className={`relative inline-flex items-center px-3.5 py-2 text-sm font-black border-r border-slate-300 last:border-r-0 transition-colors ${
                                    link.active
                                        ? 'z-10 bg-blue-600 text-white'
                                        : 'bg-white text-slate-800 hover:bg-blue-50 hover:text-blue-700'
                                }`}
                                dangerouslySetInnerHTML={{ __html: cleanLabel }}
                            />
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}
