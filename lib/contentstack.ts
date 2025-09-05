// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ContentstackSDK from 'contentstack/delivery-sdk';

const Stack = ContentstackSDK.stack({
  api_key: process.env.CONTENTSTACK_API_KEY!,
  delivery_token: process.env.CONTENTSTACK_DELIVERY_TOKEN!,
  environment: process.env.CONTENTSTACK_ENVIRONMENT || 'development',
  region: ContentstackSDK.Region.US,
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
  tags?: string[]
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

export const contentstackAPI = {
  async createUser(userData: Omit<User, 'uid' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`https://api.contentstack.io/v3/content_types/users/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: userData.name,
          ...userData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    })
    return response.json()
  },

  async getUserByEmail(email: string) {
    const query = Stack.contentType('users').entry()
    const result = await query.where('email', email).find()
    return result[0]?.[0] as User | null
  },

  async getUsersByOrg(organizationId: string) {
    const query = Stack.contentType('users').entry()
    const result = await query.where('organization_id', organizationId).find()
    return result[0] as User[]
  },

  async createOrganization(orgData: Omit<Organization, 'uid' | 'created_at' | 'updated_at' | 'invite_code'>) {
    const inviteCode = Math.random().toString(36).substring(2, 15)
    
    const response = await fetch(`https://api.contentstack.io/v3/content_types/organizations/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: orgData.name,
          ...orgData,
          invite_code: inviteCode,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    })
    return response.json()
  },

  async getOrganizationByInviteCode(inviteCode: string) {
    const query = Stack.contentType('organizations').entry()
    const result = await query.where('invite_code', inviteCode).find()
    return result[0]?.[0] as Organization | null
  },

  async getOrganizationById(orgId: string) {
    const query = Stack.contentType('organizations').entry(orgId)
    const result = await query.find()
    return result as Organization
  },

  async createFAQ(faqData: Omit<FAQ, 'uid' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`https://api.contentstack.io/v3/content_types/faqs/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          title: faqData.question,
          ...faqData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    })
    return response.json()
  },

  async getFAQsByOrg(organizationId: string) {
    const query = Stack.contentType('faqs').entry()
    const result = await query.where('organization_id', organizationId).find()
    return result[0] as FAQ[]
  },

  async createDocument(docData: Omit<Document, 'uid' | 'created_at' | 'updated_at'>) {
    const response = await fetch(`https://api.contentstack.io/v3/content_types/documents/entries`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.CONTENTSTACK_MANAGEMENT_TOKEN}`,
        'api_key': process.env.CONTENTSTACK_API_KEY!,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entry: {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          title: docData.title,
          ...docData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      })
    })
    return response.json()
  },

  async getDocumentsByOrg(organizationId: string) {
    const query = Stack.contentType('documents').entry()
    const result = await query.where('organization_id', organizationId).find()
    return result[0] as Document[]
  }
}

export { Stack }
