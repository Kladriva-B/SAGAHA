import { Resend } from "resend";
import { absoluteUrl } from "@/lib/site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

function fromAddress(): string {
  return process.env.EMAIL_FROM ?? "SAGAHA <onboarding@resend.dev>";
}

function adminRecipients(): string[] {
  const raw = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_EMAIL ?? "";
  return raw
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function appOrigin(): string {
  return absoluteUrl();
}

function canSend(): boolean {
  return Boolean(resend && process.env.RESEND_API_KEY);
}

export async function sendDistributorApplicationEmails(payload: {
  applicantEmail: string;
  companyName: string;
  region: string;
  phone: string;
  notes?: string | null;
}): Promise<void> {
  const admins = adminRecipients();
  if (!canSend()) {
    console.warn("[email] RESEND_API_KEY manquant — emails non envoyés.");
    return;
  }

  const adminHtml = `
    <h2>Nouvelle candidature distributeur</h2>
    <p><strong>Société :</strong> ${escapeHtml(payload.companyName)}</p>
    <p><strong>Email :</strong> ${escapeHtml(payload.applicantEmail)}</p>
    <p><strong>Région :</strong> ${escapeHtml(payload.region)}</p>
    <p><strong>Téléphone :</strong> ${escapeHtml(payload.phone)}</p>
    ${payload.notes ? `<p><strong>Message :</strong><br/>${escapeHtml(payload.notes)}</p>` : ""}
    <p><a href="${appOrigin()}/admin/distributeurs">Ouvrir l’administration</a></p>
  `;

  if (admins.length > 0) {
    await resend!.emails.send({
      from: fromAddress(),
      to: admins,
      subject: `[SAGAHA] Candidature distributeur — ${payload.companyName}`,
      html: adminHtml,
    });
  }

  await resend!.emails.send({
    from: fromAddress(),
    to: payload.applicantEmail,
    subject: "SAGAHA — Candidature bien reçue",
    html: `
      <p>Bonjour,</p>
      <p>Nous avons bien reçu votre candidature en tant que distributeur (<strong>${escapeHtml(payload.companyName)}</strong>).</p>
      <p>Notre équipe va l’étudier. Vous recevrez un email dès que votre compte sera validé.</p>
      <p>Cordialement,<br/>SAGAHA SARL</p>
    `,
  });
}

export async function sendDistributorApprovedEmail(payload: {
  email: string;
  companyName: string;
}): Promise<void> {
  if (!canSend()) {
    console.warn("[email] RESEND_API_KEY manquant — email d’approbation non envoyé.");
    return;
  }
  await resend!.emails.send({
    from: fromAddress(),
    to: payload.email,
    subject: "SAGAHA — Compte distributeur approuvé",
    html: `
      <p>Bonjour,</p>
      <p>Votre compte distributeur <strong>${escapeHtml(payload.companyName)}</strong> a été <strong>approuvé</strong>.</p>
      <p>Vous pouvez vous connecter et accéder à votre espace : <a href="${appOrigin()}/distributeur/tableau-de-bord">${appOrigin()}/distributeur/tableau-de-bord</a></p>
      <p>Cordialement,<br/>SAGAHA SARL</p>
    `,
  });
}

const statusLabels: Record<string, string> = {
  DRAFT: "Brouillon",
  PENDING: "En attente",
  CONFIRMED: "Confirmée",
  SHIPPED: "En livraison",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
};

export async function sendAdminNewOrderEmail(payload: {
  orderId: string;
  companyName: string;
  region: string;
  totalAmount: string;
}): Promise<void> {
  const admins = adminRecipients();
  if (!canSend() || admins.length === 0) {
    if (!canSend()) console.warn("[email] RESEND_API_KEY manquant — alerte commande non envoyée.");
    return;
  }
  await resend!.emails.send({
    from: fromAddress(),
    to: admins,
    subject: `[SAGAHA] Nouvelle commande ${payload.orderId.slice(0, 8)}…`,
    html: `
      <p>Nouvelle commande en attente de traitement.</p>
      <p><strong>Distributeur :</strong> ${escapeHtml(payload.companyName)} (${escapeHtml(payload.region)})</p>
      <p><strong>Montant :</strong> ${escapeHtml(payload.totalAmount)} XAF</p>
      <p><a href="${appOrigin()}/admin/commandes">Voir les commandes</a></p>
    `,
  });
}

export async function sendOrderStatusEmail(payload: {
  email: string;
  companyName: string;
  orderId: string;
  status: string;
  totalAmount: string;
}): Promise<void> {
  if (!canSend()) {
    console.warn("[email] RESEND_API_KEY manquant — notification commande non envoyée.");
    return;
  }
  const label = statusLabels[payload.status] ?? payload.status;
  await resend!.emails.send({
    from: fromAddress(),
    to: payload.email,
    subject: `[SAGAHA] Commande ${payload.orderId.slice(0, 8)}… — ${label}`,
    html: `
      <p>Bonjour ${escapeHtml(payload.companyName)},</p>
      <p>Le statut de votre commande <strong>${escapeHtml(payload.orderId)}</strong> est maintenant : <strong>${escapeHtml(label)}</strong>.</p>
      <p>Montant : <strong>${escapeHtml(payload.totalAmount)} XAF</strong></p>
      <p>Consultez vos commandes : <a href="${appOrigin()}/distributeur/commandes">Espace distributeur</a></p>
      <p>SAGAHA SARL</p>
    `,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
