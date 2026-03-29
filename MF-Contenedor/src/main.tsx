import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {NextUIProvider} from "@nextui-org/react";
import Contenedor from './pages/Contenedor.pages';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <Contenedor />
    </NextUIProvider>
  </StrictMode>,
)