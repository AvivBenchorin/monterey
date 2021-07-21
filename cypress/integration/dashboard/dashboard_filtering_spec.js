/**
 * dashboard_filtering test suite description:
 * 1) Create a new dashboard, populate with visualizations
 * 2) Set a filter that excludes all data, and check the visualizations for proper updates
 * 3) Set the existing filter as pinned, re-check the visualizations
 * 4) Remove the filter, and check the visualizations for proper updates
 * 5) Create a new dashboard, and populate with a pie graph
 * 6) Perform apply different filters on the pie graph and check the visualization for proper updates
 * 7) Remove all filters and ensure the graph reverts to its original design
 * 8) Test adding another pie graph to the dashboard and applying a filter to both grpahs
 */

describe('dashboard filtering', () => {
  before(() => {
    // WORK IN PROGRESS: https://github.com/AvivBenchorin/monterey/issues/11
    cy.clearJSONMapping('cypress/fixtures/dashboard/data/mappings.json.txt')

    cy.importJSONMapping('cypress/fixtures/dashboard/opensearch_dashboards/mappings.json.txt')
    cy.importJSONMapping('cypress/fixtures/dashboard/data/mappings.json.txt')

    cy.importJSONDoc('cypress/fixtures/dashboard/opensearch_dashboards/data.json.txt')
    cy.importJSONDoc('cypress/fixtures/dashboard/data/data.json.txt')
  })

  after(() => {
    // WORK IN PROGRESS: https://github.com/AvivBenchorin/monterey/issues/11
    cy.clearJSONMapping('cypress/fixtures/dashboard/data/mappings.json.txt')
  })
  describe('stall tactics to try and speed up testing', () => {
    it('open the dashboards (and thats it)', () => {
      cy.visit('app/dashboards/list')
    })
  })
  describe('adding a filter that excludes all data', () => {
    before(() => {
      // Increase the viewport size to prevent pop-up notifications from blocking UI element
      // E.g. after adding a saved visualization, a notification appears in the bottom right
      // which could block clicking on a button located behind it.
      cy.viewport(1900, 1080)

      // Go to the Dashboards list page
      cy.visit('app/dashboards/list')

      // Click the "Create dashboard" button
      cy.get('[data-test-subj="newItemButton"]', { timeout: 20000 }).should('be.visible').click()
      cy.get('[data-test-subj="emptyDashboardWidget"]').should('be.visible')
      // Change the time to be between Jan 1 2018 and Apr 13, 2018
      cy.setDashboardDataRange('Apr 13, 2018 @ 00:00:00.000', 'Jan 1, 2018 @ 00:00:00.000')

      // Add all "Filter Bytes Test" visualizations
      cy.addDashboardPanels('Filter Bytes Test', 'visualization', true)

      // Click the "Add" button and add all "Saved Searches"
      cy.addDashboardPanels('Filter Bytes Test', 'search', false)

      // Add filter
      cy.addDashboardFilter('bytes', 'is', '12345678')

      cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').should('be.visible')
    })
    it('filters on pie charts', () => {
      // Check that none of the pie charts are occupied with data (show "No results found")
      cy.checkElementDoesNotExist('svg > g > g.arcs > path.slice')
    })

    it('area, bar and heatmap charts filtered', () => {
      // Check that none of the charts are filled with data
      cy.checkElementDoesNotExist('svg > g > g.series')
    })

    it('data tables are filtered', () => {
      // Check that none of the data tables are filled with data
      cy.checkElementDoesNotExist('[data-test-subj="paginated-table-body"] [data-cell-content]')
    })

    it('goal and guages are filtered', () => {
      // Goal label should be 0, gauge label should be 0%
      cy.checkElementContainsValue('svg > g > g > text.chart-label', 2, /^0%?$/)
    })

    it('tsvb time series shows no data message', () => {
      // The no data message should be visible
      cy.checkElementExists('[data-test-subj="noTSVBDataMessage"]', 1)
    })

    it('metric value shows no data', () => {
      // The metrics should show '-'
      cy.checkElementContainsValue('.mtrVis__value', 1, /^ - $/)
    })

    it('tag cloud values are filtered', () => {
      cy.checkElementComponentDoesNotExist('[data-test-subj="tagCloudVisualization"]', 'svg > g > text')
    })

    it('tsvb metric is filtered', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbMetricValue"]', 1, /^0 custom template$/)
    })

    it('tsvb top n is filtered', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, /^0$/)
    })

    it('saved search is filtered', () => {
      cy.checkElementDoesNotExist('[data-test-subj="docTableExpandToggleColumn"]')
    })

    // TODO: Uncomment once https://github.com/elastic/kibana/issues/22561 is fixed
    // it('timeline is filtered', async () => {
    //   await dashboardExpect.timelineLegendCount(0)
    // })

    it('vega is filtered', () => {
      cy.get('.vgaVis__view text').each(($el, index, $list) => {
        cy.get($el).should('not.contain', /^5,000$/)
      })
    })
  })

  describe('using a pinned filter that excludes all data', () => {
    before(() => {
      cy.viewport(1900, 1080)
      cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').click()
      cy.get('[data-test-subj="pinFilter"]').click()
    })

    after(() => {
      cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-pinned "]').click()
      cy.get('[data-test-subj="pinFilter"]').click()
    })

    it('filters on pie charts', () => {
      // Check that none of the pie charts are occupied with data (show "No results found")
      cy.checkElementDoesNotExist('svg > g > g.arcs > path.slice')
    })

    it('area, bar and heatmap charts filtered', () => {
      // Check that none of the charts are filled with data
      cy.checkElementDoesNotExist('svg > g > g.series')
    })

    it('data tables are filtered', () => {
      // Check that none of the data tables are filled with data
      cy.checkElementDoesNotExist('[data-test-subj="paginated-table-body"] [data-cell-content]')
    })

    it('goal and guages are filtered', () => {
      // Goal label should be 0, gauge label should be 0%
      cy.checkElementContainsValue('svg > g > g > text.chart-label', 2, /^0%?$/)
    })

    it('metric value shows no data', () => {
      // The metrics should show '-'
      cy.checkElementContainsValue('.mtrVis__value', 1, /^ - $/)
    })

    it('tag cloud values are filtered', () => {
      cy.checkElementComponentDoesNotExist('[data-test-subj="tagCloudVisualization"]', 'svg > g > text')
    })

    it('tsvb metric is filtered', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbMetricValue"]', 1, /^0 custom template$/)
    })

    it('tsvb top n is filtered', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, /^0$/)
    })

    it('saved search is filtered', () => {
      cy.get('[data-test-subj="docTableExpandToggleColumn"]').should('not.exist')
    })

    // TODO: Uncomment once https://github.com/elastic/kibana/issues/22561 is fixed
    // it('timeline is filtered', async () => {
    //   await dashboardExpect.timelineLegendCount(0)
    // })

    it('vega is filtered', () => {
      cy.get('.vgaVis__view text').each(($el, index, $list) => {
        cy.get($el).should('not.contain', /^5,000$/)
      })
    })
  })

  describe('disabling a filter unfilters the data on', () => {
    before(() => {
      // TO DO: create delete filter helper function
      cy.viewport(1900, 1080)
      cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').click()
      cy.get('[data-test-subj="deleteFilter"]').click()
      cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').should('not.exist')
    })

    it('pie charts', () => {
      // Check that there are 5 slice in the pie charts
      cy.checkElementExists('svg > g > g.arcs > path.slice', 5)
    })

    it('area, bar and heatmap charts', () => {
      // Check that there are 3 charts
      cy.checkElementExists('svg > g > g.series', 3)
    })

    it('data tables', () => {
      // Check that there are 10 table rows
      cy.checkElementExists('[data-test-subj="paginated-table-body"] [data-cell-content]', 10)
    })

    it('goal and guages', () => {
      // Goal label should be 7,544, gauge label should be 39.958%%
      // Inconsistency: original code wants 7,544, sometimes visualization shows 7,565
      cy.checkElementContainsValue('svg > g > g > text.chart-label', 2, /^(7,554)|(39.958%)$/)
    })

    it('metric value', () => {
      // The metrics should show '101'
      cy.checkElementContainsValue('.mtrVis__value', 1, /^101$/)
    })

    it('tag cloud', () => {
      cy.checkElementComponentContainsValue('[data-test-subj="tagCloudVisualization"]', 'svg > g > text', 1, /^9,972|4,886|1,944|9,025$/)
    })

    it('tsvb metric', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbMetricValue"]', 1, /^50,465 custom template$/)
    })

    it('tsvb top n', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, /^6,308.125$/)
    })

    it('tsvb markdown', () => {
      cy.checkElementContainsValue('[data-test-subj="tsvbMarkdown"]', 1, /^7,209.286$/)
    })

    it('saved search is filtered', () => {
      cy.checkElementExists('[data-test-subj="docTableExpandToggleColumn"]', 1)
    })

    // TODO: Uncomment once https://github.com/elastic/kibana/issues/22561 is fixed
    // it('timeline is filtered', async () => {
    //   await dashboardExpect.timelineLegendCount(0)
    // })

    it('vega is filtered', () => {
      cy.get('.vgaVis__view text').each(($el, index, $list) => {
        // To do: need to figure out way to check that a 5,000 exists, rather than checking each
        // scy.get($el).contains(/^5,000$/)
      })
    })
  })
  // TO DO: continue making helper functions for repeated actions
  describe('nested filtering', () => {
    before(() => {
      // Go to the Dashboards list page
      cy.viewport(1900, 1080)
      cy.visit('app/dashboards/list')
    })
    it('visualization saved with a query filters data', () => {
      // Click the "Create dashboard" button
      cy.get('[data-test-subj="newItemButton"]', { timeout: 20000 }).should('be.visible').click()
      cy.get('[data-test-subj="emptyDashboardWidget"]').should('be.visible')

      // Change the time to be between Jan 1 2018 and Apr 13, 2018
      cy.setDashboardDataRange('Apr 13, 2018 @ 00:00:00.000', 'Jan 1, 2018 @ 00:00:00.000')

      cy.addDashboardPanels('Rendering Test: animal sounds pie', 'visualization', false)

      cy.get('svg > g > g.arcs > path.slice').should('be.length', 5)

      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="queryInput"]').type('{selectall}weightLbs:>50')
      cy.get('[data-test-subj="querySubmitButton"]').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 3)

      cy.saveVisualization('Rendering Test: animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 3)
    })

    it('Nested visualization filter pills filters data as expected', () => {
      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="pieSlice-grr"]').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 1)

      cy.saveVisualization('animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 1)
    })

    it('Removing filter pills and query unfiters data as expected', () => {
      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="queryInput"]').type('{selectall}{backspace}')
      cy.get('[data-test-subj="querySubmitButton"]').click()

      cy.get('[data-test-subj="filter filter-enabled filter-key-sound.keyword filter-value-grr filter-unpinned "]').click()
      cy.get('[data-test-subj="deleteFilter"]').click()

      cy.get('svg > g > g.arcs > path.slice').should('be.length', 5)

      cy.saveVisualization('Rendering Test: animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 5)
    })
    it('Pie chart linked to saved search filters data', () => {
      cy.addDashboardPanels('Filter Test: animals: linked to search with filter', 'visualization', false)
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 7)
    })

    it('Pie chart linked to saved search filters shows no data with conflicting dashboard query', () => {
      cy.get('[data-test-subj="queryInput"]').type('{selectall}weightLbs<40')
      cy.get('[data-test-subj="querySubmitButton"]').click()
      cy.get('svg > g > g.arcs > path.slice').should('be.length', 5)
    })
  })
})
