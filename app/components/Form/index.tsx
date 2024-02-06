import { ReactNode } from "react";
export { default as TextBox } from "./TextBox";
export { default as Submit } from "./Submit";

interface FormProps {
  children: ReactNode;
  action?: (_f: FormData) => Promise<void> | void;
}

export function Form({ children, action }: FormProps) {
  return (
    <form action={action} className="group" noValidate>
      {children}
    </form>
  );
}

export default Form;
