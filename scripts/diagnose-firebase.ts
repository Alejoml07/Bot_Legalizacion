import { db } from "../src/services/firebase.service";

async function main() {
  try {
    const testDoc = db.collection("diagnostics").doc("connectivity");
    const now = new Date().toISOString();

    console.log("[diagnose] Writing test doc…");
    await testDoc.set({
      updatedAt: now,
      host: process.env.COMPUTERNAME || process.env.HOSTNAME || "unknown",
      pid: process.pid,
    }, { merge: true });

    console.log("[diagnose] Reading back…");
    const snap = await testDoc.get();

    console.log("[diagnose] Exists:", snap.exists);
    console.log("[diagnose] Data:", snap.data());

    console.log("[diagnose] OK ✔");
  } catch (err) {
    console.error("[diagnose] ERROR:", err);
    process.exitCode = 1;
  }
}

main();
