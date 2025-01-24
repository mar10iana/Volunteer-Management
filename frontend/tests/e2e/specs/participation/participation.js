describe('Participation', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.hedbCreateParticipations();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create participation and verify updates', () => {

        cy.demoMemberLogin();

        // Wait for institutions data after navigating to the institution page
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');
        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        // Verify there are 2 activities listed
        cy.get('[data-cy="memberActivitiesTable"] tbody tr').should('have.length', 2);

        // Verify the first activity has 1 participation
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(10)
            .should('contain', '1');

        // Select 'Show Enrollments' for the first activity
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .find('[data-cy="showEnrollments"]')
            .click();

        // Verify there are 2 enrollments for the selected activity
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr').should('have.length', 2);

        // Verify the 'Participating' status of the first enrollment is false
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(3)
            .should('contain', 'false');

        // Create a participation for the first enrollment
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .find('[data-cy="createButton"]')
            .click();

        // Confirm participation creation
        cy.get('[data-cy="saveParticipation"]').click();

        // Verify the 'Participating' status of the first enrollment is now true
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(3)
            .should('contain', 'true');

        // Navigate back to the activities list
        cy.get('[data-cy="getActivities"]').click();

        // Verify the first activity now has 2 participations
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(10)
            .should('contain', '2');

        // Logout after the test completion.
        cy.logout();
    });
});
