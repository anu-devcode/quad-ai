function AppIcon({ name, className = '' }) {
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
    case 'moon':
      return (
        <svg {...common}>
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5z" />
        </svg>
      )
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2.5" />
          <path d="M12 19.5V22" />
          <path d="M2 12h2.5" />
          <path d="M19.5 12H22" />
          <path d="M4.9 4.9l1.8 1.8" />
          <path d="M17.3 17.3l1.8 1.8" />
          <path d="M19.1 4.9l-1.8 1.8" />
          <path d="M6.7 17.3l-1.8 1.8" />
        </svg>
      )
    case 'compass':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 6-6 2 2-6 6-2z" />
        </svg>
      )
    case 'card':
      return (
        <svg {...common}>
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 14h4" />
        </svg>
      )
    case 'inbox':
      return (
        <svg {...common}>
          <path d="M4 4h16v12H15l-3 3-3-3H4z" />
          <path d="M8 10h8" />
        </svg>
      )
    case 'users':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
          <circle cx="17.5" cy="9" r="2.5" />
        </svg>
      )
    case 'settings':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.3 1a7 7 0 0 0-1.7-1L14.5 3h-5l-.4 3a7 7 0 0 0-1.7 1l-2.3-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.3-1a7 7 0 0 0 1.7 1l.4 3h5l.4-3a7 7 0 0 0 1.7-1l2.3 1 2-3.5-2-1.5c.1-.3.1-.7.1-1z" />
        </svg>
      )
    case 'menu':
      return (
        <svg {...common}>
          <path d="M4 7h16" />
          <path d="M4 12h16" />
          <path d="M4 17h16" />
        </svg>
      )
    case 'close':
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
        </svg>
      )
    case 'logout':
      return (
        <svg {...common}>
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <path d="M16 17l5-5-5-5" />
          <path d="M21 12H9" />
        </svg>
      )
    case 'more':
      return (
        <svg {...common}>
          <circle cx="6" cy="12" r="1.4" />
          <circle cx="12" cy="12" r="1.4" />
          <circle cx="18" cy="12" r="1.4" />
        </svg>
      )
    case 'lock':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="2" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      )
    case 'ban':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M7.5 16.5l9-9" />
        </svg>
      )
    case 'warning':
      return (
        <svg {...common}>
          <path d="M12 3l9 16H3z" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      )
    case 'target':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'camera':
      return (
        <svg {...common}>
          <path d="M4 8h4l1.5-2h5L16 8h4v10H4z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      )
    case 'document':
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v14H7z" />
          <path d="M14 3v4h4" />
          <path d="M10 13h6" />
          <path d="M10 17h6" />
        </svg>
      )
    case 'message':
      return (
        <svg {...common}>
          <path d="M4 5h16v12H8l-4 4z" />
          <path d="M8 10h8" />
        </svg>
      )
    case 'pencil':
      return (
        <svg {...common}>
          <path d="M4 20l4.5-1 9-9-3.5-3.5-9 9z" />
          <path d="M13.5 6.5l3.5 3.5" />
        </svg>
      )
    case 'attachment':
      return (
        <svg {...common}>
          <path d="M8.5 12.5l5.6-5.6a3 3 0 1 1 4.2 4.2l-7.1 7.1a4.5 4.5 0 1 1-6.4-6.4l7.1-7.1" />
        </svg>
      )
    case 'search':
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="6" />
          <path d="M20 20l-4.2-4.2" />
        </svg>
      )
    case 'rocket':
      return (
        <svg {...common}>
          <path d="M14.5 4.5c-3 1-5.5 3.5-6.5 6.5l-1 3 3-1c3-1 5.5-3.5 6.5-6.5l1-3z" />
          <path d="M6 18l2-2" />
          <path d="M5 14l-2 2" />
          <path d="M10.5 10.5h.01" />
        </svg>
      )
    case 'play':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M10 8l6 4-6 4z" fill="currentColor" stroke="none" />
        </svg>
      )
    case 'bolt':
      return (
        <svg {...common}>
          <path d="M13 2L5 13h5l-1 9 8-11h-5z" />
        </svg>
      )
    case 'book':
      return (
        <svg {...common}>
          <path d="M5 4h7a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 3z" />
          <path d="M19 4h-7a3 3 0 0 0-3 3v13h7a3 3 0 0 1 3 3z" />
        </svg>
      )
    case 'package':
      return (
        <svg {...common}>
          <path d="M3 8l9-5 9 5-9 5z" />
          <path d="M3 8v8l9 5 9-5V8" />
          <path d="M12 13v8" />
        </svg>
      )
    case 'note':
      return (
        <svg {...common}>
          <path d="M7 3h10v18H7z" />
          <path d="M10 8h4" />
          <path d="M10 12h4" />
          <path d="M10 16h4" />
        </svg>
      )
    case 'institution':
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
    case 'money':
      return (
        <svg {...common}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6.5 9.5h.01" />
          <path d="M17.5 14.5h.01" />
        </svg>
      )
    case 'check':
      return (
        <svg {...common}>
          <path d="M4 12l5 5L20 6" />
        </svg>
      )
    case 'x':
      return (
        <svg {...common}>
          <path d="M6 6l12 12" />
          <path d="M18 6L6 18" />
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

export default AppIcon
