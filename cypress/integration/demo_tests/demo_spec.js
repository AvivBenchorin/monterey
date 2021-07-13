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
            cy.get('[data-test-subj="homeApp"]', { timeout: 20000 }).should('be.visible')
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

    it('Explore the data in the dashboard', () => {
        /**
         * Known issue: Comboboxes UI elements are behaving inconsistently,
         * can only sometimes successfully "click on" and select options.
        **/
        cy.get('[data-test-subj="toggleNavButton"]').click()
        // Click the Dashboards button in the Nav menu
        cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()

        // Check if automatically opening a dashboard or not
        cy.url().then((path) => {
            if (path.includes('/app/dashboards#/list')) {
                cy.get('[data-test-subj="dashboardListingTitleLink-[eCommerce]-Revenue-Dashboard"]').click()
            }
        })
        // Make sure the desired UI element is visible
        cy.get('[data-test-subj="inputControl0"]').should('be.visible')

        // Clear all existing filters in the dashboard
        cy.get('[data-test-subj="showFilterActions"]').click()
        cy.get('[data-test-subj="removeAllFilters"]').click()

        // Select "Gnomehouse"
        cy.get('[data-test-subj="listControlSelect0"]').find('[data-test-subj="comboBoxSearchInput"]').type('{selectall}Gnomehouse')
        cy.get('[class="euiFilterSelectItem"]').should('have.length', 2)
        cy.get('[data-test-subj="listControlSelect0"]').find('[data-test-subj="comboBoxInput"]').focus()
        cy.get('[title="Gnomehouse"]').click({ force: true })

        // Select "Women's Clothing"
        cy.get('[data-test-subj="listControlSelect1"]').find('[data-test-subj="comboBoxInput"]').type("{selectall}Women's Clothing")
        cy.get('[class="euiFilterSelectItem"]').should('have.length', 1)
        cy.get('[data-test-subj="listControlSelect1"]').find('[data-test-subj="comboBoxInput"]').focus()
        cy.contains('[data-test-subj="listControlSelect1"]', "Women's Clothing").click({ force: true })

        cy.get('[data-test-subj="inputControlSubmitBtn"]').click()

        cy.get('[data-test-subj="addFilter"]').click()

        // Click the "day_of_week" element
        cy.get('[data-test-subj="filterFieldSuggestionList"]').find('[data-test-subj="comboBoxInput"]').type('{selectall}day_of_week')
        cy.get('[class="euiFilterSelectItem"]').should('have.length', 2)
        cy.get('[data-test-subj="filterFieldSuggestionList"]').find('[data-test-subj="comboBoxInput"]').focus()
        cy.get('[title="day_of_week"]').click({ force: true })

        // Click the "is" operator
        cy.get('[data-test-subj="filterOperatorList"]').click()
        cy.get('[data-test-subj="filterOperatorList"]').find('[data-test-subj="comboBoxInput"]').type('{selectall}is')
        cy.get('[class="euiFilterSelectItem"]').should('have.length', 6)
        cy.get('[data-test-subj="filterOperatorList"]').find('[data-test-subj="comboBoxInput"]').focus()
        cy.get('[title="is"]').click({ force: true })

        // Select the "Wednesday" value
        cy.get('[data-test-subj="filterParamsComboBox phraseParamsComboxBox"]').click()
        cy.get('[data-test-subj="filterParamsComboBox phraseParamsComboxBox"]').find('[data-test-subj="comboBoxInput"]').type('{selectall}Wednesday')
        cy.get('[class="euiFilterSelectItem"]').should('have.length', 1)
        cy.get('[data-test-subj="filterParamsComboBox phraseParamsComboxBox"]').find('[data-test-subj="comboBoxInput"]').focus()
        cy.get('[title="Wednesday"]').click({ force: true })

        cy.get('[data-test-subj="saveFilter"]').click()
    })
})
