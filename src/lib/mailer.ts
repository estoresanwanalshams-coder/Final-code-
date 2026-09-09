import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const mailFrom =
  process.env.MAIL_FROM ?? "HM Shop Online <orders@send.hmshoponline.com>";
const ownerEmail = process.env.OWNER_EMAIL ?? "";

let resendClient: Resend | null = null;

function getResendClient() {
  if (resendClient) {
    return resendClient;
  }

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY.");
  }

  resendClient = new Resend(resendApiKey);
  return resendClient;
}

export function getOwnerEmail() {
  return ownerEmail;
}

export function canSendEmail() {
  return Boolean(resendApiKey && mailFrom);
}

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(payload: MailPayload) {
  const resend = getResendClient();

  const result = await resend.emails.send({
    from: mailFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data;
}