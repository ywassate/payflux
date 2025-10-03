"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { checkAndAddUser, getCurrentUser } from "../actions";
import {
  Shield,
  FileText,
  FolderOpen,
  MessageSquare,
} from "lucide-react";

interface NavbarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navbar = ({ isOpen, onClose }: NavbarProps) => {
  const pathname = usePathname();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);

  const navLinks = [
    { label: "Factures", href: "/invoices", icon: FileText },
    { label: "Chat", href: "/chat", icon: MessageSquare },
    ...(isAdmin
      ? [
          { label: "Catégories", href: "/admin/categories", icon: FolderOpen },
          { label: "Utilisateurs", href: "/admin/users", icon: Shield },
        ]
      : []),
  ];

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user.fullName) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName);
    }
  }, [user]);

  useEffect(() => {
    const checkUserRole = async () => {
      if (user?.id) {
        const userData = await getCurrentUser(user.id);
        setIsAdmin(userData?.role === "ADMIN");
      }
    };
    checkUserRole();
  }, [user?.id]);

  const isActiveLink = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Sidebar - Caché par défaut, s'ouvre au clic du hamburger */}
      <aside
        className={`fixed top-16 left-0 bottom-0 w-[280px] bg-sidebar border-r border-themed flex flex-col z-40 shadow-lg transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Header */}
        <div className="p-6">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600">PayFlux</h1>
              <p className="text-xs text-muted font-medium">
                Gestion de factures
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation avec style moderne */}
        <nav className="flex-1 px-6 pb-6 overflow-y-auto">
          <div className="space-y-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActiveLink(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                      : "text-secondary hover:bg-base-200 hover:shadow-md hover:text-primary"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 transition-transform duration-200 ${
                      active ? "" : "group-hover:scale-110"
                    }`}
                  />
                  <span className="text-sm">{label}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Profile moderne */}
        {user && (
          <div className="p-6 border-t border-themed">
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-xl">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-11 h-11 rounded-xl shadow-md",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-primary truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-muted truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-200">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Navbar;
