describe('Sky Track E2E - Flight selection flow', () => {
	it('main', () => {
		cy.visit('/')
		cy.get('.bg-flight-card').should('exist')

		const AIRLINE = 'KLM'

		cy.get('[data-testid="filter-by-airline"]').click()
		cy.contains(AIRLINE).click()

		cy.wait(2000)

		cy.get('.bg-flight-card').each($el => {
			cy.wrap($el).get(`img[alt=${AIRLINE}]`).should('exist')
		})

		cy.get('[data-testid="flight-card-0"').as('firstFlight')

		cy.get('@firstFlight').within(() => {
			cy.get('button').first().click({ force: true })
		})

		const flightId = cy
			.get('@firstFlight')
			.find('[data-testid="flight-id"]')
			.invoke('text')

		flightId.then(() => {
			cy.url().should('include', `?flight=`)
		})

		cy.get('aside').should('exist')

		cy.get('[data-testid="add-to-calendar-button"]').click()

		cy.contains('File added to downloads').should('be.visible')
	})
})
