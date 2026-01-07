import { Mail, Shield, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MessagingTabs } from "../messagingTab"

interface ConnectEmailProps {
	onConnect: () => void
}

export function ConnectEmail({ onConnect }: ConnectEmailProps) {
	return (
		<div>
			<MessagingTabs />
			<div className="flex flex-col items-center justify-center py-12 px-6">
				<Card className="max-w-lg w-full">
					<CardHeader className="text-center">
						<div className="mx-auto mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10">
							<Mail className="w-8 h-8 text-primary" />
						</div>
						<CardTitle className="text-2xl">Connect Your Email</CardTitle>
						<CardDescription>Link your email account to manage all your communications in one place.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						<div className="space-y-4">
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<Shield className="w-4 h-4 text-muted-foreground" />
								</div>
								<div>
									<p className="font-medium text-sm">Secure Connection</p>
									<p className="text-sm text-muted-foreground">Your credentials are securely handled through our authentication partner.</p>
								</div>
							</div>
							<div className="flex items-start gap-3">
								<div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
									<Zap className="w-4 h-4 text-muted-foreground" />
								</div>
								<div>
									<p className="font-medium text-sm">Instant Sync</p>
									<p className="text-sm text-muted-foreground">Access your inbox, sent items, and folders instantly after connecting.</p>
								</div>
							</div>
						</div>

						<Button onClick={onConnect} className="w-full" size="lg">
							Connect Email Account
							<ArrowRight className="w-4 h-4 ml-2" color="white" />
						</Button>

						<p className="text-xs text-center text-muted-foreground">By connecting, you agree to our terms of service and privacy policy.</p>
					</CardContent>
				</Card>
			</div>
		</div>
	)
}
