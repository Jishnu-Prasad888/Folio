import React, { useState, useEffect } from 'react'
import { Check, Folder, Image as ImageIcon, Settings, Wand2, X } from 'lucide-react'
import { useAppStore } from '../store'
import Button from '../components/Common/Button'
import Modal from '../components/Common/Modal'

const Onboarding: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userName, setUserName] = useState('')
  const [importPath, setImportPath] = useState('')

  const steps = [
    {
      title: 'Welcome to Pictura',
      description: 'Your personal image knowledge manager',
      icon: Wand2,
      content: (
        <div className="space-y-4">
          <p className="font-body text-neutral-600 dark:text-neutral-400">
            Let's set up your workspace. This will only take a minute.
          </p>
          <div className="rounded-xl bg-gradient-primary p-4 text-white">
            <h3 className="font-heading text-lg mb-2">Features you'll love:</h3>
            <ul className="space-y-2">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Organize images with folders and tags</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Add notes and links to images</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>Set any image as wallpaper</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>All data stays on your computer</span>
              </li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: 'Your Profile',
      description: 'Tell us how we should address you',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <p className="font-body text-neutral-600 dark:text-neutral-400">
            This helps personalize your experience.
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block font-ui text-sm font-medium">
                Your Name
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                placeholder="Enter your name"
                className="input w-full"
                autoFocus
              />
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Import Images',
      description: 'Add your first images to get started',
      icon: ImageIcon,
      content: (
        <div className="space-y-4">
          <p className="font-body text-neutral-600 dark:text-neutral-400">
            You can import images now or later from the main screen.
          </p>
          <div className="rounded-xl border border-base-border p-4 dark:border-dark-muted">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-ui text-sm font-medium">Quick Import</h4>
                <p className="font-body text-xs text-neutral-500">
                  Import from a folder on your computer
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={async () => {
                  const result = await window.api.openFileDialog()
                  if (result.success) {
                    setImportPath(result.data || '')
                  }
                }}
              >
                Browse
              </Button>
            </div>
            {importPath && (
              <p className="mt-2 text-xs text-neutral-600 dark:text-neutral-400">
                Selected: {importPath}
              </p>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'Ready to Go!',
      description: 'Your workspace is all set up',
      icon: Folder,
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary">
              <Check className="h-8 w-8 text-white" />
            </div>
            <h3 className="font-heading text-lg">All Set!</h3>
            <p className="font-body text-neutral-600 dark:text-neutral-400">
              You're ready to start organizing your images.
            </p>
          </div>
          
          <div className="space-y-3 rounded-xl border border-base-border p-4 dark:border-dark-muted">
            <div className="flex items-center justify-between">
              <span className="font-ui text-sm">Next Steps:</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Skip for now
              </Button>
            </div>
            
            <div className="space-y-2">
              <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-neutral-100 dark:hover:bg-dark-muted">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-50 p-2 dark:bg-primary-900/30">
                    <ImageIcon className="h-4 w-4 text-primary-500" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-ui text-sm font-medium">Add Images</h4>
                    <p className="font-body text-xs text-neutral-500">
                      Import your first images
                    </p>
                  </div>
                </div>
              </button>
              
              <button className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-neutral-100 dark:hover:bg-dark-muted">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent-lavender/20 p-2">
                    <Folder className="h-4 w-4 text-accent-plum" />
                  </div>
                  <div className="text-left">
                    <h4 className="font-ui text-sm font-medium">Create Folders</h4>
                    <p className="font-body text-xs text-neutral-500">
                      Organize images into folders
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )
    }
  ]

  useEffect(() => {
  window.api.getSettings().then((response) => {
    if (
      response.success &&
      response.data &&
      response.data.first_run === 'true'
    ) {
      setIsOpen(true)
    }
  })
}, [])


  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save settings and close
      await window.api.updateSettings({
        name: userName,
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

  const currentStepData = steps[currentStep]
  const Icon = currentStepData.icon

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleSkip}
      size="md"
      closeOnOverlayClick={false}
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-primary-50 p-2 dark:bg-primary-900/30">
              <Icon className="h-6 w-6 text-primary-500" />
            </div>
            <div>
              <h2 className="font-heading text-xl">{currentStepData.title}</h2>
              <p className="font-body text-sm text-neutral-600 dark:text-neutral-400">
                {currentStepData.description}
              </p>
            </div>
          </div>
          
          <button
            onClick={handleSkip}
            className="rounded-lg p-1 hover:bg-neutral-100 dark:hover:bg-dark-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="min-h-[200px]">
          {currentStepData.content}
        </div>

        {/* Progress & Navigation */}
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="flex items-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep
                    ? 'bg-primary-400'
                    : 'bg-neutral-200 dark:bg-dark-muted'
                }`}
              />
            ))}
          </div>

          {/* Step Counter */}
          <div className="flex items-center justify-between">
            <span className="font-ui text-sm text-neutral-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  onClick={() => setCurrentStep(currentStep - 1)}
                >
                  Back
                </Button>
              )}
              
              <Button
                variant="primary"
                onClick={handleNext}
                icon={currentStep === steps.length - 1 ? Check : undefined}
              >
                {currentStep === steps.length - 1 ? 'Get Started' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}

export default Onboarding