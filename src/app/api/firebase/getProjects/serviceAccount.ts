
// This is a placeholder for your service account credentials.
// In a real application, these should be loaded securely from environment variables
// and not be committed to version control.

export const serviceAccount = {
  "type": "service_account",
  "project_id": process.env.GCP_PROJECT_ID || "your-gcp-project-id",
  "private_key_id": process.env.GCP_PRIVATE_KEY_ID || "your-private-key-id",
  "private_key": (process.env.GCP_PRIVATE_KEY || "your-private-key").replace(/\\n/g, '\n'),
  "client_email": process.env.GCP_CLIENT_EMAIL || "your-client-email",
  "client_id": process.env.GCP_CLIENT_ID || "your-client-id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": process.env.GCP_CLIENT_X509_CERT_URL || "your-client-x509-cert-url"
};
