import * as contentstack from 'contentstack'

const Stack = contentstack.Stack({
  api_key: process.env.CONTENTSTACK_API_KEY!,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: contentstack.Region.US,
})

export interface User {
  uid: string
  email: string
  name: string
  role: 'admin' | 'member'
  organization_id: string
  created_at: string
  updated_at: string
}

export interface Organization {
  uid: string
  name: string
  description?: string
  admin_id: string
  invite_code: string
  created_at: string
  updated_at: string
}

export interface FAQ {
  uid: string
  question: string
  answer: string
  organization_id: string
  tagss?: string[]
  created_at: string
  updated_at: string
}

export interface Document {
  uid: string
  title: string
  content: string
  file_url: string
  organization_id: string
  created_at: string
  updated_at: string
}

const MANAGEMENT_API_BASE = 'https://api.contentstack.io/v3'

export const contentstackAPI = {
  async createUser(userData: Omit<User, 'uid' | 'created_at' | 'updated_at'>) {
    const uniqueTitle = `${userData.email}-${Date.now()}` // Ensure unique title
    const response = await fetch(`${MANAGEMENT_API_BASE}/content_types/users/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: uniqueTitle,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          organization_id: userData.organization_id,
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Contentstack API Error: ${JSON.stringify(errorData)}`)
    }
    
    const result = await response.json()
    console.log('Created user result:', result) // Debug log

    // Publish the user entry
    const publishResponse = await fetch(`${MANAGEMENT_API_BASE}/content_types/users/entries/${result.entry.uid}/publish`, {
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
      console.error('Failed to publish user:', errorData)
      throw new Error(`Contentstack Publish Error: ${JSON.stringify(errorData)}`)
    }
    console.log('User published:', await publishResponse.json()) // Debug log

    return result
  },

  async getUserByEmail(email: string) {
    try {
      console.log('Fetching user by email:', email) // Debug log
      // Use Management API to query user by email
      const response = await fetch(
        `${MANAGEMENT_API_BASE}/content_types/users/entries?query={"email":"${email}"}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
            'api_key': process.env.CONTENTSTACK_API_KEY!,
            'Content-Type': 'application/json',
          }
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error fetching user by email:', errorData)
        return null
      }

      const result = await response.json()
      console.log('User fetch result:', result) // Debug log
      return result.entries?.[0] as User | null
    } catch (error) {
      console.error('Error fetching user by email:', error)
      return null
    }
  },

  async getUsersByOrg(organizationId: string) {
    try {
      console.log('Fetching users for organization:', organizationId) // Debug log
      const query = Stack.ContentType('users').Query()
      const result = await query
        .where('organization_id', organizationId)
        .includeCount()
        .find()
      console.log('Users fetch result:', result) // Debug log
      return result.entries as User[] || []
    } catch (error) {
      console.error('Error fetching users by org:', error)
      return []
    }
  },

  async createOrganization(orgData: Omit<Organization, 'uid' | 'created_at' | 'updated_at' | 'invite_code'>) {
    const inviteCode = Math.random().toString(36).substring(2, 15)
    
    const response = await fetch(`${MANAGEMENT_API_BASE}/content_types/organizations/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: orgData.name,
          name: orgData.name,
          description: orgData.description || '',
          admin_id: orgData.admin_id,
          invite_code: inviteCode,
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Contentstack API Error: ${JSON.stringify(errorData)}`)
    }
    
    const result = await response.json()
    console.log('Created organization result:', result) // Debug log
    return result
  },

  async getOrganizationByInviteCode(inviteCode: string) {
    try {
      console.log('Fetching organization by invite code:', inviteCode) // Debug log
      const query = Stack.ContentType('organizations').Query()
      const result = await query
        .where('invite_code', inviteCode)
        .includeCount()
        .find()
      console.log('Organization by invite code result:', result) // Debug log
      return result.entries?.[0] as Organization | null
    } catch (error) {
      console.error('Error fetching org by invite code:', error)
      return null
    }
  },

  async getOrganizationById(orgId: string) {
    try {
      console.log('Fetching organization by ID:', orgId) // Debug log
      const query = Stack.ContentType('organizations').Query()
      const result = await query
        .where('uid', orgId)
        .includeCount()
        .find()
      console.log('Organization fetch result:', result) // Debug log
      return result.entries?.[0] as Organization | null
    } catch (error) {
      console.error('Error fetching org by id:', error)
      return null
    }
  },

  async createFAQ(faqData: Omit<FAQ, 'uid' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`${MANAGEMENT_API_BASE}/content_types/faqs/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: faqData.question,
          question: faqData.question,
          answer: faqData.answer,
          organization_id: faqData.organization_id,
          tagss: faqData.tagss || [],
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Contentstack API Error: ${JSON.stringify(errorData)}`)
    }
    
    return response.json()
  },

  async getFAQsByOrg(organizationId: string) {
    try {
      console.log('Fetching FAQs for organization:', organizationId) // Debug log
      const query = Stack.ContentType('faqs').Query()
      const result = await query
        .where('organization_id', organizationId)
        .includeCount()
        .find()
      console.log('FAQs fetch result:', result) // Debug log
      return result.entries as FAQ[] || []
    } catch (error) {
      console.error('Error fetching FAQs by org:', error)
      return []
    }
  },

  async createDocument(docData: Omit<Document, 'uid' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`${MANAGEMENT_API_BASE}/content_types/documents/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: docData.title,
          content: docData.content,
          file_url: docData.file_url,
          organization_id: docData.organization_id,
        }
      })
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Contentstack API Error: ${JSON.stringify(errorData)}`)
    }
    
    return response.json()
  },

  async getDocumentsByOrg(organizationId: string) {
    try {
      console.log('Fetching documents for organization:', organizationId) // Debug log
      const query = Stack.ContentType('documents').Query()
      const result = await query
        .where('organization_id', organizationId)
        .includeCount()
        .find()
      console.log('Documents fetch result:', result) // Debug log
      return result.entries as Document[] || []
    } catch (error) {
      console.error('Error fetching documents by org:', error)
      return []
    }
  }
}

export { Stack }
