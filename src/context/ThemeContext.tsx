import { createContext, useContext, useEffect, useState} from 'react';
import type { ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({
    theme: 'light',
    toggleTheme: () => {},
})

export const ThemeProvider = ({children} : {children: ReactNode}) => {
    const [theme, setTheme] = useState<Theme>(()=>{
        const stored = localStorage.getItem('mpn_theme') as Theme | null
        if (stored) return stored
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark'
        return 'light'
    });

    useEffect(() => {
        const root = document.documentElement
        if(theme === 'dark') {
            root.classList.add('dark')
        } else {
            root.classList.remove('dark')
        }

        localStorage.setItem('mpn_theme', theme)
    }, [theme])

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light')
    }

    return (
        <ThemeContext.Provider value = {{theme, toggleTheme}}>
            {children}
        </ThemeContext.Provider>
    )
}

export const useTheme = () => useContext(ThemeContext)