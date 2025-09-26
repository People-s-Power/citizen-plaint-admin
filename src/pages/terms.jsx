import React, { Fragment } from 'react';
import FrontLayout from "@/components/Layout";

const terms = () => {
    return (
        <Fragment>
            <title>Terms And Conditions</title>
            <FrontLayout>
                <div className="max-w-3xl mx-auto py-8 px-4 bg-white rounded-lg shadow-md">
                    <h1 className="text-3xl font-bold text-center mb-6 text-warning">Terms and Conditions for Virtual Assistants</h1>
                    <p className="text-sm text-gray-500 text-center mb-8">Effective Date: <span className="font-semibold">26 September 2025</span></p>
                    <div className="space-y-6 text-gray-800">
                        <p>By registering and using this platform as a Virtual Assistant (“VA”), you agree to be bound by the following Terms and Conditions. Please read them carefully before engaging in any tasks.</p>
                        <h2 className="text-xl font-semibold mt-6 mb-2">1. Definitions</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li><span className="font-semibold">Platform:</span> Refers to Experthub, the service provider offering virtual assistant task listings.</li>
                            <li><span className="font-semibold">Virtual Assistant (VA):</span> Any registered user providing services via the Platform.</li>
                            <li><span className="font-semibold">Client:</span> Any user requesting tasks to be performed by a VA.</li>
                            <li><span className="font-semibold">Task:</span> Any assignment or job accepted by a VA through the Platform.</li>
                            <li><span className="font-semibold">Due Date:</span> The deadline by which a task must be completed as agreed upon at the time of acceptance.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">2. Task Acceptance and Completion</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>Once a VA accepts a task, the VA is fully responsible for completing it by the agreed Due Date.</li>
                            <li>If the VA is unable to complete the task by the original Due Date, an automatic grace period of 1 additional day will be granted.</li>
                            <li>Failure to complete the task within the grace period will result in the forfeiture of remuneration for that task, regardless of progress made.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">3. Repeated Failure to Complete Tasks</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>A VA who fails to complete three (3) tasks on separate occasions, even after the grace period, will be permanently blocked from using the Platform.</li>
                            <li>This applies regardless of the reason for non-completion.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">4. Abandonment of Tasks</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>A VA is considered to have abandoned a task if:</li>
                            <ul className="list-[circle] ml-8">
                                <li>The VA does not attend to the task within 3 days after the 2-day grace period; or</li>
                                <li>The VA fails to engage with the task within 2 days after the task’s start date.</li>
                            </ul>
                            <li>Abandonment of any task will result in an immediate ban from the Platform without further notice.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">5. Communication and Availability</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>VAs are required to maintain timely communication through the Platform regarding task progress.</li>
                            <li>Failure to respond to client or platform messages in a timely manner may result in disciplinary action, including account suspension.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">6. Remuneration</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>VAs will receive payment upon successful and timely completion of tasks.</li>
                            <li>Payments will be processed in accordance with the Platform's standard payout schedule.</li>
                            <li>No payment will be made for tasks not completed within the allowed timeframe, including the 1-day grace period.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">7. Code of Conduct</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>VAs must maintain professionalism, respect, and confidentiality in all dealings with clients.</li>
                            <li>Any form of misconduct, harassment, or unethical behavior may result in immediate termination of access to the Platform.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">8. Termination and Suspension</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>The Platform reserves the right to suspend or permanently terminate any VA account for:</li>
                            <ul className="list-[circle] ml-8">
                                <li>Repeated task non-completion.</li>
                                <li>Task abandonment.</li>
                                <li>Violation of any of these Terms and Conditions.</li>
                                <li>Any activity deemed harmful to the Platform’s integrity or its users.</li>
                            </ul>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">9. Amendments</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>The Platform reserves the right to update or modify these Terms and Conditions at any time. Notice will be provided to all users prior to any substantial changes.</li>
                        </ul>
                        <h2 className="text-xl font-semibold mt-6 mb-2">10. Governing Law</h2>
                        <ul className="list-disc ml-6 space-y-1">
                            <li>These Terms and Conditions shall be governed by and construed in accordance with the laws of <span className="font-semibold">[Insert Jurisdiction]</span>.</li>
                        </ul>
                        <p className="mt-8 text-center text-base font-medium">By using this Platform, you acknowledge that you have read, understood, and agreed to abide by these Terms and Conditions.</p>
                    </div>
                </div>
            </FrontLayout>
        </Fragment>
    );
};

export default terms;