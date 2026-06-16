import mammoth from "mammoth";

export async function extractText(buffer: Buffer, mimeType: string): Promise<string> {
  if (mimeType === "application/pdf") {
    const PDFParser = (await import("pdf2json")).default;
    return new Promise((resolve, reject) => {
      const parser = new PDFParser();
      parser.on("pdfParser_dataReady", (data: any) => {
        const text = data.Pages
          .flatMap((page: any) => page.Texts)
          .map((t: any) => decodeURIComponent(t.R.map((r: any) => r.T).join("")))
          .join(" ")
          .trim();
        resolve(text);
      });
      parser.on("pdfParser_dataError", reject);
      parser.parseBuffer(buffer);
    });
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