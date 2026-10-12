export async function register() {
  // The positive check (not an early return) lets the edge bundle drop the import: the edge
  // runtime has no TCP sockets for Postgres or SMTP and cannot resolve node: builtins.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { startMailer } = await import('./features/workshop/mail/start');
    startMailer();
    const { startBotPolling } = await import('./features/workshop/bot/polling');
    startBotPolling();
  }
}
