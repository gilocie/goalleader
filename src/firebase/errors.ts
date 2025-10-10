// Defines a rich, contextual error for Firestore Security Rule violations.

export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

export class FirestorePermissionError extends Error {
  public readonly context: SecurityRuleContext;

  constructor(context: SecurityRuleContext) {
    const prettyContext = JSON.stringify(
      {
        auth: 'request.auth', // Placeholder for the developer
        ...context,
      },
      null,
      2
    );

    const message = `
FirestoreError: Missing or insufficient permissions.
The following request was denied by Firestore Security Rules:
${prettyContext}
`;

    super(message);
    this.name = 'FirestorePermissionError';
    this.context = context;

    // This is to make the error message more readable in the console.
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }

  // Override toString for better display in the Next.js error overlay.
  toString(): string {
    return this.message;
  }
}
