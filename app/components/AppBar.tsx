import SlideInMenu from "@components/Menu";
import { mdiApi, mdiCellphoneCog, mdiGithub, mdiHome } from "@mdi/js";
import Link from "next/link";
import { ReactNode } from "react";

export default function AppBar({ children }: { children?: ReactNode }) {
  return (
    <div className="mx-auto flex h-16 bg-primary-500 px-8 py-3 text-slate-200 drop-shadow-lg">
      <SlideInMenu
        title="Navigation"
        navigation={[
          { href: "/", icon: mdiHome, text: "Home Page" },
          {
            href: "/device-settings",
            icon: mdiCellphoneCog,
            text: "Device Settings",
          },
          { href: "/api/docs", icon: mdiApi, text: "API Docs" },
          {
            href: "https://github.com/fnordcredit/Fnordcredit/",
            target: "__blank",
            icon: mdiGithub,
            text: "Contribute on Github",
          },
        ]}
      />
      <Link href="/" className="my-auto font-semibold">
        Fnordcredit
      </Link>
      {children}
    </div>
  );
}
