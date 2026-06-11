'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ConfigStepProps {
  wizardData: Record<string, any>
  setWizardData: (data: Record<string, any>) => void
}

export function ConfigStep({ wizardData, setWizardData }: ConfigStepProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Privacy Settings</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { value: 'PUBLIC', label: 'Public', desc: 'Visible to everyone', icon: '🌐' },
            { value: 'UNLISTED', label: 'Unlisted', desc: 'Only via direct link', icon: '🔗' },
            { value: 'PRIVATE', label: 'Private', desc: 'Only you can see', icon: '🔒' },
          ].map((option) => (
            <Card
              key={option.value}
              className={`cursor-pointer transition-all will-change-transform ${
                wizardData.privacy === option.value
                  ? 'ring-2 ring-emerald-600 dark:ring-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20 gradient-border'
                  : 'hover:shadow-md'
              }`
              }
              onClick={() => setWizardData({ privacy: option.value })}
            >
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">{option.icon}</div>
                <h4 className="font-semibold text-sm">{option.label}</h4>
                <p className="text-xs text-muted-foreground">{option.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
