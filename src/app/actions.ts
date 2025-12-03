'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitNeed(formData: FormData) {
    const content = formData.get('content') as string
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // For MVP, we might want to allow anonymous posting or force login.
        // Plan said "Profile creation", so let's assume we need auth.
        // But for "Universal Input" friction reduction, maybe we redirect to login *after* typing?
        // Let's keep it simple: if not logged in, redirect to login.
        return redirect('/login')
    }

    const isAnonymous = formData.get('is_anonymous') === 'on'

    const { error } = await supabase.from('needs').insert({
        content,
        user_id: user.id,
        status: 'open',
        urgency: 'normal', // Default for now, AI can update this later
        is_anonymous: isAnonymous,
    })

    if (error) {
        console.error('Error submitting need:', error)
        throw new Error('Failed to submit need')
    }

    redirect('/need/success')
}
