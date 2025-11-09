import { Heading, Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface InvoiceReminderEmailProps {
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  daysRemaining: number;
  invoiceUrl: string;
  pdfUrl: string;
}

export default function InvoiceReminderEmail({
  invoiceNumber,
  clientName,
  totalTTC,
  dueDate,
  daysRemaining,
  invoiceUrl,
  pdfUrl,
}: InvoiceReminderEmailProps) {
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
    <EmailLayout preview={`Rappel - Facture ${invoiceNumber} à échéance dans ${daysRemaining} jours`}>
      <Section style={reminderBanner}>
        <Text style={reminderIcon}>🔔</Text>
        <Heading style={h1}>Rappel d'échéance</Heading>
      </Section>

      <Text style={text}>Bonjour {clientName},</Text>

      <Text style={text}>
        Ce message est un rappel amical concernant votre facture à venir.
      </Text>

      {/* Reminder box with countdown */}
      <Section style={countdownBox}>
        <Text style={countdownLabel}>Échéance dans</Text>
        <Text style={countdownNumber}>{daysRemaining}</Text>
        <Text style={countdownText}>jour{daysRemaining > 1 ? "s" : ""}</Text>
      </Section>

      {/* Invoice details */}
      <Section style={invoiceBox}>
        <Row>
          <Column>
            <Text style={label}>Numéro de facture</Text>
            <Text style={value}>{invoiceNumber}</Text>
          </Column>
          <Column align="right">
            <Text style={label}>Montant à payer</Text>
            <Text style={amount}>{formattedAmount}</Text>
          </Column>
        </Row>
        <Row style={{ marginTop: "16px" }}>
          <Column>
            <Text style={label}>Date d'échéance</Text>
            <Text style={value}>{formattedDate}</Text>
          </Column>
        </Row>
      </Section>

      <EmailButton href={invoiceUrl}>Voir et payer la facture</EmailButton>

      <Text style={text}>
        Vous pouvez également télécharger le{" "}
        <a href={pdfUrl} style={link}>
          PDF de la facture
        </a>{" "}
        pour vos archives.
      </Text>

      <Section style={tipBox}>
        <Text style={tipText}>
          💡 <strong>Conseil :</strong> Réglez dès maintenant pour éviter tout
          retard de paiement. Votre ponctualité nous aide à maintenir un
          excellent service.
        </Text>
      </Section>

      <Text style={text}>
        Si vous avez déjà effectué le paiement, merci d'ignorer ce message. Si
        vous rencontrez des difficultés, n'hésitez pas à{" "}
        <a href={`${invoiceUrl}?action=contact`} style={link}>
          nous contacter
        </a>
        .
      </Text>

      <Text style={signature}>
        Cordialement,
        <br />
        L'équipe PayFlux
      </Text>
    </EmailLayout>
  );
}

// Styles
const reminderBanner = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const reminderIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const h1 = {
  color: "#ea580c",
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

const countdownBox = {
  backgroundColor: "#fff7ed",
  border: "2px solid #fed7aa",
  borderRadius: "12px",
  padding: "24px",
  margin: "24px 0",
  textAlign: "center" as const,
};

const countdownLabel = {
  color: "#9a3412",
  fontSize: "14px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 8px",
};

const countdownNumber = {
  color: "#ea580c",
  fontSize: "64px",
  fontWeight: "700",
  lineHeight: "1",
  margin: "8px 0",
};

const countdownText = {
  color: "#9a3412",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0",
};

const invoiceBox = {
  backgroundColor: "#f3f4f6",
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

const amount = {
  color: "#ea580c",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const tipBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const tipText = {
  color: "#1e40af",
  fontSize: "14px",
  lineHeight: "20px",
  margin: "0",
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
