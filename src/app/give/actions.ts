'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function submitGive(formData: FormData) {
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File

    if (!imageFile || imageFile.size === 0) {
        throw new Error('Image is required')
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return redirect('/login')
    }

    // 1. Upload Image
    const fileExt = imageFile.name.split('.').pop()
    const fileName = `${user.id}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('item-images')
        .upload(fileName, imageFile)

    if (uploadError) {
        console.error('Upload error:', uploadError)
        throw new Error('Failed to upload image')
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
        .from('item-images')
        .getPublicUrl(fileName)

    // 3. Insert Record
    const { error: insertError } = await supabase.from('gives').insert({
        title,
        description,
        image_url: publicUrl,
        user_id: user.id,
        status: 'available',
    })

    if (insertError) {
        console.error('Insert error:', insertError)
        throw new Error('Failed to save item')
    }

    redirect('/give/success')
}
