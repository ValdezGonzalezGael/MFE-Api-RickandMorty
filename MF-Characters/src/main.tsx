import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import {NextUIProvider} from "@nextui-org/react";
import RickAndMortyView from './components/RickAndMortyView.component';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <NextUIProvider>
      <RickAndMortyView />
    </NextUIProvider>
  </StrictMode>,
)