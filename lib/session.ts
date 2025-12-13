import { cookies } from 'next/headers';

export async function getSessionId() {
  const cookieStore =  await cookies();
  const sessionCookie = cookieStore.get('spk_session');

  if (sessionCookie) {
    return sessionCookie.value;
  }
  return  null;
}