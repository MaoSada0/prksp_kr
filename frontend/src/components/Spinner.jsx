export default function Spinner({ className = '' }) {
  return (
    <div className={`flex justify-center items-center ${className}`}>
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '2px solid var(--border)', borderTopColor: 'var(--blue)' }}
      />
    </div>
  )
}
