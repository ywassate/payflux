"use client";

import { useState } from "react";
import { Bell, Moon, Sun, Settings, Menu } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { useTheme } from "../contexts/ThemeContext";

export default function TopNavbar({
  onToggleSidebar,
}: {
  onToggleSidebar?: () => void;
}) {
  const { theme, toggleTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  // Notifications mockées - à remplacer par de vraies données plus tard
  const notifications = [
    {
      id: 1,
      type: "payment",
      message: "Facture #INV-2025-001 payée",
      time: "Il y a 5 min",
      read: false,
    },
    {
      id: 2,
      type: "alert",
      message: "Facture #INV-2025-003 en retard",
      time: "Il y a 1 heure",
      read: false,
    },
    {
      id: 3,
      type: "info",
      message: "Nouveau message client",
      time: "Il y a 2 heures",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-navbar border-b border-themed z-40 shadow-sm transition-colors duration-200">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Hamburger menu à gauche */}
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl hover:bg-base-200 transition-all duration-200"
          title="Menu"
        >
          <Menu className="h-6 w-6 text-secondary" />
        </button>

        {/* Icônes à droite */}
        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl hover:bg-base-200 transition-all duration-200 relative group"
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-secondary" />
            ) : (
              <Moon className="h-5 w-5 text-secondary" />
            )}
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-base-300 text-base-content text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              {theme === "dark" ? "Mode clair" : "Mode sombre"}
            </span>
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-xl hover:bg-base-200 transition-all duration-200 relative"
              title="Notifications"
            >
              <Bell className="h-5 w-5 text-secondary" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Dropdown notifications */}
            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-card rounded-xl border border-themed shadow-xl z-20 overflow-hidden">
                  <div className="p-4 border-b border-themed bg-base-200">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-primary">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                          {unreadCount} nouveaux
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-muted">
                        <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Aucune notification</p>
                      </div>
                    ) : (
                      <div className="divide-y border-themed">
                        {notifications.map((notif) => (
                          <Link
                            key={notif.id}
                            href="/notifications"
                            className={`block p-4 hover:bg-base-200 transition-colors ${
                              !notif.read ? "bg-base-200" : ""
                            }`}
                            onClick={() => setShowNotifications(false)}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                                  notif.type === "payment"
                                    ? "bg-green-500"
                                    : notif.type === "alert"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                }`}
                              />
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-sm ${
                                    !notif.read
                                      ? "font-semibold text-primary"
                                      : "text-secondary"
                                  }`}
                                >
                                  {notif.message}
                                </p>
                                <p className="text-xs text-muted mt-1">
                                  {notif.time}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-themed bg-base-200">
                    <Link
                      href="/notifications"
                      className="block text-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                      onClick={() => setShowNotifications(false)}
                    >
                      Voir toutes les notifications
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Settings */}
          <Link
            href="/settings"
            className="p-2.5 rounded-xl hover:bg-base-200 transition-all duration-200 relative group"
            title="Paramètres"
          >
            <Settings className="h-5 w-5 text-secondary" />
            <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-base-300 text-base-content text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
              Paramètres
            </span>
          </Link>

          {/* Separator */}
          <div className="h-8 w-px bg-border" />

          {/* User Button from Clerk */}
          <div className="flex items-center gap-2">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-9 h-9 rounded-xl",
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
