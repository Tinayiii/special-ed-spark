
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext.tsx'
import { SidebarProvider } from './contexts/SidebarContext.tsx'

createRoot(document.getElementById("root")!).render(
    <AuthProvider>
        <SidebarProvider>
            <App />
        </SidebarProvider>
    </AuthProvider>
);
