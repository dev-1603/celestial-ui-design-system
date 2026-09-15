import { getGeneratedComponentSpec } from './spec-lookup';

export const inputOtpSpec = getGeneratedComponentSpec({
  id: 'input-otp',
  displayName: 'Input OTP',
  purpose: 'One-time password or PIN segmented input.',
  taxonomy: 'molecular',
  engineeringFamily: 'forms',
  complexity: 'moderate',
  status: 'stable',
  profile: 'form-text',
});
