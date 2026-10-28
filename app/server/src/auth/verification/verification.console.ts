const testCodes = new Map<string, string>();

export function sendVerificationCode(email: string, code: string): void {
  if (process.env.NODE_ENV === 'test') {
    testCodes.set(email, code);
    return;
  }
  console.log('\n========== SUMMIT EMAIL VERIFICATION ==========');
  console.log(`Email: ${email}`);
  console.log(`Code: ${code}`);
  console.log('Expires in 10 minutes.');
  console.log('================================================\n');
}

export function getTestVerificationCode(email: string): string | undefined {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Test verification codes are unavailable.');
  }
  return testCodes.get(email);
}
