import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import ModalE from './components/Ejemplo';
import {NextUIProvider} from "@nextui-org/react";

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <ModalE />
    </NextUIProvider>
  </StrictMode>,
)