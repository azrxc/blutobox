"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Toast } from "./toast";

export function WelcomeToast() {
  const params = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [show, setShow] = useState(() => params.get("welcome") === "1");

  useEffect(() => {
    if (show) {
      router.replace("/", { scroll: false });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!show) return null;

  const name = session?.user?.name || session?.user?.email?.split("@")[0] || "back";
  return <Toast message={`Welcome back, ${name}!`} onDone={() => setShow(false)} />;
}
