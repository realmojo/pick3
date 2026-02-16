const fs = require("fs");
const path = require("path");
const https = require("https");

// Read .env.local
const envPath = path.join(__dirname, ".env.local");
let apiKey = "";
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  const match = envContent.match(/KAKAO_REST_API_KEY=(.+)/);
  if (match) {
    apiKey = match[1].trim();
    // Remove quotes if present
    apiKey = apiKey.replace(/^['"](.*)['"]$/, "$1");
  }
}

if (!apiKey) {
  console.error("KAKAO_REST_API_KEY not found in .env.local");
  process.exit(1);
}

const KAKAO_API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";
const CATEGORY_CONFIG = {
  cafe: {
    code: "CE7",
    keywords: ["인기카페", "감성카페", "뷰카페"],
  },
};

const category = "cafe";
const config = CATEGORY_CONFIG[category];
const keyword = config.keywords[0];

const params = new URLSearchParams({
  query: keyword,
  category_group_code: config.code,
  page: "1",
  size: "3",
  sort: "accuracy",
});

const url = `${KAKAO_API_URL}?${params.toString()}`;
console.log(`Fetching URL: ${url}`);

const options = {
  headers: {
    Authorization: `KakaoAK ${apiKey}`,
  },
};

const req = https.get(url, options, (res) => {
  let data = "";

  res.on("data", (chunk) => {
    data += chunk;
  });

  res.on("end", () => {
    console.log(`Status Code: ${res.statusCode}`);
    if (res.statusCode !== 200) {
      console.error("Request failed!");
      console.error(`Response Body: ${data}`);
    } else {
      console.log("Request successful!");
    }
  });
});

req.on("error", (e) => {
  console.error(`Request Error: ${e.message}`);
});
