'use server'

import { db } from '@/lib/firebase/admin'
import { getStorage } from 'firebase-admin/storage'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import { auth } from '@/lib/firebase/admin'
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function submitGive(formData: FormData) {
    const cookieStore = await cookies()
    const sessionCookie = cookieStore.get('session')?.value

    if (!sessionCookie) {
        redirect('/login')
    }

    // Verify session
    let decodedClaims;
    try {
        decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    } catch (error) {
        redirect('/login')
    }

    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const imageFile = formData.get('image') as File

    if (!title || !imageFile) {
        return
    }

    let imageUrl = ''
    let inventory: { name: string, status: 'available' | 'taken' }[] = []

    try {
        const buffer = Buffer.from(await imageFile.arrayBuffer())

        // 1. Upload image to Firebase Storage
        const bucket = getStorage().bucket(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET)
        const filename = `${decodedClaims.uid}/${Date.now()}-${imageFile.name}`
        const file = bucket.file(filename)

        await file.save(buffer, {
            contentType: imageFile.type,
            public: true, // Make public for MVP simplicity
        })

        imageUrl = file.publicUrl()

        // 2. Analyze image with Gemini AI
        if (process.env.GOOGLE_GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

                const prompt = "Look at this image and list the distinct items visible in it. Return ONLY a simple comma-separated list of item names. Example: 'Jacket, Scarf, Gloves'. Do not include markdown or explanations.";

                const imagePart = {
                    inlineData: {
                        data: buffer.toString("base64"),
                        mimeType: imageFile.type,
                    },
                };

                const result = await model.generateContent([prompt, imagePart]);
                const response = await result.response;
                const text = response.text();

                // Clean up and parse the list
                inventory = text.split(',')
                    .map(item => item.trim())
                    .filter(item => item.length > 0)
                    .slice(0, 5) // Limit to top 5 items to keep UI clean
                    .map(name => ({ name, status: 'available' }));

                console.log("Gemini extracted inventory:", inventory);
            } catch (aiError) {
                console.error("Gemini analysis failed (non-blocking):", aiError);
                // We continue even if AI fails
            }
        }

        // 3. Save to Firestore
        await db.collection('gives').add({
            title,
            description,
            image_url: imageUrl,
            inventory, // Save the extracted list in new format
            user_id: decodedClaims.uid,
            status: 'available',
            created_at: new Date().toISOString(),
            user_profile: {
                full_name: decodedClaims.name || 'Anonymous',
                avatar_url: decodedClaims.picture || '',
                id: decodedClaims.uid
            }
        })

    } catch (error: any) {
        console.error('Error submitting give:', error)
        throw new Error(`Failed to submit give: ${error.message}`)
    }

    revalidatePath('/feed')
    redirect('/give/success')
}
