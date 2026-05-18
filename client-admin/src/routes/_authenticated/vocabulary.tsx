import Vocabulary from '@/features/vocabulary'
import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/vocabulary')({component: Vocabulary})
