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
      {[1, 2, 5, 10, 20, 50, 100, 200, 500, 1000, 2000, 5000].map(
        (amount, key) => (
          <ChargeMoneyButton
            action={action}
            userId={userId}
            amount={amount}
            key={key}
          />
        )
      )}
    </div>
  );
}
