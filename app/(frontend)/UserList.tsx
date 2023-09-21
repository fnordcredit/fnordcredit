"use client";

import AppBar from "@components/AppBar";
import Avatar from "@components/Avatar";
import Link from "next/link";
import NewAccountDialog from "./new-account/NewAccountButton";
import { useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiAccountSearch } from "@mdi/js";

type User = {
  id: number;
  name: string;
  updatedAt: Date;
  avatar: string | null;
  credit: number;
};

export default function UserList({ users }: { users: User[] }) {
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const focusSearch = () => {
    searchRef?.current?.focus();
  };
  return (
    <>
      <AppBar>
        <div className="flex-grow" />
        <div
          className="mx-8 flex cursor-text rounded-lg bg-black/20 text-white"
          onClick={focusSearch}
        >
          <Icon
            aria-hidden={true}
            path={mdiAccountSearch}
            size={1}
            className="mx-2 my-auto"
          />
          <input
            type="search"
            onChange={(e) => setSearch(e.target.value)}
            ref={searchRef}
            value={search}
            placeholder="Search..."
            className="border-0 bg-transparent pl-0 focus:ring-0"
          />
        </div>
        <NewAccountDialog />
      </AppBar>
      <div className="mx-auto my-2 flex flex-wrap content-around">
        {users
          .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
          .map((x) => (
            <Link
              href={`/user/${x.id.toString()}`}
              className="card m-6 flex h-28 w-56 cursor-pointer rounded-md px-2 py-2 transition-colors duration-200 hover:bg-gray-200 dark:hover:bg-primary-500"
              key={x.id}
            >
              <Avatar image={x.avatar} alt={x.name} />
              <span className="mx-3 my-auto block w-24 break-all text-right font-bold text-primary-500 dark:text-slate-200">
                {x.name}
                <br />
                <span
                  className={`text-sm font-normal ${
                    x.credit < 0 ? "text-error" : ""
                  }`}
                >
                  {(x.credit / 100).toFixed(2).toString() + "€"}
                </span>
              </span>
            </Link>
          ))}
      </div>
    </>
  );
}
