import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { InvoicePDFData } from "./types";

// Styles pour le PDF
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  logo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2563eb",
  },
  invoiceTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#1e293b",
    textAlign: "right",
  },
  section: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  col: {
    width: "48%",
  },
  label: {
    fontSize: 9,
    color: "#64748b",
    marginBottom: 4,
  },
  value: {
    fontSize: 11,
    color: "#1e293b",
    fontWeight: "bold",
  },
  table: {
    marginTop: 30,
    marginBottom: 30,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    padding: 10,
    fontWeight: "bold",
    borderBottom: "2px solid #cbd5e1",
  },
  tableRow: {
    flexDirection: "row",
    padding: 10,
    borderBottom: "1px solid #e2e8f0",
  },
  tableCol1: {
    width: "50%",
  },
  tableCol2: {
    width: "15%",
    textAlign: "right",
  },
  tableCol3: {
    width: "17.5%",
    textAlign: "right",
  },
  tableCol4: {
    width: "17.5%",
    textAlign: "right",
  },
  totals: {
    marginLeft: "auto",
    width: "40%",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "8px 0",
    borderBottom: "1px solid #e2e8f0",
  },
  totalLabel: {
    fontSize: 10,
    color: "#64748b",
  },
  totalValue: {
    fontSize: 10,
    fontWeight: "bold",
  },
  grandTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: "12px 0",
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 10,
    marginTop: 5,
  },
  grandTotalLabel: {
    fontSize: 12,
    fontWeight: "bold",
  },
  grandTotalValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2563eb",
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTop: "1px solid #e2e8f0",
    fontSize: 9,
    color: "#64748b",
  },
  statusBadge: {
    padding: "5px 15px",
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 10,
  },
  notes: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    marginBottom: 5,
  },
  notesText: {
    fontSize: 9,
    color: "#64748b",
    lineHeight: 1.5,
  },
});

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(amount);
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  DRAFT: { bg: "#f1f5f9", text: "#475569" },
  APPROVED: { bg: "#dbeafe", text: "#1e40af" },
  SENT: { bg: "#e0e7ff", text: "#4338ca" },
  PARTIAL: { bg: "#fef3c7", text: "#92400e" },
  PAID: { bg: "#d1fae5", text: "#065f46" },
  OVERDUE: { bg: "#fee2e2", text: "#991b1b" },
  CANCELLED: { bg: "#f1f5f9", text: "#475569" },
  REFUNDED: { bg: "#e0e7ff", text: "#5b21b6" },
  REJECTED: { bg: "#fee2e2", text: "#991b1b" },
  PROCESSING: { bg: "#fbcfe8", text: "#831843" },
};

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "Brouillon",
  APPROVED: "Approuvée",
  SENT: "Envoyée",
  PARTIAL: "Partiellement payée",
  PAID: "Payée",
  OVERDUE: "En retard",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
  REJECTED: "Rejetée",
  PROCESSING: "En traitement",
};

export const InvoicePDFTemplate = ({
  invoice,
}: {
  invoice: InvoicePDFData;
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>PAYFLUX</Text>
        </View>
        <View>
          <Text style={styles.invoiceTitle}>FACTURE</Text>
          <Text style={{ fontSize: 12, color: "#64748b", textAlign: "right" }}>
            {invoice.invoiceNumber}
          </Text>
          <View
            style={{
              ...styles.statusBadge,
              backgroundColor: STATUS_COLORS[invoice.status]?.bg || "#f1f5f9",
              color: STATUS_COLORS[invoice.status]?.text || "#475569",
            }}
          >
            <Text>{STATUS_LABELS[invoice.status] || invoice.status}</Text>
          </View>
        </View>
      </View>

      {/* Dates */}
      <View style={[styles.section, styles.row]}>
        <View style={styles.col}>
          <Text style={styles.label}>Date d&apos;émission</Text>
          <Text style={styles.value}>{formatDate(invoice.invoiceDate)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Date d&apos;échéance</Text>
          <Text style={styles.value}>{formatDate(invoice.dueDate)}</Text>
        </View>
      </View>

      {/* Issuer and Client Info */}
      <View style={[styles.section, styles.row]}>
        <View style={styles.col}>
          <Text style={styles.label}>DE</Text>
          <Text style={styles.value}>{invoice.issuerName}</Text>
          <Text style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>
            {invoice.issuerAddress}
          </Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>POUR</Text>
          <Text style={styles.value}>{invoice.clientName}</Text>
          <Text style={{ fontSize: 9, color: "#64748b", marginTop: 4 }}>
            {invoice.clientAddress}
          </Text>
          {invoice.clientEmail && (
            <Text style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
              {invoice.clientEmail}
            </Text>
          )}
          {invoice.clientPhone && (
            <Text style={{ fontSize: 9, color: "#64748b", marginTop: 2 }}>
              {invoice.clientPhone}
            </Text>
          )}
        </View>
      </View>

      {/* Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableCol1}>Description</Text>
          <Text style={styles.tableCol2}>Quantité</Text>
          <Text style={styles.tableCol3}>Prix unitaire</Text>
          <Text style={styles.tableCol4}>Total</Text>
        </View>

        {/* Table Rows */}
        {invoice.lines.map((line, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.tableCol1}>{line.description}</Text>
            <Text style={styles.tableCol2}>{line.quantity}</Text>
            <Text style={styles.tableCol3}>
              {formatCurrency(line.unitPrice)}
            </Text>
            <Text style={styles.tableCol4}>
              {formatCurrency(line.quantity * line.unitPrice)}
            </Text>
          </View>
        ))}
      </View>

      {/* Totals */}
      <View style={styles.totals}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total HT</Text>
          <Text style={styles.totalValue}>
            {formatCurrency(invoice.totalHT)}
          </Text>
        </View>
        {invoice.vatActive && (
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>TVA ({invoice.vatRate}%)</Text>
            <Text style={styles.totalValue}>
              {formatCurrency(invoice.totalTVA)}
            </Text>
          </View>
        )}
        <View style={styles.grandTotal}>
          <Text style={styles.grandTotalLabel}>Total TTC</Text>
          <Text style={styles.grandTotalValue}>
            {formatCurrency(invoice.totalTTC)}
          </Text>
        </View>
      </View>

      {/* Notes */}
      {invoice.notes && (
        <View style={styles.notes}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{invoice.notes}</Text>
        </View>
      )}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={{ textAlign: "center" }}>
          Merci pour votre confiance | {invoice.issuerName}
        </Text>
        <Text style={{ textAlign: "center", marginTop: 5 }}>
          Document généré le {formatDate(new Date())}
        </Text>
      </View>
    </Page>
  </Document>
);
