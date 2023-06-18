import Link from "next/link";
import SlideInMenu from "./components/Menu";
import "./globals.css";
import { Roboto } from 'next/font/google';
import { mdiGithub, mdiCellphoneCog, mdiApi, mdiHome } from '@mdi/js';
 
const roboto = Roboto({
  weight: ['400', '900'],
  subsets: ['latin'],
  display: 'swap',
})

export const metadata = {
  title: "Fnordcredit",
  description: "Open source credit system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`dark:bg-slate-900 text-slate-900 dark:text-slate-100 ${roboto.className} transition-colors duration-500`}>
        <div className="mx-auto px-8 py-4 bg-primary-500 text-slate-200 flex drop-shadow-lg">
          <SlideInMenu title="Navigation" navigation={[
            { href: "/",
              icon: mdiHome,
              text: "Home Page"
            },
            { href: "/device-settings",
              icon: mdiCellphoneCog,
              text: "Device Settings"
            },
            { href: "/api/docs",
              icon: mdiApi,
              text: "API Docs"
            },
            { href: "https://github.com/fnordcredit/fnordcredit/",
              target: "__blank",
              icon: mdiGithub,
              text: "Contribute on Github"
            }
          ]} />
          <span className="font-semibold"> 
            Fnordcredit
          </span>
          <div className="flex-grow" />
          <div className="">
            Login
          </div>
        </div>
        {children}
      </body>
    </html>
  );
}
