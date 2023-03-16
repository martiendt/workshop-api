import { config } from "dotenv";

config();

export const issuer = process.env.AUTH_ISSUER as string;
export const secretKey = process.env.AUTH_SECRET_KEY as string;
