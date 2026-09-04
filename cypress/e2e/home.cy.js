describe('Home Page', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('loads successfully', () => {
        cy.get('h1').should('be.visible');
    });

    it('displays the hero section', () => {
        cy.get('.hero-section').should('exist');
        cy.contains('A Plus+').should('exist');
    });

    it('navigates to shop page', () => {
        cy.get('a[href="/shop"]').first().click();
        cy.url().should('include', '/shop');
    });

    it('displays featured laptops', () => {
        cy.get('.featured-section').should('exist');
        cy.get('.product-card').should('have.length.gt', 0);
    });
});
