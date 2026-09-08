import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata:Metadata={title:'e-Keberadaan',description:'Kad perakam waktu digital SMK Bandar Baru Sungai Lalang',appleWebApp:{capable:true,statusBarStyle:'default',title:'e-Keberadaan'}};
export const viewport:Viewport={themeColor:'#0b6b3a',width:'device-width',initialScale:1,viewportFit:'cover'};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="ms"><body>{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker'in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}}/></body></html>}
