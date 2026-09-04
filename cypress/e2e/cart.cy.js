describe('Cart Page', () => {
    beforeEach(() => {
        // Add item to cart first
        cy.visit('/shop');
        cy.get('.product-card').first().find('.btn-cart').click();
        cy.visit('/cart');
    });

    it('displays cart items', () => {
        cy.get('.cart-item').should('exist');
    });

    it('updates quantity', () => {
        cy.get('.quantity-btn.plus').click();
        cy.wait(500);
        cy.get('.item-quantity').should('contain', '2');
    });

    it('removes item', () => {
        cy.get('.remove-btn').click();
        cy.contains('Cart is empty').should('exist');
    });

    it('proceeds to checkout', () => {
        cy.contains('Proceed to Checkout').click();
        cy.url().should('include', '/checkout');
    });
});
