'use server'

import { db, auth } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function startConversation(itemId: string, ownerId: string, itemType: 'need' | 'give') {
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

    const currentUserId = decodedClaims.uid

    if (currentUserId === ownerId) {
        // Cannot start conversation with self
        return
    }

    // Check for existing conversation
    // Note: Firestore queries are limited. For MVP, we might query all conversations for user and filter in code, 
    // or create a composite key ID like `minId_maxId_itemId` to enforce uniqueness easily.
    // Let's use the composite key approach for simplicity and efficiency.

    const participants = [currentUserId, ownerId].sort()
    const conversationId = `${participants[0]}_${participants[1]}_${itemId}`

    const conversationRef = db.collection('conversations').doc(conversationId)
    const conversationDoc = await conversationRef.get()

    if (!conversationDoc.exists) {
        // Create new conversation
        // We need to fetch item details to store in the conversation for easy access
        const itemCollection = itemType === 'need' ? 'needs' : 'gives'
        const itemDoc = await db.collection(itemCollection).doc(itemId).get()
        const itemData = itemDoc.data()

        await conversationRef.set({
            participants: [currentUserId, ownerId],
            item_id: itemId,
            item_type: itemType,
            item_title: itemData?.content || itemData?.title || 'Unknown Item',
            last_message: '',
            last_message_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
    }

    redirect(`/conversations/${conversationId}`)
}
