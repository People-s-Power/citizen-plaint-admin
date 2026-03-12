/* eslint-disable react/no-unescaped-entities */

"use client"
import React, { useState, useEffect } from "react"
import { useFlutterwaveScript } from "@/hooks/useFlutterwaveScript"
import { usePaystackScript } from "@/hooks/usePaystackScript"
import FrontLayout from "@/layout/FrontLayout"
import Head from "next/head"
import axios from "axios"
import { useRouter } from "next/router"
import { IUser } from "@/types/Applicant.types"
import { SERVER_URL } from "@/pages/_app"
import { Modal } from "rsuite"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { useAtom } from "jotai"
import { adminAtom } from "@/atoms/adminAtom"
import Link from "next/link"
import ReactSelect from "react-select"
import UserReview from "@/components/UserReview"
import AccessSelectionModal from "@/components/modals/AccessSelectionModal"

export interface Operator {
    userId: string
    role: string
}

const PROFESSIONS = [
    "General Administrative Assistant",
    "AI Assistant",
    "Social Media Manager ",
    "Real Estate",
    "Virtual Research",
    "Virtual Data Entry",
    "Virtual Book keeper",
    "Virtual ecommerce",
    "Customer Service Provider (Phone/Chat)",
    "Content Writer",
    "Website Management",
    "Public Relation Assistant",
    "Graphic designs",
    "Appointment/Calendar setter",
    "Email Management",
    "Campaign/petition Writer",
]

const Addadmin = () => {
    const [author] = useAtom(adminAtom)
    useFlutterwaveScript();
    usePaystackScript();
    const [professionals, setProfessionalas] = useState<IUser[]>([])
    const [profession, setProfession] = useState("General Administrative Assistant")
    const { query } = useRouter()
    const [role, setRole] = useState("")
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)
    const [showPricing, setShowPricing] = useState(true)
    const [showGAAList, setShowGAAList] = useState(false)
    const [result, setResult] = useState<{ message: string } | undefined>()
    const [userId, setUserId] = useState<any>("")
    const [search, setSearched] = useState("")
    const router = useRouter()
    const [pendingProfessional, setPendingProfessional] = useState<{
        id: string;
        price: string;
        isGVA: boolean;
        name?: string;
    } | null>(null);
    const [showAccessModal, setShowAccessModal] = useState(false);
    const [accessLoading, setAccessLoading] = useState(false);

    // Helper function to get the price for a selected professional
    const getProfessionalPrice = (user: IUser, professionName: string) => {
        // Handle profession as array of objects
        if (Array.isArray(user.profession)) {
            const professionItem = user.profession.find((prof: any) => prof.name === professionName);
            if (professionItem) {
                return professionItem.price;
            }
        }
        // Handle profession as string - return default or null
        return null;
    }

    // Helper function to check if profession is GVA
    const isGVAProfession = (user: IUser, professionName: string) => {
        if (Array.isArray(user.profession)) {
            const professionItem = user.profession.find((prof: any) => prof.name === professionName);
            return professionItem?.isGVA || false;
        }
        return false;
    }

    // Track payment status for GAA
    const [paymentSuccess, setPaymentSuccess] = useState(false);

    const handlePaymentSuccess = () => {
        setShowPricing(false)
        setShowGAAList(true)
        setPaymentSuccess(true)
    }

    const handlePaymentClose = () => {
        toast.info("Payment cancelled")
    }

    // Handle access selection and add professional
    const handleAccessSubmit = async (selectedAccess: string[]) => {
        if (!pendingProfessional) return;

        try {
            setAccessLoading(true);
            const res = await axios.post(SERVER_URL + "/api/v5/organization/add-professional", {
                professionalID: pendingProfessional.id,
                orgId: query.page,
                profession: profession,
                price: pendingProfessional.price,
                isGVA: pendingProfessional.isGVA,
                access: selectedAccess
            });

            if (res.status.toString().startsWith("2")) {
                toast.success("Professional added successfully with access permissions!");
                setShowAccessModal(false);
                setPendingProfessional(null);
                setTimeout(() => {
                    window.location.href = `/manageadmins?page=${query.page}`;
                }, 2000);
            }
        } catch (error) {
            toast.error("Failed to add professional");
        } finally {
            setAccessLoading(false);
        }
    };

    // Handle initiating payment for a professional
    const FLUTTERWAVE_TEST_KEY = "FLWPUBK_TEST-xxxxxxxxxxxxxxxxxxxxx-X"; // Replace with your test key
    const PAYSTACK_TEST_KEY = "pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx"; // Replace with your test key

    const handlePaystackPayment = (amount: string) => {
        if (!(window as any).PaystackPop) {
            toast.error("Paystack script not loaded. Please try again.");
            return;
        }
        const handler = (window as any).PaystackPop.setup({
            key: PAYSTACK_TEST_KEY,
            email: (author as any)?.email || 'test@example.com',
            amount: Number(amount) * 100, // Paystack expects kobo
            currency: 'NGN',
            ref: `GAA-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            callback: function (response: any) {
                setShowPricing(false);
                setShowGAAList(true);
                setPaymentSuccess(true);
                toast.success('Payment successful! Now select your assistant.');
            },
            onClose: function () {
                toast.info('Payment cancelled.');
            }
        });
        handler.openIframe();
    };

    const handlePayForProfessional = async (professionalId: string, price: string, isGVA: boolean, name?: string) => {
        if (profession !== "General Administrative Assistant") return;
        const isNigeria = (author as any)?.country === 'Nigeria';
        if (isNigeria) {
            handlePaystackPayment(price);
            return;
        }
        // Only trigger Flutterwave for non-NGN
        if (!(window as any).FlutterwaveCheckout) {
            toast.error("Flutterwave script not loaded. Please try again.");
            return;
        }
        const txRef = `GAA-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
        (window as any).FlutterwaveCheckout({
            public_key: FLUTTERWAVE_TEST_KEY,
            tx_ref: txRef,
            amount: Number(price),
            currency: 'USD',
            payment_options: 'card,banktransfer,ussd',
            customer: {
                email: (author as any)?.email || 'test@example.com',
                name: (author as any)?.firstName + ' ' + (author as any)?.lastName,
            },
            customizations: {
                title: 'ExpertHub GAA Payment',
                description: 'Payment for General Administrative Assistant',
                logo: '/images/logo.svg',
            },
            callback: function (response: any) {
                if (response.status === 'successful') {
                    setShowPricing(false);
                    setShowGAAList(true);
                    setPaymentSuccess(true);
                    toast.success('Payment successful! Now select your assistant.');
                } else {
                    toast.error('Payment not completed.');
                }
            },
            onclose: function () {
                toast.info('Payment cancelled.');
            },
        });
    };

    useEffect(() => {
        const GET_PROFESSIONALS_URL = "https://project-experthub.onrender.com/v1/user"
        axios.get(GET_PROFESSIONALS_URL).then((response) => {
            console.log(response);
            Array.isArray(response.data?.data?.users) &&
                setProfessionalas(
                    response.data.data.users.map((d: any) => {
                        if (d.name) return d
                        return { ...d, name: d.firstName + " " + d.lastName }
                    })
                )
        })
    }, [])

    useEffect(() => {
        if (query.trxref) {
            // Process transaction
            axios
                .get(SERVER_URL + `/api/v5/organization/transaction-verify/${query.trxref}`)
                .then((res) => {
                    console.log(res)
                    if (res.data.message) {
                        setOpen(true)
                        setResult(res.data)
                    }
                })
                .catch((err) => console.log(err))
        }
    }, [query])

    const addProfessional = async () => {
        if (loading) return

        // If General Administrative Assistant is selected, no need to check userId
        if (profession === "General Administrative Assistant") {
            setShowPricing(true)
            return
        }

        if (!userId) {
            toast.info("Please select a user!")
            return
        }

        try {
            setLoading(true)

            // Find the selected user to get their pricing
            const selectedUser = professionals.find(user => user._id === userId);
            let userPrice: string | null = null;
            let isGVA = false;

            if (selectedUser) {
                userPrice = getProfessionalPrice(selectedUser, profession);
                isGVA = isGVAProfession(selectedUser, profession);

                // If the professional has a price attached, initiate payment
                if (userPrice) {
                    toast.info("Payment required before adding this professional");
                    await handlePayForProfessional(
                        selectedUser._id,
                        userPrice,
                        isGVA,
                        `${selectedUser.firstName} ${selectedUser.lastName}`
                    );
                    setLoading(false);
                    return;
                }
            }

            // If no price is attached, proceed directly with adding the professional
            const res = await axios.post(SERVER_URL + "/api/v5/organization/add-professional", {
                professionalID: userId,
                orgId: query.page,
                profession: profession,
                price: userPrice,
                isGVA: isGVA
            })
            if (res.status.toString().startsWith("2")) {
                if (res.data?.authorization_url) {
                    window.location.href = res.data.authorization_url
                } else {
                    toast.success("Professional added successfully!")
                    setTimeout(() => {
                        window.location.href = `/manageadmins?page=${query.page}`
                    }, 2000)
                }
            }
        } catch (error) {
            toast.warn("Oops an error occurred")
        } finally {
            setLoading(false)
        }
    }

    return (
        <FrontLayout showFooter={false}>
            <>
                <Head>
                    <title>{`ExpertHub`} || Add A Professional </title>
                </Head>
                <div className="p-4 max-w-[85rem] mx-auto flex gap-3">
                    <main className="p-3 grow">
                        <section className="top flex justify-between">
                            <div className="max-w-xl">
                                <h3 className="text-lg font-bold mb-3">Hire a Virtual Assistant for Hassle-Free Administrative Support </h3>

                                <p className="font-semibold">Free up your time. Focus on what matters.</p>
                                <p className="text-sm">
                                    Running a business or managing a busy schedule comes with countless moving parts. Our experienced Virtual Assistants are here to take administrative tasks off your plate—so you can concentrate on growth, strategy, and the bigger picture.
                                </p>
                            </div>
                            {query.new ? (
                                <div className="flex gap-2 h-fit">
                                    <Link href={`/addadmin?page=${query.page}`}>
                                        <button className="bg-warning text-white rounded px-4 py-1.5 h-auto">Add admins</button>
                                    </Link>
                                </div>
                            ) : (
                                <div>
                                    <Link href={`/professional?page=${query.page}`}>
                                        <button className="bg-warning text-white rounded px-4 py-1.5 h-auto">Admins</button>
                                    </Link>
                                </div>
                            )}
                        </section>

                        <section className="select-role mt-4 space-y-2">
                            <p className="font-semibold">Filter by profession</p>
                            <ReactSelect
                                className="max-w-sm"
                                placeholder="Select a specific role"
                                value={{ value: profession, label: profession }}
                                onChange={(e: any) => {
                                    setProfession(e.value)
                                    if (e.value === "General Administrative Assistant") {
                                        setShowPricing(true)
                                        setShowGAAList(false)
                                    } else {
                                        setShowPricing(false)
                                        setShowGAAList(false)
                                    }
                                }}
                                options={PROFESSIONS.map((prof) => ({ value: prof, label: prof }))}
                            />
                        </section>

                        {showPricing && (
                            <div className="flex gap-4 mt-6">
                                <div className="p-4 lg:border-r border-r-gray-200">
                                    <h2 className="text-xl font-bold">Full-Time</h2>
                                    <p className="text-primary font-bold text-3xl my-4">{(author as any)?.country === 'Nigeria' ? '₦80,000' : '$850'}/Month</p>

                                    <ul className="pl-0 space-y-3 mt-4">
                                        {[
                                            "160 Hours per month",
                                            "Dedicated Virtual Assistant",
                                            "Free replacement",
                                            "Customer Success Manager",
                                            "Rigorous quality control and supervision",
                                            "ExpertHub Workspace App",
                                            "Your timezone",
                                            "Any hours you want",
                                            "Share with colleagues",
                                            "Unlimited file sharing/storage",
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="text-primary">
                                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M7.629 15.314a1 1 0 0 1-1.414 0l-4.243-4.243a1 1 0 1 1 1.414-1.414l3.536 3.536 7.778-7.778a1 1 0 0 1 1.414 1.414l-8.485 8.485z" />
                                                    </svg>
                                                </span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="space-y-2 mt-3">
                                        <button
                                            className="bg-primary text-white w-full rounded-full px-4 py-2"
                                            onClick={() => {
                                                handlePayForProfessional("", (author as any)?.country === 'Nigeria' ? "80000" : "850", true);
                                            }}
                                        >
                                            Hire Now
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h2 className="text-xl font-bold">Part-Time</h2>
                                    <p className="text-primary font-bold text-3xl my-4">{(author as any)?.country === 'Nigeria' ? '₦50,000' : '$450'}/Month</p>

                                    <ul className="pl-0 space-y-3 mt-4">
                                        {[
                                            "80 Hours per month",
                                            "Dedicated Virtual Assistant",
                                            "Free replacement",
                                            "Customer Success Manager",
                                            "Rigorous quality control and supervision",
                                            "ExpertHub Workspace App",
                                            "Your timezone",
                                            "Choose from designated slots",
                                            "Sharing is limited",
                                            "10 GB file sharing/storage limit",
                                        ].map((item, idx) => (
                                            <li key={idx} className="flex items-center gap-2">
                                                <span className="text-primary">
                                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                                        <path d="M7.629 15.314a1 1 0 0 1-1.414 0l-4.243-4.243a1 1 0 1 1 1.414-1.414l3.536 3.536 7.778-7.778a1 1 0 0 1 1.414 1.414l-8.485 8.485z" />
                                                    </svg>
                                                </span>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="space-y-2 mt-3">
                                        <button
                                            className="bg-primary text-white w-full rounded-full px-4 py-2"
                                            onClick={() => {
                                                handlePayForProfessional("", (author as any)?.country === 'Nigeria' ? "50000" : "450", true);
                                            }}
                                        >
                                            Hire Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showGAAList && (
                            <div className="mt-6">
                                <h3 className="text-lg font-bold mb-4">Select a General Administrative Assistant</h3>
                                <div className="grid grid-cols-3 max-h-[400px] h-auto overflow-auto w-full">
                                    <td className="px-2 py-2 border border-slate-600">User</td>
                                    <td className="px-2 py-2 border border-slate-600">Role</td>
                                    <td className="px-2 py-2 border border-slate-600">Review</td>
                                    {professionals
                                        .filter((user) => {
                                            if (typeof user.profession === 'string') return user.profession === "General Administrative Assistant";
                                            if (Array.isArray(user.profession)) return (user.profession as any[]).some((p: any) => p.name === "General Administrative Assistant");
                                            return false;
                                        })
                                        .map((user) => (
                                            <React.Fragment key={user._id}>
                                                <td
                                                    onClick={() => {
                                                        if (paymentSuccess) {
                                                            setPendingProfessional({
                                                                id: user._id,
                                                                price: "0",
                                                                isGVA: true,
                                                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                                                            })
                                                            setShowAccessModal(true)
                                                        } else {
                                                            setUserId(user._id)
                                                        }
                                                    }}
                                                    className="px-2 py-2 flex gap-2 items-center border border-slate-600 cursor-pointer"
                                                >
                                                    <svg
                                                        fill={userId == user._id ? "#18C73E" : "#e6e6e6"}
                                                        viewBox="0 0 16 16"
                                                        className="w-7"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        aria-hidden="true"
                                                    >
                                                        <path
                                                            clipRule="evenodd"
                                                            fillRule="evenodd"
                                                            d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z"
                                                        />
                                                    </svg>
                                                    {user.firstName + " " + user.lastName}
                                                </td>
                                                <td
                                                    onClick={() => {
                                                        if (paymentSuccess) {
                                                            setPendingProfessional({
                                                                id: user._id,
                                                                price: "0",
                                                                isGVA: true,
                                                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                                                            })
                                                            setShowAccessModal(true)
                                                        } else {
                                                            setUserId(user._id)
                                                        }
                                                    }}
                                                    className="px-2 py-2 border border-slate-600 cursor-pointer"
                                                >
                                                    {typeof user.profession === 'string' ? user.profession : 'General Administrative Assistant'}
                                                </td>
                                                <td
                                                    onClick={() => {
                                                        if (paymentSuccess) {
                                                            setPendingProfessional({
                                                                id: user._id,
                                                                price: "0",
                                                                isGVA: true,
                                                                name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
                                                            })
                                                            setShowAccessModal(true)
                                                        } else {
                                                            setUserId(user._id)
                                                        }
                                                    }}
                                                    className="px-2 py-2 border border-slate-600 cursor-pointer"
                                                >
                                                    <UserReview userId={user._id || user.id || ''} />
                                                </td>
                                            </React.Fragment>
                                        ))}
                                </div>
                            </div>
                        )}

                        {profession && !showPricing && !showGAAList && (
                            <section className="select-role mt-4 space-y-2">
                                <p className="font-semibold">Select user to add</p>

                                <input
                                    type="text"
                                    className="max-w-sm w-full border border-slate-600 p-1.5 rounded"
                                    onChange={(e) => {
                                        setSearched(e.target.value)
                                    }}
                                    placeholder="Type here to search for a user to assign role"
                                />

                                {professionals.length ? (
                                    <div className="grid grid-cols-4 max-h-[400px] h-auto overflow-auto w-full">
                                        <td className="px-2 py-2 border border-slate-600">User</td>
                                        <td className="px-2 py-2 border border-slate-600">Role</td>
                                        <td className="px-2 py-2 border border-slate-600">Price</td>
                                        <td className="px-2 py-2 border border-slate-600">Review</td>
                                        {(search
                                            ? professionals.filter((user) => {
                                                let professionMatches = false;
                                                if (typeof user.profession === 'string') {
                                                    professionMatches = user.profession === profession;
                                                } else if (Array.isArray(user.profession)) {
                                                    professionMatches = (user.profession as any[]).some((prof: any) => prof.name === profession);
                                                }
                                                return (
                                                    professionMatches &&
                                                    (user.firstName?.toLowerCase()?.includes(search.toLowerCase()) ||
                                                        user.lastName?.toLowerCase()?.includes(search.toLowerCase()) ||
                                                        user.name?.toLowerCase()?.includes(search.toLowerCase()))
                                                );
                                            })
                                            : professionals.filter((user) => {
                                                if (typeof user.profession === 'string') return user.profession === profession;
                                                if (Array.isArray(user.profession)) return (user.profession as any[]).some((prof: any) => prof.name === profession);
                                                return false;
                                            })
                                        ).map((user) => {
                                            const userPrice = getProfessionalPrice(user, profession);
                                            const isGVA = isGVAProfession(user, profession);

                                            return (
                                                <React.Fragment key={user._id}>
                                                    <td onClick={() => setUserId(user._id)} className="px-2 py-2 flex gap-2 items-center border border-slate-600 cursor-pointer">
                                                        <svg
                                                            fill={userId == user._id ? "#18C73E" : "#e6e6e6"}
                                                            viewBox="0 0 16 16"
                                                            className="w-7"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            aria-hidden="true"
                                                        >
                                                            <path
                                                                clipRule="evenodd"
                                                                fillRule="evenodd"
                                                                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm3.844-8.791a.75.75 0 0 0-1.188-.918l-3.7 4.79-1.649-1.833a.75.75 0 1 0-1.114 1.004l2.25 2.5a.75.75 0 0 0 1.15-.043l4.25-5.5Z"
                                                            />
                                                        </svg>
                                                        {user.firstName + " " + user.lastName}
                                                    </td>
                                                    <td onClick={() => setUserId(user._id)} className="px-2 py-2 border border-slate-600 cursor-pointer">
                                                        {typeof user.profession === 'string'
                                                            ? user.profession
                                                            : Array.isArray(user.profession)
                                                                ? (user.profession as any[]).find((prof: any) => prof.name === profession)?.name || profession
                                                                : profession
                                                        }
                                                    </td>
                                                    <td onClick={() => setUserId(user._id)} className="px-2 py-2 border border-slate-600 cursor-pointer">
                                                        {userPrice ? (
                                                            <span className={isGVA ? "font-semibold text-blue-600" : ""}>
                                                                {(author as any)?.country === 'Nigeria' ? '₦' : '$'}{userPrice}
                                                                {isGVA && <span className="text-xs ml-1">(Fixed)</span>}
                                                            </span>
                                                        ) : 'Contact for price'}
                                                    </td>
                                                    <td onClick={() => setUserId(user._id)} className="px-2 py-2 border border-slate-600 cursor-pointer">
                                                        <UserReview userId={user._id} />
                                                    </td>
                                                </React.Fragment>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p>No professionals available now</p>
                                )}
                            </section>
                        )}

                        <section className="submit mt-4 space-y-2 text-center">
                            {query.new && <button className="bg-transparent px-4 py-2" onClick={() => router.push(`/mycamp?page=${query.page}`)}>Not Now</button>}
                            {profession !== "General Administrative Assistant" && (
                                <button onClick={addProfessional} type="button" className="px-4 py-2 rounded bg-warning text-white">
                                    Hire
                                </button>
                            )}
                        </section>
                    </main>
                </div>
                <ToastContainer />
                <Modal open={open} onClose={() => setOpen(!open)}>
                    <div className="px-4">
                        <h3 className="pb-2 font-semibold">Add Professional Successful</h3>
                        <p className="text-zinc-500">{result?.message}. Where next?</p>
                        <div className="grid gap-2 mt-2">
                            <Link href={`/mycamp?page=${query.page}`}>
                                <button className="bg-warning text-white rounded px-3 py-1 text-sm">Assign task to user</button>
                            </Link>
                            <Link href={`/manageadmins?page=${query.page}`}>
                                <button className="bg-warning text-white rounded px-3 py-1 text-sm">View admin list</button>
                            </Link>
                        </div>
                    </div>
                </Modal>

                {/* Access Selection Modal */}
                <AccessSelectionModal
                    open={showAccessModal}
                    onClose={() => {
                        setShowAccessModal(false);
                        setPendingProfessional(null);
                    }}
                    onSubmit={handleAccessSubmit}
                    professionalName={pendingProfessional?.name || ''}
                    loading={accessLoading}
                />
            </>
        </FrontLayout>
    )
}

export default Addadmin