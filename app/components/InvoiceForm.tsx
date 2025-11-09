"use client";

import { useState } from "react";
import { InvoiceLifecycle, InvoicePaymentStatus } from "@prisma/client";
import { Plus, Trash2, Save, Download, Eye, Calendar, User, Building2, Info } from "lucide-react";
import { LIFECYCLE_LABELS, PAYMENT_STATUS_LABELS } from "../lib/types";
import { createInvoice } from "../invoices/new/actions";
import { updateInvoiceAction } from "../invoices/[id]/actions";

interface InvoiceLine {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface InvoiceFormData {
  id?: string;
  name: string;
  issuerName: string;
  issuerAddress: string;
  clientName: string;
  clientAddress: string;
  clientEmail: string;
  clientPhone: string;
  invoiceDate: string;
  dueDate: string;
  vatActive: boolean;
  vatRate: number;
  lifecycle: InvoiceLifecycle;
  paymentStatus: InvoicePaymentStatus;
  notes: string;
  categoryId: string;
  lines: InvoiceLine[];
}

interface InvoiceFormProps {
  initialData?: Partial<InvoiceFormData>;
  categories: { id: string; name: string }[];
  invoiceId?: string;
}

export default function InvoiceForm({
  initialData,
  categories,
  invoiceId,
}: InvoiceFormProps) {
  const [formData, setFormData] = useState<InvoiceFormData>({
    name: initialData?.name || "",
    issuerName: initialData?.issuerName || "",
    issuerAddress: initialData?.issuerAddress || "",
    clientName: initialData?.clientName || "",
    clientAddress: initialData?.clientAddress || "",
    clientEmail: initialData?.clientEmail || "",
    clientPhone: initialData?.clientPhone || "",
    invoiceDate:
      initialData?.invoiceDate ||
      new Date().toISOString().split("T")[0],
    dueDate:
      initialData?.dueDate ||
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
    vatActive: initialData?.vatActive ?? false,
    vatRate: initialData?.vatRate || 20,
    lifecycle: initialData?.lifecycle || InvoiceLifecycle.DRAFT,
    paymentStatus: initialData?.paymentStatus || InvoicePaymentStatus.PENDING,
    notes: initialData?.notes || "",
    categoryId: initialData?.categoryId || "",
    lines: initialData?.lines || [
      { description: "", quantity: 1, unitPrice: 0 },
    ],
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof InvoiceFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLineChange = (
    index: number,
    field: keyof InvoiceLine,
    value: any
  ) => {
    const newLines = [...formData.lines];
    newLines[index] = { ...newLines[index], [field]: value };
    setFormData((prev) => ({ ...prev, lines: newLines }));
  };

  const addLine = () => {
    setFormData((prev) => ({
      ...prev,
      lines: [...prev.lines, { description: "", quantity: 1, unitPrice: 0 }],
    }));
  };

  const removeLine = (index: number) => {
    if (formData.lines.length > 1) {
      const newLines = formData.lines.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, lines: newLines }));
    }
  };

  const calculateTotals = () => {
    const totalHT = formData.lines.reduce(
      (sum, line) => sum + line.quantity * line.unitPrice,
      0
    );
    const totalTVA = formData.vatActive ? (totalHT * formData.vatRate) / 100 : 0;
    const totalTTC = totalHT + totalTVA;
    return { totalHT, totalTVA, totalTTC };
  };

  const { totalHT, totalTVA, totalTTC } = calculateTotals();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (invoiceId) {
        await updateInvoiceAction(invoiceId, formData);
      } else {
        await createInvoice(formData);
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      alert("Erreur lors de la sauvegarde de la facture");
      setLoading(false);
    }
  };

  const handleGeneratePDF = () => {
    if (invoiceId) {
      window.open(`/api/invoices/${invoiceId}/pdf`, "_blank");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-7xl mx-auto">
      {/* Header avec actions - Design moderne */}
      <div className="bg-blue-600 rounded-2xl shadow-xl p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              {invoiceId ? "Modifier la facture" : "Nouvelle facture"}
            </h2>
            <p className="text-blue-100">
              Complétez les informations ci-dessous pour créer votre facture
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {invoiceId && (
              <>
                <button
                  type="button"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  onClick={handleGeneratePDF}
                >
                  <Eye className="h-4 w-4" />
                  Aperçu
                </button>
                <a
                  href={`/api/invoices/${invoiceId}/pdf`}
                  target="_blank"
                  className="px-4 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl font-medium transition-all duration-200 flex items-center gap-2"
                  download
                >
                  <Download className="h-4 w-4" />
                  Télécharger
                </a>
              </>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 bg-card text-blue-600 hover:bg-base-200 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
              disabled={loading}
            >
              <Save className="h-5 w-5" />
              {loading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </div>
      </div>

      {/* Informations générales - Design moderne avec inputs flottants */}
      <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden">
        <div className="bg-base-200 px-8 py-6 border-b border-themed">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/25">
              <Info className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-primary">
                Informations générales
              </h3>
              <p className="text-sm text-secondary">Détails de la facture</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="relative group">
              <input
                type="text"
                id="name"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none placeholder-transparent"
                value={formData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                placeholder="Nom de la facture"
                required
              />
              <label
                htmlFor="name"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-blue-600 peer-focus:font-semibold"
              >
                Nom de la facture *
              </label>
            </div>

            <div className="relative group">
              <select
                id="category"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none appearance-none bg-card"
                value={formData.categoryId}
                onChange={(e) => handleChange("categoryId", e.target.value)}
              >
                <option value="">Aucune catégorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <label
                htmlFor="category"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
              >
                Catégorie
              </label>
            </div>

            <div className="relative group">
              <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-muted pointer-events-none z-10" />
              <input
                type="date"
                id="invoiceDate"
                className="peer w-full pl-12 pr-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none"
                value={formData.invoiceDate}
                onChange={(e) => handleChange("invoiceDate", e.target.value)}
                required
              />
              <label
                htmlFor="invoiceDate"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
              >
                Date d'émission *
              </label>
            </div>

            <div className="relative group">
              <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-muted pointer-events-none z-10" />
              <input
                type="date"
                id="dueDate"
                className="peer w-full pl-12 pr-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
              />
              <label
                htmlFor="dueDate"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
              >
                Date d'échéance *
              </label>
            </div>

            <div className="relative group">
              <select
                id="lifecycle"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none appearance-none bg-card"
                value={formData.lifecycle}
                onChange={(e) =>
                  handleChange("lifecycle", e.target.value as InvoiceLifecycle)
                }
              >
                {Object.entries(LIFECYCLE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <label
                htmlFor="lifecycle"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
              >
                Cycle de vie
              </label>
            </div>

            <div className="relative group">
              <select
                id="paymentStatus"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 outline-none appearance-none bg-card"
                value={formData.paymentStatus}
                onChange={(e) =>
                  handleChange("paymentStatus", e.target.value as InvoicePaymentStatus)
                }
              >
                {Object.entries(PAYMENT_STATUS_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <label
                htmlFor="paymentStatus"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
              >
                Statut de paiement
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Émetteur et Client côte à côte - Design moderne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Émetteur */}
        <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-base-200 px-8 py-6 border-b border-themed">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-green-500 rounded-xl shadow-lg shadow-green-500/25">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Émetteur</h3>
                <p className="text-sm text-secondary">Vos informations</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="relative group">
              <input
                type="text"
                id="issuerName"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 outline-none placeholder-transparent"
                value={formData.issuerName}
                onChange={(e) => handleChange("issuerName", e.target.value)}
                placeholder="Nom de l'entreprise"
                required
              />
              <label
                htmlFor="issuerName"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:font-semibold"
              >
                Nom de l'entreprise *
              </label>
            </div>

            <div className="relative group">
              <textarea
                id="issuerAddress"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-green-500 focus:ring-4 focus:ring-green-500/10 transition-all duration-200 outline-none placeholder-transparent resize-none"
                value={formData.issuerAddress}
                onChange={(e) => handleChange("issuerAddress", e.target.value)}
                rows={4}
                placeholder="Adresse de l'entreprise"
                required
              />
              <label
                htmlFor="issuerAddress"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-green-600 peer-focus:font-semibold"
              >
                Adresse complète *
              </label>
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden hover:shadow-md transition-shadow duration-300">
          <div className="bg-base-200 px-8 py-6 border-b border-themed">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-purple-500 rounded-xl shadow-lg shadow-purple-500/25">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary">Client</h3>
                <p className="text-sm text-secondary">Informations du client</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="relative group">
              <input
                type="text"
                id="clientName"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none placeholder-transparent"
                value={formData.clientName}
                onChange={(e) => handleChange("clientName", e.target.value)}
                placeholder="Nom du client"
                required
              />
              <label
                htmlFor="clientName"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-600 peer-focus:font-semibold"
              >
                Nom du client *
              </label>
            </div>

            <div className="relative group">
              <textarea
                id="clientAddress"
                className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none placeholder-transparent resize-none"
                value={formData.clientAddress}
                onChange={(e) => handleChange("clientAddress", e.target.value)}
                rows={4}
                placeholder="Adresse du client"
                required
              />
              <label
                htmlFor="clientAddress"
                className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-600 peer-focus:font-semibold"
              >
                Adresse complète *
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="relative group">
                <input
                  type="email"
                  id="clientEmail"
                  className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none placeholder-transparent"
                  value={formData.clientEmail}
                  onChange={(e) => handleChange("clientEmail", e.target.value)}
                  placeholder="Email"
                />
                <label
                  htmlFor="clientEmail"
                  className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-600 peer-focus:font-semibold"
                >
                  Email
                </label>
              </div>
              <div className="relative group">
                <input
                  type="tel"
                  id="clientPhone"
                  className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all duration-200 outline-none placeholder-transparent"
                  value={formData.clientPhone}
                  onChange={(e) => handleChange("clientPhone", e.target.value)}
                  placeholder="Téléphone"
                />
                <label
                  htmlFor="clientPhone"
                  className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary transition-all duration-200 peer-placeholder-shown:text-base peer-placeholder-shown:text-muted peer-placeholder-shown:top-3.5 peer-focus:-top-2.5 peer-focus:text-sm peer-focus:text-purple-600 peer-focus:font-semibold"
                >
                  Téléphone
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lignes de facture - Design moderne avec table élégante */}
      <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden">
        <div className="bg-base-200 px-8 py-6 border-b border-themed">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-primary">Lignes de facture</h3>
              <p className="text-sm text-secondary">Détails des prestations</p>
            </div>
            <button
              type="button"
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-medium shadow-lg shadow-amber-500/25 transition-all duration-200 flex items-center gap-2"
              onClick={addLine}
            >
              <Plus className="h-5 w-5" />
              Ajouter une ligne
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="p-6">
            <div className="space-y-4">
              {formData.lines.map((line, index) => (
                <div
                  key={index}
                  className="relative grid grid-cols-12 gap-4 p-4 bg-base-200 hover:bg-card-hover rounded-xl border border-themed transition-all duration-200 group"
                >
                  <div className="col-span-12 md:col-span-5">
                    <div className="relative">
                      <input
                        type="text"
                        className="w-full px-4 py-2.5 border-2 border-themed rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none"
                        value={line.description}
                        onChange={(e) =>
                          handleLineChange(index, "description", e.target.value)
                        }
                        placeholder="Description du service/produit"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border-2 border-themed rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none text-center"
                      value={line.quantity}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "quantity",
                          parseInt(e.target.value) || 0
                        )
                      }
                      min="0"
                      placeholder="Qté"
                      required
                    />
                  </div>

                  <div className="col-span-4 md:col-span-2">
                    <input
                      type="number"
                      className="w-full px-4 py-2.5 border-2 border-themed rounded-lg focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all duration-200 outline-none text-right"
                      value={line.unitPrice}
                      onChange={(e) =>
                        handleLineChange(
                          index,
                          "unitPrice",
                          parseFloat(e.target.value) || 0
                        )
                      }
                      min="0"
                      step="0.01"
                      placeholder="Prix"
                      required
                    />
                  </div>

                  <div className="col-span-3 md:col-span-2 flex items-center justify-end">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(line.quantity * line.unitPrice)}
                    </span>
                  </div>

                  <div className="col-span-1 md:col-span-1 flex items-center justify-center">
                    <button
                      type="button"
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => removeLine(index)}
                      disabled={formData.lines.length === 1}
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* TVA et Totaux - Design moderne */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* TVA */}
        <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden">
          <div className="bg-base-200 px-8 py-6 border-b border-themed">
            <h3 className="text-xl font-bold text-primary">Configuration TVA</h3>
            <p className="text-sm text-secondary">Taxe sur la valeur ajoutée</p>
          </div>

          <div className="p-8 space-y-6">
            <label className="flex items-center gap-4 p-4 bg-base-200 rounded-xl cursor-pointer border-2 border-transparent hover:border-indigo-200 transition-all duration-200">
              <input
                type="checkbox"
                className="w-6 h-6 rounded-lg border-2 border-themed text-indigo-600 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
                checked={formData.vatActive}
                onChange={(e) => handleChange("vatActive", e.target.checked)}
              />
              <div>
                <span className="font-semibold text-primary block">Activer la TVA</span>
                <span className="text-sm text-secondary">Appliquer la taxe sur cette facture</span>
              </div>
            </label>

            {formData.vatActive && (
              <div className="relative group animate-in fade-in duration-300">
                <input
                  type="number"
                  id="vatRate"
                  className="peer w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 outline-none"
                  value={formData.vatRate}
                  onChange={(e) =>
                    handleChange("vatRate", parseFloat(e.target.value) || 0)
                  }
                  min="0"
                  step="0.1"
                />
                <label
                  htmlFor="vatRate"
                  className="absolute left-4 -top-2.5 bg-card px-2 text-sm font-semibold text-secondary"
                >
                  Taux de TVA (%)
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Totaux */}
        <div className="bg-blue-500 rounded-2xl shadow-xl p-8 text-white">
          <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
            Totaux
            <span className="text-blue-100 text-sm font-normal">Récapitulatif</span>
          </h3>

          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-white/20">
              <span className="text-blue-100 font-medium">Total HT</span>
              <span className="text-2xl font-bold">
                {formatCurrency(totalHT)}
              </span>
            </div>

            {formData.vatActive && (
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-blue-100 font-medium">TVA ({formData.vatRate}%)</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(totalTVA)}
                </span>
              </div>
            )}

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex justify-between items-center">
                <div>
                  <span className="text-blue-100 text-sm uppercase tracking-wide">Total à payer</span>
                  <span className="block text-3xl font-black mt-1">
                    {formatCurrency(totalTTC)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notes - Design moderne */}
      <div className="bg-card rounded-2xl shadow-sm border border-themed overflow-hidden">
        <div className="bg-base-200 px-8 py-6 border-b border-themed">
          <h3 className="text-xl font-bold text-primary">Notes additionnelles</h3>
          <p className="text-sm text-secondary">Conditions, mentions légales...</p>
        </div>

        <div className="p-8">
          <textarea
            className="w-full px-4 py-3.5 border-2 border-themed rounded-xl focus:border-slate-500 focus:ring-4 focus:ring-slate-500/10 transition-all duration-200 outline-none resize-none"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={5}
            placeholder="Ajoutez ici vos conditions de paiement, mentions légales ou toute autre remarque..."
          />
        </div>
      </div>
    </form>
  );
}