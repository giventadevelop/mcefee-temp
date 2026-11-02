'use client';

import { useState } from 'react';
import { useTenantSettings } from '@/components/TenantSettingsProvider';

/** Inbox that receives every public contact submission. */
const SALES_INBOX = 'sales@giventa.com';

const FALLBACK_PHONE = '(908) 516-8781';
const FALLBACK_EMAIL = 'Contactus@mcefee.org';

const FRIENDLY_SEND_FAILED =
  "We couldn't deliver your message just now. Please try again in a few minutes, or email us using the address on this page.";

function parseContactApiFailure(data: unknown): { failed: boolean; technicalDetail: string } {
  if (!data || typeof data !== 'object') return { failed: false, technicalDetail: '' };
  const d = data as { success?: boolean; error?: string; message?: string };
  if (d.success === false) {
    const raw =
      typeof d.error === 'string' && d.error.trim()
        ? d.error.trim()
        : typeof d.message === 'string' && d.message.trim()
          ? d.message.trim()
          : '';
    return { failed: true, technicalDetail: raw || '(success=false, no error string)' };
  }
  if (d.success !== true && typeof d.error === 'string' && d.error.trim()) {
    return { failed: true, technicalDetail: d.error.trim() };
  }
  return { failed: false, technicalDetail: '' };
}

/**
 * Public contact details plus a message form.
 * The submission is emailed to sales@giventa.com and a confirmation is sent
 * to the address entered on the form (CONTACT email type).
 */
export function PublicContactMessageForm() {
  const { settings } = useTenantSettings();
  const phone = settings?.phoneNumber?.trim() || FALLBACK_PHONE;
  const publicEmail = settings?.email?.trim() || FALLBACK_EMAIL;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [consent, setConsent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const name = fullName.trim();
    const senderEmail = email.trim();
    const note = message.trim();

    if (!name || name.length < 2) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter your name (at least 2 characters).');
      return;
    }
    if (!senderEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(senderEmail)) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a valid email address.');
      return;
    }
    if (!note || note.length < 10) {
      setSubmitStatus('error');
      setSubmitMessage('Please enter a message (at least 10 characters).');
      return;
    }
    if (!consent) {
      setSubmitStatus('error');
      setSubmitMessage('Please agree to data collection to submit.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setSubmitMessage('');

    const [firstName, ...restNameParts] = name.split(/\s+/);
    const lastName = restNameParts.join(' ').trim() || 'N/A';
    const messageBody = phoneNumber.trim() ? `${note}\n\nPhone: ${phoneNumber.trim()}` : note;

    try {
      const response = await fetch('/api/proxy/contact-form-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          messageBody,
          senderEmail,
          toEmail: SALES_INBOX,
          emailType: 'CONTACT',
        }),
      });

      const data = await response.json().catch(() => ({}));
      const { failed: bodyFailed, technicalDetail } = parseContactApiFailure(data);

      if (response.ok && !bodyFailed) {
        setSubmitStatus('success');
        setSubmitMessage(
          'Thank you. Your message was sent, and a copy is on its way to the email you entered.'
        );
        setFullName('');
        setEmail('');
        setPhoneNumber('');
        setMessage('');
        setConsent(false);
      } else {
        console.error('[PublicContactMessageForm] Contact send failed', {
          technicalDetail,
          httpStatus: response.status,
          responseBody: data,
        });
        setSubmitStatus('error');
        setSubmitMessage(FRIENDLY_SEND_FAILED);
      }
    } catch (err) {
      console.error('[PublicContactMessageForm] Contact send exception', err);
      setSubmitStatus('error');
      setSubmitMessage(FRIENDLY_SEND_FAILED);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mh-contact-layout">
      <div className="mh-contact-details">
        <p className="mh-eyebrow">Contact</p>
        <h2>Get in touch</h2>
        <p>
          Questions about events, membership, or the foundation — send a note and we will reply to
          the email you enter.
        </p>
        <ul className="mh-contact-facts">
          <li>
            <span>Organization</span>
            <strong>Malayali Cultural Exchange Foundation for Education and Events</strong>
          </li>
          <li>
            <span>Address</span>
            <strong>New Jersey, USA</strong>
          </li>
          <li>
            <span>Phone</span>
            <a href={`tel:${phone.replace(/[^\d+]/g, '')}`}>{phone}</a>
          </li>
          <li>
            <span>Email</span>
            <a href={`mailto:${publicEmail}`}>{publicEmail}</a>
          </li>
        </ul>
      </div>

      <form className="mh-contact-form" onSubmit={handleSubmit} noValidate>
        <h2>Send a message</h2>
        <p>We send this to our team and a confirmation to the address you enter below.</p>
        <div className="mh-contact-fields">
          <label>
            Name *
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
          </label>
          <label>
            Email *
            <input
              type="email"
              name="email_address"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="mh-contact-span">
            Phone
            <input
              type="tel"
              name="phone_number"
              autoComplete="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
          </label>
          <label className="mh-contact-span">
            Message *
            <textarea
              name="feedback"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </label>
        </div>
        <label className="mh-contact-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
          />
          <span>I agree that my submitted data is being collected and stored.</span>
        </label>
        {submitMessage ? (
          <p
            className={`mh-contact-status ${submitStatus === 'success' ? 'mh-contact-status--ok' : 'mh-contact-status--err'}`}
            role="status"
          >
            {submitMessage}
          </p>
        ) : null}
        <button type="submit" className="mh-btn mh-btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send your message'}
        </button>
      </form>
    </div>
  );
}
