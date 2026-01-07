"use client"

import { useState } from "react"
import { useWhatsAppTemplates, useSendWhatsAppTemplate } from "@/hooks/use-whatsapp"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, MessageSquare, Search } from "lucide-react"
import type { MessageTemplate } from "@/types/whatsapp"
import { toast } from "sonner"

interface WhatsappTemplateSelectorProps {
  userId: string
  customerPhone: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

export function WhatsappTemplateSelector({
  userId,
  customerPhone,
  open,
  onOpenChange,
  onSuccess,
}: WhatsappTemplateSelectorProps) {
  const { data, isLoading } = useWhatsAppTemplates(userId)
  const sendTemplate = useSendWhatsAppTemplate()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)
  const [variableValues, setVariableValues] = useState<Record<string, string>>({})

  const templates = data?.templates || []
  const filteredTemplates = templates.filter(
    (t) =>
      t.status === "approved" &&
      (t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.content.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template)
    const initialVars: Record<string, string> = {}
    template.variables.forEach((v) => {
      initialVars[v.key] = ""
    })
    setVariableValues(initialVars)
  }

  const handleVariableChange = (key: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSend = async () => {
    if (!selectedTemplate) return

    try {
      await sendTemplate.mutateAsync({
        userId,
        customerPhone,
        templateId: selectedTemplate.id,
        variableValues,
      })

    toast.success("Template sent", {
      description: `Successfully sent "${selectedTemplate.name}" to ${customerPhone}`,
    })

      onOpenChange(false)
      setSelectedTemplate(null)
      if (onSuccess) onSuccess()
    } catch (error: any) {
    toast.error("Failed to send template", {
      description: error?.message || "An unexpected error occurred",
    })
    }
  }

  const renderPreview = (content: string, vars: Record<string, string>) => {
    let preview = content
    Object.entries(vars).forEach(([key, value]) => {
      preview = preview.replace(`{{${key}}}`, value || `{{${key}}}`)
    })
    return preview
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle>Select WhatsApp Template</DialogTitle>
        </DialogHeader>

        <div className="flex-1 flex overflow-hidden">
          {/* Template List */}
          <div className="w-1/2 border-r flex flex-col">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : filteredTemplates.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">No approved templates found.</div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredTemplates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className={`w-full text-left p-3 rounded-md transition-colors ${
                        selectedTemplate?.id === template.id ? "bg-primary/10 border-primary" : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">{template.name}</span>
                        <Badge variant="outline" className="text-[10px] uppercase">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{template.content}</p>
                    </button>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>

          {/* Template Preview & Config */}
          <div className="w-1/2 flex flex-col bg-muted/30">
            {selectedTemplate ? (
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground uppercase tracking-wider">Preview</Label>
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-border text-sm leading-relaxed whitespace-pre-wrap">
                      {renderPreview(selectedTemplate.content, variableValues)}
                    </div>
                  </div>

                  {selectedTemplate.variables.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-xs text-muted-foreground uppercase tracking-wider">Variables</Label>
                      {selectedTemplate.variables.map((variable) => (
                        <div key={variable.key} className="space-y-1.5">
                          <Label htmlFor={`var-${variable.key}`} className="text-xs">
                            {variable.name} <span className="text-muted-foreground">(example: {variable.example})</span>
                          </Label>
                          <Input
                            id={`var-${variable.key}`}
                            placeholder={variable.example}
                            value={variableValues[variable.key] || ""}
                            onChange={(e) => handleVariableChange(variable.key, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8 text-center">
                <MessageSquare className="h-12 w-12 mb-4 opacity-20" />
                <p className="text-sm">Select a template from the list to preview and configure it.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="px-6 py-4 border-t bg-muted/50">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={!selectedTemplate || sendTemplate.isPending}>
            {sendTemplate.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
