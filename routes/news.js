import express from "express";
import axios from "axios";
import Parser from "rss-parser";
import * as cheerio from "cheerio";

const router = express.Router();
const parser = new Parser();

const NEWS_API_KEY = process.env.NEWS_API_KEY;
const NEWS_API_URL = "https://newsapi.org/v2/top-headlines";

/* ---------------------------- COUNTRY-SPECIFIC RSS FEEDS ---------------------------- */
const PAKISTAN_FEEDS = [
  { source: "Geo News RSS", url: "https://www.geo.tv/rss/1/0" },
  { source: "Dawn RSS", url: "https://www.dawn.com/feed/" },
  { source: "Express Tribune", url: "https://tribune.com.pk/feed/latest" },
  { source: "The News", url: "https://www.thenews.com.pk/rss/1/1" },
  { source: "HamariWeb RSS", url: "https://hamariweb.com/en/rss/" },
  { source: "Bol News RSS", url: "https://www.bolnews.com/feed/" },
  { source: "Express RSS", url: "https://www.express.pk/feed/" },
  { source: "ARY News RSS", url: "https://arynews.tv/feed/" },
  { source: "Aaj News RSS", url: "https://www.aaj.tv/feed/" },
  { source: "UrduPoint RSS", url: "https://www.urdupoint.com/en/rss/" },
  { source: "Mashriq TV RSS", url: "https://mashriqtv.pk/feed/" },
  { source: "Chitral Times RSS", url: "https://chitraltimes.com/feed/" },
  { source: "The Financial Daily RSS", url: "https://thefinancialdaily.com/feed/" },
  { source: "Lahore Times RSS", url: "https://lahoretimes.com.pk/feed/" },
  { source: "Daily Qudrat RSS", url: "https://dailyqudrat.pk/feed/" },
  { source: "Bol News Urdu RSS", url: "https://www.bolnews.com/urdu/feed/" },
  { source: "24 News HD Urdu RSS", url: "https://urdu.24newshd.tv/feed/" },
  { source: "Pak Showbiz RSS", url: "https://www.pakshowbiz.com/feed/" }
];

const INDIA_FEEDS = [
  { source: "NDTV", url: "https://feeds.feedburner.com/ndtvnews-top-stories" },
  { source: "The Hindu", url: "https://www.thehindu.com/feeder/default.rss" },
];

const GLOBAL_FEEDS = [
  { source: "BBC News (World)", url: "http://feeds.bbci.co.uk/news/rss.xml" },
  { source: "Yahoo News", url: "https://news.yahoo.com/rss" },
  { source: "Reddit News", url: "https://www.reddit.com/r/news/.rss" },
  { source: "Reddit World News", url: "https://www.reddit.com/r/worldnews/.rss" },
  { source: "CNN Top Stories", url: "http://rss.cnn.com/rss/edition.rss" },
  { source: "Al Jazeera", url: "https://www.aljazeera.com/xml/rss/all.xml" },
  { source: "Reuters World News", url: "http://feeds.reuters.com/Reuters/worldNews" },
  { source: "TechCrunch", url: "https://techcrunch.com/feed/" },
  { source: "The Guardian World News", url: "https://www.theguardian.com/world/rss" },
  { source: "New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
];

/* ---------------------------- CATEGORY FEEDS ---------------------------- */
const CATEGORY_FEEDS = {
  bollywood: [{ source: "NDTV Bollywood", url: "https://feeds.feedburner.com/ndtvmovies-latest" }],
  hollywood: [{ source: "Variety", url: "https://variety.com/feed/" }],
  lollywood: [
    { source: "Dawn Images", url: "https://www.dawn.com/rss/entertainment" },
    { source: "Fashion Central", url: "https://www.fashioncentral.pk/category/entertainment/feed/" }
  ],
  crime: [
    { source: "India Today Crime", url: "https://www.indiatoday.in/rss/1206572" },
    { source: "Times of India Crime", url: "https://timesofindia.indiatimes.com/rssfeeds/5880652.cms" }
  ],
  horror: [{ source: "Horror News Network", url: "https://www.horrornewsnetwork.net/feed/" }],
  world_records: [
    { source: "Guinness World Records", url: "https://www.guinnessworldrecords.com/news/rss/" },
    { source: "Bored Panda Records", url: "https://www.boredpanda.com/rss/category/world-records/" }
  ],
  physics: [
    { source: "Physics World", url: "https://physicsworld.com/feed/" },
    { source: "ArXiv Physics", url: "https://export.arxiv.org/rss/physics" }
  ],
  chemistry: [
    { source: "Chemistry World", url: "https://www.chemistryworld.com/rss" },
    { source: "ArXiv Chemistry", url: "https://export.arxiv.org/rss/physics.chem-ph" }
  ],
  biology: [
    { source: "ScienceDaily Biology", url: "https://www.sciencedaily.com/rss/misc/biology.xml" },
    { source: "ArXiv Quantitative Biology", url: "https://export.arxiv.org/rss/q-bio" }
  ],
  mathematics: [
    { source: "Mathematics News", url: "https://www.ams.org/publications/journals/rss.xml" },
    { source: "ArXiv Math", url: "https://export.arxiv.org/rss/math" }
  ],
   computers: [
    { source: "Computerworld", url: "https://www.computerworld.com/index.rss" },
    { source: "TechRadar Computing", url: "https://www.techradar.com/rss/computing" },
  ],
  electronics: [
    { source: "Electronics Weekly", url: "https://www.electronicsweekly.com/feed/" },
    { source: "EE Times", url: "https://www.eetimes.com/feed/" },
  ],
  supercomputers: [
    { source: "HPCWire", url: "https://www.hpcwire.com/feed/" },
    { source: "Top500", url: "https://www.top500.org/news/feed/" },
  ],
  politics: [
    { source: "Politico", url: "https://www.politico.com/rss/politics08.xml" },
    { source: "BBC Politics", url: "http://feeds.bbci.co.uk/news/politics/rss.xml" },
  ],
  ai: [
    { source: "MIT Technology Review AI", url: "https://www.technologyreview.com/feed/" },
    { source: "ArXiv AI", url: "https://export.arxiv.org/rss/cs.AI" }
  ],
  ml: [{ source: "ArXiv Machine Learning", url: "https://export.arxiv.org/rss/cs.LG" }],
  "deep-learning": [

    { source: "ArXiv AI", url: "https://export.arxiv.org/rss/cs.AI" },
    { source: "ArXiv Machine Learning", url: "https://export.arxiv.org/rss/cs.LG" },
    { source: "ArXiv Computation and Language", url: "https://export.arxiv.org/rss/cs.CL" },
    { source: "DeepMind Blog", url: "https://deepmind.com/blog/feed/basic/" },
    { source: "OpenAI Blog", url: "https://openai.com/blog/rss/" },
    { source: "Google AI Blog", url: "https://ai.googleblog.com/feeds/posts/default" },
    { source: "Meta AI Research", url: "https://ai.facebook.com/blog/feed/" },
    { source: "Hugging Face Blog", url: "https://huggingface.co/blog/rss.xml" },
    { source: "NVIDIA AI News", url: "https://blogs.nvidia.com/feed/" },
    { source: "MIT Technology Review AI", url: "https://www.technologyreview.com/feed/" },
    { source: "VentureBeat AI", url: "https://venturebeat.com/category/ai/feed/" },
    { source: "Synced Review", url: "https://syncedreview.com/feed/" },
    { source: "Analytics India Magazine AI", url: "https://analyticsindiamag.com/category/artificial-intelligence/feed/" },
    { source: "EleutherAI Blog", url: "https://www.eleuther.ai/feed.xml" },
    { source: "Distill.pub", url: "https://distill.pub/feed.xml" },
    { source: "The Gradient", url: "https://thegradient.pub/feed/" },
    { source: "AI Alignment Forum", url: "https://www.alignmentforum.org/feed" },
    { source: "OpenLLM News", url: "https://openllm.com/blog/rss" },
    { source: "AI Weekly", url: "https://aiweekly.co/rss" },
    { source: "Reddit Machine Learning", url: "https://www.reddit.com/r/MachineLearning/.rss" },
  ],
  "social-media": [
    { source: "TechCrunch Social Media", url: "https://techcrunch.com/tag/social/rss/" },
    { source: "Mashable Social Media", url: "https://mashable.com/category/social/rss/" },
    { source: "Social Media Today", url: "https://www.socialmediatoday.com/rss" },
    { source: "The Verge Social Media", url: "https://www.theverge.com/rss/index.xml" },
    { source: "Later Blog", url: "https://later.com/blog/feed/" },
    { source: "Sprout Social Blog", url: "https://sproutsocial.com/insights/feed/" },
    { source: "Hootsuite Blog", url: "https://blog.hootsuite.com/feed/" },
    { source: "SocialMediaExplorer", url: "https://socialmediaexplorer.com/feed/" },
    { source: "Buffer Blog", url: "https://buffer.com/resources/feed" },
    { source: "Marketing Land Social Media", url: "https://marketingland.com/feed/topic/social" },
    { source: "HubSpot Social Media", url: "https://blog.hubspot.com/marketing/rss.xml" },
    { source: "Neil Patel Social Media", url: "https://neilpatel.com/blog/feed/" }
  ]
  
};

/* ---------------------------- Helper: Fetch RSS feeds ---------------------------- */
async function fetchFromFeeds(feeds) {
  const results = [];
  await Promise.all(
    feeds.map(async (feed) => {
      try {
        const parsed = await parser.parseURL(feed.url);
        parsed?.items?.forEach((item) => {
          results.push({
            source: { name: feed.source },
            title: item.title,
            description: item.contentSnippet || item.summary || "",
            url: item.link,
            publishedAt: item.pubDate,
          });
        });
      } catch (err) {
        console.error(`❌ Failed ${feed.source}:`, err.message);
      }
    })
  );
  return results;
}

/* ---------------------------- Scraper & other routes remain the same ---------------------------- */
// (scrapeSite, scrapePKNews, scrapeBollywood, scrapeHollywood, scrapeHorror, scrapeCrime, scrapeWorldRecords, scrapeLollywood, generateSearchRSS, router.get) 
// ⬆️ keep the exact same as in your original file.




/* ---------------------------- Generic Scraper ---------------------------- */
async function scrapeSite(url, itemSelector, titleSelector, linkSelector, descSelector, baseUrl, sourceName) {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const articles = [];
    $(itemSelector).each((i, el) => {
      const title = $(el).find(titleSelector).text().trim();
      const link = $(el).find(linkSelector).attr("href");
      const description = descSelector ? $(el).find(descSelector).text().trim() : "";
      if (title && link) {
        articles.push({
          title,
          url: link.startsWith("http") ? link : `${baseUrl}${link}`,
          description,
          source: sourceName,
        });
      }
    });
    return articles;
  } catch (err) {
    console.error(`❌ Error scraping ${sourceName}:`, err.message);
    return [];
  }
}

/* ---------------------------- Pakistani news scrapers ---------------------------- */
async function scrapePKNews() {
  return Promise.all([
    scrapeSite("https://www.geo.tv/latest-news", ".latest-news__item", "a", "a", "p", "https://www.geo.tv", "Geo TV"),
    scrapeSite("https://www.dawn.com/latest-news", "article.story", "h2 a", "h2 a", "p", "https://www.dawn.com", "Dawn"),
    scrapeSite("https://arynews.tv/category/news/", "article", "h2 a", "h2 a", ".entry-content p", "https://arynews.tv", "ARY News"),
    scrapeSite("https://www.samaa.tv/news/", ".news-block", "h2 a", "h2 a", ".news-content", "https://www.samaa.tv", "Samaa TV"),
    scrapeSite("https://tribune.com.pk/latest", "article", "h2 a", "h2 a", "p", "https://tribune.com.pk", "Express Tribune"),
    scrapeSite("https://www.thenews.com.pk/latest", ".latest-news-item", "h2 a", "h2 a", "p", "https://www.thenews.com.pk", "The News"),
    fetchFromFeeds(PAKISTAN_FEEDS)
  ]).then(arr => arr.flat());
}

/* ---------------------------- Special category scrapers ---------------------------- */
async function scrapeBollywood() {
  return scrapeSite("https://www.ndtv.com/entertainment/bollywood", ".new_storylising", "h2 a", "h2 a", "p", "https://www.ndtv.com", "NDTV Bollywood");
}
async function scrapeHollywood() {
  return scrapeSite("https://variety.com/v/film/", "article", "h2 a", "h2 a", "p", "https://variety.com", "Variety Hollywood");
}
async function scrapeHorror() {
  return scrapeSite("https://www.horrornewsnetwork.net/", ".post", "h2 a", "h2 a", ".entry-content p", "https://www.horrornewsnetwork.net", "Horror News Network");
}
async function scrapeCrime() {
  return Promise.all([
    scrapeSite("https://indianexpress.com/section/crime/", ".articles", "h2 a", "h2 a", "p", "https://indianexpress.com", "Indian Express Crime"),
    scrapeSite("https://www.indiatoday.in/crime", ".news-item", "h2 a", "h2 a", "p", "https://www.indiatoday.in", "India Today Crime"),
    scrapeSite("https://timesofindia.indiatimes.com/india/crime", ".article", "h2 a", "h2 a", "p", "https://timesofindia.indiatimes.com", "Times of India Crime")
  ]).then(arr => arr.flat());
}
async function scrapeWorldRecords() {
  return Promise.all([
    scrapeSite("https://www.guinnessworldrecords.com/news", ".news-item", "h2 a", "h2 a", ".news-item__summary", "https://www.guinnessworldrecords.com", "Guinness World Records"),
    scrapeSite("https://www.boredpanda.com/category/world-records/", ".post", "h2 a", "h2 a", ".excerpt", "https://www.boredpanda.com", "Bored Panda Records")
  ]).then(arr => arr.flat());
}
async function scrapeLollywood() {
  return Promise.all([
    scrapeSite("https://www.dawn.com/latest/entertainment", "article.story", "h2 a", "h2 a", "p", "https://www.dawn.com", "Dawn Images"),
    scrapeSite("https://www.fashioncentral.pk/category/entertainment/", ".post", "h2 a", "h2 a", "p", "https://www.fashioncentral.pk", "Fashion Central")
  ]).then(arr => arr.flat());
}

/* ---------------------------- Dynamic Google/Bing RSS generator ---------------------------- */
function generateSearchRSS(query, engine = "google") {
  const encodedQuery = encodeURIComponent(query);
  if (engine.toLowerCase() === "google") {
    return `https://news.google.com/rss/search?q=${encodedQuery}&hl=en-US&gl=US&ceid=US:en`;
  } else if (engine.toLowerCase() === "bing") {
    return `https://www.bing.com/news/search?q=${encodedQuery}&format=rss`;
  } else {
    throw new Error("Unsupported search engine");
  }
}

/* ---------------------------- API Endpoint ---------------------------- */
router.get("/", async (req, res) => {
  const { country = "", category = "", q = "", pageSize = 20, page = 1, searchEngine = "google" } = req.query;
  try {
    let results = [];

    // Category-based
    if (category) {
      const cat = category.toLowerCase();

      // ✅ Deeplearning only fetch RSS feeds, no scraping
      if (cat === "deeplearning") {
        results = await fetchFromFeeds(CATEGORY_FEEDS.deeplearning);
      } else if (cat === "social-media") {
        // Social media category fetch only RSS feeds
        results = await fetchFromFeeds(CATEGORY_FEEDS["social-media"]);
      } else {
        if (CATEGORY_FEEDS[cat]) results = await fetchFromFeeds(CATEGORY_FEEDS[cat]);

        // Special scrapers
        if (cat === "bollywood") results = results.concat(await scrapeBollywood());
        if (cat === "hollywood") results = results.concat(await scrapeHollywood());
        if (cat === "horror") results = results.concat(await scrapeHorror());
        if (cat === "crime") results = results.concat(await scrapeCrime());
        if (cat === "world_records") results = results.concat(await scrapeWorldRecords());
        if (cat === "lollywood") results = results.concat(await scrapeLollywood());
      }

      if (!results.length && NEWS_API_KEY) {
        const fallback = await axios.get(NEWS_API_URL, { params: { apiKey: NEWS_API_KEY, q: category, category, pageSize, page } });
        results = fallback.data.articles || [];
      }
      return res.json({ status: "ok", totalResults: results.length, articles: results });
    }

    // Search-based dynamic feeds
    if (q) {
      const rssUrl = generateSearchRSS(q, searchEngine);
      results = await fetchFromFeeds([{ source: `${searchEngine} search: ${q}`, url: rssUrl }]);
      return res.json({ status: "ok", totalResults: results.length, articles: results });
    }

    // Country-based
    if (country.toLowerCase() === "pk") {
      results = await scrapePKNews();
    } else {
      const feedsMap = { in: INDIA_FEEDS, global: GLOBAL_FEEDS };
      if (feedsMap[country.toLowerCase()]) results = await fetchFromFeeds(feedsMap[country.toLowerCase()]);
      else if (NEWS_API_KEY) {
        const response = await axios.get(NEWS_API_URL, { params: { apiKey: NEWS_API_KEY, country, q, category, pageSize, page } });
        results = response.data.articles || [];
      }
    }

    return res.json({ status: "ok", totalResults: results.length, articles: results });
  } catch (err) {
    console.error("❌ Error fetching news:", err.message);
    return res.status(500).json({ error: "Failed to fetch news" });
  }
});

export default router;
