import React, { useState, useEffect, useRef } from "react";
import MessagesComponent from "@/components/MessageComponent";
import FrontLayout from "@/components/Layout";
import MessagingComponent from "@/components/messages/messagesComponent";
import { useRouter } from "next/router";
import { useApiQuery } from "@/hooks/backend-api-query";
import { Loader2, ShieldAlert } from "lucide-react";

const messages = () => {
  const router = useRouter();
  const { page: orgId } = router.query; // Get orgId from URL: ?orgId=xxx

  // 1. Fetch Org details including the linkedCredentials we just implemented
  const {
    data: org,
    isLoading,
    isError,
  } = useApiQuery<any>(
    ["org-details", orgId as string],
    `/organization/details/with-credentials?orgId=${orgId}`,
    { enabled: !!orgId }
  );

  if (isLoading) {
    return (
      <FrontLayout>
        <div className="flex h-[70vh] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
        </div>
      </FrontLayout>
    );
  }

  if (!orgId || isError) {
    return (
      <FrontLayout>
        <div className="flex flex-col h-[70vh] items-center justify-center text-center p-6">
          <ShieldAlert className="w-16 h-16 text-red-400 mb-4" />
          <h2 className="text-xl font-bold">Organization Not Found</h2>
          <p className="text-muted-foreground">
            Please select a valid organization to view messages.
          </p>
        </div>
      </FrontLayout>
    );
  }

  const dataOwnerId: string = org?.linkedCredentials?.sourceUser

  return (
    <FrontLayout>
      {/* <MessagesComponent /> */}
      <MessagingComponent dataOwnerId={dataOwnerId} />
    </FrontLayout>
  );
};

export default messages;
