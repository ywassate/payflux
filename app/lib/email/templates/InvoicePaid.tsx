import { Heading, Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface InvoicePaidEmailProps {
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  paidDate: string;
  invoiceUrl: string;
  pdfUrl: string;
}

export default function InvoicePaidEmail({
  invoiceNumber,
  clientName,
  totalTTC,
  paidDate,
  invoiceUrl,
  pdfUrl,
}: InvoicePaidEmailProps) {
  const formattedAmount = new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(totalTTC);

  const formattedDate = new Date(paidDate).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <EmailLayout preview={`Paiement confirmé - Facture ${invoiceNumber}`}>
      <Section style={successBanner}>
        <Text style={successIcon}>✅</Text>
        <Heading style={h1}>Paiement confirmé !</Heading>
      </Section>

      <Text style={text}>Bonjour {clientName},</Text>

      <Text style={text}>
        Nous vous confirmons que le paiement de votre facture a bien été reçu.
      </Text>

      {/* Payment summary box */}
      <Section style={paymentBox}>
        <Row>
          <Column>
            <Text style={label}>Numéro de facture</Text>
            <Text style={value}>{invoiceNumber}</Text>
          </Column>
          <Column align="right">
            <Text style={label}>Montant payé</Text>
            <Text style={amount}>{formattedAmount}</Text>
          </Column>
        </Row>
        <Row style={{ marginTop: "16px" }}>
          <Column>
            <Text style={label}>Date de paiement</Text>
            <Text style={value}>{formattedDate}</Text>
          </Column>
          <Column align="right">
            <Text style={statusLabel}>Statut</Text>
            <Section style={statusBadge}>
              <Text style={statusText}>PAYÉE</Text>
            </Section>
          </Column>
        </Row>
      </Section>

      <EmailButton href={invoiceUrl}>Voir le reçu</EmailButton>

      <Text style={text}>
        Vous pouvez télécharger votre{" "}
        <a href={pdfUrl} style={link}>
          reçu de paiement en PDF
        </a>{" "}
        pour vos archives.
      </Text>

      <Section style={thankYouBox}>
        <Text style={thankYouText}>
          🙏 Merci pour votre confiance et votre ponctualité !
        </Text>
      </Section>

      <Text style={text}>
        Si vous avez des questions, notre équipe support reste à votre disposition.
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
const successBanner = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const successIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const h1 = {
  color: "#059669",
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

const paymentBox = {
  backgroundColor: "#f0fdf4",
  border: "2px solid #86efac",
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
  color: "#059669",
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
  backgroundColor: "#059669",
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

const thankYouBox = {
  backgroundColor: "#fef3c7",
  borderLeft: "4px solid #f59e0b",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const thankYouText = {
  color: "#92400e",
  fontSize: "16px",
  lineHeight: "24px",
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
