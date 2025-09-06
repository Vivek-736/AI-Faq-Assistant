import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export const geminiAPI = {
  async generateAnswer(question: string, context: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `
Context: You are an AI assistant helping users with questions based on their organization's knowledge base.

Available Information:
${context}

User Question: ${question}

Instructions:
- Provide a helpful and accurate answer based on the available information
- If the information is not sufficient to answer the question, say so politely
- Keep answers concise but complete
- Use a friendly, professional tone

Answer:
    `
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      return response.text()
    } catch (error) {
      console.error('Gemini API error:', error)
      return "I'm sorry, I'm having trouble processing your question right now. Please try again later."
    }
  },

  async extractFAQsFromText(text: string) {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `
Analyze the following text and extract potential FAQ pairs (questions and answers).
Format your response as a JSON array of objects with "question" and "answer" properties.

Text:
${text}

Extract FAQs:
    `
    
    try {
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      try {
        return JSON.parse(text)
      } catch {
        return []
      }
    } catch (error) {
      console.error('Gemini FAQ extraction error:', error)
      return []
    }
  }
}

export { genAI }
