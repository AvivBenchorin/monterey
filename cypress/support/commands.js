// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

/**
 * Sets the Dashboard page data range
 * @param {String} start Start datetime to set
 * @param {String} end  End datetime to set
 */
Cypress.Commands.add('setDashboardDataRange', (start, end) => {
  cy.get('[data-test-subj="superDatePickerShowDatesButton"]').should('be.visible').click()

  cy.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
  cy.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
  cy.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type('{selectall}' + start)
  cy.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
  cy.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('not.exist')

  cy.get('[data-test-subj="superDatePickerstartDatePopoverButton"]').should('be.visible').click()
  cy.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
  cy.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type('{selectall}' + end)
  cy.get('[data-test-subj="superDatePickerstartDatePopoverButton"]').should('be.visible').click()

  cy.get('[data-test-subj="querySubmitButton"]').should('be.visible').click()
})

/**
 * Add saved Dashboard panels
 * @param {String} keyword Search term for panels of interest
 * @param {String} type Panel type to search for
 * @param {Boolean} multiplePages Whether there are multiple pages to iterate through
 */
Cypress.Commands.add('addDashboardPanels', (keyword, type, multiplePages = true) => {
  const iteratePages = () => {
    cy.get('[data-test-subj="pagination-button-next"]').then(($nextBtn) => {
      cy.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')
      if ($nextBtn.is(':enabled')) {
        cy.wrap($nextBtn).click()
        cy.get('[data-test-subj^="savedObjectTitle' + keyword.replace(/\s+/g, '-') + '"]').should('be.visible').each(($button) => {
          cy.wrap($button).click()
        })
        iteratePages()
      }
    })
  }
  cy.get('[data-test-subj="dashboardAddPanelButton"]').should('be.visible').click()
  cy.get('[data-test-subj="savedObjectFinderItemList"]').should('be.visible')

  cy.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()
  cy.get('[data-test-subj="savedObjectFinderFilter-' + type + '"]').should('be.visible').click()
  cy.get('[data-test-subj="savedObjectFinderFilterButton"]').should('be.visible').click()

  cy.get('[data-test-subj="savedObjectFinderSearchInput"]').should('be.visible').type(keyword)

  cy.get('[data-test-subj^="savedObjectTitle' + keyword.replace(/\s+/g, '-') + '"]').should('be.visible').each(($button) => {
    cy.wrap($button).click()
  }).then(() => {
    if (multiplePages) {
      cy.wrap(iteratePages())
    }
  })
  cy.get('[data-test-subj="euiFlyoutCloseButton"]').click()
})

/**
 * Attempts to add a specified filter to a dashboard, retrying by reopening the filter window
 * @param {String} field Field value to select
 * @param {String} operator Operator value to select
 * @param {String} value Value field input
 */

Cypress.Commands.add('addDashboardFilterRetryFull', (field, operator, value = null) => {
  // Try and select the desire combo box option
  const selectComboBoxInput = (selector, keyword) => {
    cy.get('[data-test-subj="' + selector + '"]').find('[data-test-subj="comboBoxInput"]').trigger('focus').type('{selectall}{backspace}' + keyword)
    cy.get('[data-test-subj="comboBoxOptionsList ' + selector + '-optionsList"]').find('[title="' + keyword + '"]').trigger('click', { force: true })
  }

  // Attempt up to three times to select the desired field and operator options and input the value (if applicable) 
  const tryToAddFilter = (field, operator, value = null, retry = 0) => {
    cy.wait(3000)
    cy.get('[data-test-subj="addFilter"]').click({ scrollBehavior: 'center' }).then(() => {
      
      selectComboBoxInput('filterFieldSuggestionList', field)
      cy.get('[data-test-subj="filterFieldSuggestionList"]').then(($field) => {
        const cls = $field.attr('class')
        if (cls.includes('euiComboBox-isInvalid') && retry < 3) {
          cy.get('[data-test-subj="cancelSaveFilter"]').click()
          tryToAddFilter(field, operator, value, retry + 1)
        }
        else {
          selectComboBoxInput('filterOperatorList', operator)
          cy.get('[data-test-subj="filterOperatorList"]').then(($operator) => {
            const cls = $operator.attr('class')
            if (cls.includes('euiComboBox-isInvalid') && retry < 3) {
              cy.get('[data-test-subj="cancelSaveFilter"]').click()
              tryToAddFilter(field, operator, value, retry + 1)
            }
            else {
              if(value !== null) {
                cy.get('[data-test-subj="filterParams"]').find('input').type(value)
              }
              cy.get('[data-test-subj="saveFilter"]').click()
            }
          })
        }
      })
    })
  }
  tryToAddFilter(field, operator, value)
})

/**
 * Attempts to add a specified filter to a dashboard, retrying by reselecting the failed option
 * @param {String} field Field value to select
 * @param {String} operator Operator value to select
 * @param {String} value Value field input
 */

Cypress.Commands.add('addDashboardFilterRetrySelection', (field, operator, value = null) => {
  const selectComboBoxInput = (selector, keyword, retry = 0) => {
    cy.get('[data-test-subj="' + selector + '"]').find('[data-test-subj="comboBoxInput"]').trigger('focus').type('{selectall}{backspace}' + keyword)
    cy.get('[data-test-subj="comboBoxOptionsList ' + selector + '-optionsList"]').find('[title="' + keyword + '"]').trigger('click', { force: true })
    cy.get('[data-test-subj="' + selector + '"]').then(($box) => {
      const cls = $box.attr('class')
      if (cls.includes('euiComboBox-isInvalid') && retry < 3) {
        cy.wrap($box).find('[data-test-subj="comboBoxInput"]').type('{selectall}{backspace}')
        cy.wrap($box).find('[data-test-subj="comboBoxToggleListButton"]').click()
        selectComboBoxInput(selector, keyword, retry + 1)
      }
    })
  }

  cy.get('[data-test-subj="addFilter"]').click().then(() => {
    selectComboBoxInput('filterFieldSuggestionList', field)
    selectComboBoxInput('filterOperatorList', operator)
  })

  if(value != null) {  
    cy.get('[data-test-subj="filterParams"]').find('input').type(value)
  }
  cy.get('[data-test-subj="saveFilter"]').click()
})


/**
 * Save a dashboard visualization
 * @param {String} title Field value to select
 * @param {Boolean} saveAsNew Whether to save as new visualization
 * @param {Boolean} returnToDashboard Whether to return to the home dashboard
 */

Cypress.Commands.add('saveVisualization', (title, saveAsNew = false, returnToDashboard = false) => {
  cy.get('[data-test-subj="visualizeSaveButton"]').click()
  cy.get('[data-test-subj="savedObjectTitle"]').type('{selectall}' + title + '')
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

/**
 * Asserts that there exists a certain number of instances of an element
 * @param {String} selector Selector for element of interest
 * @param {Number} numElements Number of expected elements
 */

Cypress.Commands.add('checkElementExists', (selector, numElements) => {
  cy.get(selector).should('be.length', numElements)
})

/**
 * Asserts that a certain element does not exist
 * @param {String} selector Selector for element of interest
 */

Cypress.Commands.add('checkElementDoesNotExist', (selector) => {
  cy.get(selector).should('not.exist')
})

/**
 * Asserts that the components of a certain element does not exist
 * @param {String} mainSelector Selector for element of interest
 * @param {String} componentSelector Selector for subcomponent of interest
 */

Cypress.Commands.add('checkElementComponentDoesNotExist', (mainSelector, componentSelector) => {
  cy.get(mainSelector).find(componentSelector).should('not.exist')
})

/**
 * Asserts that each element of a given selector contains a certain value
 * @param {String} selector Selector for element of interest
 * @param {Number} numElements Number of expected elements to be returned
 * @param {String} value Regex value
 */

Cypress.Commands.add('checkElementContainsValue', (selector, numElements, value) => {
  cy.get(selector).should('be.length', numElements).each(($el) => {
    cy.get($el).contains(new RegExp('^' + value + '$'))
  })
})

/**
 * Asserts that each element of a given selector has components that contain a certain value
 * @param {String} mainSelector Selector for element of interest
 * @param {String} componentSelector Selector for subcomponent of interest
 * @param {Number} numElements Number of expected elements to be returned
 * @param {String} value Regex value
 */

Cypress.Commands.add('checkElementComponentContainsValue', (mainSelector, componentSelector, numElements, value) => {
  cy.get(mainSelector).should('be.length', numElements).each(($el) => {
    cy.get($el).find(componentSelector).contains(new RegExp('^' + value + '$'))
  })
})

/**
 * Asserts each value in an array of strings is contained within an element
 * @param {String} selector Selector for element of interest
 * @param {Array} values Array of string values
 */

 Cypress.Commands.add('checkValuesExistInComponent', (selector, value) => {
    cy.wrap(value).each((str) => {
      cy.get(selector).contains(new RegExp('^' + str + '$'))
    })
})
