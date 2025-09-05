import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { contentstackAPI } from '@/lib/contentstack'

export async function GET() {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const existingUser = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
    
    if (existingUser) {
      return NextResponse.json({ user: existingUser })
    }

    return NextResponse.json({ user: null })
  } catch (error) {
    console.error('User API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { organizationId, role = 'member' } = body

    const userData = {
      email: user.emailAddresses[0]?.emailAddress || '',
      name: user.firstName + ' ' + user.lastName,
      role: role,
      organization_id: organizationId,
    }

    const newUser = await contentstackAPI.createUser(userData)
    
    return NextResponse.json({ user: newUser })
  } catch (error) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}