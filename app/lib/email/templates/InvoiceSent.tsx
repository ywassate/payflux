import { Heading, Text, Section, Row, Column } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface InvoiceSentEmailProps {
  invoiceNumber: string;
  clientName: string;
  totalTTC: number;
  dueDate: string;
  invoiceUrl: string;
  pdfUrl: string;
}

export default function InvoiceSentEmail({
  invoiceNumber,
  clientName,
  totalTTC,
  dueDate,
  invoiceUrl,
  pdfUrl,
}: InvoiceSentEmailProps) {
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
    <EmailLayout preview={`Nouvelle facture ${invoiceNumber} - ${formattedAmount}`}>
      <Heading style={h1}>Nouvelle facture</Heading>

      <Text style={text}>Bonjour {clientName},</Text>

      <Text style={text}>
        Vous avez reçu une nouvelle facture de la part de PayFlux.
      </Text>

      {/* Invoice summary box */}
      <Section style={invoiceBox}>
        <Row>
          <Column>
            <Text style={invoiceLabel}>Numéro de facture</Text>
            <Text style={invoiceValue}>{invoiceNumber}</Text>
          </Column>
          <Column align="right">
            <Text style={invoiceLabel}>Montant à payer</Text>
            <Text style={invoiceAmount}>{formattedAmount}</Text>
          </Column>
        </Row>
        <Row style={{ marginTop: "16px" }}>
          <Column>
            <Text style={invoiceLabel}>Date d'échéance</Text>
            <Text style={invoiceValue}>{formattedDate}</Text>
          </Column>
        </Row>
      </Section>

      <EmailButton href={invoiceUrl}>Voir la facture</EmailButton>

      <Text style={text}>
        Vous pouvez également télécharger directement le{" "}
        <a href={pdfUrl} style={link}>
          PDF de la facture
        </a>
        .
      </Text>

      <Section style={infoBox}>
        <Text style={infoText}>
          💡 <strong>Conseil :</strong> Pensez à régler cette facture avant la date
          d'échéance pour éviter tout retard.
        </Text>
      </Section>

      <Text style={text}>
        Si vous avez des questions concernant cette facture, n'hésitez pas à{" "}
        <a href={`${invoiceUrl}?action=contact`} style={link}>
          contacter notre support
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
const h1 = {
  color: "#1f2937",
  fontSize: "28px",
  fontWeight: "700",
  margin: "0 0 24px",
  lineHeight: "1.3",
};

const text = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "16px 0",
};

const invoiceBox = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "24px",
  margin: "24px 0",
};

const invoiceLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 4px",
};

const invoiceValue = {
  color: "#1f2937",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0",
};

const invoiceAmount = {
  color: "#1e40af",
  fontSize: "24px",
  fontWeight: "700",
  margin: "0",
};

const infoBox = {
  backgroundColor: "#eff6ff",
  borderLeft: "4px solid #3b82f6",
  borderRadius: "4px",
  padding: "16px",
  margin: "24px 0",
};

const infoText = {
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
