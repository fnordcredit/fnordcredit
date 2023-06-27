import Image from "next/image";

function ChargeMoneyButton({
  action,
  userId,
  amount,
}: {
  action: (_f: FormData) => Promise<void>;
  userId: number;
  amount: number;
}) {
  const width = amount < 500 ? 64 : 128;
  return (
    <form action={action}>
      <input type="hidden" name="id" value={userId} />
      <input type="hidden" name="amount" value={amount} />
      <button type="submit" className="m-2">
        <Image
          src={`/images/euro/${amount.toString()}.png`}
          alt={`${(amount / 100).toFixed(2).toString()}€`}
          width={width}
          height={64}
        />
      </button>
    </form>
  );
}

export default function HideChargeMoneyForm({
  action,
  userId,
}: {
  action: (_f: FormData) => Promise<void>;
  userId: number;
}) {
  return (
    <div className="flex flex-wrap">
      <ChargeMoneyButton action={action} userId={userId} amount={1} />
      <ChargeMoneyButton action={action} userId={userId} amount={2} />
      <ChargeMoneyButton action={action} userId={userId} amount={5} />
      <ChargeMoneyButton action={action} userId={userId} amount={10} />
      <ChargeMoneyButton action={action} userId={userId} amount={20} />
      <ChargeMoneyButton action={action} userId={userId} amount={50} />
      <ChargeMoneyButton action={action} userId={userId} amount={100} />
      <ChargeMoneyButton action={action} userId={userId} amount={200} />
      <ChargeMoneyButton action={action} userId={userId} amount={500} />
      <ChargeMoneyButton action={action} userId={userId} amount={1000} />
      <ChargeMoneyButton action={action} userId={userId} amount={2000} />
      <ChargeMoneyButton action={action} userId={userId} amount={5000} />
    </div>
  );
}
