import React from 'react';
import { 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell
} from 'recharts';
import { 
  BarChart3, Plus, Edit2, Trash2, Package, ShoppingBag, 
  Users, CheckCircle, RefreshCw, X, AlertTriangle, ArrowUpRight, Truck, IndianRupee, Bell,
  Gift, Percent, Tag, Sliders, Calendar, FileText, ExternalLink, Copy, CheckSquare
} from 'lucide-react';
import { Product, Order, User } from '../types.ts';
import { 
  authorizeGoogleForms, 
  hasGoogleFormsAccess, 
  getGoogleFormsAccessToken, 
  createMakhanaCampaignForm, 
  fetchGoogleFormResponses, 
  clearGoogleFormsAccess,
  GoogleFormMetadata, 
  GoogleFormResponseSummary 
} from '../lib/googleForms.ts';

interface AdminNotification {
  id: number;
  message: string;
  timestamp: string;
  unread: boolean;
}

interface AdminPanelProps {
  token: string | null;
  onClose: () => void;
  triggerToast?: (message: string, type: 'success' | 'err' | 'info') => void;
  language?: 'en' | 'hi';
}

export default function AdminPanel({ token, onClose, triggerToast, language = 'en' }: AdminPanelProps) {
  const [activeSubTab, setActiveSubTab] = React.useState<'reports' | 'products' | 'orders' | 'customers' | 'coupons' | 'forms'>('reports');
  const [activeFestiveSeasonOverride, setActiveFestiveSeasonOverride] = React.useState<string>(() => {
    return localStorage.getItem('an_active_festive_season') || 'auto';
  });
  
  // Coupon Management System States
  const [coupons, setCoupons] = React.useState<{ code: string; discount: number; description: string; minOrder?: number; expiryDate?: string; usageCount?: number }[]>(() => {
    const raw = localStorage.getItem('an_admin_promo_coupons');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        console.error(e);
      }
    }
    // Standard default coupons sync
    return [
      { code: 'MONSOON25', discount: 120, description: 'June Harvest Festival Organic Special Coupon', minOrder: 399, expiryDate: '2026-06-30', usageCount: 4 },
      { code: 'DIWALI50', discount: 150, description: 'Diwali Grand Festival Celebration Coupon', minOrder: 499, expiryDate: '2026-11-15', usageCount: 12 },
      { code: 'HOLI20', discount: 100, description: 'Holi Festival of Colors Discount Coupon', minOrder: 299, expiryDate: '2026-03-15', usageCount: 22 },
      { code: 'CHHATH15', discount: 85, description: 'Mithila Chhath Puja High Protein Sourcing Sickness Sucker Coupon', minOrder: 199, expiryDate: '2026-10-31', usageCount: 1 },
      { code: 'NEWYEAR20', discount: 90, description: 'New Year Winter Wellness Superfoods Coupon', minOrder: 249, expiryDate: '2026-01-05', usageCount: 18 }
    ];
  });

  const [newCouponCode, setNewCouponCode] = React.useState('');
  const [newCouponDiscount, setNewCouponDiscount] = React.useState('');
  const [newCouponDesc, setNewCouponDesc] = React.useState('');
  const [newCouponMinOrder, setNewCouponMinOrder] = React.useState('299');
  const [newCouponExpiry, setNewCouponExpiry] = React.useState('2026-06-30');

  const saveCoupons = (newList: typeof coupons) => {
    setCoupons(newList);
    localStorage.setItem('an_admin_promo_coupons', JSON.stringify(newList));
  };

  const handleAddCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode || !newCouponDiscount) return;
    const cleanCode = newCouponCode.trim().toUpperCase();

    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      if (triggerToast) triggerToast(
        language === 'hi' ? 'यह कूपन कोड पहले से मौजूद है।' : 'This coupon code already exists.',
        'err'
      );
      return;
    }

    const discountVal = parseFloat(newCouponDiscount);
    if (isNaN(discountVal) || discountVal <= 0) {
      if (triggerToast) triggerToast(
        language === 'hi' ? 'कृपया मान्य डिस्काउंट राशि दर्ज करें।' : 'Please enter a valid discount amount.',
        'err'
      );
      return;
    }

    const minOrderVal = parseFloat(newCouponMinOrder) || 0;

    const newCouponItem = {
      code: cleanCode,
      discount: discountVal,
      description: newCouponDesc || 'Storewide promotional discount',
      minOrder: minOrderVal,
      expiryDate: newCouponExpiry || undefined,
      usageCount: 0
    };

    const updated = [newCouponItem, ...coupons];
    saveCoupons(updated);

    setNewCouponCode('');
    setNewCouponDiscount('');
    setNewCouponDesc('');
    setNewCouponMinOrder('299');
    setNewCouponExpiry('2026-06-30');

    if (triggerToast) triggerToast(
      language === 'hi' ? `कूपन ${cleanCode} सफलतापूर्वक बनाया गया!` : `Coupon ${cleanCode} has been successfully created!`,
      'success'
    );
  };

  const handleDeleteCoupon = (codeToDelete: string) => {
    const updated = coupons.filter(c => c.code.toUpperCase() !== codeToDelete.trim().toUpperCase());
    saveCoupons(updated);
    if (triggerToast) triggerToast(
      language === 'hi' ? `कूपन ${codeToDelete} को हटा दिया गया है।` : `Coupon ${codeToDelete} was deleted successfully.`,
      'success'
    );
  };

  // States
  const [selectedCoupons, setSelectedCoupons] = React.useState<string[]>([]);
  const [productsList, setProductsList] = React.useState<Product[]>([]);
  const [ordersList, setOrdersList] = React.useState<Order[]>([]);
  const [customersList, setCustomersList] = React.useState<User[]>([]);
  const [reportsData, setReportsData] = React.useState<any>(null);
  const [notifications, setNotifications] = React.useState<AdminNotification[]>([]);
  const [showNotificationsMenu, setShowNotificationsMenu] = React.useState(false);

  // Google Forms Integration States
  const [googleForms, setGoogleForms] = React.useState<GoogleFormMetadata[]>(() => {
    const raw = localStorage.getItem('an_google_forms');
    if (raw) {
      try { return JSON.parse(raw); } catch (e) { console.error(e); }
    }
    return [];
  });
  const [googleFormsConnected, setGoogleFormsConnected] = React.useState(() => hasGoogleFormsAccess());
  const [isAuthorizingForms, setIsAuthorizingForms] = React.useState(false);
  const [isCreatingForm, setIsCreatingForm] = React.useState(false);
  const [customFormTitle, setCustomFormTitle] = React.useState('Bihar Makhana Crunch Customer Feedback');
  const [customFormDesc, setCustomFormDesc] = React.useState('Help us craft high-protein superfoods from Mithila directly to your snack bag.');
  const [selectedFormForResponses, setSelectedFormForResponses] = React.useState<string | null>(null);
  const [responsesSummary, setResponsesSummary] = React.useState<GoogleFormResponseSummary | null>(null);
  const [isLoadingResponses, setIsLoadingResponses] = React.useState(false);
  const [activeBannerFormId, setActiveBannerFormId] = React.useState<string | null>(() => {
    return localStorage.getItem('an_active_google_form_id') || null;
  });

  // Modal Coupon States
  const [showCreateCouponModal, setShowCreateCouponModal] = React.useState(false);
  const [modalCouponCode, setModalCouponCode] = React.useState('');
  const [modalCouponDiscount, setModalCouponDiscount] = React.useState('');
  const [modalCouponMinOrder, setModalCouponMinOrder] = React.useState('299');
  const [modalCouponExpiry, setModalCouponExpiry] = React.useState('2026-06-30');
  const [modalCouponDesc, setModalCouponDesc] = React.useState('');

  // Google Forms Integration Handler Functions
  const handleConnectGoogleForms = async () => {
    setIsAuthorizingForms(true);
    try {
      const token = await authorizeGoogleForms();
      if (token) {
        setGoogleFormsConnected(true);
        if (triggerToast) triggerToast(
          language === 'hi'
            ? 'गूगल फॉर्म्स प्रमाणीकरण सफल! अब आप लाइव सर्वे बना सकते हैं।'
            : 'Google Forms workspace authorized successfully! You can now deploy feedback surveys.',
          'success'
        );
      }
    } catch (err: any) {
      console.error(err);
      if (triggerToast) triggerToast(
        language === 'hi'
          ? 'प्रमाणीकरण विफल रहा: ' + (err.message || err)
          : 'Authentication failed: ' + (err.message || err),
        'err'
      );
    } finally {
      setIsAuthorizingForms(false);
    }
  };

  const handleDisconnectGoogleForms = () => {
    clearGoogleFormsAccess();
    setGoogleFormsConnected(false);
    if (triggerToast) triggerToast(
      language === 'hi' ? 'गूगल फॉर्म्स डिस्कनेक्ट हो गया है।' : 'Google Forms disconnected.',
      'info'
    );
  };

  const handleCreateGoogleForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customFormTitle.trim()) return;
    setIsCreatingForm(true);

    try {
      const newForm = await createMakhanaCampaignForm(
        customFormTitle.trim(),
        customFormDesc.trim()
      );

      const updated = [newForm, ...googleForms];
      setGoogleForms(updated);
      localStorage.setItem('an_google_forms', JSON.stringify(updated));

      // Auto-set as active storefront banner
      localStorage.setItem('an_active_google_form_id', newForm.formId);
      localStorage.setItem(`an_active_google_form_url`, newForm.responderUri);
      localStorage.setItem(`an_active_google_form_title`, newForm.title);
      setActiveBannerFormId(newForm.formId);
      window.dispatchEvent(new Event('google-form-banner-updated'));

      setCustomFormTitle('Bihar Makhana Crunch Customer Feedback');
      setCustomFormDesc('Help us craft high-protein superfoods from Mithila directly to your snack bag.');

      if (triggerToast) triggerToast(
        language === 'hi'
          ? 'नया गूगल फॉर्म सफलतापूर्वक पब्लिश किया गया!'
          : 'Google Form created and deployed successfully to your Drive!',
        'success'
      );
    } catch (err: any) {
      console.error(err);
      if (triggerToast) triggerToast(
        `Failed to deploy form: ${err.message || err}`,
        'err'
      );
    } finally {
      setIsCreatingForm(false);
    }
  };

  const handleFetchFormResponses = async (formId: string) => {
    setSelectedFormForResponses(formId);
    setIsLoadingResponses(true);
    setResponsesSummary(null);

    try {
      const summary = await fetchGoogleFormResponses(formId);
      setResponsesSummary(summary);
    } catch (err: any) {
      console.error(err);
      if (triggerToast) triggerToast(
        `Failed to fetch Google Form responses: ${err.message || err}`,
        'err'
      );
    } finally {
      setIsLoadingResponses(false);
    }
  };

  const handleToggleBannerForm = (formItem: GoogleFormMetadata) => {
    if (activeBannerFormId === formItem.formId) {
      localStorage.removeItem('an_active_google_form_id');
      localStorage.removeItem(`an_active_google_form_url`);
      localStorage.removeItem(`an_active_google_form_title`);
      setActiveBannerFormId(null);
      if (triggerToast) triggerToast(
        language === 'hi' ? 'स्टोरफ्रंट से फॉर्म हटा दिया गया।' : 'Form disassociated from storefront.',
        'info'
      );
    } else {
      localStorage.setItem('an_active_google_form_id', formItem.formId);
      localStorage.setItem(`an_active_google_form_url`, formItem.responderUri);
      localStorage.setItem(`an_active_google_form_title`, formItem.title);
      setActiveBannerFormId(formItem.formId);
      if (triggerToast) triggerToast(
        language === 'hi' ? 'फॉर्म स्टोरफ्रंट सर्वे बैनर के रूप में सक्रिय!' : 'Associated form as the default storefront feedback survey!',
        'success'
      );
    }
    window.dispatchEvent(new Event('google-form-banner-updated'));
  };

  const handleDeleteFormRecord = (formId: string) => {
    if (window.confirm(language === 'hi' ? 'क्या आप इस फॉर्म को इस रिकॉर्ड से हटाना चाहते हैं?' : 'Are you sure you want to remove this Google Form record? (Important: This does not delete the physical form from your Google Drive)')) {
      const updated = googleForms.filter(f => f.formId !== formId);
      setGoogleForms(updated);
      localStorage.setItem('an_google_forms', JSON.stringify(updated));

      if (activeBannerFormId === formId) {
        localStorage.removeItem('an_active_google_form_id');
        localStorage.removeItem(`an_active_google_form_url`);
        localStorage.removeItem(`an_active_google_form_title`);
        setActiveBannerFormId(null);
        window.dispatchEvent(new Event('google-form-banner-updated'));
      }

      if (selectedFormForResponses === formId) {
        setSelectedFormForResponses(null);
        setResponsesSummary(null);
      }

      if (triggerToast) triggerToast(
        language === 'hi' ? 'रिकॉर्ड रिमूव किया गया।' : 'Google form record removed from local listing.',
        'success'
      );
    }
  };

  // Submit Handler for Modal Create Coupon
  const handleModalCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalCouponCode || !modalCouponDiscount) return;
    const cleanCode = modalCouponCode.trim().toUpperCase();

    if (coupons.some(c => c.code.toUpperCase() === cleanCode)) {
      if (triggerToast) triggerToast(
        language === 'hi' ? 'यह कूपन कोड पहले से मौजूद है।' : 'This coupon code already exists.',
        'err'
      );
      return;
    }

    const discountVal = parseFloat(modalCouponDiscount);
    if (isNaN(discountVal) || discountVal <= 0) {
      if (triggerToast) triggerToast(
        language === 'hi' ? 'कृपया मान्य डिस्काउंट राशि दर्ज करें।' : 'Please enter a valid discount amount.',
        'err'
      );
      return;
    }

    const minOrderVal = parseFloat(modalCouponMinOrder) || 0;

    const newCouponItem = {
      code: cleanCode,
      discount: discountVal,
      description: modalCouponDesc || 'Storewide promotional discount',
      minOrder: minOrderVal,
      expiryDate: modalCouponExpiry || undefined,
      usageCount: 0,
      status: 'Active' as const
    };

    const updated = [newCouponItem, ...coupons];
    saveCoupons(updated);

    // Reset fields
    setModalCouponCode('');
    setModalCouponDiscount('');
    setModalCouponDesc('');
    setModalCouponMinOrder('299');
    setModalCouponExpiry('2026-06-30');
    setShowCreateCouponModal(false);

    if (triggerToast) triggerToast(
      language === 'hi' ? `कूपन ${cleanCode} सफलतापूर्वक बनाया गया!` : `Coupon ${cleanCode} has been successfully created!`,
      'success'
    );
  };

  // Background check to automatically mark expired coupons as 'Inactive'
  React.useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let updated = false;
    const checkedCoupons = coupons.map(c => {
      if (c.expiryDate) {
        const exp = new Date(c.expiryDate);
        exp.setHours(0, 0, 0, 0);
        if (!isNaN(exp.getTime()) && exp < today) {
          if ((c as any).status !== 'Inactive') {
            updated = true;
            return {
              ...c,
              status: 'Inactive' as const
            };
          }
        }
      }
      return c;
    });

    if (updated) {
      saveCoupons(checkedCoupons);
      if (triggerToast) {
        triggerToast(
          language === 'hi'
            ? 'अवधि समाप्त हो चुके कूपनों को स्वचालित रूप से निष्क्रिय (Inactive) चिह्नित किया गया है।'
            : 'Expired coupons have been automatically marked as Inactive in localStorage.',
          'info'
        );
      }
    }
  }, []);
  
  // Loading & Action state
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Form inputs for Add/Edit product
  const [isEditingProduct, setIsEditingProduct] = React.useState<boolean>(false);
  const [editingProdId, setEditingProdId] = React.useState<number | null>(null);
  const [prodForm, setProdForm] = React.useState({
    name: '',
    description: '',
    category: 'flavored',
    image: '',
    mrp: '',
    price: '',
    stock: '100'
  });

  // Modal controls
  const [showProductModal, setShowProductModal] = React.useState(false);
  
  // Focus variables
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [orderStatusForm, setOrderStatusForm] = React.useState('Pending');
  const [trackingForm, setTrackingForm] = React.useState('');

  // Fetch admin bundle
  const fetchAdminBundle = async () => {
    if (!token) return;
    setLoading(true);
    setErrorMsg(null);
    try {
      // 1. Fetch products
      const pRes = await fetch('/api/products');
      const pData = await pRes.json();
      setProductsList(pData);

      // 2. Fetch admin orders
      const oRes = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const oData = await oRes.json();
      setOrdersList(oData);

      // 3. Fetch admin customers
      const cRes = await fetch('/api/admin/customers', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const cData = await cRes.json();
      setCustomersList(cData);

      // 4. Fetch admin reports
      const rRes = await fetch('/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const rData = await rRes.json();
      setReportsData(rData);

    } catch (err: any) {
      console.error(err);
      setErrorMsg('Unauthorized or failed to connect to admin APIs.');
    } finally {
      setLoading(false);
    }
  };

  // Silent fetch of orders list to detect new entries
  const fetchOrdersSilent = async () => {
    if (!token) return;
    try {
      const oRes = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!oRes.ok) return;
      const oData = await oRes.json();
      
      setOrdersList(prevOrders => {
        // Only run comparison if we have previously loaded orders and there is a transition
        if (prevOrders && prevOrders.length > 0) {
          const prevIds = new Set(prevOrders.map(o => o.id));
          const newOrders = oData.filter((o: Order) => !prevIds.has(o.id));
          
          if (newOrders.length > 0) {
            // New orders detected!
            newOrders.forEach((o: Order) => {
              // Trigger app-level toast
              if (triggerToast) {
                triggerToast(
                  language === 'hi'
                    ? `🔔 नया ऑर्डर प्राप्त हुआ! ${o.fullName} द्वारा ₹${o.totalAmount} का ऑर्डर #${o.id}`
                    : `🔔 New Order received! Order #${o.id} placed by ${o.fullName} for ₹${o.totalAmount}`,
                  'success'
                );
              }
              
              // Add to local admin console notifications
              setNotifications(prev => [
                {
                  id: o.id,
                  message: language === 'hi'
                    ? `${o.fullName} ने ₹${o.totalAmount} का नया ऑर्डर #${o.id} दिया`
                    : `Order #${o.id} for ₹${o.totalAmount} placed by ${o.fullName}`,
                  timestamp: new Date().toLocaleTimeString(),
                  unread: true
                },
                ...prev
              ]);
            });

            // Play a soft dynamic synth chime
            try {
              const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = 'sine';
              osc.frequency.setValueAtTime(880, audioCtx.currentTime); // A5 note
              gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
              gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.4);
              osc.start();
              osc.stop(audioCtx.currentTime + 0.45);
            } catch (e) {
              // ignore audio failures gracefully
            }

            // Silently update reports too
            fetchReportsSilent();
          }
        }
        return oData;
      });
    } catch (err) {
      console.error("Silent order fetch error:", err);
    }
  };

  const fetchReportsSilent = async () => {
    if (!token) return;
    try {
      const rRes = await fetch('/api/admin/reports', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (rRes.ok) {
        const rData = await rRes.json();
        setReportsData(rData);
      }
    } catch (err) {
      console.error("Silent reports fetch error:", err);
    }
  };

  React.useEffect(() => {
    fetchAdminBundle();

    // Start silent order checking loop every 8 seconds
    const intervalId = setInterval(() => {
      fetchOrdersSilent();
    }, 8000);

    return () => clearInterval(intervalId);
  }, [token]);

  // Handle product edit trigger
  const handleOpenEditProduct = (p: Product) => {
    setIsEditingProduct(true);
    setEditingProdId(p.id);
    setProdForm({
      name: p.name,
      description: p.description,
      category: p.category,
      image: p.image,
      mrp: String(p.mrp),
      price: String(p.price),
      stock: String(p.stock)
    });
    setShowProductModal(true);
  };

  // Open empty product form
  const handleOpenCreateProduct = () => {
    setIsEditingProduct(false);
    setEditingProdId(null);
    setProdForm({
      name: '',
      description: '',
      category: 'flavored',
      image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop',
      mrp: '',
      price: '',
      stock: '100'
    });
    setShowProductModal(true);
  };

  // Submit product
  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const endpoint = isEditingProduct 
      ? `/api/admin/products/${editingProdId}` 
      : '/api/admin/products';
    
    const method = isEditingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(prodForm)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit product data.');

      setShowProductModal(false);
      fetchAdminBundle(); // reload logs
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this product? This action is irreversible.')) return;
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product.');
      
      fetchAdminBundle();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Delete Order record from backend
  const handleDeleteOrder = async (id: number) => {
    if (!window.confirm(language === 'hi' ? 'क्या आप वाकई इस ऑर्डर रिकॉर्ड को स्थायी रूप से हटाना चाहते हैं?' : 'Are you sure you want to permanently delete this order record? This cannot be undone.')) return;
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete order record.');
      
      if (triggerToast) {
        triggerToast(
          language === 'hi' ? 'ऑर्डर सफलतापूर्वक हटा दिया गया है!' : 'Order record deleted successfully!',
          'success'
        );
      }
      fetchAdminBundle();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  // Order status update trigger
  const handleSelectOrder = (o: Order) => {
    setSelectedOrder(o);
    setOrderStatusForm(o.status);
    setTrackingForm(o.trackingNumber || '');
  };

  const handleSubmitOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: orderStatusForm,
          trackingNumber: trackingForm
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      setSelectedOrder(null);
      fetchAdminBundle();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-amber-950/40 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
      <div className="bg-neutral-50 rounded-2xl shadow-2xl w-full max-w-7xl min-h-[90vh] md:min-h-0 flex flex-col overflow-hidden max-h-[95vh] border border-amber-100">
        
        {/* Header Bar */}
        <div className="bg-amber-900 text-white py-4 px-6 flex justify-between items-center border-b border-amber-800">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-amber-300" />
            <div>
              <h2 className="text-lg font-bold font-serif">Aditya Nutra Farm Admin Console</h2>
              <p className="text-[10px] text-amber-200 uppercase tracking-widest font-semibold">Store Management & Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3 relative" id="admin-header-actions-box">
            {/* Real-time Order Alerts Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotificationsMenu(!showNotificationsMenu);
                  // Mark all as read when opening/viewing the menu
                  setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                }}
                className={`p-1.5 hover:bg-white/10 rounded-full transition-all relative cursor-pointer ${
                  notifications.some(n => n.unread) ? 'animate-bounce text-amber-300' : 'text-white'
                }`}
                title={language === 'hi' ? "ऑर्डर सूचनाएं" : "Real-time Order Alerts"}
                id="admin-notification-bell-btn"
              >
                <Bell size={18} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-0.5 right-0.5 bg-rose-600 outline outline-1 outline-amber-900 rounded-full w-2.5 h-2.5 animate-pulse" />
                )}
              </button>

              {/* Real-time Notifications Dropdown */}
              {showNotificationsMenu && (
                <div className="absolute right-0 mt-2.5 w-76 bg-white rounded-xl shadow-xl border border-amber-100 text-amber-950 z-[9999] overflow-hidden text-xs" id="admin-notification-dropdown">
                  <div className="bg-amber-50 px-4 py-2.5 border-b border-amber-100 flex items-center justify-between font-serif font-bold text-amber-900">
                    <span>{language === 'hi' ? "ऑर्डर अलर्ट" : "Live Order Alerts"}</span>
                    <div className="flex gap-2">
                      {notifications.length > 0 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setNotifications([]);
                          }}
                          className="text-[10px] text-rose-700 hover:underline cursor-pointer bg-transparent border-none p-0"
                        >
                          {language === 'hi' ? "साफ़ करें" : "Clear"}
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowNotificationsMenu(false);
                        }}
                        className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none p-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="max-h-60 overflow-y-auto divide-y divide-amber-50">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-400 py-6" id="empty-notifications-msg">
                        <span className="block text-lg mb-1 animate-pulse">🛎️</span>
                        {language === 'hi'
                          ? "अभी तक कोई नया ऑर्डर नहीं मिला है।"
                          : "Listening for real-time orders..."}
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          onClick={() => {
                            setActiveSubTab('orders');
                            setShowNotificationsMenu(false);
                            // Highlight and focus the order
                            const match = ordersList.find(o => o.id === n.id);
                            if (match) handleSelectOrder(match);
                          }}
                          className="p-3 hover:bg-amber-50/50 transition-colors cursor-pointer flex flex-col gap-1 text-[11px]"
                          id={`notification-item-${n.id}`}
                        >
                          <div className="flex justify-between items-start">
                            <span className="font-semibold text-amber-900">
                              {language === 'hi' ? `ऑर्डर #${n.id}` : `Order #${n.id}`}
                            </span>
                            <span className="text-[9px] text-gray-400 font-mono">{n.timestamp}</span>
                          </div>
                          <p className="text-gray-600 leading-normal">{n.message}</p>
                          <span className="text-[9px] text-[#D4AF37] font-semibold mt-0.5 hover:underline">
                            {language === 'hi' ? "डिस्पैच प्रबंधित करें →" : "Manage dispatch →"}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                  {notifications.length > 0 && (
                    <div className="p-2 border-t border-amber-100 bg-neutral-50/80 text-center text-[10px] text-gray-500 font-medium">
                      {language === 'hi' ? "ऑर्डर शिपमेंट प्रबंधित करने के लिए क्लिक करें" : "Click order to open dispatch details"}
                    </div>
                  )}
                </div>
              )}
            </div>

            <button 
              onClick={fetchAdminBundle}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={18} />
            </button>
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Console Nav Tabs */}
        <div className="bg-white border-b border-amber-100 flex flex-nowrap overflow-x-auto text-xs md:text-sm font-semibold tracking-wide text-amber-950">
          {[
            { id: 'reports', label: 'Telemetry & Reports', icon: <BarChart3 size={15} /> },
            { id: 'products', label: 'Inventory & Products', icon: <Package size={15} /> },
            { id: 'orders', label: 'Customer Orders', icon: <ShoppingBag size={15} /> },
            { id: 'customers', label: 'Registered Customers', icon: <Users size={15} /> },
            { id: 'coupons', label: 'Coupon Management', icon: <Gift size={15} /> },
            { id: 'forms', label: 'Google Forms Survey', icon: <FileText size={15} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setErrorMsg(null);
              }}
              className={`flex items-center gap-2 py-4 px-6 border-b-2 transition-all cursor-pointer ${
                activeSubTab === tab.id 
                  ? 'border-amber-600 bg-amber-50/40 text-amber-900 font-bold' 
                  : 'border-transparent text-amber-900/60 hover:text-amber-700 hover:bg-neutral-100/30'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Main Content Area */}
        <div className="flex-grow p-6 overflow-y-auto">
          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 border-l-4 border-red-500 rounded-r-xl flex items-center gap-3 text-sm">
              <AlertTriangle className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center p-12 gap-3 min-h-[300px]">
              <div className="w-10 h-10 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-amber-900/70 text-xs font-semibold uppercase tracking-wider">Syncing Admin Records...</p>
            </div>
          ) : (
            <>
              {/* SUB TAB: REPORTS & ANALYTICS */}
              {activeSubTab === 'reports' && reportsData && (
                <div className="space-y-6">
                  {/* Grid Counters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700">Gross Sales</span>
                        <h4 className="text-2xl font-bold text-amber-950 font-sans mt-1">₹{reportsData.totalRevenue}</h4>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-0.5">
                          <ArrowUpRight size={10} /> 100% verified payouts
                        </div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                        <IndianRupee size={24} />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700">Lifetime Orders</span>
                        <h4 className="text-2xl font-bold text-amber-950 font-sans mt-1">{reportsData.totalOrders}</h4>
                        <div className="text-[10px] text-amber-600 font-semibold mt-1">COD & Gateway sales</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                        <ShoppingBag size={24} />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700">Client Directory</span>
                        <h4 className="text-2xl font-bold text-amber-950 font-sans mt-1">{reportsData.registeredUsers}</h4>
                        <div className="text-[10px] text-emerald-600 font-semibold mt-1">Secure Firebase Auth logins</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                        <Users size={24} />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[11px] uppercase font-bold tracking-wider text-amber-700">Unique Offerings</span>
                        <h4 className="text-2xl font-bold text-amber-950 font-sans mt-1">{reportsData.productVarieties}</h4>
                        <div className="text-[10px] text-amber-600 font-semibold mt-1">Gourmet varieties</div>
                      </div>
                      <div className="p-3 bg-amber-50 rounded-xl text-amber-700">
                        <Package size={24} />
                      </div>
                    </div>
                  </div>

                  {/* Category Breakdown Charts */}
                  <div className="bg-white rounded-2xl p-6 border border-amber-100 shadow-sm">
                    <h3 className="text-amber-950 font-serif font-bold text-base mb-4">Stock Breakdown by Category</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                      {reportsData.categoryBreakdown?.map((cat: any, idx: number) => (
                        <div key={idx} className="bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                          <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">
                            {cat.category === 'raw-makhana' || cat.category === 'raw' ? 'Raw Makhana' : 
                             cat.category === 'flavoured-makhana' || cat.category === 'flavored' ? 'Flavoured Makhana' :
                             cat.category === 'health-nutrition' ? 'Health & Nutrition' :
                             cat.category === 'dry-fruit-mixes' ? 'Dry Fruit Mixes' :
                             cat.category === 'gift-packs' ? 'Gift Packs' :
                             cat.category === 'combo-packs' ? 'Combo Packs' :
                             cat.category === 'premium-collection' ? 'Premium Collection' :
                             cat.category === 'cashews' ? 'Dry Roasted Cashews' : 'California Almonds'}
                          </span>
                          <div className="text-xl font-bold text-amber-950 mt-1">{cat.count} Varieties</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quick summary check */}
                  <div className="bg-amber-800 text-white rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div>
                      <h4 className="font-serif font-bold text-lg">Direct Bihar Farmer Sourcing Integrity Validated</h4>
                      <p className="text-xs text-amber-100 max-w-xl mt-1">This console connects to a live PostgreSQL relational instance. Total gross analytics and inventory quantities are managed with absolute strict state locking.</p>
                    </div>
                    <div className="bg-amber-700/60 text-xs px-4 py-2 border border-amber-500 rounded-lg shrink-0 font-mono">
                      Database: Live PostgreSQL
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: PRODUCTS / INVENTORY */}
              {activeSubTab === 'products' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-amber-950 font-serif font-bold text-base">Active Store Inventory List</h3>
                    <button
                      onClick={handleOpenCreateProduct}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      <Plus size={14} /> Add New Snack Variety
                    </button>
                  </div>

                  {/* Products Table */}
                  <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                      <thead>
                        <tr className="bg-amber-50 font-bold text-amber-900 border-b border-amber-100 text-xs uppercase tracking-wider">
                          <th className="py-4 px-6">Snack Variant</th>
                          <th className="py-4 px-6">Category</th>
                          <th className="py-4 px-6">MRP</th>
                          <th className="py-4 px-6">Selling Offer</th>
                          <th className="py-4 px-6 text-center">In Stock</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 text-sm text-amber-950">
                        {productsList.map((p) => (
                          <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="py-3 px-6 font-medium flex items-center gap-3">
                              <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center font-bold text-xs text-amber-800">
                                {p.name[0]}
                              </span>
                              <span>{p.name}</span>
                            </td>
                            <td className="py-3 px-6 text-xs font-semibold capitalize text-amber-700">
                              {p.category}
                            </td>
                            <td className="py-3 px-6 font-mono text-gray-400">
                              ₹{p.mrp}
                            </td>
                            <td className="py-3 px-6 font-mono font-bold text-amber-900">
                              ₹{p.price}
                            </td>
                            <td className="py-3 px-6 text-center font-semibold">
                              <span className={`px-2 py-1 rounded text-xs ${
                                p.stock <= 10 
                                  ? 'bg-rose-50 text-rose-700' 
                                  : 'bg-emerald-50 text-emerald-700'
                              }`}>
                                {p.stock} units
                              </span>
                            </td>
                            <td className="py-3 px-6 text-right flex justify-end gap-1.5">
                              <button
                                onClick={() => handleOpenEditProduct(p)}
                                className="p-1.5 hover:bg-amber-50 text-amber-700 rounded transition-colors"
                                title="Edit Item Details"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteProduct(p.id)}
                                className="p-1.5 hover:bg-red-50 text-red-600 rounded transition-colors"
                                title="Remove Variant"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: CUSTOMER ORDERS */}
              {activeSubTab === 'orders' && (
                <div className="space-y-4">
                  <h3 className="text-amber-950 font-serif font-bold text-base">Client Payout & Shipment Records</h3>
                  
                  {/* Orders Grid layout */}
                  <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                      <thead>
                        <tr className="bg-amber-50 font-bold text-amber-900 border-b border-amber-100 text-xs uppercase tracking-wider">
                          <th className="py-4 px-6">Order Ref</th>
                          <th className="py-4 px-6">Customer Details</th>
                          <th className="py-4 px-6">Sourcing Address</th>
                          <th className="py-4 px-6">Total Value</th>
                          <th className="py-4 px-6">Paid Via</th>
                          <th className="py-4 px-6">Shipment Status</th>
                          <th className="py-4 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 text-sm text-amber-950">
                        {ordersList.map((o) => (
                          <tr key={o.id} className="hover:bg-neutral-50/50 transition-colors">
                            <td className="py-4 px-6 font-mono text-xs font-bold text-amber-800">
                              #{o.id}
                            </td>
                            <td className="py-4 px-6">
                              <div className="font-semibold">{o.fullName}</div>
                              <div className="text-[10px] text-gray-500">{o.email} • {o.phone}</div>
                            </td>
                            <td className="py-4 px-6 text-xs max-w-xs truncate">
                              {o.address}, {o.city}, {o.state} - {o.zipCode}
                            </td>
                            <td className="py-4 px-6 font-mono font-bold">
                              ₹{o.totalAmount}
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold">
                              <span className={`px-2 py-0.5 rounded ${
                                o.paymentMethod === 'Razorpay' 
                                  ? 'bg-blue-50 text-blue-700' 
                                  : 'bg-neutral-100 text-neutral-700'
                              }`}>
                                {o.paymentMethod}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-xs font-semibold">
                              <span className={`px-2.5 py-1 rounded-full ${
                                o.status === 'Completed' 
                                  ? 'bg-emerald-50 text-emerald-700' 
                                  : o.status === 'Shipped' 
                                  ? 'bg-indigo-50 text-indigo-700 font-semibold' 
                                  : o.status === 'Paid' 
                                  ? 'bg-blue-50 text-blue-700 font-bold' 
                                  : 'bg-amber-50 text-amber-700'
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  onClick={() => handleSelectOrder(o)}
                                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-semibold py-1.5 px-3 rounded-lg border border-amber-200 transition-colors cursor-pointer"
                                >
                                  Dispatch Manager
                                </button>
                                <button
                                  onClick={() => handleDeleteOrder(o.id)}
                                  className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors border-none bg-transparent cursor-pointer flex items-center justify-center"
                                  title={language === 'hi' ? "ऑर्डर हटाएं" : "Delete Order Record"}
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: REGISTERED CUSTOMERS */}
              {activeSubTab === 'customers' && (
                <div className="space-y-4">
                  <h3 className="text-amber-950 font-serif font-bold text-base">Client Registrations Directory</h3>
                  <div className="bg-white rounded-2xl border border-amber-100 overflow-hidden shadow-sm">
                    <table className="w-full text-left border-collapse min-w-[500px]">
                      <thead>
                        <tr className="bg-amber-50 font-bold text-amber-900 border-b border-amber-100 text-xs uppercase tracking-wider">
                          <th className="py-4 px-6">Customer Unique ID</th>
                          <th className="py-4 px-6">Primary Name</th>
                          <th className="py-4 px-6">Registered Email</th>
                          <th className="py-4 px-6 text-center">Credentials Role</th>
                          <th className="py-4 px-6 text-right">Joined on</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-amber-100 text-sm text-amber-950">
                        {customersList.map((c) => (
                          <tr key={c.id}>
                            <td className="py-3.5 px-6 font-mono text-xs text-gray-500">
                              {c.uid}
                            </td>
                            <td className="py-3.5 px-6 font-semibold flex items-center gap-2">
                              {c.avatarUrl ? (
                                <img src={c.avatarUrl} alt={c.fullName || ''} className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs flex items-center justify-center font-bold">
                                  {c.fullName ? c.fullName[0].toUpperCase() : 'U'}
                                </div>
                              )}
                              <span>{c.fullName || 'Anonymous User'}</span>
                            </td>
                            <td className="py-3.5 px-6 text-amber-900">
                              {c.email}
                            </td>
                            <td className="py-3.5 px-6 text-center">
                              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                                c.role === 'admin' 
                                  ? 'bg-rose-50 text-rose-700 border border-rose-150' 
                                  : 'bg-green-50 text-green-700'
                              }`}>
                                {c.role}
                              </span>
                            </td>
                            <td className="py-3.5 px-6 text-right font-mono text-xs text-gray-400">
                              {new Date(c.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUB TAB: COUPON MANAGEMENT SYSTEM */}
              {activeSubTab === 'coupons' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h3 className="text-amber-950 font-serif font-bold text-lg select-all">Voucher & Promo Code Repository</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Define coupons, discounts, minimum order parameters, and track checkout campaign offerings.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-100 text-[11px] text-amber-900 font-bold uppercase tracking-wider">
                      <Tag size={13} className="text-[#D4AF37]" />
                      <span>{coupons.length} Active Codes</span>
                    </div>
                  </div>

                  {/* Coupon Stat Metrics widgets */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[#A37B24]">Standard Coupons</span>
                        <h5 className="text-xl font-bold font-sans text-amber-950 mt-1">{coupons.filter(c => c.discount <= 100).length} Standard</h5>
                        <p className="text-[9px] text-gray-400 mt-0.5">Fixed discounts under ₹100</p>
                      </div>
                      <div className="p-2.5 bg-neutral-50 rounded-xl text-amber-800">
                        <Percent size={18} />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-rose-700">Festival Bonanzas</span>
                        <h5 className="text-xl font-bold font-sans text-amber-950 mt-1">{coupons.filter(c => c.discount > 100).length} Premium</h5>
                        <p className="text-[9px] text-gray-400 mt-0.5">Campaign values & festival promos</p>
                      </div>
                      <div className="p-2.5 bg-rose-50/50 rounded-xl text-rose-700">
                        <Gift size={18} />
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-sm flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Top Cash Discount</span>
                        <h5 className="text-xl font-bold font-sans text-amber-950 mt-1">
                          ₹{coupons.length > 0 ? Math.max(...coupons.map(c => c.discount)) : 0} Off
                        </h5>
                        <p className="text-[9px] text-gray-400 mt-0.5">Maximum saving configuration</p>
                      </div>
                      <div className="p-2.5 bg-emerald-50 rounded-xl text-emerald-700">
                        <IndianRupee size={18} />
                      </div>
                    </div>
                  </div>

                  {/* GLOBAL FESTIVE CAMPAIGN THEME OVERRIDE SETTINGS (Admin Only) */}
                  <div className="bg-gradient-to-r from-amber-950 to-neutral-900 text-white p-5 rounded-2xl border border-amber-500/30 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-lg">✨</span>
                        <h4 className="font-serif font-black text-amber-200 text-xs sm:text-sm uppercase tracking-wider">
                          {language === 'hi' ? 'ग्लोबल उत्सव ऑफर थीम नियंत्रण' : 'Global Festive Theme Override Setting'}
                        </h4>
                        <span className="bg-[#D4AF37] text-black text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded leading-none">
                          Admin ONLY
                        </span>
                      </div>
                      <p className="text-[10.5px] leading-relaxed text-amber-100/80 max-w-xl">
                        {language === 'hi'
                          ? 'यहाँ से आप सीधे मुख्य उत्सव ऑफर को बदल सकते हैं (दिवाली, होली, नव वर्ष या मौसम आदि)। इससे सामान्य ग्राहकों के लिए फ्रंटएंड बैनर और नियम तुरंत बदल जाएंगे।'
                          : 'Override the currently live festival season theme across the entire application. Selecting a season option forces the floating checkout offers to adjust immediately.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 bg-black/40 border border-white/5 rounded-xl p-1.5 shrink-0 w-full md:w-auto">
                      <select
                        value={activeFestiveSeasonOverride}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'auto') {
                            localStorage.removeItem('an_active_festive_season');
                          } else {
                            localStorage.setItem('an_active_festive_season', val);
                          }
                          setActiveFestiveSeasonOverride(val);
                          window.dispatchEvent(new Event('festive-override-updated'));
                          if (triggerToast) {
                            triggerToast(
                              language === 'hi'
                                ? 'उत्सव अभियान की थीम सफलतापूर्वक परिवर्तित की गई!'
                                : 'Festive campaign theme overridden successfully!',
                              'success'
                            );
                          }
                        }}
                        className="bg-neutral-900 border border-white/10 text-[#D4AF37] font-sans font-bold text-xs rounded-lg p-2 outline-none focus:border-[#D4AF37] cursor-pointer w-full md:w-[190px]"
                      >
                        <option value="auto">⏱️ {language === 'hi' ? 'स्वचालित (समय आधारित)' : 'Auto (Date Base)'}</option>
                        <option value="monsoon">☔ {language === 'hi' ? 'मानसून ऑफर (₹120)' : 'Monsoon Harvest (₹120)'}</option>
                        <option value="diwali">🪔 {language === 'hi' ? 'ग्रैंड दिवाली (₹150)' : 'Grand Diwali (₹150)'}</option>
                        <option value="holi">🎨 {language === 'hi' ? 'होली उत्सव (₹100)' : 'Holi Colors (₹100)'}</option>
                        <option value="chhath">🌾 {language === 'hi' ? 'छठ पूजा स्पेशल (₹85)' : 'Chhath Puja Special (₹85)'}</option>
                        <option value="newyear">🥳 {language === 'hi' ? 'नव वर्ष सेहत सेल (₹90)' : 'New Year Special (₹90)'}</option>
                      </select>
                    </div>
                  </div>

                  {/* COUPON PERFORMANCE ANALYTICS CHART & LEADERBOARD */}
                  <div className="bg-white p-5 rounded-2xl border border-amber-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-neutral-100 pb-3">
                      <BarChart3 className="text-[#D4AF37]" size={18} />
                      <div>
                        <h4 className="font-serif font-black text-amber-950 text-sm">
                          {language === 'hi' ? 'कूपन लोकप्रियता और रिडेम्पशन विश्लेषण' : 'Promo Coupon Redemption & Popularity Analytics'}
                        </h4>
                        <p className="text-[10px] text-gray-500 font-sans">
                          {language === 'hi'
                            ? 'आपके द्वारा जारी किए गए कूपनों का लाइव उपयोग विश्लेषण।'
                            : 'Live comparison of active coupon codes by their absolute usage counts to inspect campaign reach.'}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                      {/* Left: Recharts Bar Chart */}
                      <div className="lg:col-span-8 h-[220px] w-full" id="coupon-performance-chart-container">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={coupons
                              .map(c => ({
                                code: c.code,
                                usage: c.usageCount || 0,
                                discount: c.discount,
                              }))
                              .sort((a, b) => b.usage - a.usage)
                              .slice(0, 10)}
                            margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                            <XAxis
                              dataKey="code"
                              tick={{ fill: '#78350f', fontSize: 10, fontWeight: 700 }}
                              axisLine={{ stroke: '#fef3c7' }}
                              tickLine={false}
                            />
                            <YAxis
                              tick={{ fill: '#6b7280', fontSize: 9 }}
                              axisLine={{ stroke: '#fef3c7' }}
                              tickLine={false}
                              allowDecimals={false}
                            />
                            <Tooltip
                              content={({ active, payload }) => {
                                if (active && payload && payload.length) {
                                  const data = payload[0].payload;
                                  return (
                                    <div className="bg-stone-900 text-stone-150 p-2.5 rounded-xl border border-stone-800 shadow-lg text-[10px] font-sans">
                                      <p className="font-mono font-black text-amber-400">🎫 {data.code}</p>
                                      <p className="text-white mt-1 font-bold">
                                        {language === 'hi' ? 'उपयोग:' : 'Redemptions:'} <span className="text-emerald-400 font-mono text-xs">{data.usage}</span>
                                      </p>
                                      <p className="text-gray-400">
                                        {language === 'hi' ? 'छूट:' : 'Discount Value:'} ₹{data.discount}
                                      </p>
                                    </div>
                                  );
                                }
                                return null;
                              }}
                            />
                            <Bar dataKey="usage" radius={[6, 6, 0, 0]}>
                              {(coupons
                                .map(c => ({
                                  code: c.code,
                                  usage: c.usageCount || 0,
                                  discount: c.discount,
                                }))
                                .sort((a, b) => b.usage - a.usage)
                                .slice(0, 10)).map((entry, index) => {
                                // Dynamic theme color based on index or usage count
                                const colors = ['#A37B24', '#D4AF37', '#92400e', '#b45309', '#d97706', '#f59e0b', '#fbbf24'];
                                const fillC = colors[index % colors.length];
                                return <Cell key={`cell-${index}`} fill={fillC} />;
                              })}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Right: Leaderboard Stats */}
                      <div className="lg:col-span-4 bg-amber-50/40 border border-amber-100 p-4 rounded-xl space-y-3">
                        <h5 className="font-serif font-bold text-amber-950 text-xs uppercase tracking-wider flex items-center justify-between border-b border-amber-100/60 pb-2">
                          <span>🏆 {language === 'hi' ? 'शीर्ष प्रदर्शनकारी' : 'Campaign Leaders'}</span>
                          <span className="text-[9px] text-[#A37B24] font-mono leading-none">by usage</span>
                        </h5>
                        <ul className="space-y-2 text-xs">
                          {coupons
                            .map(c => ({
                              code: c.code,
                              usage: c.usageCount || 0,
                              discount: c.discount,
                            }))
                            .sort((a, b) => b.usage - a.usage)
                            .slice(0, 3).map((item, idx) => (
                              <li key={item.code} className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-amber-100/50">
                                <div className="flex items-center gap-2">
                                  <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                                    idx === 0 ? 'bg-[#D4AF37] text-amber-950' : idx === 1 ? 'bg-stone-200 text-stone-800' : 'bg-amber-100 text-amber-900'
                                  }`}>
                                    {idx + 1}
                                  </span>
                                  <span className="font-mono font-bold text-amber-950">{item.code}</span>
                                </div>
                                <span className="font-mono font-black text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 text-[10px]">
                                  {item.usage} Usages
                                </span>
                              </li>
                            ))}
                          {coupons.length === 0 && (
                            <li className="text-gray-400 text-center py-4 text-[10px]">
                              No coupon usages registered yet.
                            </li>
                          )}
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Two Column Workspace */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Left Column: Create Coupon Form */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-amber-100 shadow-sm h-fit">
                      <h4 className="font-serif font-bold text-amber-950 text-sm mb-3.5 flex items-center gap-1.5 border-b border-neutral-100 pb-2">
                        <Plus size={15} className="text-[#D4AF37]" />
                        <span>Assemble Promo Code</span>
                      </h4>

                      <form onSubmit={handleAddCoupon} className="space-y-3.5 text-xs">
                        <div>
                          <label className="block text-amber-950 font-semibold mb-1 uppercase tracking-wide">
                            Coupon Code Identifier
                          </label>
                          <input
                            type="text"
                            required
                            id="admin-coupon-code-input"
                            value={newCouponCode}
                            onChange={(e) => setNewCouponCode(e.target.value.replace(/\s+/g, ''))}
                            placeholder="E.g., FESTIVE100"
                            className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case font-bold"
                          />
                          <p className="text-[9px] text-gray-400 mt-1">Alpha-numeric promo slug applied during checkout.</p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-amber-950 font-semibold mb-1 uppercase tracking-wide">
                              Discount (₹)
                            </label>
                            <input
                              type="number"
                              required
                              id="admin-coupon-discount-input"
                              value={newCouponDiscount}
                              onChange={(e) => setNewCouponDiscount(e.target.value)}
                              placeholder="E.g., 100"
                              className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans font-bold"
                            />
                          </div>
                          <div>
                            <label className="block text-amber-950 font-semibold mb-1 uppercase tracking-wide">
                              Min Order (₹)
                            </label>
                            <input
                              type="number"
                              id="admin-coupon-min-order-input"
                              value={newCouponMinOrder}
                              onChange={(e) => setNewCouponMinOrder(e.target.value)}
                              placeholder="E.g., 299"
                              className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                            />
                          </div>
                        </div>

                        {/* Expiry Date Field */}
                        <div>
                          <label className="block text-amber-950 font-semibold mb-1 uppercase tracking-wide flex items-center gap-1">
                            <Calendar size={12} className="text-[#D4AF37]" />
                            <span>Expiry Date</span>
                          </label>
                          <input
                            type="date"
                            required
                            id="admin-coupon-expiry-input"
                            value={newCouponExpiry}
                            onChange={(e) => setNewCouponExpiry(e.target.value)}
                            className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans font-bold text-gray-700"
                          />
                          <p className="text-[9px] text-gray-400 mt-1">Specify date when coupon transitions to invalid/expired.</p>
                        </div>

                        <div>
                          <label className="block text-amber-950 font-semibold mb-1 uppercase tracking-wide">
                            Promotional Description
                          </label>
                          <textarea
                            rows={3}
                            id="admin-coupon-desc-input"
                            value={newCouponDesc}
                            onChange={(e) => setNewCouponDesc(e.target.value)}
                            placeholder="E.g., Special ₹100 off on our seasonal spiced ghee roasted phool makhana variants. Direct-to-home crop deal."
                            className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 leading-normal"
                          />
                        </div>

                        <button
                          type="submit"
                          id="admin-create-coupon-btn"
                          className="w-full bg-[#0E1013] hover:bg-[#1A1D24] text-[#D4AF37] border border-[#D4AF37]/30 py-2.5 rounded-xl font-bold uppercase tracking-wider transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                          <Plus size={14} />
                          <span>Activate Promo Code</span>
                        </button>
                      </form>
                    </div>

                    {/* Right Column: Active Coupons list presented as a pristine high-contrast data table */}
                    <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-amber-100 shadow-sm min-h-[300px]">
                      <div className="flex items-center justify-between border-b border-neutral-100 pb-3 mb-4">
                        <div className="flex items-center gap-3">
                          <h4 className="font-serif font-bold text-amber-950 text-sm flex items-center gap-1.5">
                            <Tag size={15} className="text-[#D4AF37]" />
                            <span>Interactive Coupons Table</span>
                          </h4>
                          <button
                            type="button"
                            onClick={() => setShowCreateCouponModal(true)}
                            id="admin-trigger-add-coupon-modal-btn"
                            className="bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer border border-amber-200 transition-all shadow-sm"
                          >
                            <Plus size={11} className="text-amber-700" />
                            <span>{language === 'hi' ? 'नया कूपन' : 'Create Coupon'}</span>
                          </button>
                          {selectedCoupons.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(language === 'hi' ? `क्या आप इन ${selectedCoupons.length} चयनित कूपनों को हटाना चाहते हैं?` : `Are you sure you want to delete the selected ${selectedCoupons.length} coupons?`)) {
                                  const updated = coupons.filter(c => !selectedCoupons.includes(c.code.toUpperCase()));
                                  saveCoupons(updated);
                                  setSelectedCoupons([]);
                                  if (triggerToast) triggerToast(
                                    language === 'hi' ? 'चयनित कूपन हटा दिए गए हैं।' : 'Selected coupons removed successfully.',
                                    'success'
                                  );
                                }
                              }}
                              className="bg-red-600 hover:bg-red-750 text-white font-bold text-[10px] uppercase tracking-wider py-1 px-2.5 rounded-lg flex items-center gap-1 cursor-pointer shadow transition-all"
                            >
                              <Trash2 size={11} />
                              <span>{language === 'hi' ? `चयनित हटाएँ (${selectedCoupons.length})` : `Delete Selected (${selectedCoupons.length})`}</span>
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-[#A37B24] font-mono font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                          {language === 'hi' ? 'आज की तिथि:' : 'Reference Date:'} {new Date().toLocaleDateString(language === 'hi' ? 'hi-IN' : 'en-US')}
                        </span>
                      </div>

                      {coupons.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-gray-400 space-y-2">
                          <Gift size={32} className="opacity-40 text-amber-600" />
                          <p className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest">No promo codes registered</p>
                          <p className="text-[10px] text-gray-400 max-w-xs leading-normal">Construct and publish codes on the left panel to allow custom customer discounts during bag checkouts.</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto border border-neutral-100/80 rounded-xl" id="admin-coupons-table-wrapper">
                          <table className="w-full text-left border-collapse" id="admin-coupons-datatable">
                            <thead>
                              <tr className="bg-neutral-50/75 text-amber-950 font-serif font-bold text-[11px] uppercase tracking-wider border-b border-amber-200/60 select-none">
                                <th className="p-3.5 w-12 text-center">
                                  <input
                                    type="checkbox"
                                    checked={coupons.length > 0 && selectedCoupons.length === coupons.length}
                                    onChange={(e) => {
                                      if (e.target.checked) {
                                        setSelectedCoupons(coupons.map(c => c.code.toUpperCase()));
                                      } else {
                                        setSelectedCoupons([]);
                                      }
                                    }}
                                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
                                    title="Select All Coupons"
                                  />
                                </th>
                                <th className="p-3.5">Promo Slug & Campaign Details</th>
                                <th className="p-3.5">Discounts</th>
                                <th className="p-3.5">Min Spend</th>
                                <th className="p-3.5">Expiry Status</th>
                                <th className="p-3.5 text-center">Usage Count</th>
                                <th className="p-3.5 text-right">Delete</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-neutral-100 text-[11px] font-sans">
                              {coupons.map((coupon) => {
                                // Calculate expiry indicator metrics
                                const d = new Date();
                                const todayStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                                const expStr = coupon.expiryDate;
                                
                                let statusLabel = "Permanent";
                                let badgeColor = "bg-slate-50 text-slate-700 border-slate-200";
                                let dotColor = "bg-slate-400";
                                let animClass = "";
                                let rowHighlightClass = "hover:bg-neutral-50/50 transition-colors";

                                if ((coupon as any).status === 'Inactive') {
                                  statusLabel = language === 'hi' ? 'निष्क्रिय' : 'Inactive';
                                  badgeColor = "bg-stone-100 text-stone-600 border-stone-200";
                                  dotColor = "bg-stone-400";
                                  rowHighlightClass = "bg-stone-50/50 hover:bg-stone-100/55 text-stone-500 opacity-70 border-l-[3px] border-l-stone-400 font-normal transition-colors";
                                } else if (expStr) {
                                  const anchor = new Date(todayStr);
                                  const expiry = new Date(expStr);
                                  anchor.setHours(0,0,0,0);
                                  expiry.setHours(0,0,0,0);

                                  if (isNaN(expiry.getTime())) {
                                    statusLabel = "Active";
                                    badgeColor = "bg-slate-50 text-slate-600 border-slate-200";
                                    dotColor = "bg-slate-500";
                                  } else if (expiry < anchor) {
                                    statusLabel = "Expired";
                                    badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                                    dotColor = "bg-rose-600 animate-pulse";
                                    rowHighlightClass = "bg-red-50/40 hover:bg-red-50/65 text-red-950 border-l-[3px] border-l-red-500 transition-colors";
                                  } else {
                                    const diffMs = expiry.getTime() - anchor.getTime();
                                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
                                    
                                    if (diffDays <= 7) {
                                      statusLabel = `${language === 'hi' ? 'जल्द ही' : 'Soon'} (${diffDays}d left)`;
                                      badgeColor = "bg-amber-50 text-amber-800 border-amber-200";
                                      dotColor = "bg-amber-500";
                                      animClass = "animate-bounce";
                                      rowHighlightClass = "bg-amber-50/35 hover:bg-amber-50/60 text-amber-950 border-l-[3px] border-l-amber-500 transition-colors";
                                    } else {
                                      statusLabel = `${expStr}`;
                                      badgeColor = "bg-emerald-50 text-emerald-800 border-emerald-200";
                                      dotColor = "bg-emerald-500";
                                    }
                                  }
                                }

                                return (
                                  <tr key={coupon.code} className={rowHighlightClass}>
                                    {/* Select Checkbox */}
                                    <td className="p-3.5 w-12 text-center select-none">
                                      <input
                                        type="checkbox"
                                        checked={selectedCoupons.includes(coupon.code.toUpperCase())}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedCoupons(prev => [...prev, coupon.code.toUpperCase()]);
                                          } else {
                                            setSelectedCoupons(prev => prev.filter(code => code !== coupon.code.toUpperCase()));
                                          }
                                        }}
                                        className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer w-4 h-4"
                                      />
                                    </td>
                                    {/* Coupon Details */}
                                    <td className="p-3.5 min-w-[150px]">
                                      <div className="flex flex-col gap-1">
                                        <span className="font-mono font-black text-xs text-amber-950 tracking-wider select-all">
                                          🎟️ {coupon.code}
                                        </span>
                                        <span className="text-[10px] text-gray-500 leading-normal max-w-xs font-normal">
                                          {coupon.description}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Value */}
                                    <td className="p-3.5 whitespace-nowrap">
                                      <span className="font-sans font-bold text-emerald-800 bg-emerald-50/60 px-2 py-1 rounded-md border border-emerald-100 text-xs">
                                        -₹{coupon.discount}
                                      </span>
                                    </td>

                                    {/* Min Order */}
                                    <td className="p-3.5 whitespace-nowrap text-gray-600 font-mono font-semibold">
                                      ₹{coupon.minOrder || 0}
                                    </td>

                                    {/* Expiry status badge column */}
                                    <td className="p-3.5 whitespace-nowrap">
                                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold select-none ${badgeColor} ${animClass}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                                        <span>{statusLabel}</span>
                                      </span>
                                    </td>

                                    {/* Usage count statistics */}
                                    <td className="p-3.5 whitespace-nowrap text-center">
                                      <div className="inline-flex flex-col items-center">
                                        <span className="font-mono text-sm font-bold text-amber-950">
                                          {coupon.usageCount || 0}
                                        </span>
                                        <span className="text-[8.5px] uppercase tracking-wider text-gray-400 font-bold">
                                          {coupon.usageCount === 1 ? 'redemption' : 'redemptions'}
                                        </span>
                                      </div>
                                    </td>

                                    {/* Action button */}
                                    <td className="p-3.5 whitespace-nowrap text-right">
                                      <button
                                        onClick={() => handleDeleteCoupon(coupon.code)}
                                        className="text-red-600 hover:text-red-700 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer border-none bg-transparent"
                                        title={`Remove code ${coupon.code}`}
                                      >
                                        <Trash2 size={13} />
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* SUB TAB: GOOGLE FORMS INTEGRATION WORKSPACE */}
              {activeSubTab === 'forms' && (
                <div className="space-y-6" id="admin-google-forms-container">
                  {/* Title and Authentication Status Header Card */}
                  <div className="bg-gradient-to-r from-stone-900 via-zinc-800 to-stone-900 text-white p-6 rounded-3xl border border-white/5 shadow-xl flex flex-col md:flex-row items-baseline md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">📊</span>
                        <h3 className="font-serif font-black text-[#D4AF37] text-base uppercase tracking-wider">
                          Google Forms Workspace Controller
                        </h3>
                        {googleFormsConnected ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                            Connected
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                            Authorization Required
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-300 max-w-xl leading-relaxed">
                        Establish direct, live OAuth synchronization with Google Forms. Deploy, embed, and analyze customer feedback surveys for Aditya Nutra Farms in real-time.
                      </p>
                    </div>

                    <div className="shrink-0 w-full md:w-auto">
                      {googleFormsConnected ? (
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono text-gray-400">Owner Access Granted</span>
                          <button
                            type="button"
                            onClick={handleDisconnectGoogleForms}
                            className="bg-red-950 border border-red-500/30 hover:bg-red-900 text-red-200 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-all active:scale-95 shadow-sm"
                          >
                            Disconnect
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={handleConnectGoogleForms}
                          disabled={isAuthorizingForms}
                          className="gsi-material-button w-full md:w-auto cursor-pointer shadow-md"
                          id="admin-connect-google-forms-btn"
                        >
                          <div className="gsi-material-button-state"></div>
                          <div className="gsi-material-button-content-wrapper">
                            <div className="gsi-material-button-icon">
                              <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ display: "block" }}>
                                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                <path fill="none" d="M0 0h48v48H0z"></path>
                              </svg>
                            </div>
                            <span className="gsi-material-button-contents font-sans font-bold text-[#222]">
                              {isAuthorizingForms ? 'Connecting Google Account...' : 'Connect Google Forms'}
                            </span>
                          </div>
                        </button>
                      )}
                    </div>
                  </div>

                  {!googleFormsConnected ? (
                    /* Initial onboarding visual state if unauthenticated */
                    <div className="bg-white rounded-3xl p-10 border border-amber-100 text-center max-w-2xl mx-auto space-y-5 shadow-sm">
                      <div className="w-16 h-16 bg-[#D4AF37]/10 text-[#D4AF37] rounded-full flex items-center justify-center text-2xl mx-auto border border-[#D4AF37]/20">
                        📋
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-serif font-black text-amber-950 text-base">
                          Authorize Forms Integration Engine
                        </h4>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-md mx-auto">
                          Click the "Connect Google Forms" button above to grant permission. Once authorized, our system will generate secure, branded customer questionnaires and fetch responses automatically using the secure Google Workspace APIs.
                        </p>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={handleConnectGoogleForms}
                          className="bg-neutral-900 hover:bg-black text-white font-bold text-xs py-2.5 px-6 rounded-xl transition-all cursor-pointer shadow-sm"
                        >
                          Unlock Google Forms Integration
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Form Creation & Listing Subsystem */
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                      {/* Left Block: Form Generator Panel */}
                      <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-amber-100 shadow-sm flex flex-col justify-between">
                        <div className="space-y-4">
                          <div className="border-b border-gray-100 pb-3">
                            <h4 className="font-serif font-black text-amber-950 text-sm flex items-center gap-1.5">
                              <Plus size={15} className="text-[#D4AF37]" />
                              <span>Deploy Brand Survey</span>
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-1">
                              Publish a pristine feedback form structured with 3 custom questions addressing quality, favorite flavors, and qualitative reviews.
                            </p>
                          </div>

                          <form onSubmit={handleCreateGoogleForm} className="space-y-4 text-xs">
                            <div>
                              <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">
                                Survey Title
                              </label>
                              <input
                                type="text"
                                required
                                value={customFormTitle}
                                onChange={(e) => setCustomFormTitle(e.target.value)}
                                className="w-full border border-amber-100 rounded-xl p-3 outline-none focus:border-[#D4AF37] font-serif font-bold text-[#5C3A21] bg-amber-50/10 placeholder:font-sans placeholder:normal-case"
                              />
                            </div>

                            <div>
                              <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wider">
                                Survey Objective / Subtitle
                              </label>
                              <textarea
                                required
                                rows={4}
                                value={customFormDesc}
                                onChange={(e) => setCustomFormDesc(e.target.value)}
                                className="w-full border border-amber-100 rounded-xl p-3 outline-none focus:border-[#D4AF37] font-sans leading-relaxed text-gray-600 bg-amber-50/10 text-[11px]"
                              />
                            </div>

                            <button
                              type="submit"
                              disabled={isCreatingForm}
                              className="w-full py-3 bg-[#D4AF37] hover:bg-[#Bca025] text-amber-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow active:scale-[0.98] disabled:opacity-50 cursor-pointer uppercase tracking-widest"
                            >
                              {isCreatingForm ? (
                                <>
                                  <div className="w-4.5 h-4.5 border-2 border-amber-950 border-t-transparent rounded-full animate-spin" />
                                  <span>Deploying to Drive...</span>
                                </>
                              ) : (
                                <>
                                  <span>🚀 Deploy Survey Form</span>
                                </>
                              )}
                            </button>
                          </form>
                        </div>

                        <div className="bg-amber-50/40 border border-amber-100 p-3 rounded-xl mt-6 space-y-1 select-none">
                          <span className="text-[9px] font-bold text-[#A37B24] uppercase tracking-widest block">
                            💡 Did you know?
                          </span>
                          <p className="text-[9.5px] leading-relaxed text-amber-900/80 font-normal">
                            Once created, toggling "Associate with Storefront" displays a branded banner on the homepage inviting live customers to fill it out!
                          </p>
                        </div>
                      </div>

                      {/* Right Block: Active Forms Listing & Diagnostics */}
                      <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-amber-100 shadow-sm space-y-6">
                        <div className="border-b border-gray-100 pb-3 flex items-center justify-between">
                          <h4 className="font-serif font-black text-amber-950 text-sm">
                            Created Google Forms ({googleForms.length})
                          </h4>
                          <span className="text-[9.5px] font-mono text-[#D4AF37] font-bold bg-[#D4AF37]/5 border border-[#D4AF37]/20 px-2.5 py-0.5 rounded-full select-none">
                            Synchronized with GDrive
                          </span>
                        </div>

                        {googleForms.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400 space-y-3">
                            <span className="text-4xl opacity-50">📁</span>
                            <p className="text-xs font-semibold text-amber-900/60 uppercase tracking-widest">No Surveys Registered</p>
                            <p className="text-[10px] text-gray-400 max-w-sm leading-normal">
                              Deploy your very first brand survey using the composition panel on the left to initialize the responses pipeline.
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {googleForms.map((form) => {
                              const isSelected = selectedFormForResponses === form.formId;
                              const isActiveBanner = activeBannerFormId === form.formId;
                              
                              return (
                                <div
                                  key={form.formId}
                                  className={`border rounded-2xl p-5 transition-all flex flex-col justify-between ${
                                    isSelected 
                                      ? 'bg-amber-50/15 border-amber-500 shadow-md ring-1 ring-amber-500/20' 
                                      : 'bg-white hover:bg-neutral-50 border-gray-100 shadow-sm'
                                  }`}
                                >
                                  <div className="space-y-3.5">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="space-y-1">
                                        <h5 className="font-serif font-black text-amber-950 text-xs sm:text-sm select-all">
                                          📝 {form.title}
                                        </h5>
                                        <span className="text-[9px] font-mono text-gray-400 block">
                                          Created: {new Date(form.createdTime).toLocaleDateString()}
                                        </span>
                                      </div>
                                      
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleToggleBannerForm(form)}
                                          className={`py-1 px-2.5 rounded-lg border text-[9.5px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            isActiveBanner
                                              ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-amber-900'
                                              : 'bg-gray-50 hover:bg-gray-100 border-gray-200 text-gray-600'
                                          }`}
                                          title="Show or hide survey banner on active makhana bag store"
                                        >
                                          {isActiveBanner ? '★ Associated' : '☆ Private'}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteFormRecord(form.formId)}
                                          className="text-gray-400 hover:text-red-600 p-1 rounded-lg hover:bg-gray-100 transition-colors border-none bg-transparent cursor-pointer"
                                          title="De-register Record"
                                        >
                                          <Trash2 size={13} />
                                        </button>
                                      </div>
                                    </div>

                                    {form.description && (
                                      <p className="text-[10px] text-gray-500 leading-normal font-normal">
                                        {form.description}
                                      </p>
                                    )}

                                    {/* Link & Copy Actions Row */}
                                    <div className="pt-2.5 border-t border-gray-50 flex flex-wrap items-center gap-2 text-[10px]">
                                      <a
                                        href={form.editUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-amber-50 hover:bg-amber-100 border border-amber-100 text-amber-950 font-bold py-1 px-2 rounded flex items-center gap-1.5 text-[9px] transition-all"
                                      >
                                        <Sliders size={10} />
                                        <span>Edit Form Space</span>
                                        <ExternalLink size={8} />
                                      </a>

                                      <a
                                        href={form.responderUri}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-[#121417]/5 hover:bg-[#121417]/10 border border-neutral-200 text-neutral-800 font-bold py-1 px-2 rounded flex items-center gap-1.5 text-[9px] transition-all"
                                      >
                                        <FileText size={10} />
                                        <span>Fill Form</span>
                                        <ExternalLink size={8} />
                                      </a>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          const iframe = `<iframe src="${form.responderUri}?embedded=true" width="640" height="800" frameborder="0" marginheight="0" marginwidth="0">Loading survey...</iframe>`;
                                          navigator.clipboard.writeText(iframe);
                                          if (triggerToast) triggerToast('Iframe embed code copied!', 'success');
                                        }}
                                        className="bg-stone-50 hover:bg-stone-100 border border-stone-200 text-stone-600 font-medium py-1 px-2 rounded flex items-center gap-1 text-[9px] cursor-pointer"
                                        title="Copy HTML iframe code"
                                      >
                                        <Copy size={9} />
                                        <span>Embed Code</span>
                                      </button>
                                    </div>
                                  </div>

                                  <div className="mt-4 pt-3 border-t border-dashed border-gray-100">
                                    <button
                                      type="button"
                                      onClick={() => handleFetchFormResponses(form.formId)}
                                      className={`w-full py-1.5 rounded-lg border font-bold text-[10.5px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer ${
                                        isSelected 
                                          ? 'bg-neutral-900 border-neutral-950 text-white shadow' 
                                          : 'bg-neutral-50 hover:bg-gray-150 border-neutral-200 text-neutral-700'
                                      }`}
                                    >
                                      <span>📊 Analyze Live Responses</span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ACTIVE RESPONSES DETAIL DIALOGUE PANEL */}
                  {googleFormsConnected && selectedFormForResponses && (
                    <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-md space-y-6" id="google-forms-responses-visual-dashboard">
                      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">📈</span>
                          <div>
                            <h4 className="font-serif font-black text-amber-950 text-sm">
                              Feedback Survey Analytics Metrics
                            </h4>
                            <p className="text-[10px] uppercase font-bold text-[#A37B24] tracking-widest font-sans">
                              ID: {selectedFormForResponses}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleFetchFormResponses(selectedFormForResponses)}
                          disabled={isLoadingResponses}
                          className="bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-200 py-1 px-3 rounded-lg text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-all shrink-0"
                        >
                          <RefreshCw size={11} className={isLoadingResponses ? 'animate-spin' : ''} />
                          <span>Refresh Answers</span>
                        </button>
                      </div>

                      {isLoadingResponses ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
                          <p className="text-[10px] text-amber-900/70 font-semibold uppercase tracking-wider">Communicating with Google Forms API...</p>
                        </div>
                      ) : responsesSummary ? (
                        <div className="space-y-6">
                          {/* Live response telemetry metrics counter */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-1">
                            <div className="bg-[#121417]/5 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[9.5px] uppercase font-black tracking-wider text-gray-400 block font-sans">
                                  Total Submissions
                                </span>
                                <h5 className="text-2xl font-black font-sans text-amber-950">
                                  {responsesSummary.totalResponses}
                                </h5>
                              </div>
                              <span className="text-2xl">🗳️</span>
                            </div>

                            <div className="bg-[#121417]/5 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[9.5px] uppercase font-black tracking-wider text-gray-400 block font-sans">
                                  Average Score
                                </span>
                                <h5 className="text-2xl font-black font-sans text-emerald-800">
                                  {responsesSummary.totalResponses > 0 ? (() => {
                                    let sum = 0;
                                    let items = 0;
                                    Object.entries(responsesSummary.ratingsDistribution).forEach(([k, v]) => {
                                      const starNum = parseInt(k.replace(' Star', '')) || 5;
                                      const val = Number(v) || 0;
                                      sum += starNum * val;
                                      items += val;
                                    });
                                    return items > 0 ? (sum / items).toFixed(1) : '5.0';
                                  })() : '5.0'} / 5.0
                                </h5>
                              </div>
                              <span className="text-2xl">👑</span>
                            </div>

                            <div className="bg-[#121417]/5 p-4 rounded-2xl border border-neutral-100 flex items-center justify-between gap-2">
                              <div className="space-y-0.5">
                                <span className="text-[9.5px] uppercase font-black tracking-wider text-gray-400 block font-sans">
                                  Unique Flavor Feedback
                                </span>
                                <h5 className="text-2xl font-black font-sans text-blue-900">
                                  {Object.keys(responsesSummary.flavorVotes).length} flavours
                                </h5>
                              </div>
                              <span className="text-2xl">🍯</span>
                            </div>
                          </div>

                          {responsesSummary.totalResponses === 0 ? (
                            <div className="bg-amber-50/20 text-center p-8 rounded-2xl text-xs text-amber-900/60 border border-dashed border-amber-100">
                              No responses have been submitted to this Google Form yet. Share the public link or associate with the homepage to accumulate submissions.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Left Recharts Star Chart */}
                              <div className="bg-[#121417]/5 border border-amber-500/10 p-5 rounded-2xl space-y-4">
                                <h5 className="font-serif font-black text-amber-950 text-xs uppercase tracking-wider">
                                  ⭐ Quality Ratings Distribution
                                </h5>
                                <div className="h-[200px] w-full">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                      data={Object.entries(responsesSummary.ratingsDistribution)
                                        .map(([star, count]) => ({ name: star, votes: count }))
                                        .reverse()}
                                      margin={{ top: 10, right: 10, left: -25, bottom: 5 }}
                                    >
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                      <XAxis dataKey="name" tick={{ fill: '#4B5563', fontSize: 10 }} />
                                      <YAxis allowDecimals={false} tick={{ fill: '#4B5563', fontSize: 9 }} />
                                      <Tooltip />
                                      <Bar dataKey="votes" fill="#D4AF37" radius={[5, 5, 0, 0]} />
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                              </div>

                              {/* Right Flavor Selection list */}
                              <div className="bg-[#121417]/5 border border-amber-500/10 p-5 rounded-2xl space-y-4">
                                <h5 className="font-serif font-black text-amber-950 text-xs uppercase tracking-wider">
                                  🍿 Flavor Votes Breakdown
                                </h5>
                                <ul className="space-y-2 text-xs">
                                  {Object.entries(responsesSummary.flavorVotes)
                                    .sort((a, b) => Number(b[1]) - Number(a[1]))
                                    .map(([flavor, count], idx) => (
                                      <li key={flavor} className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-gray-100/50">
                                        <span className="font-semibold text-neutral-800">{flavor}</span>
                                        <span className="font-mono text-[10px] font-black text-[#A37B24] bg-amber-50/50 border border-amber-100 px-2 py-0.5 rounded">
                                          {count} votes
                                        </span>
                                      </li>
                                    ))}
                                  {Object.keys(responsesSummary.flavorVotes).length === 0 && (
                                    <li className="text-gray-400 text-center py-6 text-[10px]">
                                      No flavor selections captured in submissions.
                                    </li>
                                  )}
                                </ul>
                              </div>

                              {/* Bottom row: Qualitative Comments history */}
                              <div className="md:col-span-2 bg-[#121417]/5 border border-amber-500/10 p-5 rounded-2xl space-y-3">
                                <h5 className="font-serif font-black text-amber-950 text-xs uppercase tracking-wider pb-1.5 border-b border-gray-100">
                                  💬 Qualitative Suggestions Hub ({responsesSummary.commentsHistory.length})
                                </h5>
                                <div className="max-h-[160px] overflow-y-auto space-y-2 pr-1 divide-y divide-gray-100">
                                  {responsesSummary.commentsHistory.map((comment, idx) => (
                                    <div key={idx} className="pt-2 pb-1.5 text-[11px] leading-relaxed text-gray-650 font-normal">
                                      <span className="text-amber-600 font-serif mr-1">“</span>
                                      <span className="select-all">{comment}</span>
                                      <span className="text-amber-600 font-serif ml-1">”</span>
                                    </div>
                                  ))}
                                  {responsesSummary.commentsHistory.length === 0 && (
                                    <div className="text-gray-400 text-center py-6 text-[10px]">
                                      No text comments recorded yet.
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-400 text-xs">
                          Could not locate response analytics summary.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* MODAL: ADD / EDIT PRODUCT */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-amber-100">
              <div className="bg-amber-900 text-white py-3 px-5 flex justify-between items-center">
                <h4 className="font-serif font-bold text-sm">
                  {isEditingProduct ? 'Update Snack Variant Info' : 'Introduce New Snack Variant'}
                </h4>
                <button onClick={() => setShowProductModal(false)} className="hover:bg-white/10 p-1 rounded-full text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmitProduct} className="p-5 space-y-3.5 text-xs">
                
                {/* Snack Title */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Snack Variant Title</label>
                  <input
                    type="text"
                    required
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    placeholder="E.g., Minty Pudina Delight"
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Categories */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Variant Category</label>
                     <select
                      value={prodForm.category}
                      onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
                    >
                      <option value="raw-makhana">Raw Makhana</option>
                      <option value="flavoured-makhana">Flavoured Makhana</option>
                      <option value="health-nutrition">Health & Nutrition</option>
                      <option value="dry-fruit-mixes">Dry Fruit Mixes</option>
                      <option value="gift-packs">Gift Packs</option>
                      <option value="combo-packs">Combo Packs</option>
                      <option value="premium-collection">Premium Collection</option>
                      <option value="cashews">Exotic Cashew</option>
                      <option value="almonds">Roasted Almonds</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Inventory Stock</label>
                    <input
                      type="number"
                      required
                      value={prodForm.stock}
                      onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">MRP Value (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodForm.mrp}
                      onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })}
                      placeholder="E.g., 250"
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Selling Offer Price (₹)</label>
                    <input
                      type="number"
                      required
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                      placeholder="E.g., 199"
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Variant Detail Description</label>
                  <textarea
                    required
                    rows={3}
                    value={prodForm.description}
                    onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    placeholder="Explain the taste, sourcing organic freshness..."
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500"
                  />
                </div>

                {/* Image Link */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Product Image Path / CDN Image URL</label>
                  <input
                    type="text"
                    required
                    value={prodForm.image}
                    onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-3 flex gap-2.5 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 rounded-lg font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {submitting && <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <span>{isEditingProduct ? 'Save System Changes' : 'Publish Product to Catalogs'}</span>
                  </button>
                </div>

              </form>
            </div>
          </div>
        )}

        {/* MODAL: DISPATCH / TRACKING SHIPMENT */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-100">
              <div className="bg-amber-900 text-white py-3 px-5 flex justify-between items-center">
                <h4 className="font-serif font-bold text-sm">Shipment Dispatch Manager (Order #{selectedOrder.id})</h4>
                <button onClick={() => setSelectedOrder(null)} className="hover:bg-white/10 p-1 rounded-full text-white">
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmitOrderStatus} className="p-5 space-y-4 text-xs font-sans">
                
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">Update Delivery Status</label>
                  <select
                    value={orderStatusForm}
                    onChange={(e) => setOrderStatusForm(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                  >
                    <option value="Pending">Pending Validation</option>
                    <option value="Paid">Payment Verified / Approved</option>
                    <option value="Shipped">Dispatched / Out for Delivery</option>
                    <option value="Completed">Completed & Handed Over</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">IndiaPost / Courier Tracking Number</label>
                  <input
                    type="text"
                    value={trackingForm}
                    onChange={(e) => setTrackingForm(e.target.value)}
                    placeholder="E.g., ANT-938182"
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans"
                  />
                  <p className="text-[10px] text-gray-500 mt-1 flex items-center gap-1 font-sans">
                    <Truck size={12} /> Live tracking allows instant checkout tracking for client profile pages
                  </p>
                </div>

                <div className="pt-2 flex gap-2.5 justify-end font-sans">
                  <button
                    type="button"
                    onClick={() => setSelectedOrder(null)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2 px-3.5 rounded-lg font-semibold transition-all"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2 px-4 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    {submitting && <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>}
                    <span>Publish Shipment Update</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: CREATE NEW PROMO COUPON */}
        {showCreateCouponModal && (
          <div className="fixed inset-0 bg-black/60 z-50 overflow-y-auto flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-100">
              <div className="bg-amber-900 text-white py-3.5 px-5 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Gift size={16} className="text-amber-300 animate-pulse" />
                  <h4 className="font-serif font-bold text-sm">
                    {language === 'hi' ? 'नया कूपन कोड दर्ज करें' : 'Assemble Promo Coupon'}
                  </h4>
                </div>
                <button 
                  onClick={() => setShowCreateCouponModal(false)} 
                  className="hover:bg-white/10 p-1.5 rounded-full text-white transition-colors cursor-pointer border-none bg-transparent"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleModalCreateCoupon} className="p-5 space-y-4 text-xs font-sans">
                {/* Code Identifier */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">
                    {language === 'hi' ? 'कूपन कोड' : 'Coupon Code Slug'}
                  </label>
                  <input
                    type="text"
                    required
                    value={modalCouponCode}
                    onChange={(e) => setModalCouponCode(e.target.value.replace(/\s+/g, ''))}
                    placeholder="E.g., KASHMIR10"
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-mono text-sm uppercase placeholder:font-sans placeholder:normal-case font-bold"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-sans">
                    {language === 'hi' ? 'शामिल कोड का उपयोग ग्राहक बैग चेकआउट के समय कर सकते हैं।' : 'Slugs are applied at bag checkout for instant savings deduction.'}
                  </p>
                </div>

                {/* Grid fields: Discount and Min Spend */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">
                      {language === 'hi' ? 'छूट राशि (₹)' : 'Discount Amount (₹)'}
                    </label>
                    <input
                      type="number"
                      required
                      value={modalCouponDiscount}
                      onChange={(e) => setModalCouponDiscount(e.target.value)}
                      placeholder="E.g., 150"
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">
                      {language === 'hi' ? 'न्यूनतम खरीद (₹)' : 'Min Purchase (₹)'}
                    </label>
                    <input
                      type="number"
                      value={modalCouponMinOrder}
                      onChange={(e) => setModalCouponMinOrder(e.target.value)}
                      placeholder="E.g., 499"
                      className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans font-bold text-gray-700"
                    />
                  </div>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide flex items-center gap-1.5">
                    <Calendar size={13} className="text-[#D4AF37]" />
                    <span>{language === 'hi' ? 'कूपन समाप्ति तिथि' : 'Expiry Date'}</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={modalCouponExpiry}
                    onChange={(e) => setModalCouponExpiry(e.target.value)}
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 font-sans font-bold text-gray-700"
                  />
                  <p className="text-[9px] text-gray-400 mt-1 font-sans">
                    {language === 'hi' ? 'इस तिथि के बाद कूपन कोड निष्क्रिय हो जाएगा।' : 'Promo transitions to Inactive status automatically past this date.'}
                  </p>
                </div>

                {/* Promotional Description */}
                <div>
                  <label className="block text-amber-950 font-bold mb-1 uppercase tracking-wide">
                    {language === 'hi' ? 'अभियान विवरण' : 'Promo Description'}
                  </label>
                  <textarea
                    rows={2}
                    value={modalCouponDesc}
                    onChange={(e) => setModalCouponDesc(e.target.value)}
                    placeholder="E.g., Flat discount celebrating seasonal freshness."
                    className="w-full border border-amber-200 rounded-lg p-2.5 outline-none focus:border-amber-500 leading-normal font-sans"
                  />
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex gap-2.5 justify-end font-sans">
                  <button
                    type="button"
                    onClick={() => setShowCreateCouponModal(false)}
                    className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 py-2.5 px-4 rounded-lg font-semibold transition-all cursor-pointer"
                  >
                    {language === 'hi' ? 'रद्द करें' : 'Cancel'}
                  </button>
                  <button
                    type="submit"
                    className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-5 rounded-lg font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <Plus size={14} />
                    <span>{language === 'hi' ? 'सक्रिय करें' : 'Create Coupon'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
