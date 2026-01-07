import { useRef, useEffect } from "react"

// Add this component
export default function EmailContentIframe({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const doc = iframe.contentDocument || iframe.contentWindow?.document
      
      if (doc) {
        doc.open()
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="utf-8">
              <style>
                body {
                  margin: 0;
                  padding: 16px;
                  font-family: system-ui, -apple-system, sans-serif;
                  font-size: 14px;
                  line-height: 1.5;
                  color: #000;
                  background: transparent;
                }
                /* Add any base styles you want for emails */
              </style>
            </head>
            <body>${html}</body>
          </html>
        `)
        doc.close()
      }
    }
  }, [html])

  return (
    <iframe
      ref={iframeRef}
      className="w-full border-0 bg-transparent"
      style={{ minHeight: '400px' }}
      sandbox="allow-same-origin"
      title="Email content"
    />
  )
}