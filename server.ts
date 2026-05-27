import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import * as cheerio from "cheerio";
import path from "path";
import { fileURLToPath } from "url";
import puppeteer from "puppeteer";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import JSZip from "jszip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure directories exist
const THUMBNAILS_DIR = path.join(process.cwd(), "public", "thumbnails");
const CLIPS_DIR = path.join(process.cwd(), "public", "clips");

if (!fs.existsSync(THUMBNAILS_DIR)) fs.mkdirSync(THUMBNAILS_DIR, { recursive: true });
if (!fs.existsSync(CLIPS_DIR)) fs.mkdirSync(CLIPS_DIR, { recursive: true });

// Cleanup old files every hour
setInterval(() => {
  [THUMBNAILS_DIR, CLIPS_DIR].forEach(dir => {
    try {
      if (!fs.existsSync(dir)) return;
      const files = fs.readdirSync(dir);
      const now = Date.now();
      files.forEach(file => {
        const filePath = path.join(dir, file);
        const stats = fs.statSync(filePath);
        if (now - stats.mtimeMs > 1000 * 60 * 60) {
          if (stats.isDirectory()) {
            fs.rmSync(filePath, { recursive: true, force: true });
          } else {
            fs.unlinkSync(filePath);
          }
        }
      });
    } catch (e) {
      console.error(`Cleanup error in ${dir}:`, e);
    }
  });
}, 1000 * 60 * 60);

interface VideoResult {
  url: string;
  type: string;
  label: string;
  source: string;
}

function resolveUrl(src: string, baseUrl: string) {
  try {
    return new URL(src, baseUrl).href;
  } catch (e) {
    return src;
  }
}

function getExtension(url: string) {
  try {
    const path = new URL(url).pathname;
    return path.split('.').pop()?.toLowerCase() || "unknown";
  } catch (e) {
    return "unknown";
  }
}

async function extractFast(url: string): Promise<{ results: VideoResult[]; pageTitle: string }> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
      },
      timeout: 15000,
    });

    const html = response.data;
    const $ = cheerio.load(html);
    const results: VideoResult[] = [];
    const seen = new Set<string>();

    function addResult(src: string, label: string, source: string) {
      const fullUrl = resolveUrl(src, url);
      if (fullUrl && !seen.has(fullUrl)) {
        seen.add(fullUrl);
        results.push({
          url: fullUrl,
          type: getExtension(fullUrl),
          label,
          source
        });
      }
    }

    $("video, source, iframe").each((_, el) => {
      const src = $(el).attr("src") || $(el).attr("data-src") || $(el).attr("data-video-url");
      if (src) {
        const label = el.tagName === 'iframe' ? "Embedded Player" : "Direct Video";
        addResult(src, label, `HTML ${el.tagName} Tag`);
      }
    });

    const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8|webm|mov|avi|mkv|mpd)(?:[?#][^\s"']*)?)/gi;
    let match;
    while ((match = videoRegex.exec(html)) !== null) {
      addResult(match[1], "Deep Link", "Script/Regex Detection");
    }

    const relativeRegex = /['"]([^'"]+\.(?:mp4|m3u8|webm|mov|avi|mkv|mpd)(?:[?#][^\s"']*)?)['"]/gi;
    while ((match = relativeRegex.exec(html)) !== null) {
      const potentialUrl = match[1];
      if (potentialUrl.startsWith('/') || potentialUrl.startsWith('./') || potentialUrl.startsWith('../')) {
        addResult(potentialUrl, "Relative Link", "Path Detection");
      }
    }

    return { results, pageTitle: $("title").text().trim() || url };
  } catch (e) {
    return { results: [], pageTitle: url };
  }
}

async function extractDeep(url: string): Promise<{ results: VideoResult[]; pageTitle: string }> {
  try {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
      headless: true,
    });

    try {
      const page = await browser.newPage();
      await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
      
      const results: VideoResult[] = [];
      const seen = new Set<string>();

      function addResult(src: string, label: string, source: string) {
        const fullUrl = resolveUrl(src, url);
        if (fullUrl && !seen.has(fullUrl)) {
          const ext = getExtension(fullUrl);
          const videoExtensions = ['mp4', 'm3u8', 'webm', 'mov', 'avi', 'mkv', 'mpd', 'ts', 'm4s'];
          if (videoExtensions.includes(ext) || label === "Embedded Player" || fullUrl.includes('.isml') || fullUrl.includes('/hls/')) {
            seen.add(fullUrl);
            results.push({
              url: fullUrl,
              type: ext,
              label,
              source
            });
          }
        }
      }

      page.on('response', async response => {
        const respUrl = response.url();
        const contentType = response.headers()['content-type'] || '';
        const videoExtensions = ['.mp4', '.m3u8', '.webm', '.mpd', '.ts', '.m4s'];
        if (videoExtensions.some(ext => respUrl.toLowerCase().includes(ext))) {
          addResult(respUrl, "Network Stream", "Response URL Monitor");
        }
        if (contentType.includes('application/json') || contentType.includes('text/plain') || contentType.includes('application/javascript')) {
          try {
            const text = await response.text();
            const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8|webm|mov|avi|mkv|mpd)(?:[?#][^\s"']*)?)/gi;
            let match;
            while ((match = videoRegex.exec(text)) !== null) {
              addResult(match[1], "API Embedded Link", "Network Response Body Scan");
            }
          } catch (e) {}
        }
      });

      await page.goto(url, { waitUntil: 'networkidle2', timeout: 35000 });
      const pageTitle = await page.title();

      await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          let distance = 100;
          let timer = setInterval(() => {
            let scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;
            if(totalHeight >= scrollHeight){
              clearInterval(timer);
              resolve();
            }
          }, 100);
        });
        window.scrollTo(0, 0);
      });

      await new Promise(r => setTimeout(r, 5000));

      const data = await page.evaluate(() => {
        const results: {tag: string, src: string}[] = [];
        document.querySelectorAll('video, source, iframe, embed, object').forEach(el => {
          const src = el.getAttribute('src') || el.getAttribute('data-src') || el.getAttribute('data-video-url');
          if (src) results.push({ tag: el.tagName.toLowerCase(), src });
        });
        document.querySelectorAll('video source').forEach(el => {
          const src = el.getAttribute('src');
          if (src) results.push({ tag: 'source', src });
        });
        document.querySelectorAll('[data-config], [data-player-config], [data-video-id]').forEach(el => {
           const config = el.getAttribute('data-config') || el.getAttribute('data-player-config');
           if (config && (config.includes('.mp4') || config.includes('.m3u8'))) {
             results.push({ tag: 'config-attribute', src: config });
           }
        });
        return results;
      });

      data.forEach(n => {
        const label = n.tag === 'iframe' ? "Embedded Player" : "Direct Video";
        addResult(n.src!, label, `Enhanced DOM Scanner (${n.tag})`);
      });

      const renderedHtml = await page.content();
      const videoRegex = /(https?:\/\/[^\s"'<>]+\.(?:mp4|m3u8|webm|mov|avi|mkv|mpd)(?:[?#][^\s"']*)?)/gi;
      let match;
      while ((match = videoRegex.exec(renderedHtml)) !== null) {
        addResult(match[1], "Deep Link", "DOM Content/Regex");
      }

      return { results, pageTitle: pageTitle || url };
    } finally {
      await browser.close();
    }
  } catch (e) {
    return { results: [], pageTitle: url };
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.post("/api/extract", async (req, res) => {
    const { url, mode } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });
    try {
      new URL(url);
      let data;
      if (mode === "deep") {
        data = await extractDeep(url);
      } else {
        data = await extractFast(url);
      }
      res.json({ success: true, ...data });
    } catch (error: any) {
      res.status(500).json({ error: "Failed to process request." });
    }
  });

  app.post("/api/generate-thumbnails", async (req, res) => {
    const { url, count = 10, resolution = "640" } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const sessionId = Math.random().toString(36).substring(7);
      const outputFolder = path.join(THUMBNAILS_DIR, sessionId);
      if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder, { recursive: true });

      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err) return res.status(500).json({ error: "Could not read video metadata." });
        const duration = metadata.format.duration;
        if (!duration) return res.status(500).json({ error: "Could not determine duration." });

        // Calculate intervals for thumbnails
        const interval = duration / count;
        const tasks: Promise<any>[] = [];

        for (let i = 0; i < count; i++) {
          const startTime = i * interval + (interval / 2); // Center of the segment
          const outputPath = path.join(outputFolder, `thumb_${i}_${startTime.toFixed(2)}.png`);
          
          tasks.push(new Promise((resolve, reject) => {
            // Using "thumbnail" filter which selects the most representative frame in a segment
            // This naturally avoids black/blurry frames if better ones exist
            ffmpeg(url)
              .seekInput(startTime)
              // Use videoFilters instead of complexFilter for automatic stream mapping
              .videoFilters(`scale=${resolution}:-1,thumbnail=30`)
              .frames(1)
              .on('end', resolve)
              .on('error', (err) => {
                console.error(`Sub-task error at ${startTime}:`, err);
                // Fallback: Just take the frame at exact time if filter fails
                ffmpeg(url)
                  .seekInput(startTime)
                  .size(`${resolution}x?`)
                  .frames(1)
                  .on('end', resolve)
                  .on('error', (err) => {
                    console.error(`Fallback error at ${startTime}:`, err);
                    reject(err);
                  })
                  .save(outputPath);
              })
              .save(outputPath);
          }));
        }

        Promise.all(tasks)
          .then(() => {
            const files = fs.readdirSync(outputFolder)
              .sort((a, b) => {
                const tA = parseFloat(a.split("_").pop()?.replace(".png", "") || "0");
                const tB = parseFloat(b.split("_").pop()?.replace(".png", "") || "0");
                return tA - tB;
              })
              .map(file => ({
                url: `/thumbnails/${sessionId}/${file}`,
                timestamp: file.split("_").pop()?.replace(".png", "") || "0"
              }));
            res.json({ success: true, thumbnails: files });
          })
          .catch(err => {
            console.error("Batch error:", err);
            res.status(500).json({ error: "High-density extraction failed." });
          });
      });
    } catch (error: any) {
      res.status(500).json({ error: "Internal error." });
    }
  });

  app.post("/api/generate-clip", async (req, res) => {
    const { url, duration = 15 } = req.body;
    if (!url) return res.status(400).json({ error: "URL is required" });

    try {
      const sessionId = Math.random().toString(36).substring(7);
      const outputFilename = `mashup_${sessionId}.mp4`;
      const outputPath = path.join(CLIPS_DIR, outputFilename);

      console.log(`Starting mashup for ${url}, target duration: ${duration}s`);

      // 1. Probe for duration
      ffmpeg.ffprobe(url, (err, metadata) => {
        if (err || !metadata.format.duration) {
          console.error("FFprobe error:", err);
          return res.status(500).json({ error: "Could not probe video duration." });
        }

        const totalDuration = metadata.format.duration;
        const segDuration = duration / 3;
        
        // Define 3 logical points: Start, Middle, End
        const points = [
          totalDuration * 0.1, // 10% in
          (totalDuration / 2) - (segDuration / 2),
          totalDuration - segDuration - 1.5 // 1.5s buffer from actual end
        ].map(p => Math.max(0, p));

        console.log(`Seek points: ${points.join(", ")}`);

        // 2. Use multiple inputs with seekInput - much faster for remote URLs
        // We use a complex filter to ensure scaling and concatenation works reliably
        // If audio is missing in source, we ignore audio mapping if it fails
        const command = ffmpeg()
          .input(url).seekInput(points[0].toFixed(2)).inputOptions(`-t ${segDuration}`)
          .input(url).seekInput(points[1].toFixed(2)).inputOptions(`-t ${segDuration}`)
          .input(url).seekInput(points[2].toFixed(2)).inputOptions(`-t ${segDuration}`)
          .complexFilter([
            `[0:v]scale=426:240,setpts=PTS-STARTPTS[v0]`,
            `[1:v]scale=426:240,setpts=PTS-STARTPTS[v1]`,
            `[2:v]scale=426:240,setpts=PTS-STARTPTS[v2]`,
            `[v0][0:a][v1][1:a][v2][2:a]concat=n=3:v=1:a=1[outv][outa]`
          ])
          .map('[outv]')
          .map('[outa]')
          .videoCodec('libx264')
          .videoBitrate('180k')
          .audioBitrate('32k')
          .outputOptions([
            '-preset superfast',
            '-profile:v baseline',
            '-level 3.0',
            '-movflags +faststart'
          ])
          .on("start", (cmd) => {
            console.log("FFmpeg started with command:", cmd);
          })
          .on("end", () => {
            console.log("Mashup finished successfully");
            res.json({ success: true, url: `/clips/${outputFilename}` });
          })
          .on("error", (err) => {
            console.error("FFmpeg mashup error:", err);
            // Fallback: If concatenation with audio failed (maybe no audio in source), try video only
            console.log("Attempting video-only fallback...");
            ffmpeg()
              .input(url).seekInput(points[0].toFixed(2)).inputOptions(`-t ${segDuration}`)
              .input(url).seekInput(points[1].toFixed(2)).inputOptions(`-t ${segDuration}`)
              .input(url).seekInput(points[2].toFixed(2)).inputOptions(`-t ${segDuration}`)
              .complexFilter([
                `[0:v]scale=426:240,setpts=PTS-STARTPTS[v0]`,
                `[1:v]scale=426:240,setpts=PTS-STARTPTS[v1]`,
                `[2:v]scale=426:240,setpts=PTS-STARTPTS[v2]`,
                `[v0][v1][v2]concat=n=3:v=1:a=0[outv]`
              ])
              .map('[outv]')
              .videoCodec('libx264')
              .videoBitrate('180k')
              .noAudio()
              .outputOptions([
                '-preset superfast',
                '-profile:v baseline',
                '-level 3.0',
                '-movflags +faststart'
              ])
              .on("end", () => {
                res.json({ success: true, url: `/clips/${outputFilename}` });
              })
              .on("error", (err2) => {
                console.error("Fallback failed:", err2);
                res.status(500).json({ error: "Mashup generation failed completely." });
              })
              .save(path.join(CLIPS_DIR, `fb_${outputFilename}`));
          })
          .save(outputPath);
      });
    } catch (error: any) {
      console.error("Internal Clip Error:", error);
      res.status(500).json({ error: "Internal error." });
    }
  });

  app.use("/thumbnails", express.static(THUMBNAILS_DIR));
  app.use("/clips", express.static(CLIPS_DIR));

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
