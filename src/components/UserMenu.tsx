"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LogOut } from "lucide-react";

type UserMenuProps = {
  userName: string;
  userEmail: string;
  initials: string;
  onLogout: () => void;
};

export default function UserMenu({ userName, userEmail, initials, onLogout }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const id = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!target) return;
      if (buttonRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("pointerdown", onPointerDown, { capture: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("pointerdown", onPointerDown, { capture: true } as never);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-[#7657ff] to-[#c052f4] font-semibold text-white transition hover:brightness-110"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((prev) => !prev)}
        title="Account"
      >
        {initials}
      </button>

      {open ? (
        <div
          ref={panelRef}
          id={id}
          role="menu"
          aria-label="Account menu"
          className="absolute right-0 top-[calc(100%+12px)] z-50 w-[280px] rounded-[16px] border border-border bg-popover p-3 shadow-[0_28px_80px_rgba(0,0,0,0.55)]"
        >
          <div className="rounded-[14px] border border-border bg-muted p-3">
            <p className="truncate text-sm font-semibold text-foreground">{userName}</p>
            <p className="truncate text-sm text-muted-foreground">{userEmail}</p>
          </div>

          <div className="my-3 h-px bg-border" />

          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 rounded-[12px] px-3 py-2.5 text-left text-sm font-semibold text-foreground transition hover:bg-accent"
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
          >
            <LogOut className="size-4 text-muted-foreground" />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}

