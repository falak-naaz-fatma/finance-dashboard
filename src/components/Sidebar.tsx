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

export default function Sidebar({ navItems, userName, userEmail }: SidebarProps) {
    return (
        <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-border bg-sidebar lg:flex lg:flex-col">
            <div className="flex items-center gap-3 px-7 py-8">
                <div className="flex size-11 items-center justify-center rounded-[13px] bg-gradient-to-br from-[#7657ff] to-[#c052f4] shadow-[0_0_30px_rgba(139,92,246,0.35)]">
                    <WalletCards className="size-5" />
                </div>
                <div>
                    <p className="text-sm font-semibold leading-tight">FinTrack</p>
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
                            className={`flex h-11 items-center gap-3 rounded-[14px] px-4 text-left text-sm font-medium transition ${item.active
                                ? "bg-primary/15 text-primary"
                                : "text-sidebar-foreground hover:bg-sidebar-accent"
                                }`}
                        >
                            <Icon className="size-4" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}