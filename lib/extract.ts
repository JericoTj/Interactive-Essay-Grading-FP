import mammoth from "mammoth";
import * as pdfParseModule from "pdf-parse";

// Handle both CJS default and named exports
const pdfParse = (pdfParseModule as any).default ?? pdfParseModule;

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const data = await pdfParse(buffer);
    return data.text.trim();
  }

  if (mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
    const result = await mammoth.extractRawText({ buffer });
    return result.value.trim();
  }

  if (mimeType === "text/plain") {
    return buffer.toString("utf-8").trim();
  }

  throw new Error("Unsupported file type for text extraction");
}