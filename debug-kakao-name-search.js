const fs = require("fs");
const path = require("path");
const https = require("https");

const envPath = path.join(__dirname, ".env.local");
let apiKey = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/KAKAO_REST_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim().replace(/^['"](.*)['"]$/, "$1");
  }
}

if (!apiKey) {
  console.error("KAKAO_REST_API_KEY not found in .env.local");
  process.exit(1);
}

const KAKAO_KEYWORD_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

function fetchPlace(keyword) {
  const params = new URLSearchParams({
    query: keyword,
    size: "15", // Fetch more to increase chance of finding the specific ID
  });

  const url = `${KAKAO_KEYWORD_URL}?${params.toString()}`;
  const options = { headers: { Authorization: `KakaoAK ${apiKey}` } };

  return new Promise((resolve, reject) => {
    https
      .get(url, options, (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          if (res.statusCode === 200) resolve(JSON.parse(data));
          else reject(data);
        });
      })
      .on("error", reject);
  });
}

async function test() {
  try {
    console.log("1. Search for '스타벅스' to get a target ID...");
    const result = await fetchPlace("스타벅스");
    if (result.documents && result.documents.length > 0) {
      const target = result.documents[0];
      console.log(`Target: ${target.place_name} (${target.id})`);

      console.log(
        `2. Now simulate Detail Page logic: Search by name '${target.place_name}' and filter by ID '${target.id}'`,
      );
      const searchResult = await fetchPlace(target.place_name);

      const found = searchResult.documents.find((d) => d.id === target.id);
      if (found) {
        console.log(
          "SUCCESS: Re-found the place using Name Search + ID Filter!",
        );
        console.log(JSON.stringify(found, null, 2));
      } else {
        console.log("FAILED: Could not re-find the exact place by name.");
      }
    }
  } catch (e) {
    console.error("Error:", e);
  }
}

test();
