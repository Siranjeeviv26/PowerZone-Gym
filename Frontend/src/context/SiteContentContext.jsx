import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const SiteContentContext = createContext({})

export function SiteContentProvider({ children }) {
  const [content, setContent] = useState({})

  useEffect(() => {
    api.get('/site-content').then(({ data }) => {
      if (data.content) setContent(data.content)
    }).catch(() => {})
  }, [])

  return (
    <SiteContentContext.Provider value={content}>
      {children}
    </SiteContentContext.Provider>
  )
}

export function useSiteContent(section) {
  const ctx = useContext(SiteContentContext)
  return ctx[section] || null
}
