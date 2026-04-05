function NavIcon({ name, className = '' }) {
  const baseClassName = `h-5 w-5 ${className}`.trim()

  const common = {
    className: baseClassName,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
  }

  switch (name) {
    case 'home':
      return (
        <svg {...common}>
          <path d="M3 10.75L12 3l9 7.75" />
          <path d="M5.5 9.75V21h13V9.75" />
          <path d="M10 21v-5.5h4V21" />
        </svg>
      )
    case 'upload':
      return (
        <svg {...common}>
          <path d="M12 16V6" />
          <path d="M8.5 9.5L12 6l3.5 3.5" />
          <path d="M4 15.5V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3.5" />
        </svg>
      )
    case 'insights':
      return (
        <svg {...common}>
          <path d="M4 19.5h16" />
          <rect x="6" y="11" width="2.75" height="6.5" rx="0.5" />
          <rect x="10.6" y="8.5" width="2.75" height="9" rx="0.5" />
          <rect x="15.2" y="6" width="2.75" height="11.5" rx="0.5" />
        </svg>
      )
    case 'credit':
      return (
        <svg {...common}>
          <path d="M4 5.5h16v13H4z" />
          <path d="M4 9.5h16" />
          <path d="M7.5 14h3" />
          <path d="M7.5 17h5.5" />
        </svg>
      )
    case 'safety':
      return (
        <svg {...common}>
          <path d="M12 3l7 3v5.5c0 4.6-2.8 8.7-7 10.5-4.2-1.8-7-5.9-7-10.5V6l7-3z" />
          <path d="M9 12.5l2 2 4-4" />
        </svg>
      )
    case 'history':
      return (
        <svg {...common}>
          <path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2h7a2 2 0 0 1 2 2V17a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2z" />
          <path d="M8.5 13h7" />
        </svg>
      )
    case 'loan':
      return (
        <svg {...common}>
          <path d="M3 9.5L12 4l9 5.5" />
          <path d="M4.5 9.5h15" />
          <path d="M6.5 9.5V18" />
          <path d="M10.5 9.5V18" />
          <path d="M13.5 9.5V18" />
          <path d="M17.5 9.5V18" />
          <path d="M3.5 18h17" />
        </svg>
      )
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      )
  }
}

export default NavIcon