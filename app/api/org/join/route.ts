import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { contentstackAPI } from '@/lib/contentstack'

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { inviteCode } = body

    if (!inviteCode) {
      return NextResponse.json({ error: 'Invite code is required' }, { status: 400 })
    }

    const organization = await contentstackAPI.getOrganizationByInviteCode(inviteCode)
    
    if (!organization) {
      return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 })
    }

    const existingUser = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
    
    if (existingUser) {
      return NextResponse.json({ error: 'User already belongs to an organization' }, { status: 400 })
    }

    const userData = {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName + ' ' + user.lastName,
      role: 'member' as const,
      organization_id: organization.uid,
    }

    const newUser = await contentstackAPI.createUser(userData)
    
    return NextResponse.json({ 
      user: newUser.entry,
      organization,
      message: 'Successfully joined organization'
    })
  } catch (error) {
    console.error('Organization join error:', error)
    return NextResponse.json({ error: 'Failed to join organization' }, { status: 500 })
  }
}