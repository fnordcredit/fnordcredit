"use server";
import prisma from "@lib/prisma";
import { IsNotEmpty, IsString, MaxLength, validate } from "class-validator";
import { redirect } from "next/navigation";

class CreateUserDTO {
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  constructor(data: FormData) {
    this.name = data.get("name")?.toString() ?? "";
  }
}

export default async function createAccount(data: FormData) {
  const user = new CreateUserDTO(data);
  const errors = await validate(user);
  if (errors.length > 0) {
    return;
  }
  const id = (
    await prisma.user.create({
      data: {
        name: user.name,
      },
      select: {
        id: true,
      },
    })
  ).id;
  redirect(`/user/${id}`);
}
