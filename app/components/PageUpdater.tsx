"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  interval: number;
};

export default function PageUpdater({ interval }: Props) {
  const router = useRouter();
  useEffect(() => {
    setInterval(() => router.refresh(), interval);
  }, [router, interval]);
  return null;
}
