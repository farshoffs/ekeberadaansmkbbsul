import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'e-Keberadaan',description:'Perakam Waktu Digital SMK Bandar Baru Sungai Lalang',manifest:'/manifest.webmanifest',appleWebApp:{capable:true,title:'e-Keberadaan',statusBarStyle:'default'}};
export default function RootLayout({children}:{children:React.ReactNode}){return<html lang="ms"><body>{children}<script dangerouslySetInnerHTML={{__html:`if('serviceWorker' in navigator){addEventListener('load',()=>navigator.serviceWorker.register('/sw.js').catch(()=>{}))}`}}/></body></html>}
