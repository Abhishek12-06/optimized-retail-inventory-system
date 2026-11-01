
import { useEffect, useState } from "react";
import {
  Plus, Search, Pencil, Trash2, RefreshCw, X,
  Building2, Phone, Mail, User,
} from "lucide-react";
import api from "./api";

const emptyForm = {
  name: "",
  company: "",
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  notes: "",
};

function SupplierManagement() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "staff";
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3000);
  };

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/suppliers");
      setSuppliers(response.data.data || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to load suppliers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const openAddModal = () => {
    setEditingSupplier(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEditModal = (supplier) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || "",
      company: supplier.company || "",
      contactPerson: supplier.contactPerson || "",
      email: supplier.email || "",
      phone: supplier.phone || "",
      address: supplier.address || "",
      notes: supplier.notes || "",
    });
    setShowModal(true);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (editingSupplier) {
        await api.put(`/suppliers/${editingSupplier._id}`, form);
        showMessage("Supplier updated successfully.");
      } else {
        await api.post("/suppliers", form);
        showMessage("Supplier added successfully.");
      }

      setShowModal(false);
      setForm(emptyForm);
      setEditingSupplier(null);
      fetchSuppliers();
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to save supplier.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this supplier?")) {
      return;
    }

    try {
      await api.delete(`/suppliers/${id}`);
      showMessage("Supplier deactivated successfully.");
      fetchSuppliers();
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to delete supplier.");
    }
  };

  const filteredSuppliers = suppliers.filter((supplier) => {
    const term = search.toLowerCase();
    return (
      supplier.name?.toLowerCase().includes(term) ||
      supplier.company?.toLowerCase().includes(term) ||
      supplier.contactPerson?.toLowerCase().includes(term) ||
      supplier.email?.toLowerCase().includes(term) ||
      supplier.phone?.includes(term)
    );
  });

  return (
    <section className="dashboard-section">
      <div className="page-heading">
        <div>
          <h2>Supplier Management</h2>
          <p>Manage supplier details and contact information.</p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="secondary-button" onClick={fetchSuppliers}>
            <RefreshCw size={16} /> Refresh
          </button>
          {canManage && (
            <button className="primary-button" onClick={openAddModal}>
              <Plus size={18} /> Add Supplier
            </button>
          )}
        </div>
      </div>

      {message && (
        <div className="message-toast">
          <span>{message}</span>
          <button onClick={() => setMessage("")}><X size={16} /></button>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card stat-blue">
          <div className="stat-icon"><Building2 size={23} /></div>
          <div>
            <p>Total Suppliers</p>
            <h2>{suppliers.length}</h2>
            <span>Registered suppliers</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon"><User size={23} /></div>
          <div>
            <p>Active Suppliers</p>
            <h2>{suppliers.filter((s) => s.isActive !== false).length}</h2>
            <span>Currently active</span>
          </div>
        </div>
      </div>

      <div className="content-card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search suppliers..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">Loading suppliers...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Supplier</th>
                  <th>Company</th>
                  <th>Contact Person</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  {(canManage || canDelete) && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td className="product-name-cell">{supplier.name}</td>
                    <td>{supplier.company || "—"}</td>
                    <td>{supplier.contactPerson || "—"}</td>
                    <td>{supplier.email || "—"}</td>
                    <td>{supplier.phone || "—"}</td>
                    <td>
                      <span className={`stock-badge ${supplier.isActive === false ? "stock-low" : "stock-good"}`}>
                        {supplier.isActive === false ? "Inactive" : "Active"}
                      </span>
                    </td>
                    {(canManage || canDelete) && (
                      <td>
                        <div className="action-buttons">
                          {canManage && (
                            <button
                              className="icon-button edit-button"
                              title="Edit supplier"
                              onClick={() => openEditModal(supplier)}
                            >
                              <Pencil size={16} />
                            </button>
                          )}
                          {canDelete && supplier.isActive !== false && (
                            <button
                              className="icon-button delete-button"
                              title="Deactivate supplier"
                              onClick={() => handleDelete(supplier._id)}
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredSuppliers.length === 0 && (
                  <tr>
                    <td colSpan={canManage || canDelete ? 7 : 6} className="empty-table">
                      No suppliers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) setShowModal(false);
        }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingSupplier ? "Edit Supplier" : "Add New Supplier"}</h2>
                <p>Enter supplier information below.</p>
              </div>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Supplier Name *</label>
                  <input name="name" value={form.name} onChange={handleChange} required placeholder="Supplier name" />
                </div>
                <div className="form-group">
                  <label>Company</label>
                  <input name="company" value={form.company} onChange={handleChange} placeholder="Company name" />
                </div>
                <div className="form-group">
                  <label>Contact Person</label>
                  <input name="contactPerson" value={form.contactPerson} onChange={handleChange} placeholder="Contact person" />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Email address" />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input name="phone" value={form.phone} onChange={handleChange} placeholder="Phone number" />
                </div>
                <div className="form-group">
                  <label>Address</label>
                  <input name="address" value={form.address} onChange={handleChange} placeholder="Address" />
                </div>
                <div className="form-group form-full-width">
                  <label>Notes</label>
                  <textarea name="notes" value={form.notes} onChange={handleChange} rows="3" placeholder="Additional notes" />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  {editingSupplier ? "Update Supplier" : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

export default SupplierManagement;
