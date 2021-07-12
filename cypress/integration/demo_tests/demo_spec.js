// Demo OpenSearch-Dashboards Test
// Note: Getting ResizeObserver loop limit exceeded errors!
//    Added code from https://github.com/quasarframework/quasar/issues/2233#issuecomment-678115434
//    to support/index.js to prevent from failing tests with the error.

describe('opening OpenSearch-Dashboards', () => {
    // Setup the dashboard to start at the home page
    before(() => {
        cy.visit('/')
        cy.request('/api/saved_objects/_find?fields=title&per_page=1&search=*&search_fields=title&type=index-pattern').then((response) => {
            if (response.body.total === 0) {
                cy.log('Reached welcome page')

                // Click the "Add sample data" button
                cy.get('[class="euiButton euiButton--primary homWelcome__footerAction euiButton--fill"]', { timeout: 15000 }).click()

                // View the "Sample eCommerce orders" data
                cy.get('[data-test-subj="addSampleDataSetecommerce"]', { timeout: 15000 }).click()
                cy.get('[data-test-subj="launchSampleDataSetecommerce"]').should('contain', 'View data')
            }
        })
    })

    // Return to the home page before every test, and ensure page has loaded
    beforeEach(() => {
        cy.visit('/app/home').then(() => {
            cy.get('[data-test-subj="breadcrumb first last"]', { timeout: 20000 }).should('contain', 'Home')
        })
    })

    it('Exploring data in the Discover page', () => {
        cy.get('[data-test-subj="toggleNavButton"]').click()

        // Click the Discover button in the Nav menu
        cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Discover').click()

        // Ensure that the page is a "blank slate" (clear previous searches, refresh to get rid of old errors)
        cy.get('[data-test-subj="breadcrumbs"]').should('contain', 'Discover')
        cy.get('[data-test-subj="queryInput"]').clear()
        cy.get('[data-test-subj="querySubmitButton"]').click()

        // Open time quick select tab
        cy.get('[data-test-subj="superDatePickerToggleQuickMenuButton"]').click()

        // Select the time range
        cy.get('[aria-label="Time tense"]').select('Last').should('have.value', 'last')
        cy.get('[aria-label="Time value"]').clear().type('{selectall}7')
        cy.get('[aria-label="Time unit"]').select('days').should('have.value', 'd')
        cy.contains('Apply').click()

        // Submit a search query
        cy.get('[data-test-subj="queryInput"]').type("products.taxless_price >= 60 AND category : Women's Clothing")
        cy.get('[data-test-subj="querySubmitButton"]').click()

        // Select the "category" field
        /**
         * Issue: want to be able to "hover" over the category list element,
         * mouseover/mouseenter did not work (https://docs.cypress.io/api/commands/hover)
        **/
        cy.get('[data-attr-field="category"]').click()
        cy.get('[data-test-subj="fieldToggle-category"]').click()
    })
})
