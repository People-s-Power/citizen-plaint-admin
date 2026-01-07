"use client"

import type React from "react"

import { useState, useMemo } from "react"
import { useWhatsAppTemplates, useStartNewConversation } from "@/hooks/use-whatsapp"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

import { Loader2, CheckCircle2, User, MessageSquare, Send, AlertCircle } from "lucide-react"
import type { MessageTemplate } from "@/types/whatsapp"

interface WhatsappNewChatProps {
  userId: string
  onChatStarted?: () => void
}

export function WhatsappNewChat({ userId, onChatStarted }: WhatsappNewChatProps) {
  const { data, isLoading } = useWhatsAppTemplates(userId)
  const startConversation = useStartNewConversation()

  const [customerPhone, setCustomerPhone] = useState("")
  const [customerName, setCustomerName] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  const templates = data?.templates || []
  const approvedTemplates = templates.filter((t) => t.status === "approved")

  // Initialize variable values when template is selected
  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    const initialValues: Record<string, string> = {}
    template.variables.forEach((v) => {
      initialValues[v.key] = ""
    })
    setVariableValues(initialValues)
  }

  // Preview the message with variable substitution
  const previewMessage = useMemo(() => {
    if (!selectedTemplate) return ""
    let preview = selectedTemplate.content
    selectedTemplate.variables.forEach((variable) => {
      const value = variableValues[variable.key] || `[${variable.name}]`
      preview = preview.replace(new RegExp(variable.key.replace(/[{}]/g, "\\$&"), "g"), value)
    })
    return preview
  }, [selectedTemplate, variableValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!customerPhone) {
      toast.error("Phone Number Required", {
        description: "Please enter the customer's WhatsApp number.",
      })
      return
    }

    if (!selectedTemplate) {
      toast.error("Template Required", {
        description: "Please select a template to start the conversation.",
      })
      return
    }

    // Validate all variables are filled
    const missingVariables = selectedTemplate.variables.filter((v) => !variableValues[v.key]?.trim())
    if (missingVariables.length > 0) {
      toast.error("Missing Variables", {
        description: `Please fill in all variables: ${missingVariables.map((v) => v.name).join(", ")}`,
      })
      return
    }

    try {
        await startConversation.mutateAsync({
            userId,
            customerPhone,
            customerName: customerName || undefined,
            templateId: selectedTemplate.id,
            variableValues,
        })

        toast.success("Conversation Started", {
            description: `Your message has been sent to ${customerPhone}`,
        })

        // Reset form
        setCustomerPhone("")
        setCustomerName("")
        setSelectedTemplate(null)
        setVariableValues({})

        // Notify parent component
        onChatStarted?.()
    } catch (error: any) {
        toast.error("Failed to Start Conversation", {
            description: error?.message || "An error occurred while sending the message.",
        })
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b bg-white dark:bg-zinc-900">
        <h2 className="text-xl font-bold mb-1">New Conversation</h2>
        <p className="text-xs text-muted-foreground">Start a conversation with a new customer using a template</p>
      </div>

      <ScrollArea className="flex-1">
        <form onSubmit={handleSubmit} className="p-6 max-w-2xl mx-auto space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">
                  WhatsApp Number <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="phone"
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+1234567890"
                  required
                />
                <p className="text-xs text-muted-foreground">Include country code (e.g., +1 for USA)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Customer Name (Optional)</Label>
                <Input
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                Select Template <span className="text-destructive ml-1">*</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : approvedTemplates.length === 0 ? (
                <div className="py-8 text-center">
                  <AlertCircle className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No approved templates available. Create and get templates approved first.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {approvedTemplates.map((template) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full p-3 border rounded-lg text-left transition-all ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5 ring-1 ring-primary"
                          : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold text-sm">{template.name}</h4>
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] h-4">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                              Approved
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted">{template.category}</span>
                            {template.variables.length > 0 && (
                              <span className="text-[10px] text-muted-foreground">
                                {template.variables.length} variable{template.variables.length > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedTemplate?.id === template.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Variable Input */}
          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Fill Template Variables</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate.variables.map((variable) => (
                  <div key={variable.key} className="space-y-2">
                    <Label htmlFor={variable.key}>
                      {variable.name} <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={variable.key}
                      value={variableValues[variable.key] || ""}
                      onChange={(e) =>
                        setVariableValues({
                          ...variableValues,
                          [variable.key]: e.target.value,
                        })
                      }
                      placeholder={`e.g., ${variable.example}`}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Will replace <span className="font-mono">{variable.key}</span> in the message
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Message Preview */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Message Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#dcf8c6] dark:bg-[#056162] p-3 rounded-lg rounded-tl-none shadow-sm">
                  <p className="text-sm whitespace-pre-wrap text-foreground">{previewMessage}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <Separator />

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="submit"
              disabled={!customerPhone || !selectedTemplate || startConversation.isPending}
              className="min-w-[140px]"
            >
              {startConversation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Start Chat
                </>
              )}
            </Button>
          </div>
        </form>
      </ScrollArea>
    </div>
  )
}
