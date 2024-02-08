import React from "react";

interface ButtonGroupItemProps {
  name: string;
  group: string;
  onClick: () => void;
  children: React.ReactNode;
  defaultChecked?: boolean;
}

export function ButtonGroupItem(props: ButtonGroupItemProps) {
  return (
    <li className="p-0 border-r border-r-black last:border-r-0 [&:first-child>*]:rounded-l-lg [&:last-child>*]:rounded-r-lg cursor-pointer">
      <input
        type="radio"
        id={props.name}
        name={props.group}
        className="hidden peer"
        defaultChecked={props.defaultChecked}
      />
      <label
        htmlFor={props.name}
        className="p-2 block cursor-pointer bg-primary-800/20 hover:bg-primary-300/20 peer-checked:bg-primary-800 peer-checked:shadow-inner"
        onClick={props.onClick}
      >
        {props.children}
      </label>
    </li>
  );
}

interface ButtonGroupProps {
  children: React.ReactNode;
}

export default function ButtonGroup(props: ButtonGroupProps) {
  return (
    <ul className="list-none flex border border-black rounded-lg">
      {props.children}
    </ul>
  );
}
