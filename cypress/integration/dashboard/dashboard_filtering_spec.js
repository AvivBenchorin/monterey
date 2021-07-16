/**
 * dashboard_filtering test suite description:
 * 1) Create a new dashboard, and populate it with visualizations
 * 2) Set a filter that excludes all data, and check the visualizations for proper updates
 * 3) Set the existing filter to be pinned, re-check the visualizations
 * 4) Remove the filter, and check the visualizations for proper updates
 * 5) Create a new dashboard, and populate it with a pie graph
 * 6) Apply different filters to the pie graph and check the pie graph for proper updates
 * 7) Remove all filters and ensure that the pie graph reverts to its original format
 * 8) Test adding another pie graph to the dashboard and applying a filter to both graphs
 */

describe('dashboard filtering', () => {
  before(() => {

    // TO DO: Setup the indices and test data (see https://github.com/AvivBenchorin/monterey/issues/11)
    // cy.request('PUT', 'localhost:9200/.kibana_1', cy.fixture('dashboard/mappings.json'))
    // cy.request('POST', 'localhost:9200/.kibana_1', cy.fixture('dashboard/data.json.gz'))
  })

  after(() => {
    // TO DO: Tear-down the indices and test data (see https://github.com/AvivBenchorin/monterey/issues/11)
    // cy.request('DELETE', 'localhost:9200')
  })
  describe('Adding and removing filters from a dashboard', () => {
    before(() => {
      // Increase the viewport size to prevent pop-up notifications from blocking UI elements.
      // E.g. after adding a saved visualization, a notification appears in the bottom right
      // which could block clicking on a button located behind it.
      cy.viewport(1900, 1080)

      // Go to the Dashboards list page
      cy.visit('app/dashboards/list')

      // Click the "Create dashboard" button
      cy.get('[data-test-subj="newItemButton"]', { timeout: 60000 }).should('be.visible').click()
      cy.get('[data-test-subj="emptyDashboardWidget"]').should('be.visible')
      // Change the time to be between Jan 1 2018 and Apr 13, 2018
      cy.setDashboardDataRange('Apr 13, 2018 @ 00:00:00.000', 'Jan 1, 2018 @ 00:00:00.000')

      // Add all "Filter Bytes Test" visualizations
      cy.addDashboardPanels('Filter Bytes Test', 'visualization', true)

      // Click the "Add" button and add all "Saved Searches"
      cy.addDashboardPanels('Filter Bytes Test', 'search', false)
    })

    describe('adding a filter that excludes all data', () => {
      before(() => {
        // Increase the viewport size to prevent pop-up notifications from blocking UI elements.
        // E.g. after adding a saved visualization, a notification appears in the bottom right
        // which could block clicking on a button located behind it.
        cy.viewport(1900, 1080)
        
        // Clear add filters to properly clean the environment for the test
        cy.get('[data-test-subj="showFilterActions"]').click()
        cy.get('[data-test-subj="removeAllFilters"]').click()

        // Add filter
        cy.addDashboardFilterRetrySelection('bytes', 'is', '12345678')
      })
      
      it('Nonpinned filter: filters on pie charts', () => {
        // Check that none of the pie charts are occupied with data (show "No results found")
        cy.checkElementDoesNotExist('svg > g > g.arcs > path.slice')
      })
  
      it('Nonpinned filter: area, bar and heatmap charts filtered', () => {
        // Check that none of the charts are filled with data
        cy.checkElementDoesNotExist('svg > g > g.series')
      })
  
      it('Nonpinned filter: data tables are filtered', () => {
        // Check that none of the data tables are filled with data
        cy.checkElementDoesNotExist('[data-test-subj="paginated-table-body"] [data-cell-content]')
      })
  
      it('Nonpinned filter: goal and guages are filtered', () => {
        // Goal label should be 0, gauge label should be 0%
        cy.checkValuesExistInComponent('svg > g > g > text.chart-label', ['0', '0%'])
      })
  
      it('Nonpinned filter: tsvb time series shows no data message', () => {
        // The no data message should be visible
        cy.checkElementExists('[data-test-subj="noTSVBDataMessage"]', 1)
      })
  
      it('Nonpinned filter: metric value shows no data', () => {
        // The metrics should show '-'
        cy.checkValuesExistInComponent('.mtrVis__value', [' - '])
      })
  
      it('Nonpinned filter: tag cloud values are filtered', () => {
        cy.checkElementComponentDoesNotExist('[data-test-subj="tagCloudVisualization"]', 'svg > g > text')
      })
  
      it('Nonpinned filter: tsvb metric is filtered', () => {
        cy.checkValuesExistInComponent('[data-test-subj="tsvbMetricValue"]', ['0 custom template'])
      })
  
      it('Nonpinned filter: tsvb top n is filtered', () => {
        cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, '0')
      })
  
      it('Nonpinned filter: saved search is filtered', () => {
        cy.checkElementDoesNotExist('[data-test-subj="docTableExpandToggleColumn"]')
      })
  
      it('Nonpinned filter: vega is filtered', () => {
        cy.get('.vgaVis__view text').each(($el) => {
          cy.get($el).should('not.contain', '5,000')
        })
      })
    })
  
    describe('using a pinned filter that excludes all data', () => {
      before(() => {
        // Clear add filters to properly clean environment for the test
        cy.get('[data-test-subj="showFilterActions"]').click()
        cy.get('[data-test-subj="removeAllFilters"]').click()

        cy.addDashboardFilterRetrySelection('bytes', 'is', '12345678')
        cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').click()
        cy.get('[data-test-subj="pinFilter"]').click()
      })
  
      it('Pinned filter: filters on pie charts', () => {
        // Check that none of the pie charts are occupied with data (show "No results found")
        cy.checkElementDoesNotExist('svg > g > g.arcs > path.slice')
      })
  
      it('Pinned filter: area, bar and heatmap charts filtered', () => {
        // Check that none of the charts are filled with data
        cy.checkElementDoesNotExist('svg > g > g.series')
      })
  
      it('Pinned filter: data tables are filtered', () => {
        // Check that none of the data tables are filled with data
        cy.checkElementDoesNotExist('[data-test-subj="paginated-table-body"] [data-cell-content]')
      })
  
      it('Pinned filter: goal and guages are filtered', () => {
        // Goal label should be 0, gauge label should be 0%
        cy.checkValuesExistInComponent('svg > g > g > text.chart-label', ['0', '0%'])
      })
  
      it('Pinned filter: metric value shows no data', () => {
        // The metrics should show '-'
        cy.checkValuesExistInComponent('.mtrVis__value', [' - '])
      })
  
      it('Pinned filter: tag cloud values are filtered', () => {
        cy.checkElementComponentDoesNotExist('[data-test-subj="tagCloudVisualization"]', 'svg > g > text')
      })
  
      it('Pinned filter: tsvb metric is filtered', () => {
        cy.checkValuesExistInComponent('[data-test-subj="tsvbMetricValue"]', ['0 custom template'])
      })
  
      it('Pinned filter: tsvb top n is filtered', () => {
        cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, '0')
      })
  
      it('Pinned filter: saved search is filtered', () => {
        cy.get('[data-test-subj="docTableExpandToggleColumn"]').should('not.exist')
      })
  
      it('Pinned filter: vega is filtered', () => {
        cy.get('.vgaVis__view text').each(($el, index, $list) => {
          cy.get($el).should('not.contain', /^5,000$/)
        })
      })
    })
  
    describe('disabling a filter unfilters the data on', () => {
      before(() => {
        // TO DO: create delete filter helper function
        // Clear add filters to properly clean environment for the test
        cy.get('[data-test-subj="showFilterActions"]').click()
        cy.get('[data-test-subj="removeAllFilters"]').click()

        cy.addDashboardFilterRetrySelection('bytes', 'is', '12345678')

        cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').click()
        cy.get('[data-test-subj="deleteFilter"]').click()
        cy.get('[data-test-subj="filter filter-enabled filter-key-bytes filter-value-12,345,678 filter-unpinned "]').should('not.exist')
      })
  
      it('Filter disabled: pie charts', () => {
        // Check that there are 5 slice in the pie charts
        cy.checkElementExists('svg > g > g.arcs > path.slice', 5)
      })
  
      it('Filter disabled: area, bar and heatmap charts', () => {
        // Check that there are 3 charts
        cy.checkElementExists('svg > g > g.series', 3)
      })
  
      it('Filter disabled: data tables', () => {
        // Check that there are 10 table rows
        cy.checkElementExists('[data-test-subj="paginated-table-body"] [data-cell-content]', 10)
      })

      it('Filter disabled: goal and guages', () => {
        // Goal label should be 7,544, and the gauge label should be 39.958%%
        // Inconsistency: original code says that the goal label should have "7,544",
        // but sometimes the goal displays "7,565". It may have been related to a
        // data loading issue.
        cy.checkValuesExistInComponent('svg > g > g > text.chart-label', ['7,544', '39.958%'])
      })

      it('Filter disabled: metric value', () => {
        // The metrics should show '101'
        cy.checkValuesExistInComponent('.mtrVis__value', ['101'])
      })

      it('Filter disabled: tag cloud', () => {
        cy.checkValuesExistInComponent('[data-test-subj="tagCloudVisualization"]', ['9,972', '4,886', '1,944', '9,025'])
      })

      it('Filter disabled: tsvb metric', () => {
        cy.checkValuesExistInComponent('[data-test-subj="tsvbMetricValue"]', ['50,465 custom template'])
      })

      it('Filter disabled: tsvb top n', () => {
        cy.checkElementContainsValue('[data-test-subj="tsvbTopNValue"]', 2, '6,308.125')
      })

      it('Filter disabled: tsvb markdown', () => {
        cy.checkValuesExistInComponent('[data-test-subj="tsvbMarkdown"]', ['7,209.286'])
      })

      it('Filter disabled: saved search is filtered', () => {
        cy.checkElementExists('[data-test-subj="docTableExpandToggleColumn"]', 1)
      })

      it('Filter disabled: vega is filtered', () => {
        cy.checkValuesExistInComponent('.vgaVis__view text', ['5,000'])
      })
    })
  })
  
  // TO DO: continue making helper functions for repeated actions.
  // TO DO: better subdivide the nested filtering tests to improve consistency.
  // For example, if the test runner stops after renaming the "Rendering Test: animal sounds pie"
  // visualization, future runs of the test suite will fail due to being unable to find the visualization
  // under the expected name.

  describe('nested filtering', () => {
    before(() => {
      // Go to the Dashboards list page
      cy.visit('app/dashboards/list')
      
      // Click the "Create dashboard" button
      cy.get('[data-test-subj="newItemButton"]', { timeout: 20000 }).should('be.visible').click()
      cy.get('[data-test-subj="emptyDashboardWidget"]').should('be.visible')

      // Change the time to be between Jan 1 2018 and Apr 13, 2018
      cy.setDashboardDataRange('Apr 13, 2018 @ 00:00:00.000', 'Jan 1, 2018 @ 00:00:00.000')

      
      cy.addDashboardPanels('Rendering Test: animal sounds pie', 'visualization', false)
    })

    it('visualization saved with a query filters data', () => {

      cy.checkElementExists('svg > g > g.arcs > path.slice', 5)

      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="queryInput"]').type('{selectall}weightLbs:>50')
      cy.get('[data-test-subj="querySubmitButton"]').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 3)

      cy.saveVisualization('Rendering Test: animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 3)
    })

    it('Nested visualization filter pills filters data as expected', () => {
      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="pieSlice-grr"]').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 1)

      cy.saveVisualization('animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 1)
    })

    it('Removing filter pills and query unfiters data as expected', () => {
      cy.get('[data-test-subj="embeddablePanelToggleMenuIcon"]').click()
      cy.get('[data-test-subj="embeddablePanelAction-editPanel"]').click()

      cy.get('[data-test-subj="queryInput"]').type('{selectall}{backspace}')
      cy.get('[data-test-subj="querySubmitButton"]').click()

      cy.get('[data-test-subj="filter filter-enabled filter-key-sound.keyword filter-value-grr filter-unpinned "]').click()
      cy.get('[data-test-subj="deleteFilter"]').click()

      cy.checkElementExists('svg > g > g.arcs > path.slice', 5)

      cy.saveVisualization('Rendering Test: animal sounds pie', false, false)

      cy.get('[data-test-subj="toggleNavButton"]').click()
      cy.get('[data-test-subj="collapsibleNavAppLink"]').contains('Dashboard').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 5)
    })
    it('Pie chart linked to saved search filters data', () => {
      cy.addDashboardPanels('Filter Test: animals: linked to search with filter', 'visualization', false)
      cy.checkElementExists('svg > g > g.arcs > path.slice', 7)
    })

    it('Pie chart linked to saved search filters shows no data with conflicting dashboard query', () => {
      cy.get('[data-test-subj="queryInput"]').type('{selectall}weightLbs<40')
      cy.get('[data-test-subj="querySubmitButton"]').click()
      cy.checkElementExists('svg > g > g.arcs > path.slice', 5)
    })
  })
})
