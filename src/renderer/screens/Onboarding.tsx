import React, { useState, useEffect } from 'react'
import { Check, Image as ImageIcon } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import Modal from '../components/Common/Modal'

const Onboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState(0)
  const [name, setName] = useState('')
  const [importPath, setImportPath] = useState('')

  const steps = [
    {
      title: 'Welcome to Pictura',
      body: (
        <>
          <p className="text-neutral-600 dark:text-neutral-400">
            Pictura helps you organize, explore, and connect your images — all locally on your
            computer.
          </p>

          <ul className="mt-6 space-y-3 text-sm text-neutral-600 dark:text-neutral-400">
            <li>• Organize with folders and tags</li>
            <li>• Add notes and links</li>
            <li>• Instantly set wallpapers</li>
            <li>• Your data stays private</li>
          </ul>
        </>
      )
    },
    {
      title: 'What should we call you?',
      body: (
        <div className="mt-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input w-full text-base"
            autoFocus
          />
        </div>
      )
    },
    {
      title: 'Import your first images',
      body: (
        <div className="space-y-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            You can import a folder now or do this later.
          </p>

          <Button
            variant="secondary"
            onClick={async () => {
              const result = await window.api.openFileDialog()
              if (result.success) {
                setImportPath(result.data || '')
              }
            }}
          >
            Choose Folder
          </Button>

          {importPath && <p className="text-xs text-neutral-500">Selected: {importPath}</p>}
        </div>
      )
    },
    {
      title: 'You’re ready to go.',
      body: (
        <div className="flex flex-col items-center justify-center text-center py-4">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#FF5B04]/10">
            <Check className="h-6 w-6 text-[#FF5B04]" />
          </div>
          <p className="text-neutral-600 dark:text-neutral-400">Your workspace is set up.</p>
        </div>
      )
    }
  ]

  useEffect(() => {
    window.api.getSettings().then((res) => {
      if (res.success && res.data?.first_run === 'true') {
        setIsOpen(true)
      }
    })
  }, [])

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(step + 1)
    } else {
      await window.api.updateSettings({
        name,
        first_run: 'false'
      })
      setIsOpen(false)
    }
  }

  const handleSkip = async () => {
    await window.api.updateSettings({
      first_run: 'false'
    })
    setIsOpen(false)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="sm"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="px-2 py-4">
        {/* Content */}
        <div className="space-y-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold">{steps[step].title}</h2>
          </div>

          <div className="min-h-[120px]">{steps[step].body}</div>
        </div>

        {/* Footer */}
        <div className="mt-8 flex items-center justify-between">
          {/* Progress Dots */}
          <div className="flex gap-2">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`h-2 w-2 rounded-full transition-colors ${
                  i === step ? 'bg-[#FF5B04]' : 'bg-neutral-300 dark:bg-dark-muted'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-sm text-neutral-500 hover:underline"
              >
                Back
              </button>
            )}

            <Button variant="primary" onClick={handleNext}>
              {step === steps.length - 1 ? 'Start using Pictura' : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Onboarding
