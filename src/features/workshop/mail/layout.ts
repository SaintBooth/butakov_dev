import { EMAIL_THEME as c } from '@/config/workshop';

export interface EmailButton {
  label: string;
  url: string;
}

export interface EmailLayout {
  preheader: string;
  paragraphs: string[];
  buttons: EmailButton[];
  // Secondary notes go under the buttons so the main action stays next to the text it belongs to.
  notes: string[];
  signature: string;
  footer: { text: string; link: EmailButton };
}

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

const lines = (s: string) => escapeHtml(s).replace(/\n/g, '<br>');

// Table markup with inline styles: Outlook and Yandex/Mail.ru webmail drop flexbox and <style>.
function button({ label, url }: EmailButton, primary: boolean): string {
  const bg = primary ? c.button : c.card;
  const fg = primary ? c.buttonText : c.text;
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0"><tr><td style="border-radius:999px;background:${bg};border:1px solid ${c.button}"><a href="${escapeHtml(url)}" style="display:inline-block;padding:12px 24px;font-family:${c.font};font-size:15px;font-weight:600;color:${fg};text-decoration:none;border-radius:999px">${escapeHtml(label)}</a></td></tr></table>`;
}

export function renderEmailHtml(m: EmailLayout): string {
  const text = `font-family:${c.font};font-size:15px;line-height:1.6;color:${c.text}`;
  const footer = `font-family:${c.font};font-size:12px;line-height:1.5;color:${c.muted}`;
  const para = (p: string) => `<p style="margin:0 0 16px;${text}">${lines(p)}</p>`;
  const notes = m.notes.map((p) => `<p style="margin:16px 0 0;${text}">${lines(p)}</p>`).join('');
  const body = m.paragraphs.map(para).join('');
  const buttons = m.buttons.map((b, i) => button(b, i === 0)).join('') + notes;
  return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;padding:0;background:${c.page}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${escapeHtml(m.preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${c.page}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:${c.maxWidth}px">
<tr><td style="padding:0 4px 16px;font-family:${c.font};font-size:16px;font-weight:700;color:${c.text}">butakov<span style="color:${c.accent}">.dev</span></td></tr>
<tr><td style="background:${c.card};border:1px solid ${c.border};border-radius:16px;padding:32px 28px">${body}${buttons}<p style="margin:24px 0 0;${text}">${lines(m.signature)}</p></td></tr>
<tr><td style="padding:16px 4px;${footer}">${escapeHtml(m.footer.text)} <a href="${escapeHtml(m.footer.link.url)}" style="color:${c.muted};text-decoration:underline">${escapeHtml(m.footer.link.label)}</a></td></tr>
</table></td></tr></table></body></html>`;
}
