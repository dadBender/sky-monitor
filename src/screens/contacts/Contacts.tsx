import { CenterLayout } from '@/components/CenterLayout'
import { Heading } from '@/components/custom-ui/Heading'
import { SubHeading } from '@/components/custom-ui/SubHeading'

export function Contacts() {
	return (
		<CenterLayout>
			<div className='xs:w-11/12 mx-auto w-4/12'>
				<Heading>Contacts</Heading>
				<SubHeading>
					For any inquiries, support, or feedback, please reach out to us at
					<a href='mailto:test@test.ru'>test@test.ru</a> or call us at (123)
					456-7890. We look forward to hearing from you!
				</SubHeading>
			</div>
		</CenterLayout>
	)
}
