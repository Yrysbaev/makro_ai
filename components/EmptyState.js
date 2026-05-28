import Link from 'next/link'

export default function EmptyState({ icon: Icon, title, description, action, actionHref }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {Icon && <Icon size={40} className="text-gray-300 mb-4" />}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-sm mb-5">{description}</p>
      {action && actionHref && (
        <Link
          href={actionHref}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {action}
        </Link>
      )}
    </div>
  )
}
