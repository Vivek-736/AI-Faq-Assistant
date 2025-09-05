'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Upload, Users, FileText, Plus, Copy, Check } from 'lucide-react'

interface User {
  uid: string
  email: string
  name: string
  role: 'admin' | 'member'
  organization_id: string
}

interface Organization {
  uid: string
  name: string
  description?: string
  admin_id: string
  invite_code: string
}

export default function Dashboard() {
  const { user: clerkUser } = useUser()
  const router = useRouter()
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [orgName, setOrgName] = useState('')
  const [orgDescription, setOrgDescription] = useState('')
  const [inviteCode, setInviteCode] = useState('')

  useEffect(() => {
    if (clerkUser) {
      checkUserStatus()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkUser])

  const checkUserStatus = async () => {
    try {
      const response = await fetch('/api/user')
      const data = await response.json()
      
      if (data.user) {
        setCurrentUser(data.user)
        if (data.user.role === 'member') {
          router.push('/chat')
          return
        }
        if (data.user.organization_id) {
          fetchOrganization(data.user.organization_id)
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async (orgId: string) => {
    try {
      const response = await fetch(`/api/org/${orgId}`)
      const data = await response.json()
      if (data.organization) {
        setOrganization(data.organization)
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, description: orgDescription })
      })
      
      const data = await response.json()
      if (response.ok) {
        setOrganization(data.organization)
        setShowCreateForm(false)
        setOrgName('')
        setOrgDescription('')
        await checkUserStatus()
      } else {
        alert(data.error || 'Failed to create organization')
      }
    } catch (error) {
      console.error('Error creating organization:', error)
      alert('Failed to create organization')
    }
  }

  const joinOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      })
      
      const data = await response.json()
      if (response.ok) {
        router.push('/chat')
      } else {
        alert(data.error || 'Failed to join organization')
      }
    } catch (error) {
      console.error('Error joining organization:', error)
      alert('Failed to join organization')
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !organization) return

    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file')
      return
    }

    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('organizationId', organization.uid)

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      if (response.ok) {
        alert('PDF uploaded and processed successfully!')
      } else {
        alert(data.error || 'Failed to upload PDF')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Failed to upload PDF')
    } finally {
      setUploading(false)
    }
  }

  const copyInviteCode = () => {
    if (organization?.invite_code) {
      navigator.clipboard.writeText(organization.invite_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome to AskNest</h1>
            
            <div className="grid md:grid-cols-2 gap-8">
              {/* Create Organization */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Plus className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-4">Create Organization</h2>
                <p className="text-gray-600 mb-6">Start your own organization and manage your team&apos;s knowledge base.</p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Organization
                </button>
              </div>

              {/* Join Organization */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <Users className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                <h2 className="text-xl font-semibold mb-4">Join Organization</h2>
                <p className="text-gray-600 mb-6">Join an existing organization using an invite code.</p>
                <button
                  onClick={() => setShowJoinForm(true)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Join Organization
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Create Organization Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Create Organization</h2>
              <form onSubmit={createOrganization}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Organization Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Join Organization Modal */}
        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold mb-6">Join Organization</h2>
              <form onSubmit={joinOrganization}>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter invite code"
                    required
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Join
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    )
  }

  // Admin Dashboard
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{organization?.name || 'Organization Dashboard'}</h1>
              <p className="text-gray-600 mt-2">{organization?.description}</p>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Chat
            </button>
          </div>

          {/* Invite Code Section */}
          {organization && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">Invite Team Members</h2>
              <p className="text-blue-700 mb-4">Share this invite code with your team members:</p>
              <div className="flex items-center gap-4">
                <code className="bg-white px-4 py-2 rounded border font-mono text-lg">
                  {organization.invite_code}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload PDF Section */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Upload className="h-8 w-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Upload Documents</h2>
            </div>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Upload PDF Files</h3>
              <p className="text-gray-600 mb-6">
                Upload PDF documents to automatically extract and add FAQs to your knowledge base.
              </p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || !organization}
                />
                <span className={`inline-block px-6 py-3 rounded-lg transition-colors ${
                  uploading || !organization
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}>
                  {uploading ? 'Processing...' : 'Choose PDF File'}
                </span>
              </label>
            </div>

            {uploading && (
              <div className="mt-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                    <span className="text-blue-700">Processing PDF and extracting FAQs...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Organization Stats */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center gap-3 mb-6">
              <Users className="h-8 w-8 text-green-600" />
              <h2 className="text-2xl font-bold text-gray-900">Organization Overview</h2>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Quick Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">0</div>
                    <div className="text-sm text-gray-600">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">0</div>
                    <div className="text-sm text-gray-600">FAQs</div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Recent Activity</h3>
                <div className="text-gray-600 text-sm">
                  <p>• Organization created</p>
                  <p>• Admin account set up</p>
                  <p>• Ready to upload documents</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Getting Started</h4>
                <ul className="text-yellow-700 text-sm space-y-1">
                  <li>1. Upload PDF documents to build your knowledge base</li>
                  <li>2. Share the invite code with team members</li>
                  <li>3. Start using the chat interface for Q&A</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Knowledge Base</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors">
              <FileText className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold mb-2">View Documents</h3>
              <p className="text-gray-600 text-sm">Browse and manage uploaded documents</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors">
              <Plus className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold mb-2">Add Manual FAQ</h3>
              <p className="text-gray-600 text-sm">Create FAQs manually without uploading documents</p>
            </button>
            
            <button className="p-6 border-2 border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-colors">
              <Users className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold mb-2">Team Members</h3>
              <p className="text-gray-600 text-sm">View and manage organization members</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}