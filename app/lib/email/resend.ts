import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not defined in environment variables");
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration de l'expéditeur
export const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@payflux.com";
export const FROM_NAME = "PayFlux";
export const FROM_ADDRESS = `${FROM_NAME} <${FROM_EMAIL}>`;
