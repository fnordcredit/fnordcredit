import SlideInMenu from "@components/Menu";
import { mdiApi, mdiCellphoneCog, mdiGithub, mdiHome } from "@mdi/js";
import { ReactNode } from "react";

export default function AppBar({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto px-8 py-4 bg-primary-500 text-slate-200 flex drop-shadow-lg">
      <SlideInMenu title="Navigation" navigation={[
        { href: "/",
          icon: mdiHome,
          text: "Home Page",
        },
        { href: "/device-settings",
          icon: mdiCellphoneCog,
          text: "Device Settings",
        },
        { href: "/api/docs",
          icon: mdiApi,
          text: "API Docs",
        },
        { href: "https://github.com/fnordcredit/Fnordcredit/",
          target: "__blank",
          icon: mdiGithub,
          text: "Contribute on Github",
        },
      ]} />
      <span className="font-semibold"> 
        Fnordcredit
      </span>
      { children }
    </div>
  );
}
