import browser from "webextension-polyfill";

const CDN_URL = "https://nettenshop.cdn.juliamertz.dev";
const DASHBOARD_URL = CDN_URL + "/dashboard.js";
const DASHBOARD_SIGNATURE_URL = CDN_URL + "/dashboard.js.sig";

const PUBLIC_KEY_BASE64 = "77etFSOJuWxws8IL5gytqwxzP0MQtF4aHdr1G0fouf4=";

async function importPublicKey(publicKeyBase64: string): Promise<CryptoKey> {
  const publicKeyBytes = Uint8Array.from(atob(publicKeyBase64), c => c.charCodeAt(0));

  return await crypto.subtle.importKey(
    "raw",
    publicKeyBytes,
    {
      name: "Ed25519",
    },
    false,
    ["verify"]
  );
}

async function verifySignature(
  message: string,
  signatureBase64: string,
  publicKey: CryptoKey
): Promise<boolean> {
  try {
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(atob(signatureBase64), c => c.charCodeAt(0));

    return await crypto.subtle.verify(
      "Ed25519",
      publicKey,
      signatureBytes,
      messageBytes
    );
  } catch (error) {
    return false;
  }
}

async function fetchDashboardCode(): Promise<{ code: string; signature: string }> {
  try {
    const [codeResponse, sigResponse] = await Promise.all([
      fetch(DASHBOARD_URL, {
        cache: "no-store",
      }),
      fetch(DASHBOARD_SIGNATURE_URL, {
        cache: "no-store",
      }),
    ]);

    if (!codeResponse.ok) {
      throw new Error(`Failed to fetch dashboard code: ${codeResponse.status} ${codeResponse.statusText}`);
    }

    if (!sigResponse.ok) {
      throw new Error(`Failed to fetch signature: ${sigResponse.status} ${sigResponse.statusText}`);
    }

    const code = await codeResponse.text();
    const signature = await sigResponse.text();

    return { code: code.trim(), signature: signature.trim() };
  } catch (error) {
    throw new Error(`Error fetching dashboard code: ${error instanceof Error ? error.message : String(error)}`);
  }
}

browser.tabs.onUpdated.addListener(async function(tabID, info, tab) {
  const isDashboard = tab.url === "https://nettenshop.webshopapp.com/admin/";

  if (isDashboard && info.status === "complete") {
      try {
        const { code, signature } = await fetchDashboardCode();
        if (!PUBLIC_KEY_BASE64) {
          console.error("No public key")
          throw new Error("No public key")
        }

        const publicKey = await importPublicKey(PUBLIC_KEY_BASE64);
        const isValid = await verifySignature(code, signature, publicKey);

        if (!isValid) {
          console.error("failed to verify code signature")
          throw new Error("Dashboard code signature verification failed. Code may be compromised.");
        }

        const executeCode = (codeToExecute: string) => {
          const script = document.createElement('script');
          script.textContent = codeToExecute;
          (document.head || document.documentElement).appendChild(script);
          script.remove();
        };

        try {
          const results = await browser.scripting.executeScript({
            target: { tabId: tabID },
            func: executeCode,
            args: [code],
          });

          if (results && results.length > 0) {
            results.forEach((result, index) => {
              if (result.error) {
                console.error(`Frame ${index} execution error:`, result.error);
              }
            });
          }
        } catch (frameError) {
          console.error("Error executing in main frame:", frameError);
          if (frameError instanceof Error) {
            console.error("Frame error details:", frameError.message, frameError.stack);
          }
          try {
            const allFrameResults = await browser.scripting.executeScript({
              target: { tabId: tabID, allFrames: true },
              func: executeCode,
              args: [code],
            });
          } catch (allFramesError) {
            console.error("Error executing in all frames:", allFramesError);
            if (allFramesError instanceof Error) {
              console.error("All frames error details:", allFramesError.message, allFramesError.stack);
            }
            throw allFramesError;
          }
        }
      } catch (error) {
        console.error("Error in dashboard injection:", error);
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        // TODO: error tracking service
      }
  }
});
