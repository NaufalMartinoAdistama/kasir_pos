import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { IconX } from './Icons';

export default function ModalDialog({
    show = false,
    onClose = () => {},
    title = '',
    children,
    maxWidth = 'max-w-lg',
}) {
    return (
        <Transition show={show} as={Fragment} leave="duration-200">
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel
                                className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl border-2 border-slate-200 transition-all sm:my-8 w-full ${maxWidth}`}
                            >
                                <div className="flex items-center justify-between px-6 py-4 border-b-2 border-slate-100 bg-slate-50">
                                    <Dialog.Title className="text-base font-black leading-6 text-slate-950">
                                        {title}
                                    </Dialog.Title>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        className="rounded-lg p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-200 focus:outline-hidden transition-colors"
                                    >
                                        <IconX className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="p-6">
                                    {children}
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
