"use client";

import { signOut } from "next-auth/react";

export function LogoutButton() {
  function handleClick() {
    if (confirm("Are you sure you want to log out?")) {
      signOut({ callbackUrl: "/" });
    }
  }

  return (
    <button onClick={handleClick} className="underline transition-colors hover:text-foreground">
      Log out
    </button>
  );
}
