import { SidebarTrigger } from './ui/sidebar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'motion/react'
import { itemVariants } from '@/lib/animation-variants'
import { ExportOptions } from './ExportOptions'

export const Header = ({ children, className, onClick, repoUrl }: {
	children?: React.ReactNode,
	className?: string,
	onClick?: () => void,
	repoUrl?: string
}) => {
	return (
		<motion.header variants={itemVariants} className="flex items-center gap-2 bg-zinc-100 border dark:border-zinc-800 dark:hover:bg-zinc-600/10 dark:bg-zinc-900 px-4 py-2 rounded-3xl">
			<SidebarTrigger
				variant="link"
				className="[&_svg:not([class*='size-'])]:size-5 cursor-pointer"
			/>
			<Link href="/">
			   <Image src="/logo.svg" alt="logo" width={25} height={25} />
			</Link>
			<div className="flex-1" />
			<ExportOptions repoUrl={repoUrl} />
			{children && <Button
				variant="link"
				data-sidebar="trigger"
				data-slot="sidebar-trigger"
				size="icon"
				className={cn("h-7 w-7 [&_svg:not([class*='size-'])]:size-5 cursor-pointer", className)}
				onClick={onClick}
			>
				{children}
			</Button>}
		</motion.header>
	)
}
