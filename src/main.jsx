/*
 * @description: 
 * @author: pengrenchang
 * @Date: 2024-08-14 10:30:14
 * @LastEditors: pengrenchang
 * @LastEditTime: 2024-08-14 17:23:00
 */
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// import App from "./test/index";
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
