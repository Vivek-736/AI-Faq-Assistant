import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { contentstackAPI } from '@/lib/contentstack'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: orgId } = await params

    console.log('Fetching organization with ID:', orgId)

    const organization = await contentstackAPI.getOrganizationById(orgId)
    
    if (!organization) {
      console.error('Organization not found for ID:', orgId)
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    const currentUserData = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
    
    if (!currentUserData || currentUserData.organization_id !== orgId) {
      console.error('Access denied for user:', user.emailAddresses[0]?.emailAddress, 'Org ID:', orgId)
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    const [documents, faqs, members] = await Promise.all([
      contentstackAPI.getDocumentsByOrg(orgId),
      contentstackAPI.getFAQsByOrg(orgId),
      contentstackAPI.getUsersByOrg(orgId)
    ])

    return NextResponse.json({
      organization,
      stats: {
        documents: documents?.length || 0,
        faqs: faqs?.length || 0,
        members: members?.length || 0
      }
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Organization detail API error:', error)
    
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}