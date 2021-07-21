it('test', () => {
    cy.importJSONMapping('cypress/fixtures/dashboard/data/mappings.json.txt')
    cy.importJSONMapping('cypress/fixtures/dashboard/opensearch_dashboards/mappings.json.txt')
    cy.wait(5000)
    cy.importJSONDoc('cypress/fixtures/dashboard/data/tempdata.json.txt')
    cy.importJSONDoc('cypress/fixtures/dashboard/opensearch_dashboards/data.json.txt')
    cy.wait(5000)
    cy.clearJSONMapping('cypress/fixtures/dashboard/data/mappings.json.txt')
    cy.clearJSONMapping('cypress/fixtures/dashboard/opensearch_dashboards/mappings.json.txt')

})
