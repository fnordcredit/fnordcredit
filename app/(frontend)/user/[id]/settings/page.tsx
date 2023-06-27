"use client";
import SimpleDialog from "@components/SimpleDialog";
import { useRouter } from "next/navigation";

export default function UserSettings() {
  const router = useRouter();
  const closeModal = () => router.back();
  return (
    <SimpleDialog open={true} title="Not yet implemented" onClose={closeModal}>
      The settings are still work in progress. Please come back when Fnordcredit
      3.0 is out of beta!
    </SimpleDialog>
  );
}
