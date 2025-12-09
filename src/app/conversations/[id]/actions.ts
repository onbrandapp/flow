'use server'

import { db, auth } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function sendMessage(conversationId: string, formData: FormData) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
        throw new Error('Unauthorized')
    }

    let decodedClaims;
    try {
        decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        throw new Error('Unauthorized')
    }

    const content = formData.get('content') as string
    if (!content) return

    try {
        const batch = db.batch()

        // 1. Add message to sub-collection
        const messageRef = db.collection('conversations').doc(conversationId).collection('messages').doc()
        batch.set(messageRef, {
            content,
            sender_id: decodedClaims.uid,
            created_at: new Date().toISOString()
        })

        // 2. Update conversation last_message
        const conversationRef = db.collection('conversations').doc(conversationId)
        batch.update(conversationRef, {
            last_message: content,
            last_message_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })

        await batch.commit()

    } catch (error) {
        console.error('Error sending message:', error)
        throw new Error('Failed to send message')
    }

    revalidatePath(`/conversations/${conversationId}`)
}
