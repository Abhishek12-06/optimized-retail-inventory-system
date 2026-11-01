
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, Package, Boxes, Search, Plus, Pencil, Trash2,
  RefreshCw, AlertTriangle, IndianRupee, X, LogOut, UserCircle,
  ArrowDownUp, History, ChartColumn, TrendingUp, Menu, Truck,
} from "lucide-react";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, PieChart, Pie, Cell, Legend, LabelList,
} from "recharts";

import Auth from "./Auth";
import SupplierManagement from "./SupplierManagement";
import api from "./api";
import "./App.css";

const CHART_COLORS = [
  "#6366f1", "#06b6d4", "#10b981", "#f59e0b",
  "#f43f5e", "#8b5cf6", "#14b8a6",
];

const emptyProduct = {
  name: "", sku: "", category: "", description: "",
  price: "", costPrice: "", quantity: "", reorderLevel: "", supplier: "",
};

const CustomTooltip = ({ active, payload, label, currency = false }) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="custom-chart-tooltip">
      <strong>{label || payload[0]?.name}</strong>
      <p>
        {currency
          ? new Intl.NumberFormat("en-IN", {
              style: "currency",
              currency: "INR",
              maximumFractionDigits: 0,
            }).format(Number(payload[0].value) || 0)
          : `${Number(payload[0].value || 0).toLocaleString("en-IN")} units`}
      </p>
    </div>
  );
};

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem("user");
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const [products, setProducts] = useState([]);
  const [activePage, setActivePage] = useState("Dashboard");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [message, setMessage] = useState("");
  const [stockMovements, setStockMovements] = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [stockForm, setStockForm] = useState({
    productId: "", type: "IN", quantity: "", note: "",
  });

  const [form, setForm] = useState(emptyProduct);

  const role = currentUser?.role || "staff";
  const canManage = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const showMessage = (text) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 3500);
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount) || 0);

  const displayDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString("en-IN");
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get("/products");
      setProducts(response.data.data || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to load products.");
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      setStockLoading(true);
      const response = await api.get("/stock/history");
      setStockMovements(response.data.data || []);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to load stock history.");
    } finally {
      setStockLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const response = await api.get("/analytics");
      setAnalytics(response.data.data || null);
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to load analytics.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser) fetchProducts();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser && activePage === "Stock Management") {
      fetchStockMovements();
    }
  }, [currentUser, activePage]);

  useEffect(() => {
    if (currentUser && activePage === "Reports & Analytics" && canManage) {
      fetchAnalytics();
    }
  }, [currentUser, activePage, canManage]);

  const handleLogin = (user) => {
    setCurrentUser(user);
    setActivePage("Dashboard");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    setProducts([]);
    setAnalytics(null);
    setStockMovements([]);
  };

  const resetForm = () => {
    setForm(emptyProduct);
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      category: product.category || "",
      description: product.description || "",
      price: product.price ?? "",
      costPrice: product.costPrice ?? "",
      quantity: product.quantity ?? "",
      reorderLevel: product.reorderLevel ?? "",
      supplier: product.supplier || "",
    });
    setShowModal(true);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const payload = {
      ...form,
      price: Number(form.price),
      costPrice: Number(form.costPrice),
      quantity: Number(form.quantity),
      reorderLevel: Number(form.reorderLevel),
    };

    try {
      if (editingProduct) {
        await api.put(`/products/${editingProduct._id}`, payload);
        showMessage("Product updated successfully.");
      } else {
        await api.post("/products", payload);
        showMessage("Product added successfully.");
      }

      setShowModal(false);
      resetForm();
      fetchProducts();
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to save product.");
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${productId}`);
      showMessage("Product deleted successfully.");
      fetchProducts();
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to delete product.");
    }
  };

  const handleStockFormChange = (event) => {
    const { name, value } = event.target;
    setStockForm((previous) => ({ ...previous, [name]: value }));
  };

  const handleStockSubmit = async (event) => {
    event.preventDefault();

    try {
      await api.post("/stock", {
        ...stockForm,
        quantity: Number(stockForm.quantity),
      });

      showMessage("Stock movement recorded successfully.");
      setStockForm({ productId: "", type: "IN", quantity: "", note: "" });
      fetchProducts();
      fetchStockMovements();
      if (activePage === "Reports & Analytics") fetchAnalytics();
    } catch (error) {
      showMessage(error.response?.data?.message || "Unable to record stock movement.");
    }
  };

  const filteredProducts = products.filter((product) => {
    const search = searchTerm.toLowerCase();
    return (
      product.name?.toLowerCase().includes(search) ||
      product.sku?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    );
  });

  const totalProducts = products.length;
  const totalStock = products.reduce(
    (total, product) => total + Number(product.quantity || 0), 0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + Number(product.price || 0) * Number(product.quantity || 0), 0
  );

  const lowStockProducts = products.filter(
    (product) => Number(product.quantity) <= Number(product.reorderLevel)
  );

  const recentProducts = [...products].slice(-5).reverse();

  const categoryData = useMemo(() => {
    const grouped = {};

    products.forEach((product) => {
      const category = product.category || "Uncategorized";

      if (!grouped[category]) {
        grouped[category] = { name: category, quantity: 0, value: 0 };
      }

      grouped[category].quantity += Number(product.quantity || 0);
      grouped[category].value +=
        Number(product.price || 0) * Number(product.quantity || 0);
    });

    return Object.values(grouped);
  }, [products]);

  const stockChartData = [
    { name: "Stock In", quantity: Number(analytics?.totalStockIn || 0), fill: "#10b981" },
    { name: "Stock Out", quantity: Number(analytics?.totalStockOut || 0), fill: "#f97316" },
  ];

  const categoryChartData =
    analytics?.categoryStats?.length > 0
      ? analytics.categoryStats.map((item) => ({
          name: item.category || item._id || "Other",
          quantity: Number(item.totalStock ?? item.quantity ?? 0),
        }))
      : categoryData.map((item) => ({
          name: item.name,
          quantity: item.quantity,
        }));

  const totalCategoryQuantity = categoryChartData.reduce(
    (sum, item) => sum + Number(item.quantity || 0), 0
  );

  const inventoryValueData = [...categoryData]
    .map((item) => ({ name: item.name, value: item.value }))
    .sort((a, b) => b.value - a.value);

  const navigation = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: Package },
    { name: "Stock Management", icon: Boxes },
    { name: "Suppliers", icon: Truck },
    ...(canManage ? [{ name: "Reports & Analytics", icon: ChartColumn }] : []),
  ];

  if (!currentUser) return <Auth onLogin={handleLogin} />;

  return (
    <div className="app-container">
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand">
          <div className="brand-icon"><Boxes size={25} /></div>
          <div>
            <h2>RetailFlow</h2>
            <span>Inventory Management</span>
          </div>
          <button className="sidebar-close" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <div className="sidebar-label">MAIN MENU</div>

        <nav className="sidebar-menu">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className={`sidebar-link ${activePage === item.name ? "active" : ""}`}
                onClick={() => {
                  setActivePage(item.name);
                  setSidebarOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-user">
            <div className="user-avatar"><UserCircle size={25} /></div>
            <div className="user-info">
              <strong>{currentUser.name || "User"}</strong>
              <span>{role}</span>
            </div>
          </div>

          <button className="logout-button" onClick={handleLogout}>
            <LogOut size={18} /><span>Logout</span>
          </button>
          <p className="sidebar-footer">RetailFlow by Abhi</p>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="mobile-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
              <Menu size={22} />
            </button>
            <div>
              <h1>{activePage}</h1>
              <p>Welcome back, {currentUser.name || "User"}!</p>
            </div>
          </div>

          <div className="topbar-right">
            <div className="topbar-user">
              <UserCircle size={21} />
              <span>{currentUser.name || "User"}</span>
            </div>
          </div>
        </header>

        {message && (
          <div className="message-toast">
            <span>{message}</span>
            <button onClick={() => setMessage("")}><X size={16} /></button>
          </div>
        )}

        {activePage === "Dashboard" && (
          <section className="dashboard-section">
            <div className="page-heading">
              <div>
                <h2>Dashboard Overview</h2>
                <p>Here's what's happening with your inventory.</p>
              </div>
              <button className="secondary-button" onClick={fetchProducts}>
                <RefreshCw size={16} />Refresh
              </button>
            </div>

            <div className="stats-grid">
              <div className="stat-card stat-blue">
                <div className="stat-icon"><Package size={23} /></div>
                <div><p>Total Products</p><h2>{totalProducts}</h2><span>Products in inventory</span></div>
              </div>
              <div className="stat-card stat-purple">
                <div className="stat-icon"><Boxes size={23} /></div>
                <div><p>Total Stock</p><h2>{totalStock.toLocaleString("en-IN")}</h2><span>Units available</span></div>
              </div>
              <div className="stat-card stat-green">
                <div className="stat-icon"><IndianRupee size={23} /></div>
                <div><p>Inventory Value</p><h2>{formatCurrency(inventoryValue)}</h2><span>Based on selling price</span></div>
              </div>
              <div className="stat-card stat-orange">
                <div className="stat-icon"><AlertTriangle size={23} /></div>
                <div><p>Low Stock Items</p><h2>{lowStockProducts.length}</h2><span>Need attention</span></div>
              </div>
            </div>

            <div className="dashboard-grid">
              <div className="content-card recent-products-card">
                <div className="card-heading">
                  <div><h3>Recent Products</h3><p>Recently added inventory items</p></div>
                  <button className="text-button" onClick={() => setActivePage("Products")}>View all</button>
                </div>

                {loading ? <div className="loading-state">Loading products...</div> :
                  recentProducts.length === 0 ? <div className="empty-state">No products available.</div> :
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Quantity</th></tr></thead>
                      <tbody>
                        {recentProducts.map((product) => (
                          <tr key={product._id}>
                            <td className="product-name-cell">{product.name}</td>
                            <td>{product.sku}</td>
                            <td>{product.category || "—"}</td>
                            <td>
                              <span className={`stock-badge ${Number(product.quantity) <= Number(product.reorderLevel) ? "stock-low" : "stock-good"}`}>
                                {product.quantity}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                }
              </div>

              <div className="content-card low-stock-card">
                <div className="card-heading">
                  <div><h3>Low Stock Alerts</h3><p>Products that need restocking</p></div>
                  <AlertTriangle size={21} color="#f59e0b" />
                </div>

                {lowStockProducts.length === 0 ? (
                  <div className="empty-alert">
                    <div className="success-icon">✓</div>
                    <strong>All good!</strong>
                    <p>No products are currently below their reorder level.</p>
                  </div>
                ) : (
                  <div className="alert-list">
                    {lowStockProducts.slice(0, 6).map((product) => (
                      <div className="alert-item" key={product._id}>
                        <div><strong>{product.name}</strong><span>SKU: {product.sku}</span></div>
                        <span className="alert-quantity">{product.quantity} left</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {activePage === "Products" && (
          <section className="dashboard-section">
            <div className="page-heading">
              <div><h2>Product Management</h2><p>Manage and organize your inventory products.</p></div>
              {canManage && <button className="primary-button" onClick={openAddModal}><Plus size={18} />Add Product</button>}
            </div>

            <div className="content-card">
              <div className="table-toolbar">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="text"
                    placeholder="Search by name, SKU or category..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                  />
                </div>
                <button className="secondary-button" onClick={fetchProducts}><RefreshCw size={16} />Refresh</button>
              </div>

              {loading ? <div className="loading-state">Loading products...</div> :
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Product Name</th><th>SKU</th><th>Category</th><th>Price</th>
                        <th>Cost Price</th><th>Quantity</th><th>Reorder Level</th><th>Status</th>
                        {(canManage || canDelete) && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((product) => (
                        <tr key={product._id}>
                          <td className="product-name-cell">{product.name}</td>
                          <td>{product.sku}</td>
                          <td>{product.category || "—"}</td>
                          <td>{formatCurrency(product.price)}</td>
                          <td>{formatCurrency(product.costPrice)}</td>
                          <td>{product.quantity}</td>
                          <td>{product.reorderLevel}</td>
                          <td>
                            <span className={`stock-badge ${Number(product.quantity) <= Number(product.reorderLevel) ? "stock-low" : "stock-good"}`}>
                              {Number(product.quantity) <= Number(product.reorderLevel) ? "Low Stock" : "In Stock"}
                            </span>
                          </td>
                          {(canManage || canDelete) && (
                            <td>
                              <div className="action-buttons">
                                {canManage && <button className="icon-button edit-button" title="Edit product" onClick={() => openEditModal(product)}><Pencil size={16} /></button>}
                                {canDelete && <button className="icon-button delete-button" title="Delete product" onClick={() => handleDelete(product._id)}><Trash2 size={16} /></button>}
                              </div>
                            </td>
                          )}
                        </tr>
                      ))}
                      {filteredProducts.length === 0 && (
                        <tr><td colSpan={canManage || canDelete ? 9 : 8} className="empty-table">No matching products found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </section>
        )}

        {activePage === "Stock Management" && (
          <section className="dashboard-section">
            <div className="page-heading">
              <div><h2>Stock Management</h2><p>Record stock additions and stock removals.</p></div>
              <button className="secondary-button" onClick={() => { fetchProducts(); fetchStockMovements(); }}>
                <RefreshCw size={16} />Refresh
              </button>
            </div>

            {canManage && (
              <div className="content-card stock-form-card">
                <div className="card-heading">
                  <div><h3>Record Stock Movement</h3><p>Add new stock or record outgoing stock.</p></div>
                  <ArrowDownUp size={22} />
                </div>

                <form onSubmit={handleStockSubmit} className="stock-form">
                  <div className="form-group">
                    <label>Select Product</label>
                    <select name="productId" value={stockForm.productId} onChange={handleStockFormChange} required>
                      <option value="">Choose a product</option>
                      {products.map((product) => <option key={product._id} value={product._id}>{product.name} ({product.sku})</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Movement Type</label>
                    <select name="type" value={stockForm.type} onChange={handleStockFormChange} required>
                      <option value="IN">Stock In</option><option value="OUT">Stock Out</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input type="number" name="quantity" min="1" placeholder="Enter quantity" value={stockForm.quantity} onChange={handleStockFormChange} required />
                  </div>
                  <div className="form-group">
                    <label>Note</label>
                    <input type="text" name="note" placeholder="Optional note" value={stockForm.note} onChange={handleStockFormChange} />
                  </div>
                  <button type="submit" className="primary-button"><Plus size={17} />Record Movement</button>
                </form>
              </div>
            )}

            <div className="content-card">
              <div className="card-heading"><div><h3>Current Stock</h3><p>Current available quantity for each product.</p></div></div>
              <div className="table-container">
                <table>
                  <thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>Available Stock</th><th>Reorder Level</th><th>Status</th></tr></thead>
                  <tbody>
                    {products.map((product) => (
                      <tr key={product._id}>
                        <td className="product-name-cell">{product.name}</td><td>{product.sku}</td><td>{product.category || "—"}</td>
                        <td>{product.quantity}</td><td>{product.reorderLevel}</td>
                        <td><span className={`stock-badge ${Number(product.quantity) <= Number(product.reorderLevel) ? "stock-low" : "stock-good"}`}>
                          {Number(product.quantity) <= Number(product.reorderLevel) ? "Low Stock" : "Available"}
                        </span></td>
                      </tr>
                    ))}
                    {products.length === 0 && <tr><td colSpan="6" className="empty-table">No products available.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="content-card">
              <div className="card-heading"><div><h3>Stock Movement History</h3><p>Recent stock IN and OUT transactions.</p></div><History size={22} /></div>
              {stockLoading ? <div className="loading-state">Loading stock history...</div> :
                <div className="table-container">
                  <table>
                    <thead><tr><th>Date</th><th>Product</th><th>SKU</th><th>Type</th><th>Quantity</th><th>Note</th><th>Recorded By</th></tr></thead>
                    <tbody>
                      {stockMovements.map((movement) => (
                        <tr key={movement._id}>
                          <td>{displayDate(movement.createdAt)}</td>
                          <td className="product-name-cell">{movement.product?.name || "—"}</td>
                          <td>{movement.product?.sku || "—"}</td>
                          <td><span className={`stock-badge ${movement.type === "IN" ? "stock-good" : "stock-low"}`}>{movement.type}</span></td>
                          <td>{movement.quantity}</td><td>{movement.note || "—"}</td><td>{movement.createdBy?.name || "—"}</td>
                        </tr>
                      ))}
                      {stockMovements.length === 0 && <tr><td colSpan="7" className="empty-table">No stock movements recorded yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              }
            </div>
          </section>
        )}

        {activePage === "Suppliers" && <SupplierManagement />}

        {activePage === "Reports & Analytics" && canManage && (
          <section className="dashboard-section">
            <div className="page-heading">
              <div><h2>Reports & Analytics</h2><p>Understand your inventory performance.</p></div>
              <button className="secondary-button" onClick={fetchAnalytics}><RefreshCw size={16} />Refresh Reports</button>
            </div>

            {analyticsLoading ? <div className="content-card loading-state">Loading analytics...</div> : (
              <>
                <div className="stats-grid analytics-stats">
                  <div className="stat-card stat-blue"><div className="stat-icon"><Package size={23} /></div><div><p>Total Products</p><h2>{analytics?.totalProducts ?? totalProducts}</h2><span>Active products</span></div></div>
                  <div className="stat-card stat-purple"><div className="stat-icon"><Boxes size={23} /></div><div><p>Total Stock</p><h2>{analytics?.totalStock ?? totalStock}</h2><span>Units in inventory</span></div></div>
                  <div className="stat-card stat-green"><div className="stat-icon"><IndianRupee size={23} /></div><div><p>Inventory Value</p><h2>{formatCurrency(analytics?.inventoryValue ?? inventoryValue)}</h2><span>Total inventory worth</span></div></div>
                  <div className="stat-card stat-orange"><div className="stat-icon"><AlertTriangle size={23} /></div><div><p>Low Stock Items</p><h2>{analytics?.lowStockCount ?? lowStockProducts.length}</h2><span>Require restocking</span></div></div>
                </div>

                <div className="analytics-chart-grid">
                  <div className="content-card chart-card">
                    <div className="card-heading">
                      <div><h3>Stock Movement Overview</h3><p>Comparison of stock entering and leaving.</p></div>
                      <ArrowDownUp size={21} />
                    </div>

                    <div className="chart-summary-row">
                      <div><span className="summary-dot dot-in" /><span>Stock In</span><strong>{stockChartData[0].quantity.toLocaleString("en-IN")}</strong></div>
                      <div><span className="summary-dot dot-out" /><span>Stock Out</span><strong>{stockChartData[1].quantity.toLocaleString("en-IN")}</strong></div>
                    </div>

                    <div className="chart-container">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stockChartData} barSize={64} margin={{ top: 25, right: 15, left: -12, bottom: 5 }}>
                          <defs>
                            <linearGradient id="stockInGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#059669" /><stop offset="100%" stopColor="#6ee7b7" />
                            </linearGradient>
                            <linearGradient id="stockOutGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#ea580c" /><stop offset="100%" stopColor="#fdba74" />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="4 5" vertical={false} stroke="#e9edf5" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: "#74809a", fontSize: 12 }} />
                          <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: "#74809a", fontSize: 12 }} />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f5f7fc" }} />
                          <Bar dataKey="quantity" radius={[10, 10, 4, 4]} name="Quantity">
                            {stockChartData.map((entry, index) => (
                              <Cell key={entry.name} fill={index === 0 ? "url(#stockInGradient)" : "url(#stockOutGradient)"} />
                            ))}
                            <LabelList dataKey="quantity" position="top" fill="#26334d" fontSize={13} fontWeight={700} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="content-card chart-card">
                    <div className="card-heading">
                      <div><h3>Category Distribution</h3><p>Stock distribution across categories.</p></div>
                      <Boxes size={21} />
                    </div>

                    <div className="chart-container donut-chart-container">
                      {categoryChartData.length === 0 ? (
                        <div className="empty-state">No category data available.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              dataKey="quantity"
                              nameKey="name"
                              cx="50%"
                              cy="43%"
                              innerRadius={72}
                              outerRadius={112}
                              paddingAngle={4}
                              cornerRadius={7}
                              stroke="none"
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                              ))}
                            </Pie>
                            <text x="50%" y="40%" textAnchor="middle" dominantBaseline="middle" className="donut-center-label">
                              {totalCategoryQuantity.toLocaleString("en-IN")}
                            </text>
                            <text x="50%" y="48%" textAnchor="middle" dominantBaseline="middle" className="donut-center-caption">
                              Total Units
                            </text>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={42} iconType="circle" />
                          </PieChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>

                  <div className="content-card chart-card chart-wide">
                    <div className="card-heading">
                      <div><h3>Inventory Value by Category</h3><p>Estimated selling value of available stock.</p></div>
                      <TrendingUp size={21} />
                    </div>

                    <div className="chart-container chart-container-wide">
                      {inventoryValueData.length === 0 ? (
                        <div className="empty-state">No inventory value data available.</div>
                      ) : (
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={inventoryValueData} layout="vertical" margin={{ top: 8, right: 65, left: 20, bottom: 5 }}>
                            <defs>
                              <linearGradient id="valueGradient" x1="0" y1="0" x2="1" y2="0">
                                <stop offset="0%" stopColor="#6366f1" /><stop offset="100%" stopColor="#06b6d4" />
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="4 5" horizontal={false} stroke="#e9edf5" />
                            <XAxis type="number" tickFormatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} axisLine={false} tickLine={false} tick={{ fill: "#74809a", fontSize: 12 }} />
                            <YAxis type="category" dataKey="name" width={115} axisLine={false} tickLine={false} tick={{ fill: "#596780", fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip currency />} cursor={{ fill: "#f5f7fc" }} />
                            <Bar dataKey="value" fill="url(#valueGradient)" radius={[0, 9, 9, 0]} barSize={28}>
                              <LabelList dataKey="value" position="right" formatter={(value) => formatCurrency(value)} fill="#35415b" fontSize={12} />
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      )}
                    </div>
                  </div>
                </div>

                <div className="content-card">
                  <div className="card-heading"><div><h3>Category-wise Inventory</h3><p>Stock quantity and value by category.</p></div></div>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Category</th><th>Total Quantity</th><th>Inventory Value</th></tr></thead>
                      <tbody>
                        {categoryData.map((item) => (
                          <tr key={item.name}><td className="product-name-cell">{item.name}</td><td>{item.quantity}</td><td>{formatCurrency(item.value)}</td></tr>
                        ))}
                        {categoryData.length === 0 && <tr><td colSpan="3" className="empty-table">No category information available.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="content-card">
                  <div className="card-heading"><div><h3>Recent Stock Transactions</h3><p>Latest inventory movement records.</p></div><History size={21} /></div>
                  <div className="table-container">
                    <table>
                      <thead><tr><th>Date</th><th>Product</th><th>Movement</th><th>Quantity</th><th>Recorded By</th></tr></thead>
                      <tbody>
                        {(analytics?.recentMovements || []).slice(0, 10).map((movement) => (
                          <tr key={movement._id}>
                            <td>{displayDate(movement.createdAt)}</td>
                            <td className="product-name-cell">{movement.product?.name || "—"}</td>
                            <td><span className={`stock-badge ${movement.type === "IN" ? "stock-good" : "stock-low"}`}>{movement.type}</span></td>
                            <td>{movement.quantity}</td>
                            <td>{movement.createdBy?.name || "—"}</td>
                          </tr>
                        ))}
                        {!analytics?.recentMovements?.length && <tr><td colSpan="5" className="empty-table">No recent transactions available.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </section>
        )}
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={(event) => {
          if (event.target === event.currentTarget) {
            setShowModal(false);
            resetForm();
          }
        }}>
          <div className="modal">
            <div className="modal-header">
              <div>
                <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
                <p>{editingProduct ? "Update the product information." : "Enter the details of your new product."}</p>
              </div>
              <button className="modal-close" onClick={() => { setShowModal(false); resetForm(); }}><X size={21} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group"><label>Product Name *</label><input name="name" value={form.name} onChange={handleFormChange} placeholder="Enter product name" required /></div>
                <div className="form-group"><label>SKU *</label><input name="sku" value={form.sku} onChange={handleFormChange} placeholder="Enter SKU" required /></div>
                <div className="form-group"><label>Category *</label><input name="category" value={form.category} onChange={handleFormChange} placeholder="Enter category" required /></div>
                <div className="form-group"><label>Supplier</label><input name="supplier" value={form.supplier} onChange={handleFormChange} placeholder="Enter supplier" /></div>
                <div className="form-group"><label>Selling Price *</label><input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleFormChange} placeholder="Enter selling price" required /></div>
                <div className="form-group"><label>Cost Price *</label><input type="number" min="0" step="0.01" name="costPrice" value={form.costPrice} onChange={handleFormChange} placeholder="Enter cost price" required /></div>
                {!editingProduct && <div className="form-group"><label>Initial Quantity *</label><input type="number" min="0" name="quantity" value={form.quantity} onChange={handleFormChange} placeholder="Enter quantity" required /></div>}
                <div className="form-group"><label>Reorder Level *</label><input type="number" min="0" name="reorderLevel" value={form.reorderLevel} onChange={handleFormChange} placeholder="Enter reorder level" required /></div>
                <div className="form-group form-full-width"><label>Description</label><textarea name="description" value={form.description} onChange={handleFormChange} placeholder="Enter product description" rows="3" /></div>
              </div>

              <div className="modal-actions">
                <button type="button" className="secondary-button" onClick={() => { setShowModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="primary-button">{editingProduct ? "Update Product" : "Save Product"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
