'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function markItemComplete(itemId: string, itemType: 'need' | 'give') {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Unauthorized')
    }

    const table = itemType === 'need' ? 'needs' : 'gives'
    const status = itemType === 'need' ? 'fulfilled' : 'given'

    // Update the item status
    const { error } = await supabase
        .from(table)
        .update({ status: status })
        .eq('id', itemId)
        .eq('user_id', user.id) // Ensure ownership

    if (error) {
        console.error(`Error marking ${itemType} as complete:`, error)
        throw new Error(`Failed to mark ${itemType} as complete`)
    }

    revalidatePath('/feed')
}
