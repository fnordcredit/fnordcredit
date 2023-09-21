import { ReactNode } from "react";
import { mdiShieldAlert } from "@mdi/js";
import Icon from "@mdi/react";
import style from "./TextBox.module.scss";

interface TextBoxError {
  message: string;
  active: boolean;
}

interface TextBoxProps {
  label?: ReactNode;
  name?: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  regexErrorMessage?: string;
  errors?: TextBoxError[];
  showErrorOnFocus?: boolean;
}

export default function TextBox<T extends TextBoxProps>({
  label,
  name,
  placeholder,
  required,
  maxLength,
  regexErrorMessage,
  errors,
  showErrorOnFocus,
  ...extraProps
}: T) {
  const activeErrors = errors?.filter((e) => e.active);
  return (
    <div className={style.textbox}>
      <input
        type="text"
        name={name}
        className={`${(activeErrors?.length ?? 0) > 0 ? style.error : ""} ${
          showErrorOnFocus ? style.showErrorOnFocus : ""
        }`}
        maxLength={maxLength}
        placeholder={placeholder}
        required={required}
        {...extraProps}
      ></input>
      {label != null ? <label htmlFor={name}>{label}</label> : null}
      {regexErrorMessage != null ? (
        <span>
          <Icon path={mdiShieldAlert} className={style.regex} size={1} />
          {regexErrorMessage}
        </span>
      ) : null}
      {errors?.map((e, i) => (
        <span className={e.active ? style.active : ""} key={i}>
          <Icon path={mdiShieldAlert} size={1} />
          {e.message}
        </span>
      ))}
    </div>
  );
}
