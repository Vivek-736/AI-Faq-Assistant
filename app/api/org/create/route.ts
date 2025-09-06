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
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Organization name is required' }, { status: 400 })
    }

    const orgData = {
      name,
      description: description || '',
      admin_id: user.id,
    }

    // Create the organization
    const newOrg = await contentstackAPI.createOrganization(orgData)
    console.log('Created organization:', newOrg) // Debug log

    // Publish the organization entry
    const publishResponse = await fetch(`${process.env.CONTENTSTACK_API_BASE || 'https://api.contentstack.io/v3'}/content_types/organizations/entries/${newOrg.entry.uid}/publish`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          environments: [process.env.CONTENTSTACK_ENVIRONMENT || 'development'],
          locales: ['en-us'],
        }
      })
    })

    if (!publishResponse.ok) {
      const errorData = await publishResponse.json()
      console.error('Failed to publish organization:', errorData)
      throw new Error(`Contentstack Publish Error: ${JSON.stringify(errorData)}`)
    }
    console.log('Organization published:', await publishResponse.json()) // Debug log

    // Check if user already exists
    let userData = await contentstackAPI.getUserByEmail(user.emailAddresses[0]?.emailAddress || '')
    
    if (userData) {
      // User exists, update their organization_id and role if necessary
      if (userData.organization_id !== newOrg.entry.uid || userData.role !== 'admin') {
        const response = await fetch(`${process.env.CONTENTSTACK_API_BASE || 'https://api.contentstack.io/v3'}/content_types/users/entries/${userData.uid}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
            'api_key': process.env.CONTENTSTACK_API_KEY!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entry: {
              title: user.emailAddresses[0]?.emailAddress || '',
              email: user.emailAddresses[0]?.emailAddress || '',
              name: user.firstName + ' ' + user.lastName,
              role: 'admin',
              organization_id: newOrg.entry.uid,
            }
          })
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`Contentstack API Error: ${JSON.stringify(errorData)}`)
        }
        userData = (await response.json()).entry
        console.log('Updated user:', userData) // Debug log
      }
    } else {
      // Create new user
      const createUserResponse = await contentstackAPI.createUser({
        email: user.emailAddresses[0]?.emailAddress || '',
        name: user.firstName + ' ' + user.lastName,
        role: 'admin',
        organization_id: newOrg.entry.uid,
      })
      console.log('Created user:', createUserResponse) // Debug log
      userData = createUserResponse.entry // Extract entry from createUser response
    }
    
    return NextResponse.json({ 
      organization: newOrg.entry,
      user: userData,
      message: 'Organization created successfully'
    })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Organization creation error:', error)
    return NextResponse.json({ error: error.message || 'Failed to create organization' }, { status: 500 })
  }
}