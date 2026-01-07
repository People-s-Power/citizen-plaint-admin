import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// Optional: Define a type for your channels to make it easier to add more later
const channels = [
    {
        name: 'Platform Messaging',
        description: 'Internal chat and system alerts',
        href: '/messaging',
        icon: '💬',
        color: 'bg-blue-500',
    },
    {
        name: 'WhatsApp',
        description: 'Direct customer communication via WhatsApp Business',
        href: '/whatsapp',
        icon: '📱',
        color: 'bg-green-500',
    },
    {
        name: 'Email Inbox',
        description: 'Manage support tickets and official emails',
        href: '/emails',
        icon: '✉️',
        color: 'bg-purple-500',
    },
];

export default function MessagingPicker() {
    const router = useRouter();

    // Try router.query first, fall back to parsing window.location.search if needed (client-side)
    const pageParam =
        (router && (router.query?.page as string | undefined)) ??
        (typeof window !== 'undefined'
            ? new URLSearchParams(window.location.search).get('page') ?? undefined
            : undefined);

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Select Messaging Channel</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {channels.map((channel) => {
                    const href = pageParam
                        ? { pathname: channel.href, query: { page: String(pageParam) } }
                        : channel.href;

                    return (
                        <Link
                            key={channel.href}
                            href={href}
                            className="group block p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md hover:border-blue-300 transition-all no-underline"
                        >
                            <div
                                className={`inline-flex items-center justify-center w-12 h-12 mb-4 rounded-full text-white ${channel.color} text-xl`}
                            >
                                {channel.icon}
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600">
                                {channel.name}
                            </h3>
                            <p className="mt-2 text-sm text-gray-600">{channel.description}</p>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}