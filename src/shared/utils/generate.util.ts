import { randomBytes } from 'crypto';

export const generateToken = () => {
  const verificationToken = randomBytes(32).toString('hex');

  return verificationToken;
};
