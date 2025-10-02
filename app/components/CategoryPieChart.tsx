"use client";

import { InvoiceWithDetails } from "../lib/types";
import { PieChart, FolderOpen } from "lucide-react";

interface CategoryPieChartProps {
  invoices: InvoiceWithDetails[];
}

export default function CategoryPieChart({ invoices }: CategoryPieChartProps) {
  // Grouper les factures par catégorie
  const categoryData = invoices.reduce((acc, invoice) => {
    const categoryName = invoice.category?.name || "Sans catégorie";
    if (!acc[categoryName]) {
      acc[categoryName] = { count: 0, total: 0 };
    }
    acc[categoryName].count += 1;
    acc[categoryName].total += invoice.totalTTC;
    return acc;
  }, {} as Record<string, { count: number; total: number }>);

  const categories = Object.entries(categoryData).map(([name, data]) => ({
    name,
    count: data.count,
    total: data.total,
  }));

  const totalInvoices = invoices.length;

  // Palette de couleurs moderne
  const colors = [
    { color: "#3b82f6" }, // blue-500
    { color: "#a855f7" }, // purple-500
    { color: "#10b981" }, // emerald-500
    { color: "#f59e0b" }, // amber-500
    { color: "#f43f5e" }, // rose-500
    { color: "#6366f1" }, // indigo-500
    { color: "#8b5cf6" }, // violet-500
    { color: "#84cc16" }, // lime-500
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Calculer les angles pour le diagramme circulaire
  let cumulativePercentage = 0;
  const segments = categories.map((cat, index) => {
    const percentage = (cat.count / totalInvoices) * 100;
    const startAngle = (cumulativePercentage / 100) * 360;
    cumulativePercentage += percentage;
    const endAngle = (cumulativePercentage / 100) * 360;
    const colorScheme = colors[index % colors.length];

    return {
      ...cat,
      percentage,
      startAngle,
      endAngle,
      color: colorScheme.color,
    };
  });

  // Créer les segments SVG
  const createArcPath = (
    startAngle: number,
    endAngle: number,
    radius: number
  ) => {
    const start = polarToCartesian(50, 50, radius, endAngle);
    const end = polarToCartesian(50, 50, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
      "M",
      50,
      50,
      "L",
      start.x,
      start.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
      "Z",
    ].join(" ");
  };

  const polarToCartesian = (
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  return (
    <div className="bg-card rounded-xl border border-themed p-6 h-full flex flex-col">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-primary">
          Répartition par catégories
        </h3>
        <p className="text-sm text-muted">Distribution des factures</p>
      </div>

      <div className="flex-1 flex items-center justify-center">
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted">
            <FolderOpen className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Aucune facture disponible</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Diagramme circulaire */}
            <div className="flex items-center justify-center">
              <div className="relative w-48 h-48">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full transform -rotate-180"
                >
                  {segments.map((segment, index) => (
                    <path
                      key={index}
                      d={createArcPath(
                        segment.startAngle,
                        segment.endAngle,
                        45
                      )}
                      className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                      style={{
                        fill: segment.color,
                      }}
                    />
                  ))}
                  {/* Cercle central */}
                  <circle cx="50" cy="50" r="25" className="fill-card" />
                </svg>
                {/* Centre du diagramme */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <p className="text-2xl font-bold text-primary">
                    {totalInvoices}
                  </p>
                  <p className="text-xs text-muted">Factures</p>
                </div>
              </div>
            </div>

            {/* Légende */}
            <div className="space-y-3">
              {segments.map((segment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 p-3 rounded-lg hover:bg-base-200 transition-colors"
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: segment.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary truncate">
                      {segment.name}
                    </p>
                    <p className="text-xs text-muted">
                      {segment.count} facture{segment.count > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-semibold text-primary">
                      {segment.percentage.toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted">
                      {formatCurrency(segment.total)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
