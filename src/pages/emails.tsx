import React from "react"
import FrontLayout from "layout/FrontLayout"
import { EmailClient } from "@/components/emails/emailComponent"
// import { useRecoilValue } from "recoil"
// import { UserAtom } from "@/atoms/UserAtom"
import { useRouter } from "next/router"
import { useApiQuery } from "@/hooks/backend-api-query"
import { MailWarning, ShieldAlert, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MessagingTabs } from "@/components/messagingTab"

const Messages = () => {
//   const user = useRecoilValue(UserAtom)
  const router = useRouter()
  const { page: orgId } = router.query // Get orgId from URL: ?orgId=xxx

  // 1. Fetch Org details including the linkedCredentials we just implemented
  const { data: org, isLoading, isError } = useApiQuery<any>(
    ["org-details", orgId as string],
    `/organization/details/with-credentials?orgId=${orgId}`,
    { enabled: !!orgId }
  )

  const handleConnectEmail = async () => {
    // Logic for connecting personal email (remains same)
    // try {
    //   const response = await fetch(`/api/email/auth?userId=${user.id}`)
    //   const data = await response.json()
    //   if (data.authUrl) window.location.href = data.authUrl
    // } catch (error) {
    //   console.error('Failed to initiate email connection:', error)
    // }
  }

  // State: Loading
  if (isLoading) {
    return (
      <FrontLayout showFooter={false} msg={false}>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      </FrontLayout>
    )
  }

  // State: No OrgId in URL or Org not found
  if (!orgId || isError) {
    return (
      <FrontLayout showFooter={false} msg={false}>
        <div className="flex flex-col h-[70vh] items-center justify-center text-center p-6">
          <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold">Organization Not Found</h2>
          <p className="text-muted-foreground">Please select a valid organization to view messages.</p>
        </div>
      </FrontLayout>
    )
  }

  // Extract credentials from the new block
  const nylasGrantId = org?.linkedCredentials?.email?.nylasGrantId;
  const isEmailConnected = org?.linkedCredentials?.email?.emailConnected;

  return (
    <FrontLayout showFooter={false} msg={false}>
      {isEmailConnected && nylasGrantId ? (
        <EmailClient 
          grantId={nylasGrantId} 
          onConnectEmail={handleConnectEmail} 
        //   orgName={org.name} // You can pass org info to show whose inbox it is
        />
      ) : (
        <div>
            <MessagingTabs />
        <div className="flex flex-col h-[70vh] items-center justify-center text-center p-6 bg-slate-50/50">
          <div className="bg-white p-8 rounded-2xl shadow-sm border flex flex-col items-center max-w-md">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <MailWarning className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">No Email Connected</h2>
            <p className="text-slate-500 mt-2 mb-6">
              The organization <strong>{org.name}</strong> does not have a linked email channel. 
              An admin needs to grant email access to this organization.
            </p>
          </div>
        </div>
        </div>
      )}
    </FrontLayout>
  )
}

export default Messages