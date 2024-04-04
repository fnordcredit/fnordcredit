import SlideInMenu from "@components/Menu";
import { mdiApi, mdiCellphoneCog, mdiGithub, mdiHome } from "@mdi/js";
import Link from "next/link";
import { ReactNode } from "react";

interface AppBarProps {
  children?: ReactNode;
  className?: string;
  titleClassName?: string;
  menuClassName?: string;
  noTitle?: boolean;
}

export default function AppBar({ children, ...props }: AppBarProps) {
  return (
    <div
      className={
        "flex h-16 bg-primary-500 px-8 py-3 text-slate-200 drop-shadow-lg " +
          props.className ?? ""
      }
    >
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
        className={props.menuClassName}
      />
      <Link
        href="/"
        className={`my-auto font-semibold ${props.titleClassName ?? ""}`}
      >
        Fnordcredit
      </Link>
      {children}
    </div>
  );
}
