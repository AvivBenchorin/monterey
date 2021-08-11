/**
 * Add saved Dashboard panels
 * @param {String} keyword Search term for panels of interest
 * @param {String} type Panel type to search for
 * @param {Boolean} multiplePages Whether there are multiple pages to iterate through
 */

Cypress.Commands.add('addDashboardPanels', (keyword, type, multiplePages = true) => {
  const replaceSpacesWithDashes = (keyword) => {
    return keyword.replace(/\s+/g, '-')
  }

  const iteratePages = () => {
    cy.get('[data-test-subj="pagination-button-next"]').then(($nextBtn) => {
      cy.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')
      if ($nextBtn.is(':enabled')) {
        cy.wrap($nextBtn).click()
        cy.get(`[data-test-subj^="savedObjectTitle${replaceSpacesWithDashes(keyword)}"]`).should('be.visible').each(($button) => {
          cy.wrap($button).click()
          cy.get('[data-test-subj="toastCloseButton"').click({ multiple: true, force: true })
        })
        iteratePages()
      }
    })
  }
  cy.get('[data-test-subj="dashboardAddPanelButton"]').should('be.visible').click()
  cy.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')

  cy.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()
  cy.get(`[data-test-subj="savedObjectFinderFilter-${type}"]`).should('be.visible').click()
  cy.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()

  cy.get('[data-test-subj="savedObjectFinderSearchInput"]').should('be.visible').type(keyword)

  cy.get(`[data-test-subj^="savedObjectTitle${replaceSpacesWithDashes(keyword)}"]`).should('be.visible').each(($button) => {
    cy.wrap($button).click()
    cy.get('[data-test-subj="toastCloseButton"').click({ multiple: true, force: true })
  }).then(() => {
    if (multiplePages) {
      cy.wrap(iteratePages())
    }
  })
  cy.get('[data-test-subj="euiFlyoutCloseButton"]').click()
})

/**
 * Save a dashboard visualization
 * @param {String} title Field value to select
 * @param {Boolean} saveAsNew Whether to save as new visualization
 * @param {Boolean} returnToDashboard Whether to return to the home dashboard
 */

Cypress.Commands.add('saveDashboardVisualization', (title, saveAsNew = false, returnToDashboard = false) => {
  cy.get('[data-test-subj="visualizeSaveButton"]').click()
  cy.get('[data-test-subj="savedObjectTitle"]').type(`{selectall}${title}`)
  cy.get('[data-test-subj="saveAsNewCheckbox"]').then(($checkbox) => {
    if (saveAsNew === false) {
      cy.get($checkbox).click()
    }
  })
  cy.get('[data-test-subj="returnToOriginModeSwitch"]').then(($checkbox) => {
    if (returnToDashboard === false) {
      cy.get($checkbox).click()
    }
  })
  cy.get('[data-test-subj="confirmSaveSavedObjectButton"]').click()
})
