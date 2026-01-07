"use client"

import type React from "react"

import { useState } from "react"
import { useWhatsAppTemplates, useCreateWhatsAppTemplate } from "@/hooks/use-whatsapp"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Plus, X, Loader2, FileText, CheckCircle2, XCircle, Clock, AlertCircle, ChevronRight } from "lucide-react"
import type { MessageTemplate } from "@/types/whatsapp"
import { format } from "date-fns"

interface WhatsappTemplateManagementProps {
  userId: string
}

export function WhatsappTemplateManagement({ userId }: WhatsappTemplateManagementProps) {
  const { data, isLoading } = useWhatsAppTemplates(userId)
  const createTemplate = useCreateWhatsAppTemplate()

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    content: "",
    category: "UTILITY" as "MARKETING" | "UTILITY" | "AUTHENTICATION",
    language: "en",
    isDefault: false,
  })

  const [variables, setVariables] = useState<Array<{ key: string; name: string; example: string }>>([])

  const templates = data?.templates || []

  const handleAddVariable = () => {
    setVariables([...variables, { key: `{{${variables.length + 1}}}`, name: "", example: "" }])
  }

  const handleRemoveVariable = (index: number) => {
    setVariables(variables.filter((_, i) => i !== index))
  }

  const handleUpdateVariable = (index: number, field: "name" | "example", value: string) => {
    const updated = [...variables]
    updated[index][field] = value
    setVariables(updated)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.content) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      await createTemplate.mutateAsync({
        userId,
        ...formData,
        variables: variables.length > 0 ? variables : undefined,
      })

      toast.success("Template Created — Your template has been submitted to Meta for approval.")

      // Reset form
      setFormData({
        name: "",
        content: "",
        category: "UTILITY",
        language: "en",
        isDefault: false,
      })
      setVariables([])
      setShowCreateForm(false)
    } catch (error: any) {
      toast.error(error?.message || "An error occurred while creating the template.")
    }
  }

  const getStatusBadge = (status: MessageTemplate["status"]) => {
    switch (status) {
      case "approved":
        return (
          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Approved
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "received":
        return (
          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        )
      case "paused":
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Paused
          </Badge>
        )
    }
  }

  return (
    <div className="flex h-full bg-background">
      {/* Template List */}
      <div
        className={`${selectedTemplate || showCreateForm ? "hidden md:block" : "flex-1"} md:w-[380px] shrink-0 border-r`}
      >
        <div className="p-4 border-b bg-white dark:bg-zinc-900">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Templates</h2>
            <Button
              size="sm"
              onClick={() => {
                setShowCreateForm(true)
                setSelectedTemplate(null)
              }}
            >
              <Plus className="h-4 w-4 mr-1" color="white" />
              New
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Manage your Meta-approved message templates</p>
        </div>

        <ScrollArea className="h-[calc(100%-88px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : templates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <FileText className="h-10 w-10 text-muted-foreground/20 mb-2" />
              <p className="text-sm text-muted-foreground">No templates yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Create your first template to get started.</p>
            </div>
          ) : (
            <div className="divide-y">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template)
                    setShowCreateForm(false)
                  }}
                  className="w-full p-4 text-left hover:bg-muted/50 transition-colors flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-sm truncate">{template.name}</h3>
                      {getStatusBadge(template.status)}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 mb-2">{template.content}</p>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span className="px-1.5 py-0.5 rounded bg-muted">{template.category}</span>
                      <span>{template.language.toUpperCase()}</span>
                      {template.usageCount > 0 && <span>Used {template.usageCount}x</span>}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Template Detail / Create Form */}
      <div className="flex-1">
        {showCreateForm ? (
          <div className="h-full">
            <div className="p-4 border-b bg-white dark:bg-zinc-900 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowCreateForm(false)} className="md:hidden">
                ← Back
              </Button>
              <h2 className="text-lg font-semibold">Create New Template</h2>
            </div>

            <ScrollArea className="h-[calc(100%-64px)]">
              <form onSubmit={handleSubmit} className="p-6 space-y-6 max-w-2xl">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Template Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., order_confirmation"
                    required
                  />
                  <p className="text-xs text-muted-foreground">Use lowercase letters, numbers, and underscores only</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    Message Content <span className="text-destructive">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Your message here. Use {{1}}, {{2}} for variables."
                    rows={6}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Use {`{{1}}, {{2}}, etc.`} as placeholders for dynamic content
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value: any) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger id="category">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTILITY">Utility</SelectItem>
                        <SelectItem value="MARKETING">Marketing</SelectItem>
                        <SelectItem value="AUTHENTICATION">Authentication</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <Input
                      id="language"
                      value={formData.language}
                      onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                      placeholder="en"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Variables (Optional)</Label>
                      <p className="text-xs text-muted-foreground">Define variables used in your template</p>
                    </div>
                    <Button type="button" size="sm" variant="outline" onClick={handleAddVariable}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Variable
                    </Button>
                  </div>

                  {variables.map((variable, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-2">
                          <div className="flex-1 space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                              <Input value={variable.key} disabled className="bg-muted" />
                              <Input
                                placeholder="Variable name"
                                value={variable.name}
                                onChange={(e) => handleUpdateVariable(index, "name", e.target.value)}
                              />
                              <Input
                                placeholder="Example value"
                                value={variable.example}
                                onChange={(e) => handleUpdateVariable(index, "example", e.target.value)}
                              />
                            </div>
                          </div>
                          <Button type="button" size="icon" variant="ghost" onClick={() => handleRemoveVariable(index)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Separator />

                <div className="flex items-center justify-between pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createTemplate.isPending}>
                    {createTemplate.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Create Template
                  </Button>
                </div>
              </form>
            </ScrollArea>
          </div>
        ) : selectedTemplate ? (
          <div className="h-full">
            <div className="p-4 border-b bg-white dark:bg-zinc-900 flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => setSelectedTemplate(null)} className="md:hidden">
                ← Back
              </Button>
              <h2 className="text-lg font-semibold">Template Details</h2>
            </div>

            <ScrollArea className="h-[calc(100%-64px)]">
              <div className="p-6 space-y-6 max-w-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">{selectedTemplate.name}</h3>
                    {getStatusBadge(selectedTemplate.status)}
                  </div>
                </div>

                {selectedTemplate.status === "rejected" && selectedTemplate.rejectionReason && (
                  <Card className="border-destructive bg-destructive/5">
                    <CardHeader>
                      <CardTitle className="text-sm text-destructive flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Rejection Reason
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">{selectedTemplate.rejectionReason}</p>
                    </CardContent>
                  </Card>
                )}

                <div>
                  <Label className="text-muted-foreground">Message Content</Label>
                  <Card className="mt-2">
                    <CardContent className="pt-4">
                      <p className="whitespace-pre-wrap">{selectedTemplate.content}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">Category</Label>
                    <p className="font-medium mt-1">{selectedTemplate.category}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Language</Label>
                    <p className="font-medium mt-1">{selectedTemplate.language.toUpperCase()}</p>
                  </div>
                </div>

                {selectedTemplate.variables.length > 0 && (
                  <div>
                    <Label className="text-muted-foreground">Variables</Label>
                    <div className="mt-2 space-y-2">
                      {selectedTemplate.variables.map((variable, index) => (
                        <Card key={index}>
                          <CardContent className="pt-4 flex items-center justify-between">
                            <div>
                              <p className="font-mono text-sm font-medium">{variable.key}</p>
                              <p className="text-xs text-muted-foreground">{variable.name}</p>
                            </div>
                            <Badge variant="outline">{variable.example}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p className="mt-1">{format(new Date(selectedTemplate.createdAt), "PPp")}</p>
                  </div>
                  {selectedTemplate.approvedAt && (
                    <div>
                      <Label className="text-muted-foreground">Approved</Label>
                      <p className="mt-1">{format(new Date(selectedTemplate.approvedAt), "PPp")}</p>
                    </div>
                  )}
                  <div>
                    <Label className="text-muted-foreground">Usage Count</Label>
                    <p className="mt-1">{selectedTemplate.usageCount} times</p>
                  </div>
                  {selectedTemplate.lastUsedAt && (
                    <div>
                      <Label className="text-muted-foreground">Last Used</Label>
                      <p className="mt-1">{format(new Date(selectedTemplate.lastUsedAt), "PPp")}</p>
                    </div>
                  )}
                </div>

                {/* {selectedTemplate.twilioContentSid && (
                  <div>
                    <Label className="text-muted-foreground">Twilio Content SID</Label>
                    <p className="mt-1 font-mono text-xs bg-muted px-2 py-1 rounded">
                      {selectedTemplate.twilioContentSid}
                    </p>
                  </div>
                )} */}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-center p-8">
            <div>
              <div className="bg-primary/5 dark:bg-zinc-800 p-8 rounded-full mb-6 inline-block">
                <FileText className="h-16 w-16 text-primary opacity-20" />
              </div>
              <h3 className="text-xl font-bold mb-2">Select a Template</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Choose a template from the list to view details or create a new one to get started.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
