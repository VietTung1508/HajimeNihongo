import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Props {
  open: boolean
  title: string
  description: string
  submitText?: string
  cancelText?: string
  onSubmit: () => void
  onCancel: () => void
}

export function ConfirmDialog({
  open,
  title,
  description,
  submitText = 'Confirm',
  cancelText = 'Cancel',
  onSubmit,
  onCancel,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onCancel() }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>{cancelText}</Button>
          <Button variant="destructive" onClick={onSubmit}>{submitText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
