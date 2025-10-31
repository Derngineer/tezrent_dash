// Util Imports
import { menuClasses, verticalNavClasses } from '@menu/utils/menuClasses'

const navigationCustomStyles = theme => {
  return {
    color: 'var(--mui-palette-text-primary)',
    zIndex: 'var(--drawer-z-index) !important',
    [`& .${verticalNavClasses.bgColorContainer}`]: {
      backgroundColor: theme.palette.mode === 'dark' ? '#1a1d2e' : '#ffffff',
      borderRight: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'}`,
      boxShadow: theme.palette.mode === 'dark' 
        ? '2px 0 8px rgba(0, 0, 0, 0.3)' 
        : '2px 0 8px rgba(0, 0, 0, 0.05)'
    },
    [`& .${verticalNavClasses.header}`]: {
      paddingBlock: theme.spacing(5),
      paddingInline: theme.spacing(5.5, 4),
      borderBottom: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
      marginBottom: theme.spacing(2)
    },
    [`& .${verticalNavClasses.container}`]: {
      transition: 'width 0.3s ease, transform 0.3s ease',
      borderColor: 'transparent',
      [`& .${verticalNavClasses.toggled}`]: {
        boxShadow: theme.palette.mode === 'dark' 
          ? '0 0 20px rgba(0, 0, 0, 0.5)' 
          : '0 0 20px rgba(0, 0, 0, 0.1)'
      }
    },
    [`& .${menuClasses.root}`]: {
      paddingBlockEnd: theme.spacing(2),
      paddingInlineStart: theme.spacing(2),
      paddingInlineEnd: theme.spacing(2),
      [`& .${menuClasses.button}`]: {
        borderRadius: theme.spacing(2),
        marginBottom: theme.spacing(0.5),
        paddingInline: theme.spacing(2),
        transition: 'all 0.2s ease',
        '&:hover': {
          backgroundColor: theme.palette.mode === 'dark' 
            ? 'rgba(255, 255, 255, 0.06)' 
            : 'rgba(0, 0, 0, 0.04)',
          transform: 'translateX(4px)'
        },
        '&.active': {
          backgroundColor: theme.palette.primary.main,
          color: theme.palette.primary.contrastText,
          fontWeight: 600,
          '& i': {
            color: theme.palette.primary.contrastText
          }
        }
      },
      [`& .${menuClasses.icon}`]: {
        marginInlineEnd: theme.spacing(2),
        fontSize: '1.375rem'
      },
      [`& .${menuClasses.menuSectionContent}`]: {
        color: theme.palette.text.secondary,
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.4px',
        textTransform: 'uppercase',
        paddingInline: theme.spacing(2.5),
        paddingBlock: theme.spacing(2, 1),
        marginBlock: theme.spacing(1, 0.5)
      }
    },
    [`& .${verticalNavClasses.backdrop}`]: {
      backgroundColor: 'var(--backdrop-color)'
    }
  }
}

export default navigationCustomStyles
