// This file securely loads your service account credentials from environment variables.
// DO NOT COMMIT your actual credentials to version control.

export const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.GCP_PROJECT_ID,
  "private_key_id": process.env.GCP_PRIVATE_KEY_ID,
  // The private key is sensitive and should be handled carefully.
  // The .replace() call is necessary to handle line breaks correctly when loading from a .env file.
  "private_key": (process.env.GCP_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  "client_email": process.env.GCP_CLIENT_EMAIL,
  "client_id": process.env.GCP_CLIENT_ID,
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.GCP_CLIENT_X509_CERT_URL
};

// Validate that the required environment variables are set.
if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
  console.warn("Service account environment variables are not fully configured. The Firebase project listing will fail.");
}
