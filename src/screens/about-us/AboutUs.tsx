import { CenterLayout } from '@/components/CenterLayout'
import { Heading } from '@/components/custom-ui/Heading'
import { SubHeading } from '@/components/custom-ui/SubHeading'

export function AboutUs() {
	return (
		<CenterLayout>
			<div className='xs:w-11/12 mx-auto w-4/12'>
				<Heading>About us</Heading>
				<SubHeading>
					We are a team of aviation enthusiasts dedicated to providing real-time
					flight tracking information. Our mission is to make flight data
					accessible and engaging for everyone, from casual observers to
					industry professionals.
				</SubHeading>
			</div>
		</CenterLayout>
	)
}
