import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import Image from '@tiptap/extension-image'
import { Color, TextStyle } from '@tiptap/extension-text-style'
import { cn } from '@/lib/utils'

interface Props {
  value: string
  onChange: (html: string) => void
  className?: string
  disabled?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

// Preset colors shown in the toolbar color picker
const PRESET_COLORS = [
  '#000000', '#ef4444', '#f97316', '#eab308',
  '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899',
  '#6b7280', '#ffffff',
]

function ToolbarButton({ onClick, active, children }: {
  onClick: () => void
  active?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onMouseDown={e => { e.preventDefault(); onClick() }}
      className={cn(
        'px-2 py-1 text-xs rounded border transition-colors',
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'border-input hover:bg-accent hover:text-accent-foreground'
      )}
    >
      {children}
    </button>
  )
}

export function RichTextEditor({ value, onChange, className, disabled, onImageUpload }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({ inline: false }),
    ],
    content: value,
    editable: !disabled,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
  })

  // Sync external value changes into the editor (e.g. async data load after mount)
  useEffect(() => {
    if (!editor || editor.isDestroyed) return
    if (editor.getHTML() === value) return
    editor.commands.setContent(value, false) // false = don't emit onUpdate, avoids loop
  }, [value, editor])

  // Handle paste events for clipboard images
  useEffect(() => {
    if (!editor || !onImageUpload) return

    const handlePaste = (event: ClipboardEvent) => {
      const items = Array.from(event.clipboardData?.items ?? [])
      const imageItem = items.find(item => item.type.startsWith('image/'))
      if (!imageItem) return
      event.preventDefault()
      const file = imageItem.getAsFile()
      if (!file) return
      onImageUpload(file).then(url => {
        editor.chain().focus().setImage({ src: url }).run()
      })
    }

    const el = editor.view.dom
    el.addEventListener('paste', handlePaste)
    return () => el.removeEventListener('paste', handlePaste)
  }, [editor, onImageUpload])

  if (!editor) return null

  const insertTable = () =>
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !onImageUpload) return
    e.target.value = ''
    try {
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch {
      // consumer handles error notification
    }
  }

  const activeColor = editor.getAttributes('textStyle').color as string | undefined

  return (
    <div className={cn('border rounded-md overflow-hidden', className)}>
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/30">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
          <strong>B</strong>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
          <em>I</em>
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
          H1
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
          H2
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })}>
          H3
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
          • List
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
          1. List
        </ToolbarButton>
        <ToolbarButton onClick={insertTable}>
          Table
        </ToolbarButton>
        {onImageUpload && (
          <ToolbarButton onClick={() => fileInputRef.current?.click()}>
            Image
          </ToolbarButton>
        )}

        {/* Color picker: preset swatches + free-pick via native color input */}
        <div className="flex items-center gap-0.5 border border-input rounded px-1">
          {PRESET_COLORS.map(color => (
            <button
              key={color}
              type="button"
              title={color}
              onMouseDown={e => {
                e.preventDefault()
                editor.chain().focus().setColor(color).run()
              }}
              className={cn(
                'w-4 h-4 rounded-sm border transition-transform hover:scale-110',
                activeColor === color ? 'border-primary scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: color }}
            />
          ))}
          {/* Native color picker for custom color */}
          <button
            type="button"
            title="Custom color"
            onMouseDown={e => { e.preventDefault(); colorInputRef.current?.click() }}
            className="w-4 h-4 rounded-sm border border-dashed border-input flex items-center justify-center text-[9px] text-muted-foreground hover:bg-accent"
          >
            +
          </button>
          {/* Reset to default color */}
          <button
            type="button"
            title="Remove color"
            onMouseDown={e => {
              e.preventDefault()
              editor.chain().focus().unsetColor().run()
            }}
            className="ml-0.5 px-1 text-[9px] text-muted-foreground border border-input rounded hover:bg-accent"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Hidden file inputs */}
      {onImageUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
        />
      )}
      {/* Positioned at bottom-center so the browser opens the color picker upward from there */}
      <input
        ref={colorInputRef}
        type="color"
        defaultValue="#000000"
        onChange={e => editor.chain().focus().setColor(e.target.value).run()}
        style={{
          position: 'fixed',
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          opacity: 0,
          pointerEvents: 'none',
        }}
      />

      <EditorContent
        editor={editor}
        className={cn(
          'prose prose-sm max-w-none p-3 min-h-[200px] focus-within:outline-none',
          '[&_.ProseMirror]:outline-none',
          '[&_table]:border-collapse [&_td]:border [&_td]:border-border [&_td]:p-2',
          '[&_th]:border [&_th]:border-border [&_th]:p-2 [&_th]:bg-muted',
          '[&_img]:max-w-full [&_img]:h-auto [&_img]:rounded',
          disabled && 'opacity-50 pointer-events-none'
        )}
      />
    </div>
  )
}
