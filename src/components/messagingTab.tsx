import Link from "next/link";
import { useRouter } from "next/router";
import { MessageCircle, MessageSquare, Mail } from "lucide-react";

export function MessagingTabs() {
  const router = useRouter();

  const tabs = [
    {
      id: "messages",
      label: "Messaging",
      href: "/messaging",
      icon: MessageCircle,
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      href: "/whatsapp",
      icon: MessageSquare,
    },
    {
      id: "emails",
      label: "Email",
      href: "/emails",
      icon: Mail,
    },
  ];

  // Determine active tab based on current route
  const getActiveTab = () => {
    if (router.pathname.includes("/messaging")) return "messages";
    if (router.pathname.includes("/whatsapp")) return "whatsapp";
    if (router.pathname.includes("/emails")) return "emails";
    return "messages";
  };

  const activeTab = getActiveTab();

  // extract page param (take first if it's an array)
  const pageParam = (() => {
    const p = router.query.page;
    return Array.isArray(p) ? p[0] : p;
  })();

  return (
    <div className="flex items-center gap-0 border-b border-border">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        // include page query param when present
        const href = pageParam
          ? { pathname: tab.href, query: { page: pageParam } }
          : tab.href;

        return (
          <Link key={tab.id} href={href}>
            <button
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 -mb-px ${
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon
                className="w-4 h-4"
                color={isActive ? `#fdc332` : "#000000"}
              />
              {tab.label}
            </button>
          </Link>
        );
      })}
    </div>
  );
}
