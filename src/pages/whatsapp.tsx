import React from "react"
import FrontLayout from "layout/FrontLayout"
// import { UserAtom } from "@/atoms/UserAtom"
// import { useRecoilValue } from "recoil"
import { useRouter } from "next/router"
import { useApiQuery } from "@/hooks/backend-api-query"
import { MessageSquareOff, Loader2, ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/button"
import WhatsappMessageComponent from "@/components/whatsapp/whastapp-messaging-compont"
import { MessagingTabs } from "@/components/messagingTab"
// import WhatsAppInitComponent from "@/components/whatsappComponent"

const Messages = () => {
    // const user = useRecoilValue(UserAtom)
    const router = useRouter()
    const { page: orgId } = router.query

    // 1. Fetch Org details to check for linked WhatsApp credentials
    const { data: org, isLoading, isError } = useApiQuery<any>(
        ["org-details", orgId as string],
        `/organization/details/with-credentials?orgId=${orgId}`,
        { enabled: !!orgId }
    )

    if (isLoading) {
        return (
            <FrontLayout showFooter={false} msg={false}>
                <div className="flex h-[70vh] items-center justify-center">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                </div>
            </FrontLayout>
        )
    }

    // Logic: If in Org view, use Org's linked owner. Otherwise, use personal user.
    const whatsappSid = org?.linkedCredentials?.whatsapp?.whatsappSubaccountSid

    const dataOwnerId = org?.linkedCredentials?.sourceUser 

    return (
        <FrontLayout showFooter={false} msg={false}>
            {(whatsappSid && dataOwnerId) ? (
                <WhatsappMessageComponent 
                    ownerId={dataOwnerId} 
                    orgName={org?.name} 
                />
            ) : (
                /* Org View Fallback */
                <div>

                    <MessagingTabs />
                <div className="flex flex-col h-[70vh] items-center justify-center text-center p-6 bg-slate-50/50">
                    <div className="bg-white p-8 rounded-2xl shadow-sm border flex flex-col items-center max-w-md">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquareOff className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800">WhatsApp Not Linked</h2>
                        <p className="text-slate-500 mt-2 mb-6">
                            The organization <strong>{org?.name}</strong> does not have a linked WhatsApp channel. 
                            An admin must grant access to power this organization's communications.
                        </p>
                    </div>
                </div>
                </div>
            )}
        </FrontLayout>
    )
}

export default Messages