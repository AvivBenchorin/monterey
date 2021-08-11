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
        cy.request({ method: 'PUT', url: `${hostname}:${port}/${index}`, body: body, failOnStatusCode: false }).then((response) => {

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
    cy.wrap(strSplit).each((element) => {
      const json = JSON.parse(element)
      if (json.type === 'index') {
        const index = json.value.index
        cy.request({ method: 'DELETE', url: `${hostname}:${port}/${index}`, failOnStatusCode: false }).then((response) => {
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
    const bulkLines = [[]]
    str.split('\n\n').forEach((element) => {
      const json = JSON.parse(element)

      const id = json.value.id
      const index = json.value.index
      const source = json.value.source

      const body = { index: { _id: id, _index: index } }
      const oneLineBody = JSON.stringify(body).replace('\n', '')
      const oneLineSource = JSON.stringify(source).replace('\n', '')
      const oneLineDoc = `${oneLineBody}\n${oneLineSource}`
      bulkLines[0].push(oneLineDoc)

      line++
      if (line % bulkMax === 0) {
        cy.request({ headers: { 'Content-Type': 'application/json' }, method: 'POST', url: `${hostname}:${port}/_bulk`, body: `${bulkLines.pop().join('\n')}\n`, failOnStatusCode: false, timeout: 30000 }).then((response) => {
          expect(response.status).to.eq(200)
        })
        bucket++
        bulkLines.push([])
      }
    })
    if (bulkLines.length > 0) {
      cy.request({ headers: { 'Content-Type': 'application/json' }, method: 'POST', url: `${hostname}:${port}/_bulk`, body: `${bulkLines.pop().join('\n')}\n`, failOnStatusCode: false, timeout: 30000 }).then((response) => {
        expect(response.status).to.eq(200)
      })
    }
    cy.request({ method: 'POST', url: `${hostname}:${port}/_all/_refresh`, failOnStatusCode: false }).then((response) => {
      expect(response.status).to.eq(200)
    })
  })
})
