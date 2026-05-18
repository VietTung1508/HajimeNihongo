import Landing from '@/features/landing'
import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/landing')({component: Landing})
