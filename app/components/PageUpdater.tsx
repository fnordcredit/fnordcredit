"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

type Props = {
  interval: number;
};

export default function PageUpdater({ interval }: Props) {
  const router = useRouter();
  useEffect(() => {
    const i = setInterval(() => router.refresh(), interval);
    return () => clearInterval(i);
  }, [router, interval]);
  return null;
}
