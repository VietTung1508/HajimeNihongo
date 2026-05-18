import Grammar from '@/features/grammar'
import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/grammar')({component: Grammar})
