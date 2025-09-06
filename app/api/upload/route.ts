import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { contentstackAPI } from '@/lib/contentstack'
import { extractTextFromPDF } from '@/lib/pdf'
import { geminiAPI } from '@/lib/gemini'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const currentUserData = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
    
    if (!currentUserData || currentUserData.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can upload files' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const organizationId = formData.get('organizationId') as string

    if (!file || !organizationId) {
      return NextResponse.json({ error: 'File and organization ID are required' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are supported' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const extractedText = await extractTextFromPDF(buffer)
    
    if (!extractedText || extractedText.trim().length === 0) {
      return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 400 })
    }

    const documentData = {
      title: file.name.replace('.pdf', ''),
      content: extractedText,
      file_url: '',
      organization_id: organizationId,
    }

    const document = await contentstackAPI.createDocument(documentData)

    const extractedFAQs = await geminiAPI.extractFAQsFromText(extractedText)
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const faqPromises = extractedFAQs.map(async (faq: any) => {
      if (faq.question && faq.answer) {
        return contentstackAPI.createFAQ({
          question: faq.question,
          answer: faq.answer,
          organization_id: organizationId,
          tagss: ['auto-generated', 'pdf-extract']
        })
      }
      return null
    })

    const faqs = await Promise.all(faqPromises)
    const successfulFAQs = faqs.filter(faq => faq !== null)

    return NextResponse.json({
      message: 'PDF processed successfully',
      document: document.entry,
      faqsCreated: successfulFAQs.length,
      faqs: successfulFAQs
    })

  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to process PDF file' }, 
      { status: 500 }
    )
  }
}