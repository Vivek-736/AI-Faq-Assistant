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
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white p-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-black mb-6">AskNest</h1>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border border-black p-6">
              <Plus className="mx-auto h-12 w-12 text-black mb-4" />
              <h2 className="text-lg font-bold mb-2">Create Organization</h2>
              <p className="text-black mb-4">Start your own organization</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                Create
              </button>
            </div>

            <div className="border border-black p-6">
              <Users className="mx-auto h-12 w-12 text-black mb-4" />
              <h2 className="text-lg font-bold mb-2">Join Organization</h2>
              <p className="text-black mb-4">Join using an invite code</p>
              <button
                onClick={() => setShowJoinForm(true)}
                className="border border-black px-4 py-2 hover:bg-black hover:text-white"
              >
                Join
              </button>
            </div>
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Create Organization</h2>
              <form onSubmit={createOrganization}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-2 py-1 border border-black"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-1">
                    Description
                  </label>
                  <textarea
                    value={orgDescription}
                    onChange={(e) => setOrgDescription(e.target.value)}
                    className="w-full px-2 py-1 border border-black"
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 border border-black px-4 py-2 hover:bg-black hover:text-white"
                  >
                    Create
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 border border-black px-4 py-2 hover:bg-black hover:text-white"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showJoinForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 max-w-sm w-full">
              <h2 className="text-xl font-bold mb-4">Join Organization</h2>
              <form onSubmit={joinOrganization}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-1">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    className="w-full px-2 py-1 border border-black"
                    placeholder="Enter code"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 border border-black px-4 py-2 hover:bg-black hover:text-white"
                  >
                    Join
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoinForm(false)}
                    className="flex-1 border border-black px-4 py-2 hover:bg-black hover:text-white"
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

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="border border-black p-6 mb-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-black">{organization?.name || 'Dashboard'}</h1>
              <p className="text-black">{organization?.description}</p>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="border border-black px-4 py-2 hover:bg-black hover:text-white"
            >
              Chat
            </button>
          </div>

          {organization && (
            <div className="border border-black p-4 mb-4">
              <h2 className="text-lg font-bold text-black mb-2">Invite Members</h2>
              <div className="flex items-center gap-2">
                <code className="bg-white px-3 py-1 border border-black font-mono">
                  {organization.invite_code}
                </code>
                <button
                  onClick={copyInviteCode}
                  className="border border-black px-3 py-1 hover:bg-black hover:text-white"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-4">
          <div className="border border-black p-6">
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-6 w-6 text-black" />
              <h2 className="text-lg font-bold text-black">Upload</h2>
            </div>
            
            <div className="border border-black p-6 text-center">
              <FileText className="mx-auto h-12 w-12 text-black mb-2" />
              <h3 className="text-base font-bold mb-2">PDF Files</h3>
              <p className="text-black mb-4">Upload PDFs to extract FAQs</p>
              
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading || !organization}
                />
                <span className={`inline-block px-4 py-2 border border-black ${
                  uploading || !organization
                    ? 'text-black opacity-50 cursor-not-allowed'
                    : 'hover:bg-black hover:text-white'
                }`}>
                  {uploading ? 'Processing...' : 'Choose PDF'}
                </span>
              </label>
            </div>

            {uploading && (
              <div className="mt-4">
                <div className="border border-black p-3">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    <span className="text-black">Processing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="border border-black p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-6 w-6 text-black" />
              <h2 className="text-lg font-bold text-black">Overview</h2>
            </div>

            <div className="space-y-4">
              <div className="border border-black p-4">
                <h3 className="font-bold text-black mb-2">Stats</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="text-center">
                    <div className="text-xl font-bold text-black">0</div>
                    <div className="text-sm text-black">Documents</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-black">0</div>
                    <div className="text-sm text-black">FAQs</div>
                  </div>
                </div>
              </div>

              <div className="border border-black p-4">
                <h3 className="font-bold text-black mb-2">Activity</h3>
                <div className="text-black text-sm">
                  <p>Organization created</p>
                  <p>Admin account set up</p>
                  <p>Ready to upload</p>
                </div>
              </div>

              <div className="border border-black p-4">
                <h4 className="font-bold text-black mb-2">Getting Started</h4>
                <ul className="text-black text-sm space-y-1">
                  <li>Upload PDFs</li>
                  <li>Share invite code</li>
                  <li>Use chat for Q&A</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 border border-black p-6">
          <h2 className="text-lg font-bold text-black mb-4">Manage</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <button className="p-4 border border-black hover:bg-black hover:text-white">
              <FileText className="h-6 w-6 text-black mb-2" />
              <h3 className="font-bold">Documents</h3>
              <p className="text-sm">Browse documents</p>
            </button>
            
            <button className="p-4 border border-black hover:bg-black hover:text-white">
              <Plus className="h-6 w-6 text-black mb-2" />
              <h3 className="font-bold">Add FAQ</h3>
              <p className="text-sm">Create FAQs manually</p>
            </button>
            
            <button className="p-4 border border-black hover:bg-black hover:text-white">
              <Users className="h-6 w-6 text-black mb-2" />
              <h3 className="font-bold">Members</h3>
              <p className="text-sm">Manage members</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}