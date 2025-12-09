'use server'

import { db, auth } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function submitNeed(formData: FormData) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
        redirect('/login')
    }

    let decodedClaims;
    try {
        decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        redirect('/login')
    }

    const content = formData.get('content') as string
    const urgency = formData.get('urgency') as string
    const isAnonymous = formData.get('is_anonymous') === 'on'

    if (!content) {
        return
    }

    try {
        await db.collection('needs').add({
            content,
            urgency: urgency || 'normal',
            is_anonymous: isAnonymous,
            user_id: decodedClaims.uid,
            status: 'open',
            created_at: new Date().toISOString(),
            user_profile: {
                full_name: decodedClaims.name || 'Anonymous',
                avatar_url: decodedClaims.picture || '',
                id: decodedClaims.uid
            }
        })
    } catch (error) {
        console.error('Error submitting need:', error)
        throw new Error('Failed to submit need')
    }

    revalidatePath('/feed')
    redirect('/need/success')
}
