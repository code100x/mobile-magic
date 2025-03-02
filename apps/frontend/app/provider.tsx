'use client';
import { ReactNode } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { ClerkProvider } from '@clerk/nextjs'
import { dark } from '@clerk/themes'

export const Providers = ({ children }: { children: ReactNode }) => {
    return (
        <ClerkProvider
            appearance={{
                baseTheme: dark,
            }}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                {children}
            </ThemeProvider>
        </ClerkProvider>
    );
};