// app/template.tsx
export default function Template({ children }: { children: React.ReactNode }) {
    return (
      <div className="max-w-screen mx-auto px-4">
        {children}
      </div>
    )
  }
  