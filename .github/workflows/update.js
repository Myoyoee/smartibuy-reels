const fetch = require("node-fetch");
const fs = require("fs");

async function main() {
  const { IG_USER_ID, IG_ACCESS_TOKEN } = process.env;
  const fields = "id,caption,permalink,media_type,timestamp";
  const url = `https://graph.facebook.com/v21.0/${IG_USER_ID}/media?fields=${fields}&limit=1&access_token=${IG_ACCESS_TOKEN}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("IG error " + res.status);
  const data = await res.json();
  const latest = data.data[0];
  if (!latest || latest.media_type !== "VIDEO") return;

  let current = {};
  try { current = JSON.parse(fs.readFileSync("latest.json", "utf8")); } catch(e){}

  if (current.instagram_url === latest.permalink) return;

  const payload = {
    title: "SMARTIBUY — הרילס האחרון",
    caption: (latest.caption || "").trim(),
    instagram_url: latest.permalink,
    facebook_url: "",
    instagram_profile: "https://www.instagram.com/smartibuy.coms/",
    facebook_page: "",
    ali_link: "", // אפשר לשים כאן קישור קבוע או למלא ידנית
    site_url: "https://smartibuy.com",
    avatar: "https://smartibuy.com/logo.png",
    updated_at: latest.timestamp
  };

  fs.writeFileSync("latest.json", JSON.stringify(payload, null, 2));
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
