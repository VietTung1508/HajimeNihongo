import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { GrammarDetail } from '@/types/grammar'

export type GrammarFormData = Partial<Omit<GrammarDetail, 'id' | 'examples'>> & {
  grammarPoint: string
  meaning: string
  level: string
}

interface Props {
  fields: GrammarFormData
  onChange: (patch: Partial<GrammarFormData>) => void
  disabled?: boolean
}

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1']

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      {children}
    </div>
  )
}

export function GrammarFormFields({ fields, onChange, disabled }: Props) {
  const set = (patch: Partial<GrammarFormData>) => onChange(patch)

  return (
    <div className="space-y-4">
      {/* Required */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Grammar Point *">
          <Input
            value={fields.grammarPoint}
            onChange={e => set({ grammarPoint: e.target.value })}
            placeholder="e.g. 〜てしまう"
            disabled={disabled}
          />
        </Field>
        <Field label="Level *">
          <Select value={fields.level} onValueChange={val => set({ level: val })} disabled={disabled}>
            <SelectTrigger>
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {JLPT_LEVELS.map(l => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field label="Meaning *">
        <Input
          value={fields.meaning}
          onChange={e => set({ meaning: e.target.value })}
          placeholder="English meaning..."
          disabled={disabled}
        />
      </Field>

      {/* Optional fields */}
      <div className="grid grid-cols-2 gap-4">
        <Field label="Part of Speech">
          <Input value={fields.partOfSpeech ?? ''} onChange={e => set({ partOfSpeech: e.target.value })} disabled={disabled} />
        </Field>
        <Field label="Register">
          <Input value={fields.register ?? ''} onChange={e => set({ register: e.target.value })} disabled={disabled} />
        </Field>
        <Field label="Lesson Number">
          <Input
            type="number"
            value={fields.lessonNumber ?? ''}
            onChange={e => set({ lessonNumber: e.target.value ? Number(e.target.value) : undefined })}
            disabled={disabled}
          />
        </Field>
        <Field label="Lesson Title">
          <Input value={fields.lessonTitle ?? ''} onChange={e => set({ lessonTitle: e.target.value })} disabled={disabled} />
        </Field>
        <Field label="Synonyms">
          <Input value={fields.synonyms ?? ''} onChange={e => set({ synonyms: e.target.value })} disabled={disabled} />
        </Field>
        <Field label="Antonyms">
          <Input value={fields.antonyms ?? ''} onChange={e => set({ antonyms: e.target.value })} disabled={disabled} />
        </Field>
      </div>

      <Field label="Meaning Hint">
        <Input value={fields.meaningHint ?? ''} onChange={e => set({ meaningHint: e.target.value })} disabled={disabled} />
      </Field>

      <Field label="Structure">
        <Textarea value={fields.structure ?? ''} onChange={e => set({ structure: e.target.value })} rows={2} disabled={disabled} />
      </Field>

      <Field label="Structure Display">
        <Textarea value={fields.structureDisplay ?? ''} onChange={e => set({ structureDisplay: e.target.value })} rows={2} disabled={disabled} />
      </Field>

      <Field label="About">
        <Textarea value={fields.about ?? ''} onChange={e => set({ about: e.target.value })} rows={3} disabled={disabled} />
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Example (JP) — legacy">
          <Textarea value={fields.exampleJp ?? ''} onChange={e => set({ exampleJp: e.target.value })} rows={2} disabled={disabled} />
        </Field>
        <Field label="Example (EN) — legacy">
          <Textarea value={fields.exampleEn ?? ''} onChange={e => set({ exampleEn: e.target.value })} rows={2} disabled={disabled} />
        </Field>
      </div>
    </div>
  )
}
