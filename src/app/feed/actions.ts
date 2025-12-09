'use server'

import { db, auth } from '@/lib/firebase/admin'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

export async function markItemComplete(itemId: string, itemType: 'need' | 'give') {
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

    const collection = itemType === 'need' ? 'needs' : 'gives'
    const status = itemType === 'need' ? 'fulfilled' : 'given'

    try {
        const docRef = db.collection(collection).doc(itemId)
        const doc = await docRef.get()

        if (!doc.exists) {
            throw new Error('Item not found')
        }

        if (doc.data()?.user_id !== decodedClaims.uid) {
            throw new Error('Unauthorized')
        }

        await docRef.update({ status: status })
    } catch (error) {
        console.error(`Error marking ${itemType} as complete:`, error)
        throw new Error(`Failed to mark ${itemType} as complete`)
    }

    revalidatePath('/feed')
}

export async function toggleItemStatus(giveId: string, itemIndex: number) {
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

    try {
        const docRef = db.collection('gives').doc(giveId)
        const doc = await docRef.get()

        if (!doc.exists) {
            throw new Error('Item not found')
        }

        if (doc.data()?.user_id !== decodedClaims.uid) {
            throw new Error('Unauthorized')
        }

        const currentInventory = doc.data()?.inventory || []
        if (itemIndex >= 0 && itemIndex < currentInventory.length) {
            const item = currentInventory[itemIndex]
            item.status = item.status === 'available' ? 'taken' : 'available'

            await docRef.update({ inventory: currentInventory })
        }
    } catch (error) {
        console.error('Error toggling item status:', error)
        throw new Error('Failed to toggle item status')
    }

    revalidatePath('/feed')
}

export async function addInventoryItem(giveId: string, itemName: string) {
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

    if (!itemName || itemName.trim().length === 0) {
        return
    }

    try {
        const docRef = db.collection('gives').doc(giveId)
        const doc = await docRef.get()

        if (!doc.exists) {
            throw new Error('Item not found')
        }

        if (doc.data()?.user_id !== decodedClaims.uid) {
            throw new Error('Unauthorized')
        }

        const currentInventory = doc.data()?.inventory || []
        const newItem = { name: itemName.trim(), status: 'available' }

        await docRef.update({ inventory: [...currentInventory, newItem] })
    } catch (error) {
        console.error('Error adding inventory item:', error)
        throw new Error('Failed to add inventory item')
    }

    revalidatePath('/feed')
}
