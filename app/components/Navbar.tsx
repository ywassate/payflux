"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import Image from "next/image";
import { checkAndAddUser, getCurrentUser } from "../actions";
import {
  Shield,
  FileText,
  LayoutDashboard,
  FolderOpen,
  Menu,
  X,
} from "lucide-react";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Factures", href: "/invoices", icon: FileText },
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
      {/* Sidebar Desktop - Design moderne */}
      <aside className="hidden lg:flex w-[280px] bg-gradient-to-b from-slate-50 to-white border-r border-gray-200 flex-col fixed h-screen shadow-lg">
        {/* Logo Header avec gradient */}
        <div className="p-6 border-b border-gray-200 bg-white">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                PayFlux
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Gestion de factures
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation avec style moderne */}
        <nav className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-2">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = isActiveLink(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                    active
                      ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                      : "text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900"
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

          {/* Section admin si applicable */}
          {isAdmin && (
            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                Administration
              </p>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                <Shield className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">
                  Accès Administrateur
                </span>
              </div>
            </div>
          )}
        </nav>

        {/* User Profile moderne */}
        {user && (
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-11 h-11 rounded-xl shadow-md",
                  },
                }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-900 truncate">
                  {user.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user.primaryEmailAddress?.emailAddress}
                </p>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg border border-emerald-200">
                    <Shield className="h-3 w-3" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Spacer pour desktop */}
      <div className="hidden lg:block w-[280px] flex-shrink-0"></div>

      {/* Header Mobile moderne */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-lg">
        <div className="flex items-center justify-between px-4 h-16">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2.5 rounded-xl hover:bg-gradient-to-r hover:from-blue-50 hover:to-cyan-50 text-gray-600 hover:text-blue-600 transition-all duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              PayFlux
            </span>
          </Link>

          <div className="rounded-xl overflow-hidden shadow-md">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Spacer pour mobile */}
      <div className="lg:hidden h-16"></div>

      {/* Mobile Menu moderne */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <aside
            className="absolute left-0 top-0 bottom-0 w-[280px] bg-gradient-to-b from-slate-50 to-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Logo Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <Link
                href="/"
                className="flex items-center gap-3 group"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    PayFlux
                  </h1>
                  <p className="text-xs text-gray-500 font-medium">
                    Gestion de factures
                  </p>
                </div>
              </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-6 overflow-y-auto">
              <div className="space-y-2">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = isActiveLink(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`group flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                        active
                          ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg shadow-blue-500/25"
                          : "text-gray-600 hover:bg-white hover:shadow-md hover:text-gray-900"
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

              {/* Section admin si applicable */}
              {isAdmin && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-3">
                    Administration
                  </p>
                  <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
                    <Shield className="h-4 w-4 text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-700">
                      Accès Administrateur
                    </span>
                  </div>
                </div>
              )}
            </nav>

            {/* User Profile */}
            {user && (
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all duration-200">
                  <UserButton
                    appearance={{
                      elements: {
                        avatarBox: "w-11 h-11 rounded-xl shadow-md",
                      },
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-gray-900 truncate">
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {user.primaryEmailAddress?.emailAddress}
                    </p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 text-xs font-semibold bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 rounded-lg border border-emerald-200">
                        <Shield className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </>
  );
};

export default Navbar;
