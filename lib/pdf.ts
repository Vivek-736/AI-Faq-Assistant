import pdf from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdf(buffer)
    return data.text
  } catch (error) {
    console.error('PDF parsing error:', error)
    throw new Error('Failed to extract text from PDF')
  }
}

export function chunkText(text: string, chunkSize: number = 1000): string[] {
  const chunks = []
  let currentChunk = ''
  
  const sentences = text.split(/[.!?]+/)
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > chunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim())
      currentChunk = sentence
    } else {
      currentChunk += sentence + '. '
    }
  }
  
  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}