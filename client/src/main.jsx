import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from "@/components/theme-provider"
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { ClerkProvider } from '@clerk/react'
import store from './redux/store.js'
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <Provider store={store}>
       <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
           <ClerkProvider>  <App /></ClerkProvider>
                </ThemeProvider>
    
    </Provider>
    </BrowserRouter>
   
  </StrictMode>,
)
