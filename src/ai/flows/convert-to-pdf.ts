'use server';

import { z } from 'genkit';
import puppeteer from 'puppeteer';

const ConvertToPdfInputSchema = z.object({
    htmlContent: z.string().describe('The HTML content to convert.'),
});
export type ConvertToPdfInput = z.infer<typeof ConvertToPdfInputSchema>;

const ConvertToPdfOutputSchema = z.object({
    pdfBase64: z.string().describe('The PDF as a base64-encoded string'),
});
export type ConvertToPdfOutput = z.infer<typeof ConvertToPdfOutputSchema>;

function buildPrintableHtml(htmlContent: string): string {
    return `<!DOCTYPE html>
  <html>
    <head>
      <meta charset="utf-8"/>
      <style>
        @page { size: A4; margin: 25mm; }
        body {
          font-family: "Times New Roman", Georgia, serif;
          font-size: 12pt;
          line-height: 1.6;
          color: #1f2937;
        }
        h1, h2, h3, h4, h5, h6 { color: #0f172a; margin: 0 0 8pt 0; }
        h1 { font-size: 20pt; }
        h2 { font-size: 16pt; }
        h3 { font-size: 14pt; }
        p { margin: 0 0 10pt 0; }
        ul, ol { margin: 0 0 10pt 24pt; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #cbd5e1; padding: 6pt; }
      </style>
    </head>
    <body>${htmlContent}</body>
  </html>`;
}

export async function convertToPdf(
    input: ConvertToPdfInput
): Promise<ConvertToPdfOutput> {
    const html = buildPrintableHtml(input.htmlContent);
    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'load' });
        const buffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: { top: '25mm', right: '25mm', bottom: '25mm', left: '25mm' },
        });
        const pdfBase64 = Buffer.from(buffer).toString('base64');
        return { pdfBase64 };
    } finally {
        await browser.close();
    }
}


