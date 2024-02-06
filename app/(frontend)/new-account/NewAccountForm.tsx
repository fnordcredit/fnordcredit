"use client";
import React, { useState } from "react";
import { useFormState } from "react-dom";
import createAccount, {
  userExists as userExistsAction,
} from "@actions/createAccount";
import Form, { Submit, TextBox } from "@components/Form";

export default function NewAccountDialog() {
  const [userExists, setUserExists] = useState(false);
  const onBlur = (e: React.MouseEvent<HTMLInputElement>) => {
    userExistsAction((e.target as HTMLInputElement).value).then((i) =>
      setUserExists(i != null),
    );
  };
  const nameErrors = [
    { message: "User name already exists.", active: userExists },
  ];
  const [formError, action] = useFormState(createAccount, null);
  return (
    <Form action={action}>
      {formError != null ? (
        <div className="bg-error text-white p-2 m-4">{formError}</div>
      ) : null}
      <TextBox
        label="New Name"
        name="name"
        required
        maxLength={20}
        placeholder="Your name"
        errors={nameErrors}
        showErrorOnFocus
        onChange={onBlur}
      />
      <Submit disabled={userExists}>Create</Submit>
    </Form>
  );
}
