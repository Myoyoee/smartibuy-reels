// אזהרה: פתרון best-effort ללא API. אם אינסטגרם ישנו HTML/חסימות, ייתכן שיפסיק לעבוד.
// משתמש ב-proxy ציבורי r.jina.ai שמחזיר HTML/טקסט של העמוד ללא JavaScript.

const fetch = require('node-fetch');
const fs = require('fs');

async function main(){
  const IG_HANDLE = process.env.IG_HANDLE || 'smartibuy.coms';
  const SITE_URL = process.env.SITE_URL || 'https://smartibuy.com';
  const IG_PROFILE = process.env.IG_PROFILE || `https://www.instagram.com/${IG_HANDLE}/`;
  const AVATAR = process.env.AVATAR || '';

  // 1) מושכים HTML דרך r.jina.ai
  const url = `https://r.jina.ai/http://instagram.com/${IG_HANDLE}/`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' }});
  if(!res.ok){
    console.error('Fetch failed', res.status, await res.text());
    process.exit(0);
  }
  const text = await res.text();

  // 2) מחפשים קישור ראשון ל-reel
  const reelMatch = text.match(/https?:\/\/www\.instagram\.com\/reel\/[A-Za-z0-9_-]+\//);
  if(!reelMatch){
    console.log('No reel found on page.');
    process.exit(0);
  }
  const reelUrl = reelMatch[0];

  // 3) קרא latest.json הקיים
  let current = {};
  try { current = JSON.parse(fs.readFileSync('latest.json', 'utf8')); } catch(e){}

  if (current.instagram_url === reelUrl) {
    console.log('Already up-to-date.');
    process.exit(0);
  }

  // 4) בניית האובייקט (caption נשאר כפי שהיה, כדי שלא נאבד תיאור שהזנת ידנית)
  const caption = current.caption || '';

  const payload = {
    title: "SMARTIBUY — Latest Reel",
    caption: caption,
    instagram_url: reelUrl,
    facebook_url: "",
    instagram_profile: IG_PROFILE,
    facebook_page: "",
    ali_link: current.ali_link || "",
    site_url: SITE_URL,
    avatar: AVATAR,
    updated_at: new Date().toISOString()
  };

  fs.writeFileSync('latest.json', JSON.stringify(payload, null, 2));
  console.log('latest.json updated to', reelUrl);
}

main().catch(err=>{
  console.error(err);
  process.exit(0);
});
