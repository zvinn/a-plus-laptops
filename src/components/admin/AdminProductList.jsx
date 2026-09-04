/* eslint-disable react/prop-types */
import { useState } from 'react';
import OptimizedImage from '../OptimizedImage';
import { useConfirm } from '../../context/ConfirmContext';
import { useToast } from '../../context/ToastContext';
import { productService } from '../../api/productService';

const AdminProductList = ({ products, refreshProducts }) => {
    const { confirm } = useConfirm();
    const { success, error } = useToast();
    const [showAddForm, setShowAddForm] = useState(false);

    // Product Form State
    const [newProduct, setNewProduct] = useState({
        name: '', brand: '', price: '', image: '', stockCount: 50, lowStockThreshold: 5,
        specs: { cpu: '', gpu: '', ram: '', storage: '', screen: '' }
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setNewProduct(prev => ({
                ...prev,
                [parent]: { ...prev[parent], [child]: value }
            }));
        } else {
            setNewProduct(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        try {
            await productService.addProduct(newProduct);
            setShowAddForm(false);
            setNewProduct({
                name: '', brand: '', price: '', image: '', stockCount: 50, lowStockThreshold: 5,
                specs: { cpu: '', gpu: '', ram: '', storage: '', screen: '' }
            });
            refreshProducts();
            success("Product added successfully!");
        } catch {
            error("Error adding product");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (await confirm({
            title: 'Delete Product',
            message: 'Are you sure you want to delete this product?',
            confirmText: 'Delete',
            variant: 'danger'
        })) {
            try {
                await productService.deleteProduct(id);
                refreshProducts();
                success("Product deleted");
            } catch (err) {
                console.error(err);
                error("Failed to delete product");
            }
        }
    };

    return (
        <div className="products-manager animate-fade-in">
            <div className="actions-bar">
                <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
                    {showAddForm ? 'Cancel' : '+ Add New Product'}
                </button>
            </div>

            {showAddForm && (
                <div className="add-product-form slide-down">
                    <h2>Add New Laptop</h2>
                    <form onSubmit={handleAddProduct}>
                        <div className="form-grid">
                            <div className="form-group"><label htmlFor="product-name">Name</label><input id="product-name" name="name" value={newProduct.name} onChange={handleInputChange} required /></div>
                            <div className="form-group">
                                <label htmlFor="product-brand">Brand</label>
                                <select id="product-brand" name="brand" value={newProduct.brand} onChange={handleInputChange} required>
                                    <option value="">Select Brand</option>
                                    <option value="Asus">Asus</option>
                                    <option value="Lenovo">Lenovo</option>
                                    <option value="MSI">MSI</option>
                                    <option value="Razer">Razer</option>
                                    <option value="HP">HP</option>
                                    <option value="Dell">Dell</option>
                                    <option value="Apple">Apple</option>
                                </select>
                            </div>
                            <div className="form-group"><label htmlFor="product-price">Price (EGP)</label><input id="product-price" type="number" name="price" value={newProduct.price} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-image">Image URL</label><input id="product-image" name="image" value={newProduct.image} onChange={handleInputChange} placeholder="https://..." required /></div>
                            <div className="form-group"><label htmlFor="product-cpu">CPU</label><input id="product-cpu" name="specs.cpu" value={newProduct.specs.cpu} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-gpu">GPU</label><input id="product-gpu" name="specs.gpu" value={newProduct.specs.gpu} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-ram">RAM</label><input id="product-ram" name="specs.ram" value={newProduct.specs.ram} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-storage">Storage</label><input id="product-storage" name="specs.storage" value={newProduct.specs.storage} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-stock">Stock Count</label><input id="product-stock" type="number" name="stockCount" value={newProduct.stockCount} onChange={handleInputChange} required /></div>
                            <div className="form-group"><label htmlFor="product-threshold">Low Stock Threshold</label><input id="product-threshold" type="number" name="lowStockThreshold" value={newProduct.lowStockThreshold} onChange={handleInputChange} required /></div>
                        </div>
                        <button type="submit" className="btn btn-success" style={{ marginTop: '1rem' }}>Save Product</button>
                    </form>
                </div>
            )}

            <div className="products-table-container">
                <table className="products-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Brand</th>
                            <th>Price</th>
                            <th>Stock</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <OptimizedImage
                                        src={product.image}
                                        alt=""
                                        className="table-img"
                                        skeletonHeight="50px"
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.brand}</td>
                                <td>{product.price?.toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${product.stockCount <= product.lowStockThreshold ? 'shipped' : 'success'}`} style={{ backgroundColor: product.stockCount === 0 ? '#fee2e2' : undefined, color: product.stockCount === 0 ? '#991b1b' : undefined }}>
                                        {product.stockCount ?? 'N/A'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => handleDeleteProduct(product.id)} className="btn-delete">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminProductList;
