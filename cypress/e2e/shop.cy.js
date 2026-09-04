describe('Shop Page', () => {
    beforeEach(() => {
        cy.visit('/shop');
    });

    it('displays products grid', () => {
        cy.get('.products-grid').should('exist');
        cy.get('.product-card').should('have.length.gt', 0);
    });

    it('filters products', () => {
        // Assuming there's a search input
        cy.get('input[type="text"]').type('ASUS');
        cy.wait(500); // Wait for debounce
        cy.get('.product-card').should('contain', 'ASUS');
    });

    it('adds product to cart', () => {
        cy.get('.product-card').first().within(() => {
            cy.get('.btn-cart').click();
        });
        // Check toast or cart count update
        cy.contains('Added to cart').should('exist');
        cy.get('.cart-count').should('not.have.text', '0');
    });
});
