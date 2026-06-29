'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

interface PaddleLoaderProps {
    token?: string // Make optional to handle loading states
    onReady?: () => void
}

declare global {
    interface Window {
        Paddle?: any
    }
}

export const PaddleLoader = ({ token, onReady }: PaddleLoaderProps) => {
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined' && window.Paddle && token && !initialized) {
            window.Paddle.Environment.set('sandbox')
            window.Paddle.Initialize({
                token: token,
                eventCallback: () => {},
            })
            setInitialized(true)
            onReady?.()
        }
    }, [token, onReady, initialized])

    if (!token) return null;

    return (
        <Script
            src="https://cdn.paddle.com/paddle/v2/paddle.js"
            strategy="afterInteractive"
            onLoad={() => {
                if (typeof window !== 'undefined' && window.Paddle && token && !initialized) {
                    window.Paddle.Environment.set('sandbox')
                    window.Paddle.Initialize({
                        token: token,
                    })
                    setInitialized(true)
                    onReady?.()
                }
            }}
        />
    )
}

export const usePaddle = () => {
    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        const checkPaddle = setInterval(() => {
            if (window.Paddle) {
                setIsReady(true)
                clearInterval(checkPaddle)
            }
        }, 100)

        return () => clearInterval(checkPaddle)
    }, [])

    return {
        Paddle: window.Paddle,
        isReady,
    }
}