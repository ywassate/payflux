import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Img,
  Hr,
  Text,
  Link,
} from "@react-email/components";
import * as React from "react";

interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
}

export default function EmailLayout({ preview, children }: EmailLayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header with logo */}
          <Section style={header}>
            <Img
              src="https://payflux.com/logo.png"
              width="120"
              height="40"
              alt="PayFlux"
              style={logo}
            />
          </Section>

          {/* Main content */}
          <Section style={content}>{children}</Section>

          {/* Footer */}
          <Hr style={hr} />
          <Section style={footer}>
            <Text style={footerText}>
              PayFlux - Gestion de facturation professionnelle
            </Text>
            <Text style={footerText}>
              123 Rue de la Tech, 75001 Paris, France
            </Text>
            <Text style={footerLinks}>
              <Link href="https://payflux.com" style={link}>
                Site web
              </Link>
              {" • "}
              <Link href="https://payflux.com/support" style={link}>
                Support
              </Link>
              {" • "}
              <Link href="https://payflux.com/privacy" style={link}>
                Confidentialité
              </Link>
            </Text>
            <Text style={footerDisclaimer}>
              Vous recevez cet email car vous avez un compte PayFlux.
              <br />
              Si vous pensez que c'est une erreur, contactez-nous.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  maxWidth: "600px",
};

const header = {
  padding: "24px 48px",
  backgroundColor: "#1e40af",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
};

const logo = {
  margin: "0 auto",
};

const content = {
  padding: "32px 48px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  padding: "0 48px 24px",
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
  textAlign: "center" as const,
};

const footerLinks = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "8px 0",
  textAlign: "center" as const,
};

const footerDisclaimer = {
  color: "#8898aa",
  fontSize: "11px",
  lineHeight: "14px",
  margin: "16px 0 0",
  textAlign: "center" as const,
};

const link = {
  color: "#1e40af",
  textDecoration: "underline",
};
