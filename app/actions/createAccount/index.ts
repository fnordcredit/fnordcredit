"use server";
import prisma from "@lib/prisma";
import { IsNotEmpty, IsString, MaxLength, validate } from "class-validator";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";

class CreateUserDTO {
  @IsString()
  @IsNotEmpty({ message: "User already exists." })
  @MaxLength(20, { message: "User name must be at most 20 characters long." })
  name: string;

  constructor(data: FormData) {
    this.name = data.get("name")?.toString() ?? "";
  }
}

export async function userExists(name: string) {
  return (
    await prisma.user.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
      select: {
        id: true,
      },
    })
  )?.id;
}

export default async function createAccount(_state: any, data: FormData) {
  const user = new CreateUserDTO(data);
  const errors = await validate(user);
  if (errors.length > 0) {
    return errors[0].toString();
  }
  try {
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
  } catch (e) {
    if (isRedirectError(e)) {
      throw e;
    }
    return "User already exists.";
  }
}
