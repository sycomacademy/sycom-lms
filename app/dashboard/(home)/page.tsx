"use client";
import { useUserQuery } from "@/packages/hooks/use-user";

export default function Page() {
  const data = useUserQuery();
  return (
    <div>
      Home
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
