'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { Upload, Users, FileText, Plus, Copy, Check, Building2, MessageSquare } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

/* eslint-disable @typescript-eslint/no-explicit-any */

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

interface OrgStats {
  documents: number
  faqs: number
  members: number
}

export default function Dashboard() {
  const { user: clerkUser } = useUser()
  const router = useRouter()
  
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [orgStats, setOrgStats] = useState<OrgStats>({ documents: 0, faqs: 0, members: 0 })
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showJoinForm, setShowJoinForm] = useState(false)
  const [copied, setCopied] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isJoining, setIsJoining] = useState(false)

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
        console.log('User data fetched:', data.user) // Debug log
        setCurrentUser(data.user)
        if (data.user.organization_id) {
          await fetchOrganization(data.user.organization_id)
        }
      } else {
        console.error('No user data found in response:', data)
      }
    } catch (error) {
      console.error('Error checking user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchOrganization = async (orgId: string) => {
    try {
      console.log('Fetching organization with ID:', orgId) // Debug log
      const response = await fetch(`/api/org/${orgId}`)
      const data = await response.json()
      if (response.ok && data.organization) {
        console.log('Organization data fetched:', data.organization) // Debug log
        setOrganization(data.organization)
        if (data.stats) {
          setOrgStats(data.stats)
        }
      } else {
        console.error('Failed to fetch organization:', data.error || 'No organization data')
      }
    } catch (error) {
      console.error('Error fetching organization:', error)
    }
  }

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)
    try {
      const response = await fetch('/api/org/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: orgName, description: orgDescription })
      })
      
      const data = await response.json()
      console.log('Create organization response:', data) // Debug log
      if (response.ok && data.organization) {
        setOrganization(data.organization) // Set organization state immediately
        setCurrentUser(data.user) // Set user state from create response
        setShowCreateForm(false)
        setOrgName('')
        setOrgDescription('')
        await fetchOrganization(data.organization.uid) // Fetch organization stats
      } else {
        console.error('Organization creation failed:', data.error)
        alert(data.error || 'Failed to create organization')
      }
    } catch (error: any) {
      console.error('Error creating organization:', error)
      alert(error.message || 'Failed to create organization')
    } finally {
      setIsCreating(false)
    }
  }

  const joinOrganization = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsJoining(true)
    try {
      const response = await fetch('/api/org/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode })
      })
      
      const data = await response.json()
      console.log('Join organization response:', data) // Debug log
      if (response.ok) {
        await checkUserStatus()
        if (data.organization) {
          setOrganization(data.organization)
          await fetchOrganization(data.organization.uid)
        }
        router.push('/dashboard')
      } else {
        console.error('Join organization failed:', data.error)
        alert(data.error || 'Failed to join organization')
      }
    } catch (error: any) {
      console.error('Error joining organization:', error)
      alert(error.message || 'Failed to join organization')
    } finally {
      setIsJoining(false)
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
        if (organization) {
          await fetchOrganization(organization.uid)
        }
      } else {
        console.error('File upload failed:', data.error)
        alert(data.error || 'Failed to upload PDF')
      }
    } catch (error: any) {
      console.error('Error uploading file:', error)
      alert(error.message || 'Failed to upload PDF')
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

  console.log('Current states:', { currentUser, organization, orgStats }) // Debug log

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white p-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-sm">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl font-light text-gray-900 mb-4">Welcome to AskNest</CardTitle>
              <p className="text-gray-600">Get started by creating or joining an organization</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Create Organization */}
                <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
                  <DialogTrigger asChild>
                    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                          <Plus className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Create Organization</h3>
                        <p className="text-gray-600 text-sm mb-4">Start your own organization and manage your team</p>
                        <Button variant="outline" className="border-gray-300 cursor-pointer">
                          Create Organization
                        </Button>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-medium">Create Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={createOrganization} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Organization Name</Label>
                        <Input
                          id="name"
                          value={orgName}
                          onChange={(e: any) => setOrgName(e.target.value)}
                          required
                          className="border-gray-200"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="description">Description (Optional)</Label>
                        <Textarea
                          id="description"
                          value={orgDescription}
                          onChange={(e: any) => setOrgDescription(e.target.value)}
                          className="border-gray-200 resize-none"
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gray-900 hover:bg-gray-800"
                          disabled={isCreating}
                        >
                          {isCreating ? 'Creating...' : 'Create'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowCreateForm(false)}
                          className="flex-1"
                          disabled={isCreating}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                {/* Join Organization */}
                <Dialog open={showJoinForm} onOpenChange={setShowJoinForm}>
                  <DialogTrigger asChild>
                    <Card className="border-2 border-dashed border-gray-200 hover:border-gray-300 transition-colors cursor-pointer group">
                      <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-medium mb-2">Join Organization</h3>
                        <p className="text-gray-600 text-sm mb-4">Join an existing organization using an invite code</p>
                        <Button variant="outline" className="border-gray-300 cursor-pointer">
                          Join Organization
                        </Button>
                      </CardContent>
                    </Card>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-medium">Join Organization</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={joinOrganization} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="invite-code">Invite Code</Label>
                        <Input
                          id="invite-code"
                          value={inviteCode}
                          onChange={(e: any) => setInviteCode(e.target.value)}
                          placeholder="Enter invite code"
                          required
                          className="border-gray-200"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          type="submit" 
                          className="flex-1 bg-gray-900 hover:bg-gray-800"
                          disabled={isJoining}
                        >
                          {isJoining ? 'Joining...' : 'Join'}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setShowJoinForm(false)}
                          className="flex-1"
                          disabled={isJoining}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <Card className="border-0 shadow-sm mb-8">
          <CardContent className="p-8">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-gray-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900">{organization?.name || 'Organization Dashboard'}</h1>
                  <p className="text-gray-600 mt-1">{organization?.description}</p>
                </div>
              </div>
              <Button 
                onClick={() => router.push('/chat')}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Go to Chat
              </Button>
            </div>

            {/* Invite Code Section */}
            {organization && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-2">Invite Team Members</h2>
                <p className="text-gray-600 mb-4">Share this invite code with your team members:</p>
                <div className="flex items-center gap-3">
                  <code className="bg-white px-4 py-2 rounded border font-mono text-sm flex-1">
                    {organization.invite_code}
                  </code>
                  <Button
                    onClick={copyInviteCode}
                    variant="outline"
                    size="sm"
                    className="border-gray-300"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    <span className="ml-2">{copied ? 'Copied!' : 'Copy'}</span>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <Upload className="h-6 w-6 text-gray-600" />
                  <CardTitle className="text-xl font-medium text-gray-900">Upload Documents</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Upload PDF Files</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Upload PDF documents to automatically extract and add FAQs to your knowledge base
                  </p>
                  
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      disabled={uploading || !organization}
                    />
                    <Button
                      disabled={uploading || !organization}
                      className={uploading ? "bg-gray-300" : "bg-gray-900 hover:bg-gray-800"}
                    >
                      {uploading ? 'Processing...' : 'Choose PDF File'}
                    </Button>
                  </label>
                </div>

                {uploading && (
                  <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      <span className="text-blue-700 text-sm">Processing PDF and extracting FAQs...</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600 text-sm">Documents</span>
                  <span className="text-xl font-semibold">{orgStats.documents}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600 text-sm">FAQs</span>
                  <span className="text-xl font-semibold">{orgStats.faqs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="text-gray-600 text-sm">Members</span>
                  <span className="text-xl font-semibold">{orgStats.members}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-medium text-gray-900">Getting Started</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center mt-0.5">1</span>
                    <span className="text-gray-600">Upload PDF documents to build your knowledge base</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center mt-0.5">2</span>
                    <span className="text-gray-600">Share the invite code with team members</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gray-900 text-white rounded-full text-xs flex items-center justify-center mt-0.5">3</span>
                    <span className="text-gray-600">Start using the chat interface for Q&A</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {!organization && (
          <div className="mt-12 text-center">
            <p className="text-gray-600">You are not part of any organization yet.</p>
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={() => setShowCreateForm(true)} className="bg-gray-900 hover:bg-gray-800">
                Create Organization
              </Button>
              <Button onClick={() => setShowJoinForm(true)} variant="outline" className="border-gray-300">
                Join Organization
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}