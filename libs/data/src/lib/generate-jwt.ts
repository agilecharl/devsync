import { SignJWT, importPKCS8 } from 'jose';

// Make sure privateKeyPem is already a string, not read from file
export async function generateGitHubAppJwt(
  appId: string,
  privateKeyPem: string // This should be the actual PEM content, not a file path
): Promise<string> {
  try {
    // Ensure the private key is properly formatted
    let formattedKey = privateKeyPem.trim();

    // Replace any \n literals with actual newlines first
    formattedKey = formattedKey.replace(/\\n/g, '\n');

    let key: any;

    // Check if it's RSA format and throw an error with conversion instructions
    if (formattedKey.includes('-----BEGIN RSA PRIVATE KEY-----')) {
      throw new Error(
        'RSA private key format detected. Please convert to PKCS#8 format using: openssl pkcs8 -topk8 -inform PEM -outform PEM -nocrypt -in rsa_key.pem -out pkcs8_key.pem'
      );
    }

    // Handle PKCS#8 format
    if (formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
      key = await importPKCS8(formattedKey, 'RS256');
    } else {
      // If it's a raw key without headers, assume it's base64 encoded PKCS#8
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${formattedKey}\n-----END PRIVATE KEY-----`;

      // Ensure proper line breaks in PEM format
      const lines = formattedKey.split('\n');
      const beginIndex = lines.findIndex((line) =>
        line.includes('-----BEGIN PRIVATE KEY-----')
      );
      const endIndex = lines.findIndex((line) =>
        line.includes('-----END PRIVATE KEY-----')
      );

      if (beginIndex !== -1 && endIndex !== -1) {
        // Extract and reformat only the key content between headers
        const keyContent = lines.slice(beginIndex + 1, endIndex).join('');
        const formattedContent = keyContent.replace(/(.{64})/g, '$1\n').trim();

        formattedKey = [
          '-----BEGIN PRIVATE KEY-----',
          formattedContent,
          '-----END PRIVATE KEY-----',
        ].join('\n');
      }

      key = await importPKCS8(formattedKey, 'RS256');
    }

    // Create the JWT payload
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: appId, // GitHub App ID
      iat: now, // Issued at time
      exp: now + 10 * 60, // Expiration time (10 minutes maximum)
    };

    // Generate and sign the JWT
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'RS256' })
      .setIssuedAt(payload.iat)
      .setExpirationTime(payload.exp)
      .setIssuer(payload.iss)
      .sign(key);

    return token;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate JWT: ${error.message}`);
    } else {
      throw new Error('Failed to generate JWT: Unknown error');
    }
  }
}
