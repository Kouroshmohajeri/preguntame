import { getSubtitles } from "youtube-caption-extractor";
import axios from "axios";
import * as cheerio from "cheerio";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";

export async function extractFromYoutube(url: string): Promise<string> {
  try {
    // Extract video ID from URL
    const videoIdMatch = url.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?\s]+)/
    );
    if (!videoIdMatch) {
      throw new Error("Invalid YouTube URL");
    }

    const videoID = videoIdMatch[1];

    // Try to get subtitles in English, fallback to auto-generated
    let captions;
    try {
      captions = await getSubtitles({ videoID, lang: "en" });
    } catch (err) {
      // Try without language specification (gets default/auto-generated)
      captions = await getSubtitles({ videoID });
    }

    if (!captions || captions.length === 0) {
      throw new Error("No captions found for this video");
    }

    // Combine all caption text
    const fullText = captions.map((caption: any) => caption.text).join(" ");

    if (fullText.length < 50) {
      throw new Error("Insufficient content in video captions");
    }

    return fullText;
  } catch (error: any) {
    console.error("YouTube extraction error:", error);
    throw new Error(
      error.message ||
        "Failed to extract YouTube transcript. Make sure the video has captions available."
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
      "Failed to extract content from website. Please check the URL."
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
