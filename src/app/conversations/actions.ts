'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function startConversation(itemId: string, itemType: 'need' | 'give', ownerId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    if (user.id === ownerId) {
        // Can't start conversation with yourself
        return
    }

    // Check if conversation already exists
    const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('item_id', itemId)
        .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
        .or(`participant1_id.eq.${ownerId},participant2_id.eq.${ownerId}`)
        .single()

    if (existingConv) {
        redirect(`/conversations/${existingConv.id}`)
    }

    // Create new conversation
    const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({
            item_id: itemId,
            item_type: itemType,
            participant1_id: user.id,
            participant2_id: ownerId
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating conversation:', error)
        throw new Error('Failed to create conversation')
    }

    redirect(`/conversations/${newConv.id}`)
}
