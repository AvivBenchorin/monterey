/**
 * Read indices from a file and send to OpenSearch using the create index API
 * @param {String} filename File path (with its root at the directory containing the cypress.json file)
 * @param {String} hostname Host name for OpenSearch
 * @param {String} port Port for OpenSearch
 */

Cypress.Commands.add('importJSONMapping', (filepath, hostname = 'localhost', port = '9200') => {
  const parseIndex = ({ index, settings, mappings, aliases }) => {
    return { index, body: { settings, mappings, aliases } }
  }

  cy.readFile(filepath, 'utf8').then((str) => {
    const strSplit = str.split('\n\n')
    strSplit.forEach((element) => {
      const json = JSON.parse(element)
      if (json.type === 'index') {
        const indexContent = parseIndex(json.value)
        cy.request({ method: 'PUT', url: `${hostname}:${port}/${indexContent.index}`, body: indexContent.body, failOnStatusCode: false }).then((response) => {

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
    strSplit.forEach((element) => {
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
  const parseDocument = ({ value: { id, index, source } }) => {
    const actionData = { index: { _id: id, _index: index } }
    const oneLineAction = JSON.stringify(actionData).replace('\n', '')
    const oneLineSource = JSON.stringify(source).replace('\n', '')
    const bulkOperation = `${oneLineAction}\n${oneLineSource}`
    return bulkOperation
  }

  const sendBulkAPIRequest = (bodyArray, hostname, port) => {
    cy.request({ headers: { 'Content-Type': 'application/json' }, method: 'POST', url: `${hostname}:${port}/_bulk`, body: `${bodyArray.join('\n')}\n`, timeout: 30000 }).then((response) => {

    })
  }

  cy.readFile(filename, 'utf8').then((str) => {
    let readJSONCount = 0
    const bulkLines = [[]]
    str.split('\n\n').forEach((element) => {
      bulkLines[0].push(parseDocument(JSON.parse(element)))

      readJSONCount++
      if (readJSONCount % bulkMax === 0) {
        sendBulkAPIRequest(bulkLines.pop(), hostname, port)
        bulkLines.push([])
      }
    })

    if (bulkLines.length > 0) {
      sendBulkAPIRequest(bulkLines.pop(), hostname, port)
    }

    cy.request({ method: 'POST', url: `${hostname}:${port}/_all/_refresh` }).then((response) => {

    })
  })
})
