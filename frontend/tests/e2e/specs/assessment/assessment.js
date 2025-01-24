describe('Assessment', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.hedbCreateAssessments();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('create assessment', () => {
        const ASSESSMENT_TEXT = 'This activity was great!';
        const ACTIVITY_NAME = 'A1';

        cy.demoVolunteerLogin();

        cy.intercept('GET', '/activities').as('getActivities');
        cy.get('[data-cy="volunteerActivities"]').click();
        cy.wait('@getActivities');
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr').should('have.length', 6);
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .eq(0)
            .children()
            .eq(0)
            .should('contain', ACTIVITY_NAME);

        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr').eq(0).find('[data-cy="writeAssessmentButton"]').click();
        cy.get('[data-cy="reviewInput"]').type(ASSESSMENT_TEXT);
        cy.get('[data-cy="submitButton"]').click();
        cy.logout();


        cy.demoMemberLogin();
        cy.intercept('GET', '/institutions/*/assessments').as('getInstitutions');
        cy.get('[data-cy="institution"]').click();
        cy.get('[data-cy="assessments"]').click();
        cy.wait('@getInstitutions');
        cy.get('[data-cy="institutionAssessmentsTable"] tbody tr').should('have.length', 1);
        cy.get('[data-cy="institutionAssessmentsTable"] tbody tr')
            .eq(0)
            .children()
            .eq(1)
            .should('contain', ASSESSMENT_TEXT);

        cy.logout();
        
    });
});
