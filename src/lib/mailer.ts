import nodemailer from "nodemailer";

const smtpHost = process.env.SMTP_HOST ?? process.env.ZOHO_SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT ?? process.env.ZOHO_SMTP_PORT ?? "587");
const smtpSecure =
  (process.env.SMTP_SECURE ?? process.env.ZOHO_SMTP_SECURE ?? "false") === "true";
const smtpAuthMethod =
  process.env.SMTP_AUTH_METHOD ?? process.env.ZOHO_SMTP_AUTH_METHOD;
const smtpUser = process.env.SMTP_USER ?? process.env.ZOHO_SMTP_USER;
const smtpPass = process.env.SMTP_PASS ?? process.env.ZOHO_SMTP_PASS;
const mailFrom =
  process.env.MAIL_FROM ?? process.env.ZOHO_MAIL_FROM ?? smtpUser;
const ownerEmail = process.env.OWNER_EMAIL ?? process.env.ZOHO_OWNER_EMAIL;

let cachedTransporter: nodemailer.Transporter | null = null;

export function getOwnerEmail() {
  return ownerEmail ?? "";
}

export function canSendEmail() {
  return Boolean(smtpHost && smtpUser && smtpPass && mailFrom);
}

function isGmailUser(user: string) {
  return /@gmail\.com$/i.test(user.trim());
}

function resolveSmtpHost(user: string, host: string) {
  const trimmedHost = host.trim().toLowerCase();
  if (isGmailUser(user) && trimmedHost.includes("zoho")) {
    return "smtp.gmail.com";
  }
  return host;
}

function normalizePortAndSecure(host: string, port: number, secure: boolean) {
  const isGmail = host.toLowerCase().includes("gmail.com");
  if (isGmail) {
    if (port === 465) {
      return { port: 465, secure: true };
    }
    return { port: 587, secure: false };
  }

  // For any SMTP host, 465 should use secure=true.
  if (port === 465 && !secure) {
    return { port, secure: true };
  }

  return { port, secure };
}

function getTransporter() {
  if (cachedTransporter) {
    return cachedTransporter;
  }

  if (!canSendEmail()) {
    throw new Error("Missing SMTP configuration.");
  }

  const resolvedHost = resolveSmtpHost(smtpUser!, smtpHost!);
  const normalized = normalizePortAndSecure(resolvedHost, smtpPort, smtpSecure);
  const authMethod =
    resolvedHost.toLowerCase().includes("gmail.com") ? undefined : smtpAuthMethod;

  cachedTransporter = nodemailer.createTransport({
    host: resolvedHost,
    port: normalized.port,
    secure: normalized.secure,
    authMethod,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      servername: resolvedHost,
      minVersion: "TLSv1.2",
    },
  });

  return cachedTransporter;
}

type MailPayload = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

export async function sendMail(payload: MailPayload) {
  const transporter = getTransporter();
  await transporter.sendMail({
    from: mailFrom,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}
