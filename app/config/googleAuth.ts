const DEFAULT_GOOGLE_CLIENT_ID = "877885675229-u1vqcf2o0c4fbjqvr6crjtkoiv2ve6gp.apps.googleusercontent.com";

export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim() || DEFAULT_GOOGLE_CLIENT_ID;
export const isGoogleAuthConfigured = GOOGLE_CLIENT_ID.length > 0;
