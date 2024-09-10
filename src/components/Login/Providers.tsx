'use client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { toast } from 'sonner'
import Loading from '@/components/Loading'

export default function Providers() {
	const [isLoading, setIsLoading] = useState(false)

	const handleGitHub = async () => {
		setIsLoading(true)
		try {
			await signIn('github', { callbackUrl: '/' })
		} catch (error) {
			toast.error(`GitHub sign-in failed: ${error}`, {
				position: 'bottom-center',
			})
		} finally {
			setIsLoading(false)
		}
	}

	const handleDiscord = async () => {
		setIsLoading(true)
		try {
			await signIn('discord', { callbackUrl: '/' })
		} catch (error) {
			toast.error(`Discord sign-in failed: ${error}`, {
				position: 'bottom-center',
			})
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="dark:bg-primary-black bg-primary-white px-2 text-muted-foreground">
						Or continue with
					</span>
				</div>
			</div>
			<div className="flex gap-4">
				<Button
					variant="outline"
					className="flex gap-2 w-full"
					onClick={handleGitHub}
					disabled={isLoading}
				>
					{isLoading ? (
						<Loading size={16} />
					) : (
						<Image
							src={'/github.svg'}
							alt="GitHub"
							width={20}
							height={20}
							className="size-5 p-[1px] dark:invert"
						/>
					)}
					GitHub
				</Button>
				<Button
					variant="outline"
					className="flex gap-2 w-full"
					onClick={handleDiscord}
					disabled={isLoading}
				>
					{isLoading ? (
						<Loading size={16} />
					) : (
						<Image
							src={'/discord.svg'}
							alt="Discord"
							width={20}
							height={20}
							className="size-5"
						/>
					)}
					Discord
				</Button>
			</div>
		</>
	)
}