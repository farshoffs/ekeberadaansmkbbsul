import { redirect } from 'next/navigation';
import { currentSession } from '@/lib/security';
import AppClient from '@/components/AppClient';
export default async function AppPage(){if(!(await currentSession()))redirect('/login');return <AppClient/>}
