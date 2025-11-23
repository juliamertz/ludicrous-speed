#!/usr/bin/env bun

import { readFile, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

async function importPrivateKey(privateKeyPEM) {
  const base64Key = privateKeyPEM
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  
  const keyBytes = Uint8Array.from(atob(base64Key), c => c.charCodeAt(0));
  
  return await crypto.subtle.importKey(
    "pkcs8",
    keyBytes,
    {
      name: "Ed25519",
    },
    false,
    ["sign"]
  );
}

async function signFile(filePath, privateKeyPath) {
  if (!existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
  
  if (!existsSync(privateKeyPath)) {
    throw new Error(`Private key not found: ${privateKeyPath}`);
  }

  const [fileContent, privateKeyPEM] = await Promise.all([
    readFile(filePath, "utf-8"),
    readFile(privateKeyPath, "utf-8"),
  ]);

  const privateKey = await importPrivateKey(privateKeyPEM);
  const messageBytes = new TextEncoder().encode(fileContent.trim());
  
  const signature = await crypto.subtle.sign("Ed25519", privateKey, messageBytes);
  const signatureBase64 = Buffer.from(signature).toString("base64");

  const signaturePath = filePath + ".sig";
  await writeFile(signaturePath, signatureBase64);
  
  console.log(`Signed ${filePath}`);
  console.log(`Signature saved to: ${signaturePath}`);
}

const dashboardPath = process.argv[2] || join(import.meta.dir, "..", "dist", "dashboard.js");
const privateKeyPath = process.argv[3] || join(import.meta.dir, "private-key.pem");

signFile(dashboardPath, privateKeyPath).catch((error) => {
  console.error("Error signing file:", error.message);
  process.exit(1);
});

