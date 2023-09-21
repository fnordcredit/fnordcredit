"use client";
import React from "react";
import createAccount, {
  userExists as userExistsAction,
} from "@actions/createAccount";
import Form, { Submit, TextBox } from "@components/Form";
import { useState } from "react";

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
  return (
    <Form action={createAccount}>
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
