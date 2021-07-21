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
        cy.get('[data-test-subj^="savedObjectTitle' + keyword.replace(/\s+/g, '-') + '"]').should('be.visible').click({ multiple: true })
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

  cy.get('[data-test-subj^="savedObjectTitle' + keyword.replace(/\s+/g, '-') + '"]').should('be.visible').click({ multiple: true }).then(() => {
    if (multiplePages) {
      iteratePages()
    }
  })
  cy.get('[data-test-subj="euiFlyoutCloseButton"]').click()
})

/**
 * Add a specified filter to a dashboard
 * @param {String} field Field value to select
 * @param {String} operator Operator value to select
 * @param {String} value Value field input
 */

Cypress.Commands.add('addDashboardFilter', (field, operator, value) => {
  cy.get('[data-test-subj="addFilter"]').click()

  cy.get('[data-test-subj="filterFieldSuggestionList"]').find('[data-test-subj="comboBoxInput"]').type(field)
  cy.get('[data-test-subj="comboBoxOptionsList filterFieldSuggestionList-optionsList"]').find('[title="' + field + '"]').click({ force: true })

  cy.get('[data-test-subj="filterOperatorList"]').find('[data-test-subj="comboBoxInput"]').type(operator)
  cy.get('[data-test-subj="comboBoxOptionsList filterOperatorList-optionsList"]').find('[title="' + operator + '"]').click({ force: true })

  cy.get('[data-test-subj="filterParams"]').find('input').type(value)
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
 * @param {RegExp} value Regex value
 */

Cypress.Commands.add('checkElementContainsValue', (selector, numElements, value) => {
  cy.get(selector).should('be.length', numElements).each(($el) => {
    cy.get($el).contains(value)
  })
})

/**
 * Asserts that each element of a given selector has components that contain a certain value
 * @param {String} mainSelector Selector for element of interest
 * @param {String} componentSelector Selector for subcomponent of interest
 * @param {Number} numElements Number of expected elements to be returned
 * @param {RegExp} value Regex value
 */

Cypress.Commands.add('checkElementComponentContainsValue', (selector, componentSelector, numElements, value) => {
  cy.get(selector).should('be.length', numElements).each(($el) => {
    cy.get($el).find(componentSelector).contains(value)
  })
})

/**
 * Read indices from a file and send to OpenSearch using the create index API
 * @param {String} filename File path (with its root at the directory containing the cypress.json file)
 * @param {String} hostname Host name for OpenSearch
 * @param {String} port Port for OpenSearch
 */

Cypress.Commands.add('importJSONMapping', (filepath, hostname = 'localhost', port = '9200') => {
  cy.readFile(filepath, 'utf8').then((str) => {
    const strSplit = str.split('\n\n')
    cy.wrap(strSplit).each((element) => {
      const json = JSON.parse(element)
      if (json.type === 'index') {
        const index = json.value.index
        const settings = json.value.settings
        const mappings = json.value.mappings
        const aliases = json.value.aliases
        const body = { settings, mappings, aliases }
        cy.request({ method: 'PUT', url: hostname + ':' + port + '/' + index, body: body, failOnStatusCode: false, log: true }).then((response) => {
        
        })
      }
    })
  })
})

/**
 * Read indices from a file and request for them to be deleted from OpenSearch using the delete index API
 * @param {String} filename File path (with its root at the directory containing the cypress.json file)
 * @param {String} hostname Host name for OpenSearch
 * @param {String} port Port for OpenSearch
 */

Cypress.Commands.add('clearJSONMapping', (filename, hostname = 'localhost', port = '9200') => {
  cy.readFile(filename, 'utf8').then((str) => {
    const strSplit = str.split('\n\n')
    cy.wrap(strSplit).each((element, i, array) => {
      const json = JSON.parse(element)
      if (json.type === 'index') {
        const index = json.value.index
        cy.request({ method: 'DELETE', url: hostname + ':' + port + '/' + index, failOnStatusCode: false, log: true }).then((response) => {
        })
      }
    })
  })
})

/**
 * Read docs from a file and import them to OpenSearch using the bulk API
 * @param {String} filename File path (with its root at the directory containing the cypress.json file)
 * @param {String} hostname Host name for OpenSearch
 * @param {String} port Port for OpenSearch
 */

Cypress.Commands.add('importJSONDoc', (filename, hostname = 'localhost', port = '9200', bulkMax = 1600) => {
  cy.readFile(filename, 'utf8').then((str) => {
    let line = 0
    let bucket = 0
    let bulkLines = [[]]
    str.split('\n\n').forEach((element) => {
      const json = JSON.parse(element)

      const id = json.value.id
      const index = json.value.index
      const source = json.value.source

      const body = { "index": {"_id": id, "_index": index }  }
      const oneLineBody = JSON.stringify(body).replace('\n', '')
      const oneLineSource = JSON.stringify(source).replace('\n', '')
      const oneLineDoc = oneLineBody + '\n' + oneLineSource
      bulkLines[0].push(oneLineDoc)
      
      line = line + 1
      if(line % bulkMax === 0) {
        console.log(bucket)
        console.log("Before response" + bucket)
        cy.request({ headers: {"Content-Type": "application/json"}, method: 'POST', url: hostname + ':' + port + '/_bulk', body: bulkLines.pop().join('\n') + '\n', failOnStatusCode: false, log: true, timeout: 30000 }).then((response) => {
          expect(response.status).to.eq(200)
        })
        bucket = bucket + 1
        bulkLines.push([])
      }
    })
    if(bulkLines.length > 0) {
      cy.request({ headers: {"Content-Type": "application/json"}, method: 'POST', url: hostname + ':' + port + '/_bulk', body: bulkLines.pop().join('\n') + '\n', failOnStatusCode: false, log: true, timeout: 30000 }).then((response) => {
        expect(response.status).to.eq(200)
      })
    }
    cy.request({ method: 'POST', url: hostname + ':' + port + '/_all/_refresh', failOnStatusCode: false, log: true }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})
