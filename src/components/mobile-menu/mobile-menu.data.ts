import type { ComponentType } from 'react'

import { BadgeCheckIcon } from '../animate-ui/icons/badge-check'
import type { IconProps } from '../animate-ui/icons/icon'
import { LayoutDashboardIcon } from '../animate-ui/icons/layout-dashboard'
import { MessageCircleHeartIcon } from '../animate-ui/icons/message-circle-heart'
import { MoonIcon } from '../animate-ui/icons/moon'
import { StarIcon } from '../animate-ui/icons/star'
import { headerMenuData } from '../header/header-menu.data'

import { PAGES } from '@/config/pages.config'

export interface IMobileMenuItem {
	icon: ComponentType<IconProps<never>>
	label: string
	href: string
}

export const mobileMenuData: IMobileMenuItem[] = [
	{
		...headerMenuData[1],
		icon: BadgeCheckIcon
	},
	{
		label: 'Toggle Theme',
		href: '#',
		icon: MoonIcon
	},
	{
		...headerMenuData[0],
		icon: LayoutDashboardIcon
	},
	{
		label: 'Favorites',
		href: PAGES.FAVORITES,
		icon: StarIcon
	},

	{
		...headerMenuData[2],
		icon: MessageCircleHeartIcon
	}
]
