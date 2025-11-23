#!/usr/bin/env bun

import { writeFile } from "fs/promises";
import { join } from "path";

async function generateKeypair() {
  const keyPair = await crypto.subtle.generateKey(
    {
      name: "Ed25519",
    },
    true,
    ["sign", "verify"]
  );

  const privateKey = await crypto.subtle.exportKey("pkcs8", keyPair.privateKey);
  const privateKeyBase64 = Buffer.from(privateKey).toString("base64");
  
  const publicKey = await crypto.subtle.exportKey("raw", keyPair.publicKey);
  const publicKeyBase64 = Buffer.from(publicKey).toString("base64");

  const privateKeyPath = join(import.meta.dir, "private-key.pem");
  const privateKeyPEM = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64}\n-----END PRIVATE KEY-----\n`;
  await writeFile(privateKeyPath, privateKeyPEM, { mode: 0o600 });
  
  const publicKeyPath = join(import.meta.dir, "public-key.txt");
  await writeFile(publicKeyPath, publicKeyBase64);

  console.log(`Private key saved to: ${privateKeyPath}`);
  console.log(`Public key saved to: ${publicKeyPath}`);
  console.log("Public key (base64):");
  console.log(publicKeyBase64);
}

generateKeypair().catch(console.error);

