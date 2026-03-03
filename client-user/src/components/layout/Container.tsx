type Props = {
  children: React.ReactNode
  className?: string
}

export default function Container({children, className = ''}: Props) {
  return <div className={`max-w-347 mx-auto px-6 ${className}`}>{children}</div>
}
