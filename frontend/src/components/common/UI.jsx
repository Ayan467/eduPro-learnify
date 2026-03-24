// Skeleton loader
export const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

// Progress bar
export const ProgressBar = ({ value = 0, color = 'bg-primary' }) => (
  <div className="w-full bg-gray-100 rounded-full h-2">
    <div className={`${color} h-2 rounded-full transition-all duration-500`} style={{ width: `${value}%` }} />
  </div>
);

// Badge
export const Badge = ({ children, variant = 'default' }) => {
  const styles = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-primary-light text-primary-dark',
    info: 'bg-blue-50 text-blue-700',
    warning: 'bg-amber-50 text-amber-700',
    danger: 'bg-red-50 text-red-600',
    premium: 'bg-amber-50 text-amber-700',
  };
  return (
    <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${styles[variant] || styles.default}`}>
      {children}
    </span>
  );
};

// Loading spinner
export const Spinner = ({ size = 'md' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' };
  return (
    <div className={`${sizes[size]} border-2 border-gray-200 border-t-primary rounded-full animate-spin`} />
  );
};

// Empty state
export const EmptyState = ({ icon = '📭', title, description }) => (
  <div className="text-center py-16">
    <div className="text-4xl mb-3">{icon}</div>
    <h3 className="text-gray-700 font-medium mb-1">{title}</h3>
    {description && <p className="text-gray-400 text-sm">{description}</p>}
  </div>
);

// Stat card
export const StatCard = ({ label, value, sub, icon }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-gray-500 mb-1">{label}</p>
        <p className="text-2xl font-semibold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-primary mt-1">{sub}</p>}
      </div>
      {icon && <span className="text-2xl">{icon}</span>}
    </div>
  </div>
);
