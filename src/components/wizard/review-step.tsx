'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2 } from 'lucide-react'

interface ReviewStepProps {
  wizardData: Record<string, any>
  publishing: boolean
  handlePublish: () => void
}

export function ReviewStep({ wizardData, publishing, handlePublish }: ReviewStepProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Review Your Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-xs text-muted-foreground">Name</span>
              <p className="font-medium">{wizardData.name || 'Untitled Agent'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Category</span>
              <p className="font-medium">{wizardData.category || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Framework</span>
              <p className="font-medium">{wizardData.framework || 'Not set'}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Difficulty</span>
              <p className="font-medium capitalize">{wizardData.difficulty || 'Not set'}</p>
            </div>
            <div className="sm:col-span-2">
              <span className="text-xs text-muted-foreground">Description</span>
              <p className="text-sm">{wizardData.description || 'No description'}</p>
            </div>
            {wizardData.tags?.length > 0 && (
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground">Tags</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {wizardData.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            {wizardData.code && (
              <div className="sm:col-span-2">
                <span className="text-xs text-muted-foreground">Code</span>
                <pre className="mt-1 p-3 bg-gray-950 text-gray-100 rounded text-xs overflow-x-auto max-h-32">
                  {wizardData.code.slice(0, 300)}{wizardData.code.length > 300 ? '...' : ''}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Button
        className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base font-semibold"
        onClick={handlePublish}
        disabled={publishing}
      >
        {publishing ? (
          <><Loader2 className="h-5 w-5 mr-2 animate-spin" /> Publishing...</>
        ) : (
          <><Check className="h-5 w-5 mr-2" /> Publish Agent</>
        )}
      </Button>
    </div>
  )
}
