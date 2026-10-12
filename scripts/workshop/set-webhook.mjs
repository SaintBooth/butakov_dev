// Only for TELEGRAM_BOT_MODE=webhook; `--delete` drops a webhook manually.
import { buildWebhookRequest } from './lib.mjs';

const token = process.env.TELEGRAM_BOT_TOKEN;
let req;
try {
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not set');
  req = buildWebhookRequest(process.env, { remove: process.argv.includes('--delete') });
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

const call = async (method, body = {}) => {
  const res = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  return res.json();
};

const result = await call(req.method, req.body);
console.log(`${req.method}: ${result.ok ? 'ok' : `failed — ${result.description}`}`);
const info = await call('getWebhookInfo');
// Only non-secret fields: the token and secret never reach the terminal or a log.
const { url, pending_update_count, last_error_message } = info.result ?? {};
console.log({ url, pending_update_count, last_error_message });
process.exit(result.ok ? 0 : 1);
