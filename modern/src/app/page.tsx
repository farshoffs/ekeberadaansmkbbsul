import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/security';
export default async function Home(){redirect((await currentSession())?'/app':'/login')}
