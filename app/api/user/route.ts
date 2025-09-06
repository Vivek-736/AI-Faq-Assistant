import { NextRequest, NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import { contentstackAPI } from '@/lib/contentstack'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  try {
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let userData = null
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Attempt ${attempt} to fetch user by email:`, user.emailAddresses[0]?.emailAddress)
      userData = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
      if (userData) break
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    console.log('User data in /api/user:', userData)
    
    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: userData })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('User API error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
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
    
    return NextResponse.json({ user: newUser.entry })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('User creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 })
  }
}