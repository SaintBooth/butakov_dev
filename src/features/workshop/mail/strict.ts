// next-intl's default onError returns the bare message key, which would put a raw
// "email.confirmation.body" into a participant's inbox. Throwing turns it into a failed job.
export function failOnMissingMessage(error: Error): never {
  throw error;
}
