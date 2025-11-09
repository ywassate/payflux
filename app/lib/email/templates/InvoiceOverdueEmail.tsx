import { Heading, Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface InvoiceOverdueEmailProps {
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  daysOverdue: number;
  invoiceUrl: string;
  pdfUrl: string;
}

export default function InvoiceOverdueEmail({
  invoiceNumber,
  clientName,
  totalTTC,
  dueDate,
  daysOverdue,
  invoiceUrl,
  pdfUrl,
}: InvoiceOverdueEmailProps) {
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(totalTTC);

  const formattedDate = new Date(dueDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <EmailLayout preview={`URGENT - Facture ${invoiceNumber} en retard de ${daysOverdue} jour${daysOverdue > 1 ? "s" : ""}`}>
      <Section style={urgentBanner}>
        <Text style={urgentIcon}>⚠️</Text>
        <Heading style={h1}>Facture en retard</Heading>
      </Section>

      <Text style={text}>Bonjour {clientName},</Text>

      <Text style={text}>
        Nous constatons que le paiement de votre facture{" "}
        <strong>{invoiceNumber}</strong> n'a pas encore été reçu.
      </Text>

      {/* Overdue alert box */}
      <Section style={overdueBox}>
        <Text style={overdueLabel}>⏰ Retard de paiement</Text>
        <Text style={overdueNumber}>{daysOverdue}</Text>
        <Text style={overdueText}>jour{daysOverdue > 1 ? "s" : ""}</Text>
      </Section>

      {/* Invoice details */}
      <Section style={invoiceBox}>
        <Row>
          <Column>
            <Text style={label}>Numéro de facture</Text>
            <Text style={value}>{invoiceNumber}</Text>
          </Column>
          <Column align="right">
            <Text style={label}>Montant dû</Text>
            <Text style={amount}>{formattedAmount}</Text>
          </Column>
        </Row>
        <Row style={{ marginTop: "16px" }}>
          <Column>
            <Text style={label}>Date d'échéance dépassée</Text>
            <Text style={overdueValue}>{formattedDate}</Text>
          </Column>
          <Column align="right">
            <Text style={statusLabel}>Statut</Text>
            <Section style={statusBadge}>
              <Text style={statusText}>EN RETARD</Text>
            </Section>
          </Column>
        </Row>
      </Section>

      <EmailButton href={invoiceUrl}>Régler maintenant</EmailButton>

      <Text style={text}>
        Téléchargez le{" "}
        <a href={pdfUrl} style={link}>
          PDF de la facture
        </a>{" "}
        si nécessaire.
      </Text>

      <Section style={actionBox}>
        <Text style={actionTitle}>🚨 Action requise</Text>
        <Text style={actionText}>
          Merci de régulariser cette facture dans les plus brefs délais pour
          éviter :
        </Text>
        <ul style={actionList}>
          <li style={actionListItem}>Des pénalités de retard supplémentaires</li>
          <li style={actionListItem}>L'interruption de nos services</li>
          <li style={actionListItem}>Un impact sur votre historique de paiement</li>
        </ul>
      </Section>

      <Text style={text}>
        Si vous avez déjà effectué le paiement, merci de nous en informer
        immédiatement. Si vous rencontrez des difficultés financières, nous
        vous invitons à{" "}
        <a href={`${invoiceUrl}?action=contact`} style={link}>
          nous contacter au plus vite
        </a>{" "}
        afin de trouver ensemble une solution.
      </Text>

      <Section style={contactBox}>
        <Text style={contactText}>
          📞 Notre équipe est disponible pour vous aider à régulariser cette
          situation.
        </Text>
      </Section>

      <Text style={signature}>
        Cordialement,
        <br />
        L'équipe PayFlux
      </Text>
    </EmailLayout>
  );
}

// Styles
const urgentBanner = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const urgentIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const h1 = {
  color: "#dc2626",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0",
  lineHeight: "1.3",
  textAlign: "center" as const,
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const overdueBox = {
  backgroundColor: "#fef2f2",
  border: "2px solid #fca5a5",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const overdueLabel = {
  color: "#991b1b",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const overdueNumber = {
  color: "#dc2626",
  fontSize: "64px",
  fontWeight: "700",
  lineHeight: "1",
  margin: "8px 0",
};

const overdueText = {
  color: "#991b1b",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const invoiceBox = {
  backgroundColor: "#fef2f2",
  border: "2px solid #fca5a5",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const label = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const value = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const overdueValue = {
  color: "#dc2626",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0",
};

const amount = {
  color: "#dc2626",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const statusLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
  textAlign: "right" as const,
};

const statusBadge = {
  backgroundColor: "#dc2626",
  borderRadius: "4px",
  padding: "4px 12px",
  display: "inline-block",
  margin: "0",
};

const statusText = {
  color: "#ffffff",
  fontSize: "12px",
  fontWeight: "700",
  margin: "0",
  textAlign: "center" as const,
};

const actionBox = {
  backgroundColor: "#fff7ed",
  border: "2px solid #fb923c",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const actionTitle = {
  color: "#9a3412",
  fontSize: "16px",
  fontWeight: "700",
  margin: "0 0 12px",
};

const actionText = {
  color: "#7c2d12",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0 0 12px",
};

const actionList = {
  color: "#7c2d12",
  fontSize: "15px",
  lineHeight: "22px",
  margin: "0",
  paddingLeft: "24px",
};

const actionListItem = {
  margin: "8px 0",
};

const contactBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const contactText = {
  color: "#1e40af",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
  textAlign: "center" as const,
};

const link = {
  color: "#1e40af",
  textDecoration: "underline",
};

const signature = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
