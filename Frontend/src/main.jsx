import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/index.js'
import App from './App.jsx'
import { SiteContentProvider } from './context/SiteContentContext.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <SiteContentProvider>
          <App />
        </SiteContentProvider>
      </ThemeProvider>
    </Provider>
  </React.StrictMode>,
)
