"use client";

import Link from "next/link";
import { WalletCards } from "lucide-react";

type NavItem = {
    label: string;
    href: string;
    icon: React.ElementType;
    active?: boolean;
};

type SidebarProps = {
    navItems: NavItem[];
    userName?: string;
    userEmail?: string;
};

export default function Sidebar({ navItems }: SidebarProps) {
    return (
        <>
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-white/10 bg-white/5 backdrop-blur-xl lg:flex lg:flex-col">
                <div className="flex items-center gap-3 px-7 py-8">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-fintech text-white shadow-glow">
                        <WalletCards className="size-5" />
                    </div>
                    <div>
                        <p className="text-base font-bold leading-tight tracking-tight text-foreground">FinTrack</p>
                        <p className="text-sm text-muted-foreground">Personal Finance</p>
                    </div>
                </div>

                <nav className="mt-7 flex flex-1 flex-col gap-2 px-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={`group flex h-12 items-center gap-3 rounded-2xl px-4 text-left text-sm font-semibold transition-all duration-300 hover:translate-x-1 ${item.active
                                    ? "bg-gradient-fintech text-white shadow-glow"
                                    : "text-sidebar-foreground hover:bg-white/10 hover:text-foreground"
                                    }`}
                            >
                                <Icon className="size-4 transition-transform duration-300 group-hover:scale-110" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </aside>

            <nav className="fixed inset-x-3 bottom-3 z-40 flex items-center justify-between rounded-2xl border border-white/10 bg-background/80 p-2 shadow-card backdrop-blur-xl lg:hidden">
                {navItems.slice(0, 5).map((item) => {
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold transition ${item.active
                                ? "bg-primary text-primary-foreground"
                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                }`}
                        >
                            <Icon className="size-4" />
                            <span className="max-w-full truncate">{item.label.replace("Savings Goals", "Savings")}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
