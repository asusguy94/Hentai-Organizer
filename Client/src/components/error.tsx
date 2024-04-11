import { ErrorComponent as DefaultErrorComponent, ErrorComponentProps } from '@tanstack/react-router'

export default function ErrorComponent({ error }: ErrorComponentProps) {
  if (error instanceof Error && import.meta.env.DEV) {
    return (
      <div>
        <h1>{error.message}</h1>
        <pre>{error.stack}</pre>
      </div>
    )
  }

  return <DefaultErrorComponent error={error} />
}
