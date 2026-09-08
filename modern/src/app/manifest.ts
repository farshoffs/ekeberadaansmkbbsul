import type { MetadataRoute } from 'next';
export default function manifest():MetadataRoute.Manifest{return{name:'e-Keberadaan SMK BBSL',short_name:'e-Keberadaan',description:'Kad perakam waktu dan keberadaan staf',start_url:'/app',display:'standalone',background_color:'#f4f7f5',theme_color:'#0b6b3a',icons:[{src:'/icon.svg',sizes:'any',type:'image/svg+xml'}]}}
