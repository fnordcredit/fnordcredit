import NewAccountForm from "./NewAccountForm";
import AppBar from "@components/AppBar";

export default function NewAccountPage() {
  return (
    <>
      <AppBar />
      <div className="mx-auto my-6 p-4 max-w-2xl self-center">
        <NewAccountForm />
      </div>
    </>
  );
}
