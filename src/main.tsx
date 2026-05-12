import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { MathJaxContext } from 'better-react-mathjax'
import './index.css'
import App from './App.tsx'

// Конфиг MathJax: распознавать формулы внутри $...$, \(...\) и \[...\]
const mathJaxConfig = {
  loader: { load: ['[tex]/ams'] },
  tex: {
    inlineMath: [
      ['$', '$'],
      ['\\(', '\\)'],
    ],
    displayMath: [
      ['$$', '$$'],
      ['\\[', '\\]'],
    ],
    packages: { '[+]': ['ams'] },
  },
  options: {
    enableMenu: false, // отключаем правую кнопку мыши с меню MathJax
  },
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MathJaxContext config={mathJaxConfig} version={3}>
      <App />
    </MathJaxContext>
  </StrictMode>,
)