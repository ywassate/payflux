"use client";

import { useState } from "react";
import { Trash2, Shield, User as UserIcon, Mail, FileText } from "lucide-react";
import { updateUserRole, deleteUser } from "../actions";
import Image from "next/image";

interface User {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CLIENT";
  imageUrl?: string | null;
  _count: {
    invoices: number;
  };
}

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

export default function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleRoleChange = async (userId: string, newRole: "ADMIN" | "CLIENT") => {
    if (userId === currentUserId) {
      alert("Vous ne pouvez pas changer votre propre rôle !");
      return;
    }

    setLoadingId(userId);
    try {
      await updateUserRole(userId, newRole);
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
      alert("Erreur lors du changement de rôle");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (userId: string) => {
    if (userId === currentUserId) {
      alert("Vous ne pouvez pas supprimer votre propre compte !");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Toutes ses factures seront également supprimées.")) {
      return;
    }

    setLoadingId(userId);
    try {
      await deleteUser(userId);
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      alert("Erreur lors de la suppression de l'utilisateur");
    } finally {
      setLoadingId(null);
    }
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
        <UserIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg font-medium">Aucun utilisateur trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {users.map((user) => {
        const isCurrentUser = user.id === currentUserId;
        const isAdmin = user.role === "ADMIN";

        return (
          <div
            key={user.id}
            className={`relative group bg-gradient-to-r ${
              isCurrentUser
                ? "from-blue-50 to-cyan-50 border-blue-200"
                : "from-white to-gray-50 border-gray-200"
            } rounded-2xl border-2 p-6 hover:shadow-lg transition-all duration-300`}
          >
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              {/* Photo de profil et infos utilisateur */}
              <div className="flex items-center gap-4 flex-1">
                <div className="relative">
                  {user.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user.name}
                      width={64}
                      height={64}
                      className="rounded-2xl border-2 border-gray-200 shadow-md"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-gray-200">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {isCurrentUser && (
                    <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-lg shadow-lg">
                      Vous
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {user.name}
                  </h3>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4" />
                      <span>{user.email}</span>
                    </div>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <div className="flex items-center gap-1.5">
                      <FileText className="h-4 w-4" />
                      <span>{user._count.invoices} facture(s)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rôle */}
              <div className="flex items-center gap-3">
                <div className="relative group/role">
                  <div className="flex items-center gap-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isAdmin
                          ? "bg-emerald-100"
                          : "bg-purple-100"
                      }`}
                    >
                      {isAdmin ? (
                        <Shield className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <UserIcon className="h-5 w-5 text-purple-600" />
                      )}
                    </div>
                    <select
                      className={`px-4 py-2.5 border-2 rounded-xl font-semibold transition-all duration-200 outline-none focus:ring-4 ${
                        isAdmin
                          ? "border-emerald-200 text-emerald-700 bg-emerald-50 focus:border-emerald-500 focus:ring-emerald-500/20"
                          : "border-purple-200 text-purple-700 bg-purple-50 focus:border-purple-500 focus:ring-purple-500/20"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                      value={user.role}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value as "ADMIN" | "CLIENT")
                      }
                      disabled={isCurrentUser || loadingId === user.id}
                    >
                      <option value="ADMIN">Administrateur</option>
                      <option value="CLIENT">Client</option>
                    </select>
                  </div>
                </div>

                {/* Actions */}
                <button
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed group-hover:scale-105"
                  onClick={() => handleDelete(user.id)}
                  disabled={isCurrentUser || loadingId === user.id}
                  title={
                    isCurrentUser
                      ? "Vous ne pouvez pas supprimer votre propre compte"
                      : "Supprimer l'utilisateur"
                  }
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Indicateur de chargement */}
            {loadingId === user.id && (
              <div className="absolute inset-0 bg-white/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}