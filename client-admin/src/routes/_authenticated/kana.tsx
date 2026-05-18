import Kana from '@/features/kana'
import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/kana')({component: Kana})
