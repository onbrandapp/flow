'use server'

import { cookies } from 'next/headers'
import { auth } from '@/lib/firebase/admin'
import { redirect } from 'next/navigation'

export async function createSession(idToken: string) {
    // 5 days expiration
    const expiresIn = 60 * 60 * 24 * 5 * 1000

    try {
        if (!auth) {
            throw new Error('Firebase Admin not initialized')
        }

        const sessionCookie = await auth.createSessionCookie(idToken, { expiresIn })

        const cookieStore = await cookies()
        cookieStore.set('session', sessionCookie, {
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            sameSite: 'lax',
        })
    } catch (error) {
        console.error('Failed to create session cookie', error)
        throw new Error('Authentication failed')
    }

    redirect('/feed')
}

export async function signOut() {
    const cookieStore = await cookies()
    cookieStore.delete('session')
    redirect('/login')
}
