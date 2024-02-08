"use client";

import AppBar from "@components/AppBar";
import Avatar from "@components/Avatar";
import Link from "next/link";
import NewAccountDialog from "./new-account/NewAccountButton";
import { useRef, useState } from "react";
import Icon from "@mdi/react";
import {
  mdiAccountSearch,
  mdiSortClockDescendingOutline,
  mdiSortClockAscendingOutline,
  mdiSortAlphabeticalAscending,
  mdiSortAlphabeticalDescending,
} from "@mdi/js";
import formatCurrency from "@lib/formatCurrency";
import ButtonGroup, { ButtonGroupItem } from "@components/ButtonGroup";

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
  const [[sort, sortReverse], setSort] = useState(["Recent", false]);
  const changeSort = (newsort: string) => {
    if (sort === newsort) {
      setSort([sort, !sortReverse]);
    } else {
      setSort([newsort, false]);
    }
  };
  const sortABC = (x: User, y: User) => {
    if (x.name < y.name) {
      return -1;
    }
    if (x.name > y.name) {
      return 1;
    }
    return 0;
  };
  const sortRecent = (x: User, y: User) => {
    return y.updatedAt.getTime() - x.updatedAt.getTime();
  };
  return (
    <>
      <AppBar>
        <div className="flex-grow" />
        <div
          className="mx-2 flex cursor-text rounded-lg bg-black/20 text-white"
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
        <div className="mr-8">
          <ButtonGroup>
            <ButtonGroupItem
              group="sort"
              name="Recent"
              onClick={() => changeSort("Recent")}
              defaultChecked={sort === "Recent"}
            >
              {sort === "Recent" && sortReverse ? (
                <Icon
                  size={1}
                  aria-hidden={true}
                  path={mdiSortClockDescendingOutline}
                />
              ) : (
                <Icon
                  size={1}
                  aria-hidden={true}
                  path={mdiSortClockAscendingOutline}
                />
              )}
            </ButtonGroupItem>
            <ButtonGroupItem
              group="sort"
              name="ABC"
              onClick={() => changeSort("ABC")}
              defaultChecked={sort === "ABC"}
            >
              {sort === "ABC" && sortReverse ? (
                <Icon
                  size={1}
                  aria-hidden={true}
                  path={mdiSortAlphabeticalDescending}
                />
              ) : (
                <Icon
                  size={1}
                  aria-hidden={true}
                  path={mdiSortAlphabeticalAscending}
                />
              )}
            </ButtonGroupItem>
          </ButtonGroup>
        </div>
        <NewAccountDialog />
      </AppBar>
      <div className="mx-auto my-2 flex flex-wrap content-around">
        {(sortReverse
          ? (x: Array<User>) => x.reverse()
          : (x: Array<User>) => x)(
          users
            .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()))
            .sort((x, y) =>
              sort === "ABC" ? sortABC(x, y) : sortRecent(x, y),
            ),
        ).map((x) => (
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
                {formatCurrency(x.credit)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </>
  );
}
