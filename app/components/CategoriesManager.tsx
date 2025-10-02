"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, FolderOpen } from "lucide-react";
import { createCategory } from "../actions";

interface Category {
  id: string;
  name: string;
  description: string | null;
  _count: {
    invoices: number;
  };
}

interface CategoriesManagerProps {
  categories: Category[];
}

export default function CategoriesManager({
  categories: initialCategories,
}: CategoriesManagerProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await createCategory(name, description || undefined);
      setName("");
      setDescription("");
      setIsModalOpen(false);
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la création:", error);
      alert("Erreur lors de la création de la catégorie");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Stats modernes */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <FolderOpen className="h-6 w-6 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Total
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {initialCategories.length}
          </div>
          <div className="text-sm text-gray-600">Catégories créées</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <FolderOpen className="h-6 w-6 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Utilisées
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {initialCategories.filter((c) => c._count.invoices > 0).length}
          </div>
          <div className="text-sm text-gray-600">Catégories actives</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-100 rounded-xl">
              <FolderOpen className="h-6 w-6 text-amber-600" />
            </div>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Vides
            </span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-1">
            {initialCategories.filter((c) => c._count.invoices === 0).length}
          </div>
          <div className="text-sm text-gray-600">Sans factures</div>
        </div>
      </div>

      {/* Liste des catégories */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-8 py-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Liste des catégories
              </h2>
              <p className="text-gray-600 mt-1">
                Gérez vos catégories de factures
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-700 hover:to-orange-600 rounded-xl font-semibold shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="h-5 w-5" />
              Nouvelle catégorie
            </button>
          </div>
        </div>

        <div className="p-8">
          {initialCategories.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border-2 border-dashed border-gray-300">
              <FolderOpen className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg font-medium mb-6">
                Aucune catégorie créée
              </p>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white hover:from-amber-700 hover:to-orange-600 rounded-xl font-semibold shadow-lg shadow-amber-500/25 transition-all duration-200"
              >
                Créer la première catégorie
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {initialCategories.map((category) => (
                <div
                  key={category.id}
                  className="group bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border-2 border-gray-200 hover:border-amber-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-amber-100 to-orange-100 rounded-xl group-hover:scale-110 transition-transform duration-300">
                        <FolderOpen className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {category.name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 bg-amber-500 rounded-full"></span>
                          {category._count.invoices} facture(s)
                        </p>
                      </div>
                    </div>
                  </div>

                  {category.description && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                    <button className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2">
                      <Edit2 className="h-4 w-4" />
                      Modifier
                    </button>
                    <button
                      className="flex-1 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={category._count.invoices > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal de création moderne */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300">
            {/* Header du modal */}
            <div className="bg-gradient-to-r from-amber-600 to-orange-500 px-8 py-6 text-white">
              <h3 className="text-2xl font-bold">
                Nouvelle catégorie
              </h3>
              <p className="text-amber-100 text-sm mt-1">
                Créez une nouvelle catégorie pour vos factures
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="relative group">
                <input
                  type="text"
                  id="categoryName"
                  className="peer w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none placeholder-transparent"
                  placeholder="Nom de la catégorie"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                />
                <label
                  htmlFor="categoryName"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-semibold text-gray-600 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-amber-600 peer-focus:font-semibold"
                >
                  Nom de la catégorie *
                </label>
              </div>

              <div className="relative group">
                <textarea
                  id="categoryDescription"
                  className="peer w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none placeholder-transparent resize-none"
                  placeholder="Description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                <label
                  htmlFor="categoryDescription"
                  className="absolute left-4 -top-2.5 bg-white px-2 text-sm font-semibold text-gray-600 transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-amber-600 peer-focus:font-semibold"
                >
                  Description (optionnelle)
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  className="flex-1 px-6 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
                  onClick={() => {
                    setIsModalOpen(false);
                    setName("");
                    setDescription("");
                  }}
                  disabled={loading}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-500 text-white font-semibold rounded-xl hover:from-amber-700 hover:to-orange-600 shadow-lg shadow-amber-500/25 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !name.trim()}
                >
                  {loading ? "Création..." : "Créer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
