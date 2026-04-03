'use client'

import { useState } from "react"
import { signIn, signOut, signUp, useSession } from "@/lib/auth-client"

export default function Klijent() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const { data: session, isPending } = useSession()

    async function handleSignUp() {
        setLoading(true)
        const result = await signUp.email({
            name,
            email,
            password,
            callbackURL: '/'
        })

        if (result.error) {
            setMessage(`Error: ${result.error.message ?? 'Sign up failed'}`)
            setLoading(false)
            return
        }

        setMessage('Sign up successful!')
        setName('')
        setEmail('')
        setPassword('')
        setLoading(false)
    }

    async function handleSignIn() {
        setLoading(true)
        const result = await signIn.email({
            email,
            password,
            callbackURL: '/server-auth'
        })

        if (result.error) {
            setMessage(`Error: ${result.error.message ?? 'Sign in failed'}`)
            setLoading(false)
            return
        }

        setMessage('Sign in successful!')
        setEmail('')
        setPassword('')
        setLoading(false)
    }

    async function handleSignOut() {
        setLoading(true)
        await signOut()
        setMessage('Signed out')
        setLoading(false)
    }

    if (session?.user) {
        return (
            <div className="p-6 border rounded-lg max-w-md space-y-4">
                <p className="font-semibold text-lg">Logged in</p>
                <div className="space-y-2">
                    <p><strong>Email:</strong> {session.user.email}</p>
                    <p><strong>Name:</strong> {session.user.name}</p>
                </div>
                <button 
                    onClick={handleSignOut}
                    disabled={loading}
                    className="w-full bg-red-600 text-white rounded px-4 py-2 hover:bg-red-700 disabled:opacity-50"
                >
                    {loading ? 'Signing out...' : 'Sign out'}
                </button>
                {message && <p className="text-sm text-green-600">{message}</p>}
            </div>
        )
    }

    return (
        <div className="p-6 border rounded-lg max-w-md space-y-4">
            <p className="font-semibold text-lg">Sign up or Sign in</p>

            <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Name (for signup)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
            />
            <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />
            <input
                className="border rounded px-3 py-2 w-full"
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <div className="flex gap-2">
                <button 
                    onClick={handleSignUp}
                    disabled={loading}
                    className="flex-1 bg-blue-600 text-white rounded px-3 py-2 hover:bg-blue-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Sign up'}
                </button>
                <button 
                    onClick={handleSignIn}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white rounded px-3 py-2 hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Loading...' : 'Sign in'}
                </button>
            </div>

            {message && <p className="text-sm text-red-600">{message}</p>}
        </div>
    )
}