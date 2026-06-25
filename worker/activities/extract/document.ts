import mammoth from 'mammoth';
import { PDFParse } from 'pdf-parse';

export interface ExtractionResult {
  text: string;
  metadata: {
    method: 'pdf-parse' | 'mammoth' | 'utf8' | 'unsupported';
    page_count?: number;
    word_count?: number;
    char_count?: number;
  };
}

export async function extractDocumentText(
  buffer: Buffer,
  mimeType: string,
  _fileName: string
): Promise<ExtractionResult> {
  if (mimeType === 'application/pdf') {
    return extractPdf(buffer);
  }

  if (
    mimeType ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    return extractDocx(buffer);
  }

  if (mimeType === 'text/plain') {
    const text = buffer.toString('utf8');
    return {
      text,
      metadata: {
        method: 'utf8',
        word_count: countWords(text),
        char_count: text.length,
      },
    };
  }

  return { text: '', metadata: { method: 'unsupported' } };
}

async function extractPdf(buffer: Buffer): Promise<ExtractionResult> {
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    const text = (result.text ?? '').replace(/\x00/g, '');
    return {
      text,
      metadata: {
        method: 'pdf-parse',
        page_count: result.pages?.length,
        word_count: countWords(text),
        char_count: text.length,
      },
    };
  } finally {
    await parser.destroy();
  }
}

async function extractDocx(buffer: Buffer): Promise<ExtractionResult> {
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value ?? '').replace(/\x00/g, '');
  return {
    text,
    metadata: {
      method: 'mammoth',
      word_count: countWords(text),
      char_count: text.length,
    },
  };
}

function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}
