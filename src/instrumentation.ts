export async function register() {
  // The edge runtime has no TCP sockets for Postgres or SMTP.
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;
  const { startMailer } = await import('./features/workshop/mail/start');
  startMailer();
}
