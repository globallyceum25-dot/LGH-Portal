import { spawnSync } from "child_process";

// Cloudflare DNS configuration CLI script for portal.lgh.lk
// Usage: CLOUDFLARE_API_TOKEN=xxx CLOUDFLARE_ZONE_ID=yyy bun scripts/setup-dns.ts

const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN;
let ZONE_ID = process.env.CLOUDFLARE_ZONE_ID;
const RECORD_NAME = "portal.lgh.lk";

async function main() {
  console.log("🌌 Lyceum DNS Connector");
  console.log("=======================");

  if (!API_TOKEN) {
    console.error("❌ Error: Missing required environment variable CLOUDFLARE_API_TOKEN.");
    console.log("\nPlease run the script with the following variables:");
    console.log("  CLOUDFLARE_API_TOKEN  Your Cloudflare API Token (Edit zone permissions)");
    console.log("  CLOUDFLARE_ZONE_ID    (Optional) Your Cloudflare Zone ID for lgh.lk");
    console.log("\nExample:");
    console.log("  CLOUDFLARE_API_TOKEN=xxxx bun scripts/setup-dns.ts\n");
    process.exit(1);
  }

  // Auto-discover Zone ID if not provided
  if (!ZONE_ID) {
    console.log("🔍 Zone ID not provided. Attempting to discover Zone ID for lgh.lk...");
    try {
      const res = await fetch("https://api.cloudflare.com/client/v4/zones?name=lgh.lk", {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      });
      const data = (await res.json()) as { success: boolean; result: any[]; errors: any[] };
      if (data.success && data.result.length > 0) {
        ZONE_ID = data.result[0].id;
        console.log(`✅ Discovered Zone ID: ${ZONE_ID}`);
      } else {
        console.error("❌ Zone ID discovery failed.");
        if (data.errors && data.errors.length > 0) {
          console.error(`Reason: ${JSON.stringify(data.errors)}`);
        }
        process.exit(1);
      }
    } catch (err: any) {
      console.error(`❌ Network error during Zone discovery: ${err.message}`);
      process.exit(1);
    }
  }

  // 1. Detect public IP address or use custom IP
  const CUSTOM_IP = process.env.CLOUDFLARE_IP;
  let publicIp = CUSTOM_IP || "";

  if (CUSTOM_IP) {
    console.log(`✅ Using custom IP address: ${publicIp}`);
  } else {
    console.log("🔍 Fetching current public IP address...");
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { ip: string };
      publicIp = data.ip;
      console.log(`✅ Detected public IP: ${publicIp}`);
    } catch {
      console.error("❌ Failed to automatically detect public IP address.");
      console.log("Attempting backup ip fetch...");
      try {
        const res = await fetch("https://icanhazip.com");
        publicIp = (await res.text()).trim();
        console.log(`✅ Detected public IP (backup): ${publicIp}`);
      } catch {
        console.error("❌ Could not determine public IP address. Please check your internet connection.");
        process.exit(1);
      }
    }
  }

  // 2. Fetch existing DNS records for the domain
  console.log(`🔍 Checking existing Cloudflare DNS records for ${RECORD_NAME}...`);
  let existingRecord: any = null;
  try {
    const res = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records?name=${RECORD_NAME}`,
      {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Cloudflare API error: ${res.status} ${errText}`);
    }

    const data = (await res.json()) as { success: boolean; result: any[] };
    if (data.success && data.result.length > 0) {
      existingRecord = data.result[0];
      console.log(`ℹ️ Found existing record: A -> ${existingRecord.content} (ID: ${existingRecord.id})`);
    } else {
      console.log("ℹ️ No existing record found. Creating a new one.");
    }
  } catch (err: any) {
    console.error(`❌ Failed to query Cloudflare DNS records: ${err.message}`);
    process.exit(1);
  }

  // 3. Upsert DNS record
  const directConnect = process.env.CLOUDFLARE_DIRECT === "true";
  const proxied = !directConnect;
  console.log(`ℹ️ Mode: ${proxied ? "Cloudflare Proxied (CDN Active)" : "Direct Connect (DNS-only / Grey Cloud)"}`);

  const payload = {
    type: "A",
    name: RECORD_NAME,
    content: publicIp,
    ttl: 1, // Auto
    proxied: proxied,
  };

  if (existingRecord) {
    if (existingRecord.content === publicIp && existingRecord.proxied === proxied) {
      console.log(`🎉 DNS Record is already up-to-date and ${proxied ? "proxied via Cloudflare" : "set to DNS-only (direct connect)"}.`);
      process.exit(0);
    }

    console.log(`🔄 Updating record ${RECORD_NAME} to point to ${publicIp}...`);
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records/${existingRecord.id}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as { success: boolean; errors: any[] };
      if (res.ok && data.success) {
        console.log(`🎉 Successfully updated DNS record for ${RECORD_NAME}!`);
        console.log(proxied ? "Traffic is now securely proxied through Cloudflare." : "Traffic is now routed directly to your server's IP address (DNS-only).");
      } else {
        console.error(`❌ Failed to update DNS record: ${JSON.stringify(data.errors)}`);
        process.exit(1);
      }
    } catch (err: any) {
      console.error(`❌ Network error while updating record: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log(`➕ Creating new DNS A record for ${RECORD_NAME} pointing to ${publicIp}...`);
    try {
      const res = await fetch(
        `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/dns_records`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${API_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = (await res.json()) as { success: boolean; errors: any[] };
      if (res.ok && data.success) {
        console.log(`🎉 Successfully created DNS record for ${RECORD_NAME}!`);
        console.log(proxied ? "Traffic is now securely proxied through Cloudflare." : "Traffic is now routed directly to your server's IP address (DNS-only).");
      } else {
        console.error(`❌ Failed to create DNS record: ${JSON.stringify(data.errors)}`);
        process.exit(1);
      }
    } catch (err: any) {
      console.error(`❌ Network error while creating record: ${err.message}`);
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
