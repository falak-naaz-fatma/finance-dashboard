import { Bell, Search } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import UserMenu from "@/components/UserMenu";

type HeaderProps = {
  userName: string;
  userEmail: string;
  initials: string;
  onLogout: () => void;
};

export default function Header({ userName, userEmail, initials, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/50 bg-background/80 backdrop-blur">
      <div className="flex h-[72px] items-center gap-4 px-4 sm:px-8 lg:px-10">
        <div className="relative w-full max-w-[560px] flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search transactions, categories..."
            className="h-9 w-full rounded-[12px] border border-border bg-card/80 px-10 text-sm font-normal text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/70 focus:ring-4 focus:ring-primary/10"
          />
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            type="button"
            className="relative rounded-full p-2 text-muted-foreground transition hover:bg-accent"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="size-5" />
            <span className="absolute right-1.5 top-1.5 size-2.5 rounded-full bg-danger" />
          </button>

          <ThemeToggle />
          <UserMenu
            userName={userName}
            userEmail={userEmail}
            initials={initials}
            onLogout={onLogout}
          />
        </div>
      </div>
    </header>
  );
}
