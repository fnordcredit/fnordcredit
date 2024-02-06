import { ReactNode } from "react";
import "@lib/globals.css";
import "@lib/helpers.css";
import { Roboto } from "next/font/google";
import PageUpdater from "@components/PageUpdater";

const roboto = Roboto({
  weight: ["400", "900"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Fnordcredit",
  description: "Open source credit system.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`text-slate-900 dark:bg-slate-900 dark:text-slate-100 ${roboto.className} transition-colors duration-500`}
      >
        {children}
        <PageUpdater interval={20000} />
      </body>
    </html>
  );
}
