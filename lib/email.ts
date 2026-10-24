// Sends transactional emails via Resend. Everything here is a no-op when
// RESEND_API_KEY or NOTIFICATION_EMAIL aren't set, so the app keeps running
// without email configured.

import { Resend } from "resend";
import { formatMoney } from "./pricing";
import type { BookingRequest } from "./db";
import { getListing, POLICIES } from "./listings";

export function emailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY && process.env.NOTIFICATION_EMAIL);
}

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function fromAddress(): string {
  // Resend uses onboarding@resend.dev for testing without a verified domain.
  // Set EMAIL_FROM once a sender domain is verified in Resend.
  return process.env.EMAIL_FROM || "Hill Hangout <onboarding@resend.dev>";
}

function listingName(slug: string): string {
  return getListing(slug)?.name ?? slug;
}

function fmtDate(d: string): string {
  return d.slice(0, 10);
}

type MinimalRequest = Pick<
  BookingRequest,
  | "id"
  | "listing_slug"
  | "check_in"
  | "check_out"
  | "guests"
  | "bringing_pet"
  | "name"
  | "email"
  | "phone"
  | "purpose"
  | "total"
>;

/** Notify the host when a new request comes in. */
export async function notifyHostNewRequest(r: MinimalRequest): Promise<void> {
  const c = client();
  const to = process.env.NOTIFICATION_EMAIL;
  if (!c || !to) return;
  await c.emails
    .send({
      from: fromAddress(),
      to,
      subject: `New booking request: ${listingName(r.listing_slug)} ${fmtDate(r.check_in)}`,
      text: [
        `New request for ${listingName(r.listing_slug)}.`,
        ``,
        `Dates: ${fmtDate(r.check_in)} → ${fmtDate(r.check_out)}`,
        `Guests: ${r.guests}${r.bringing_pet ? " (bringing pet)" : ""}`,
        `Total: ${formatMoney(parseFloat(String(r.total)))}`,
        ``,
        `Guest: ${r.name}`,
        `Email: ${r.email}`,
        `Phone: ${r.phone}`,
        r.purpose ? `About: ${r.purpose}` : ``,
        ``,
        `Approve or reject from the admin page.`,
      ]
        .filter(Boolean)
        .join("\n"),
    })
    .catch((err) => {
      console.error("notifyHostNewRequest failed", err);
    });
}

/** Confirm to the guest that we got their request. */
export async function emailGuestRequestReceived(
  r: MinimalRequest,
): Promise<void> {
  const c = client();
  if (!c) return;
  await c.emails
    .send({
      from: fromAddress(),
      to: r.email,
      subject: `We got your request for ${listingName(r.listing_slug)}`,
      text: [
        `Hi ${r.name},`,
        ``,
        `Thanks for your request to stay at ${listingName(r.listing_slug)} from ${fmtDate(r.check_in)} to ${fmtDate(r.check_out)}.`,
        ``,
        `We'll get back to you within ${POLICIES.approvalWindowHours} hours. If the dates work, you'll get a secure payment link.`,
        ``,
        `Hill Hangout`,
      ].join("\n"),
    })
    .catch((err) => {
      console.error("emailGuestRequestReceived failed", err);
    });
}

/** When host approves, send guest the payment link. */
export async function emailGuestApproved(
  r: MinimalRequest,
  paymentUrl: string | null,
): Promise<void> {
  const c = client();
  if (!c) return;
  const body = paymentUrl
    ? [
        `Hi ${r.name},`,
        ``,
        `Good news: your dates at ${listingName(r.listing_slug)} are approved.`,
        ``,
        `Total: ${formatMoney(parseFloat(String(r.total)))}`,
        ``,
        `Pay here to lock it in (card, Apple Pay, Google Pay, Cash App, or ACH):`,
        paymentUrl,
        ``,
        `This link holds the dates for 24 hours. After that we may release them.`,
        ``,
        `Hill Hangout`,
      ]
    : [
        `Hi ${r.name},`,
        ``,
        `Good news: your dates at ${listingName(r.listing_slug)} are approved. We'll send a payment link shortly.`,
        ``,
        `Hill Hangout`,
      ];
  await c.emails
    .send({
      from: fromAddress(),
      to: r.email,
      subject: `Approved: ${listingName(r.listing_slug)} ${fmtDate(r.check_in)} to ${fmtDate(r.check_out)}`,
      text: body.join("\n"),
    })
    .catch((err) => {
      console.error("emailGuestApproved failed", err);
    });
}

/** When host rejects. */
export async function emailGuestRejected(r: MinimalRequest): Promise<void> {
  const c = client();
  if (!c) return;
  await c.emails
    .send({
      from: fromAddress(),
      to: r.email,
      subject: `About your request for ${listingName(r.listing_slug)}`,
      text: [
        `Hi ${r.name},`,
        ``,
        `Thanks for your interest in Hill Hangout. Unfortunately those dates don't work for us this time.`,
        ``,
        `If your plans are flexible, let us know and we'll do our best to find another window that fits.`,
        ``,
        `Hill Hangout`,
      ].join("\n"),
    })
    .catch((err) => {
      console.error("emailGuestRejected failed", err);
    });
}

/** When Stripe webhook marks paid, confirm to guest and alert host. */
export async function emailBookingPaid(r: MinimalRequest): Promise<void> {
  const c = client();
  if (!c) return;
  await Promise.all([
    c.emails
      .send({
        from: fromAddress(),
        to: r.email,
        subject: `Payment received — see you ${fmtDate(r.check_in)}`,
        text: [
          `Hi ${r.name},`,
          ``,
          `Payment received for ${listingName(r.listing_slug)}, ${fmtDate(r.check_in)} to ${fmtDate(r.check_out)}.`,
          ``,
          `We'll send check-in details (door code, Wi-Fi, parking) the day before your arrival.`,
          ``,
          `Hill Hangout`,
        ].join("\n"),
      })
      .catch((err) => console.error("guest paid email failed", err)),
    process.env.NOTIFICATION_EMAIL
      ? c.emails
          .send({
            from: fromAddress(),
            to: process.env.NOTIFICATION_EMAIL,
            subject: `Paid: ${listingName(r.listing_slug)} ${fmtDate(r.check_in)}`,
            text: `${r.name} paid for ${listingName(r.listing_slug)}, ${fmtDate(r.check_in)} to ${fmtDate(r.check_out)}. Total: ${formatMoney(parseFloat(String(r.total)))}.`,
          })
          .catch((err) => console.error("host paid email failed", err))
      : Promise.resolve(),
  ]);
}
