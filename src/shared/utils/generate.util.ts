import { randomBytes } from "crypto";
import * as bcrypt from 'bcrypt';

export const generateApiKey = () => {
    const apiKey = 'pk_live_' + randomBytes(24).toString('hex');

    return apiKey;
}

export const generateverificationToken = () => {
    const verificationToken = randomBytes(32).toString('hex');

    return verificationToken;
}

export const generateApiSecretHash = async () => {
    const apiSecret = 'sk_live_' + randomBytes(48).toString('hex');

    const apiSecretHash = await bcrypt.hash(apiSecret, 10);

    return apiSecretHash;
}