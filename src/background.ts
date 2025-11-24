import browser from "webextension-polyfill";

const CDN_URL = "https://nettenshop.cdn.juliamertz.dev";
const DASHBOARD_URL = CDN_URL + "/dashboard.js";
const DASHBOARD_SIGNATURE_URL = CDN_URL + "/dashboard.js.sig";

const PUBLIC_KEY_BASE64 = "77etFSOJuWxws8IL5gytqwxzP0MQtF4aHdr1G0fouf4=";

async function importPublicKey(encoded: string): Promise<CryptoKey> {
  const algo = { name: "Ed25519" };
  const extractable = false;
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));

  return await crypto.subtle.importKey("raw", bytes, algo, extractable, [
    "verify",
  ]);
}

async function verifySignature(
  message: string,
  signatureBase64: string,
  publicKey: CryptoKey,
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(atob(signatureBase64), (c) =>
      c.charCodeAt(0),
    );

    return await crypto.subtle.verify(
      "Ed25519",
      publicKey,
      signatureBytes,
      messageBytes,
    );
  } catch (error) {
    return false;
  }
}

async function fetchDashboardCode(): Promise<string> {
  try {
    if (!PUBLIC_KEY_BASE64) {
      throw new Error("No public key");
    }

    const [codeResponse, sigResponse] = await Promise.all([
      fetch(DASHBOARD_URL, {
        cache: "no-store",
      }),
      fetch(DASHBOARD_SIGNATURE_URL, {
        cache: "no-store",
      }),
    ]);

    if (!codeResponse.ok) {
      throw new Error(
        `Failed to fetch dashboard code: ${codeResponse.status} ${codeResponse.statusText}`,
      );
    }
    if (!sigResponse.ok) {
      throw new Error(
        `Failed to fetch signature: ${sigResponse.status} ${sigResponse.statusText}`,
      );
    }

    const [code, signature] = await Promise.all([
      codeResponse.text(),
      sigResponse.text(),
    ]);

    const publicKey = await importPublicKey(PUBLIC_KEY_BASE64);
    const isValid = await verifySignature(code, signature, publicKey);

    if (!isValid) {
      throw new Error(
        "Dashboard code signature verification failed. Code may be compromised.",
      );
    }

    return code.trim();
  } catch (error) {
    throw new Error(
      `Error fetching dashboard code: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

browser.tabs.onUpdated.addListener(async function (tabID, info, tab) {
  const isDashboard = tab.url === "https://nettenshop.webshopapp.com/admin/";

  if (isDashboard && info.status === "complete") {
    try {
      const code = await fetchDashboardCode();
      await browser.scripting.executeScript({
        target: { tabId: tabID },
        args: [code],
        world: "MAIN",
        func: (content: string) => {
          const script = document.createElement("script");
          script.textContent = content;
          (document.head || document.documentElement).appendChild(script);
          script.remove();
        },
      });
    } catch (error) {
      console.error("Error in dashboard injection:", error);
      if (error instanceof Error) {
        console.error("message:", error.message);
        console.error("stack:", error.stack);
      }
      // TODO: error tracking service
    }
  }
});
