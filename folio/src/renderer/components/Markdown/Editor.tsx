import React, { useState, useEffect } from 'react'
import { Bold, Italic, List, ListOrdered, Link, Image as ImageIcon, Eye, Type } from 'lucide-react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import LinkExtension from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { useAppStore } from '../../store'
import Button from '../Common/Button'
import clsx from 'clsx'

interface MarkdownEditorProps {
  content: string
  onChange: (content: string) => void
  imageId?: string
  placeholder?: string
  className?: string
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  imageId: _imageId,
  placeholder = 'Start writing your notes...',
  className
}) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit')
  const [linkDialog, setLinkDialog] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkText, setLinkText] = useState('')
  const { images, folders } = useAppStore()

  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary-500 underline hover:text-primary-600'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px]',
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  const toggleBold = () => {
    editor?.chain().focus().toggleBold().run()
  }

  const toggleItalic = () => {
    editor?.chain().focus().toggleItalic().run()
  }

  const toggleBulletList = () => {
    editor?.chain().focus().toggleBulletList().run()
  }

  const toggleOrderedList = () => {
    editor?.chain().focus().toggleOrderedList().run()
  }

  const addLink = () => {
    if (!editor) return

    if (editor.isActive('link')) {
      editor.chain().focus().unsetLink().run()
    } else {
      setLinkDialog(true)
    }
  }

  const handleAddLink = () => {
  if (!editor) return

  const text = linkText || linkUrl

  editor
    .chain()
    .focus()
    .insertContent({
      type: 'text',
      text,
      marks: [
        {
          type: 'link',
          attrs: { href: linkUrl }
        }
      ]
    })
    .run()

  setLinkDialog(false)
  setLinkUrl('')
  setLinkText('')
}


  const handleInternalLink = (type: 'image' | 'folder', id: string, name: string) => {
    if (!editor) return

    const linkText = `[[${name}]]`
    const linkUrl = `app://${type}/${id}`

    editor
      .chain()
      .focus()
      .insertContent(`<a href="${linkUrl}" data-type="${type}" data-id="${id}">${linkText}</a>`)
      .run()
  }

  const renderPreview = () => {
    if (!editor) return null

    return (
      <div className="prose prose-sm max-w-none rounded-lg bg-base-surfaceAlt p-4 dark:prose-invert">
        <div dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
      </div>
    )
  }

  if (!editor) {
    return null
  }

  return (
    <div className={clsx("space-y-4", className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-xl border border-base-border bg-base-surfaceAlt p-2 dark:border-dark-muted">
        {/* Mode Toggle */}
        <div className="mr-2 flex rounded-lg bg-neutral-100 p-1 dark:bg-dark-muted">
          <button
            onClick={() => setMode('edit')}
            className={clsx(
              "rounded-md px-3 py-1 text-sm transition-colors",
              mode === 'edit'
                ? "bg-white text-primary-500 shadow-sm dark:bg-dark-base"
                : "text-neutral-600 hover:text-dark-base dark:text-neutral-400"
            )}
          >
            <Type className="inline h-3 w-3 mr-1" />
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={clsx(
              "rounded-md px-3 py-1 text-sm transition-colors",
              mode === 'preview'
                ? "bg-white text-primary-500 shadow-sm dark:bg-dark-base"
                : "text-neutral-600 hover:text-dark-base dark:text-neutral-400"
            )}
          >
            <Eye className="inline h-3 w-3 mr-1" />
            Preview
          </button>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-base-border dark:bg-dark-muted" />

        {/* Formatting Buttons */}
        <Button
          variant="ghost"
          size="sm"
          icon={Bold}
          onClick={toggleBold}
          className={editor.isActive('bold') ? 'bg-primary-50 text-primary-500' : ''}
          title="Bold"
        />

        <Button
          variant="ghost"
          size="sm"
          icon={Italic}
          onClick={toggleItalic}
          className={editor.isActive('italic') ? 'bg-primary-50 text-primary-500' : ''}
          title="Italic"
        />

        <Button
          variant="ghost"
          size="sm"
          icon={List}
          onClick={toggleBulletList}
          className={editor.isActive('bulletList') ? 'bg-primary-50 text-primary-500' : ''}
          title="Bullet List"
        />

        <Button
          variant="ghost"
          size="sm"
          icon={ListOrdered}
          onClick={toggleOrderedList}
          className={editor.isActive('orderedList') ? 'bg-primary-50 text-primary-500' : ''}
          title="Numbered List"
        />

        <Button
          variant="ghost"
          size="sm"
          icon={Link}
          onClick={addLink}
          className={editor.isActive('link') ? 'bg-primary-50 text-primary-500' : ''}
          title="Add Link"
        />

        {/* Internal Link Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            icon={ImageIcon}
            title="Link to image or folder"
          >
            Link to...
          </Button>

          <div className="absolute left-0 top-full z-10 mt-1 hidden w-48 rounded-xl border border-base-border bg-base-surface shadow-lg group-hover:block dark:border-dark-muted dark:bg-dark-base">
            <div className="p-2">
              <h4 className="mb-2 font-ui text-xs font-medium">Images</h4>
              <div className="space-y-1">
                {images.slice(0, 5).map(image => (
                  <button
                    key={image.id}
                    onClick={() => handleInternalLink('image', image.id, image.file_path.split('/').pop() || 'Image')}
                    className="block w-full rounded-lg px-2 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-dark-muted"
                  >
                    {image.file_path.split('/').pop()}
                  </button>
                ))}
              </div>

              <h4 className="mb-2 mt-3 font-ui text-xs font-medium">Folders</h4>
              <div className="space-y-1">
                {folders.slice(0, 5).map(folder => (
                  <button
                    key={folder.id}
                    onClick={() => handleInternalLink('folder', folder.id, folder.name)}
                    className="block w-full rounded-lg px-2 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-dark-muted"
                  >
                    {folder.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Link Dialog */}
      {linkDialog && (
        <div className="rounded-xl border border-base-border bg-base-surfaceAlt p-4 dark:border-dark-muted">
          <h4 className="mb-3 font-ui text-sm font-medium">Add Link</h4>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Link URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="input w-full"
            />
            <input
              type="text"
              placeholder="Link text (optional)"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="input w-full"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLinkDialog(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddLink}
                disabled={!linkUrl}
              >
                Add Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Editor/Preview Area */}
      <div className="min-h-[300px] rounded-2xl border border-base-border bg-base-surface dark:border-dark-muted">
        {mode === 'edit' ? (
          <EditorContent
            editor={editor}
            className="p-4"
          />
        ) : (
          renderPreview()
        )}
      </div>
    </div>
  )
}

export default MarkdownEditor