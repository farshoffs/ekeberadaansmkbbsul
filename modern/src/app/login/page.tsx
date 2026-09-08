import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/security';
import LoginClient from '@/components/LoginClient';
export default async function Login(){if(await currentSession())redirect('/app');return <LoginClient/>}
