import { Heading, Text, Section } from "@react-email/components";
import * as React from "react";
import EmailLayout from "./components/EmailLayout";
import EmailButton from "./components/EmailButton";

interface NewMessageEmailProps {
  recipientName: string;
  senderName: string;
  messagePreview: string;
  conversationUrl: string;
  isAdmin: boolean;
}

export default function NewMessageEmail({
  recipientName,
  senderName,
  messagePreview,
  conversationUrl,
  isAdmin,
}: NewMessageEmailProps) {
  return (
    <EmailLayout preview={`Nouveau message de ${senderName}`}>
      <Section style={notificationBanner}>
        <Text style={notificationIcon}>💬</Text>
        <Heading style={h1}>Nouveau message</Heading>
      </Section>

      <Text style={text}>Bonjour {recipientName},</Text>

      <Text style={text}>
        Vous avez reçu un nouveau message de{" "}
        <strong>{senderName}</strong>.
      </Text>

      {/* Message preview box */}
      <Section style={messageBox}>
        <Text style={messageLabel}>Aperçu du message</Text>
        <Text style={messageContent}>
          {messagePreview.length > 200
            ? `${messagePreview.substring(0, 200)}...`
            : messagePreview}
        </Text>
      </Section>

      <EmailButton href={conversationUrl}>Voir la conversation</EmailButton>

      <Section style={infoBox}>
        <Text style={infoText}>
          💡 <strong>Astuce :</strong> Répondez rapidement pour maintenir une
          bonne communication avec {isAdmin ? "votre client" : "notre équipe"}.
        </Text>
      </Section>

      <Text style={text}>
        Connectez-vous à votre espace PayFlux pour consulter le message complet
        et y répondre.
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
const notificationBanner = {
  textAlign: "center" as const,
  margin: "0 0 24px",
};

const notificationIcon = {
  fontSize: "48px",
  margin: "0 0 16px",
};

const h1 = {
  color: "#1f2937",
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

const messageBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderLeft: "4px solid #1e40af",
  borderRadius: "8px",
  padding: "20px",
  margin: "24px 0",
};

const messageLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase" as const,
  letterSpacing: "0.5px",
  margin: "0 0 12px",
};

const messageContent = {
  color: "#1f2937",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0",
  fontStyle: "italic",
  whiteSpace: "pre-wrap" as const,
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

const signature = {
  color: "#374151",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "32px 0 0",
};
