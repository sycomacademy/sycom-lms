import { getCaller } from "@/packages/trpc/server";

export default async function Page() {
  const data = await (await getCaller()).user.me();
  return (
    <div>
      Home
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
