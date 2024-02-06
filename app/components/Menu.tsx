"use client";
import { Fragment, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import Icon from "@mdi/react";
import { mdiClose, mdiMenu } from "@mdi/js";
import Link from "next/link";

export type MenuItem = {
  icon: string;
  text: string;
  href: string;
  [extraProps: string]: Object;
};

export type SlideInMenuProps = {
  title: string;
  navigation: MenuItem[];
};

export default function SlideInMenu(props: SlideInMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mx-2 shadow-white hover:text-white hover:drop-shadow-lg"
      >
        <span className="sr-only">Open menu</span>
        <Icon className="h-6 w-6" aria-hidden="true" path={mdiMenu} />
      </button>
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-800 dark:bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 left-0 flex max-w-full">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto relative w-screen max-w-md">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-500"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-500"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute right-0 top-0 ml-8 mt-1 flex pr-2 pt-4 sm:pr-4">
                        <button
                          type="button"
                          className="rounded-md text-gray-600 hover:text-primary-800 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:text-slate-300 dark:hover:text-slate-50"
                          onClick={() => setOpen(false)}
                        >
                          <span className="sr-only">Close panel</span>
                          <Icon
                            className="h-6 w-6"
                            aria-hidden="true"
                            path={mdiClose}
                          />
                        </button>
                      </div>
                    </Transition.Child>
                    <div className="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl dark:bg-primary-600">
                      <div className="px-4 sm:px-6">
                        <Dialog.Title className="text-base font-semibold leading-6 text-primary-600 dark:text-slate-200">
                          {props.title}
                        </Dialog.Title>
                      </div>
                      <div className="relative mt-6 flex-1">
                        {props.navigation.map(
                          ({ icon, text, ...extraProps }, i) => (
                            <Link
                              className="flex w-full border-b border-gray-400 bg-slate-50 p-4 text-3xl first:border-t hover:bg-slate-200 dark:border-primary-900 dark:bg-primary-500 dark:hover:bg-primary-400"
                              key={i}
                              {...extraProps}
                            >
                              <Icon
                                path={icon}
                                size={1.5}
                                className="mr-6 text-primary-600 dark:text-gray-300"
                              />
                              <span className="my-auto text-xl">{text}</span>
                            </Link>
                          ),
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}
