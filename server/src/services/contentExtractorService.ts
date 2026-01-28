import { getSubtitles } from "youtube-caption-extractor";
import axios from "axios";
import * as cheerio from "cheerio";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import ytdl from "@distube/ytdl-core";
import fs from "fs";
import path from "path";
import os from "os";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY!);

export async function extractFromYoutube(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/,
    );
    if (!videoIdMatch) {
      throw new Error("Invalid YouTube URL");
    }

    const videoID = videoIdMatch[1];

    // Try to get captions first (fast and free)
    try {
      let captions;
      try {
        captions = await getSubtitles({ videoID, lang: "en" });
      } catch (err) {
        captions = await getSubtitles({ videoID });
      }

      if (captions && captions.length > 0) {
        const fullText = captions.map((caption: any) => caption.text).join(" ");

        if (fullText.length >= 50) {
          console.log("✅ Extracted captions from YouTube video");
          return fullText;
        }
      }
    } catch (captionError) {
      console.log("⚠️ No captions found, analyzing video with Gemini AI...");
    }

    // Fallback: Download video and analyze with Gemini
    console.log("🎥 Downloading video for AI analysis...");

    const tempDir = os.tmpdir();
    const tempVideoPath = path.join(tempDir, `video_${videoID}.mp4`);

    // Download video
    await new Promise<void>((resolve, reject) => {
      ytdl(url, { quality: "lowest", filter: "videoandaudio" })
        .pipe(fs.createWriteStream(tempVideoPath))
        .on("finish", () => {
          console.log("✅ Video downloaded");
          resolve();
        })
        .on("error", (err) => {
          console.error("Video download error:", err);
          reject(new Error("Failed to download video"));
        });
    });

    console.log("📤 Uploading video to Gemini...");

    // Upload to Gemini
    const uploadResponse = await fileManager.uploadFile(tempVideoPath, {
      mimeType: "video/mp4",
      displayName: `YouTube_${videoID}`,
    });

    console.log(`✅ Uploaded: ${uploadResponse.file.uri}`);

    // Wait for processing
    let file = await fileManager.getFile(uploadResponse.file.name);
    while (file.state === "PROCESSING") {
      console.log("⏳ Processing video...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      file = await fileManager.getFile(uploadResponse.file.name);
    }

    if (file.state === "FAILED") {
      throw new Error("Video processing failed");
    }

    console.log("🤖 Analyzing video with Gemini AI...");

    // Generate content from video
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResponse.file.mimeType,
          fileUri: uploadResponse.file.uri,
        },
      },
      {
        text: "Please provide a detailed transcript and summary of this video. Include all spoken dialogue, key topics discussed, main points, and important information. Format it as a comprehensive text transcript that captures the video's content.",
      },
    ]);

    const videoTranscript = result.response.text();

    // Clean up
    console.log("🗑️ Cleaning up...");
    fs.unlinkSync(tempVideoPath); // Delete temp video
    await fileManager.deleteFile(uploadResponse.file.name); // Delete from Gemini

    console.log("✅ Video analyzed successfully!");

    if (videoTranscript.length < 50) {
      throw new Error("Unable to extract sufficient content from video");
    }

    return videoTranscript.slice(0, 10000);
  } catch (error: any) {
    console.error("YouTube extraction error:", error);
    throw new Error(
      error.message || "Failed to extract content from YouTube video",
    );
  }
}

export async function extractFromWebsite(url: string): Promise<string> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PreguntameBot/1.0)",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(response.data);

    // Remove script, style, nav, footer, and other non-content elements
    $("script, style, nav, footer, header, aside, .advertisement").remove();

    // Extract main content (prioritize article, main, or body)
    const mainContent = $("article, main, .content, body").first().text();

    // Clean up whitespace
    const cleanText = mainContent.replace(/\s+/g, " ").trim().slice(0, 10000);

    if (cleanText.length < 100) {
      throw new Error("Insufficient content extracted from website");
    }

    return cleanText;
  } catch (error) {
    console.error("Website extraction error:", error);
    throw new Error(
      "Failed to extract content from website. Please check the URL.",
    );
  }
}

export async function extractFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(buffer),
      useSystemFonts: true,
    });

    const pdf = await loadingTask.promise;
    let fullText = "";

    // Extract text from all pages
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine all text items from the page
      const pageText = textContent.items.map((item: any) => item.str).join(" ");

      fullText += pageText + " ";
    }

    // Clean up and limit text
    const cleanText = fullText.replace(/\s+/g, " ").trim().slice(0, 10000);

    if (cleanText.length < 50) {
      throw new Error("Insufficient text extracted from PDF");
    }

    return cleanText;
  } catch (error) {
    console.error("PDF extraction error:", error);
    throw new Error("Failed to extract text from PDF file.");
  }
}

export async function extractFromWord(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.slice(0, 10000);
  } catch (error) {
    console.error("Word extraction error:", error);
    throw new Error("Failed to extract text from Word file.");
  }
}

export async function extractFromText(buffer: Buffer): Promise<string> {
  return buffer.toString("utf-8").slice(0, 10000);
}
