import Image from "next/image";

export type AvatarProps = {
  image?: string | null;
  alt: string;
};

function getUserColor(userId: number): string {
  return [
    "bg-blue-600",
    "bg-orange-600",
    "bg-red-600",
    "bg-teal-600",
    "bg-green-600",
    "bg-purple-600",
    "bg-yellow-600",
    "bg-pink-600",
    "bg-blue-500",
    "bg-orange-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-yellow-500",
    "bg-pink-500",
  ][userId % 16];
}

export default function Avatar({ image, alt }: AvatarProps) {
  const color = getUserColor(
    alt
      .split("")
      .reduce(
        (acc, x) => acc + (isNaN(parseInt(x, 36)) ? 0 : parseInt(x, 36)),
        0
      )
  );
  return image != null ? (
    <Image
      src={image}
      className={`rounded-full ${color} mx-2 my-auto`}
      alt={alt}
      width="64"
      height="64"
    />
  ) : (
    <div
      className={`rounded-full ${color} mx-2 my-auto h-16 w-16 px-2 py-3 text-center text-4xl`}
    >
      {alt.toUpperCase()[0]}
    </div>
  );
}
