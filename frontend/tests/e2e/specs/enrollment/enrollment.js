describe('Activity', () => {
    beforeEach(() => {
        cy.deleteAllButArs();
        cy.hedbCreateEnrollments();
    });

    afterEach(() => {
        cy.deleteAllButArs();
    });

    it('check activity enrollment', () => {
        const MOTIVATION = 'I am very motivated!';

        cy.demoMemberLogin()
        // intercept get institutions
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        // check results
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
        .should('have.length', 3)

        //check that first activity has 0 enrollments
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .first()
            .children()
            .should('have.length', 13)
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .eq(0).children().eq(3).should('contain', 0);


        cy.logout();

        cy.demoVolunteerLogin();
        // intercept get activities request
        cy.intercept('GET', '/activities').as('getActivities');
        // go to volunteer activities view
        cy.get('[data-cy="volunteerActivities"]').click();
        // check request was done
        cy.wait('@getActivities');

        
        cy.get('[data-cy="volunteerActivitiesTable"] tbody tr')
            .first()
            .find('[data-cy="enrollButton"]').click();
        cy.get('[data-cy="motivationInput"]').type(MOTIVATION);
        cy.get('[data-cy="submitButton"]').click();
        cy.logout();

        cy.demoMemberLogin()
        // intercept get institutions
        cy.intercept('GET', '/users/*/getInstitution').as('getInstitutions');

        cy.get('[data-cy="institution"]').click();

        cy.get('[data-cy="activities"]').click();
        cy.wait('@getInstitutions');

        // check that activity A1 has 1 enrollment
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .filter((k, tr) => {
                return tr.children[0].innerText === 'A1'
            })
            .children()
            .should('have.length', 13)
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .filter((k, tr) => {
                return tr.children[0].innerText === 'A1'
            })
            .eq(0).children().eq(3).should('contain', 1);
        
        // select Show Enrollments on activity A1
        cy.get('[data-cy="memberActivitiesTable"] tbody tr')
            .filter((k, tr) => {
                return tr.children[0].innerText === 'A1'
            })
            .find('[data-cy="showEnrollments"]').click();
        
        // check that activity has 1 enrollment with the correct motivation
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .should('have.length', 1)
        cy.get('[data-cy="activityEnrollmentsTable"] tbody tr')
            .eq(0).children().eq(0).should('contain', MOTIVATION);
    });
});