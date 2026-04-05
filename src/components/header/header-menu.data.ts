import { PAGES } from '@/config/pages.config'

export interface IHeaderMenuItem {
	label: string
	href: string
}

export const headerMenuData = [
	{
		label: 'Home',
		href: PAGES.HOME
	},
	{
		label: 'About',
		href: PAGES.ABOUT
	},
	{
		label: 'Contacts',
		href: PAGES.CONTACTS
	}
]
