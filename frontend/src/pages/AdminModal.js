import React, { useState, useEffect, useMemo } from 'react';
import './AdminModal.css';

const FIELD_MAP = {
    workshops: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'instructor', label: 'Instructor', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'datetime-local', required: true },
        { name: 'duration', label: 'Duration (hours)', type: 'number', required: true },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'price', label: 'Price ($)', type: 'number', step: '0.01', required: true },
        { name: 'capacity', label: 'Capacity', type: 'number', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Gardening', 'Cooking', 'Preservation', 'Sustainability', 'Other'], required: true },
        { name: 'image', label: 'Image URL', type: 'text' },
    ],
    products: [
        { name: 'name', label: 'Product Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'price', label: 'Price ($)', type: 'number', step: '0.01', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Vegetables', 'Fruits', 'Herbs', 'Seeds', 'Tools', 'Other'], required: true },
        { name: 'stock', label: 'Stock Quantity', type: 'number', required: true },
        { name: 'unit', label: 'Unit', type: 'select', options: ['piece', 'kg', 'lb', 'bunch', 'pack'], required: true },
        { name: 'organic', label: 'Organic', type: 'checkbox' },
        { name: 'image', label: 'Image URL', type: 'text' },
    ],
    events: [
        { name: 'title', label: 'Event Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea', required: true },
        { name: 'date', label: 'Start Date', type: 'datetime-local', required: true },
        { name: 'endDate', label: 'End Date', type: 'datetime-local', required: true },
        { name: 'location', label: 'Location', type: 'text', required: true },
        { name: 'price', label: 'Price ($)', type: 'number', step: '0.01', default: 0 },
        { name: 'capacity', label: 'Capacity', type: 'number', required: true },
        { name: 'category', label: 'Category', type: 'select', options: ['Harvest Festival', 'Farmers Market', 'Community Garden', 'Educational', 'Social', 'Other'], required: true },
        { name: 'organizer', label: 'Organizer', type: 'text' },
        { name: 'image', label: 'Image URL', type: 'text' },
    ],
};

const AdminModal = ({ type, item, onClose, onSave }) => {
    const [formData, setFormData] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const fields = useMemo(() => FIELD_MAP[type] || [], [type]);

    useEffect(() => {
        if (item) {
            const initialData = { ...item };
            // Format dates for input type="datetime-local"
            fields.forEach(f => {
                if (f.type === 'datetime-local' && initialData[f.name]) {
                    initialData[f.name] = new Date(initialData[f.name]).toISOString().slice(0, 16);
                }
            });
            setFormData(initialData);
        } else {
            const defaults = {};
            fields.forEach(f => {
                if (f.default !== undefined) defaults[f.name] = f.default;
                if (f.type === 'checkbox') defaults[f.name] = false;
                if (f.type === 'select') defaults[f.name] = f.options[0];
            });
            setFormData(defaults);
        }
    }, [item, type, fields]);

    const handleChange = (e) => {
        const { name, value, type: inputType, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: inputType === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSave(formData);
            onClose();
        } catch (err) {
            alert(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content glass">
                <header className="modal-header">
                    <h3>{item ? 'Edit' : 'Add New'} {type.slice(0, -1)}</h3>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </header>
                <form onSubmit={handleSubmit} className="modal-form">
                    <div className="form-grid">
                        {fields.map(field => (
                            <div key={field.name} className={`form-group ${field.type === 'textarea' ? 'full-width' : ''}`}>
                                <label>{field.label}</label>
                                {field.type === 'textarea' ? (
                                    <textarea
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                    />
                                ) : field.type === 'select' ? (
                                    <select
                                        name={field.name}
                                        value={formData[field.name] || ''}
                                        onChange={handleChange}
                                        required={field.required}
                                    >
                                        {field.options.map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type={field.type}
                                        name={field.name}
                                        step={field.step}
                                        value={field.type === 'checkbox' ? undefined : (formData[field.name] || '')}
                                        checked={field.type === 'checkbox' ? formData[field.name] : undefined}
                                        onChange={handleChange}
                                        required={field.required}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                    <footer className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={submitting}>
                            {submitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </footer>
                </form>
            </div>
        </div>
    );
};

export default AdminModal;
