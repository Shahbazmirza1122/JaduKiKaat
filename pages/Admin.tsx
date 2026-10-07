import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Lock,
  LayoutDashboard,
  PenTool,
  LogOut,
  Save,
  Trash2,
  Plus,
  CircleCheck,
  Pencil,
  Eye,
  EyeOff,
  ArrowLeft,
  Image as ImageIcon,
  SquareCheck,
  ScrollText,
  Loader2,
  ShoppingBag,
  X,
  Database,
  Tag,
  CalendarClock,
  Package,
  PackageX,
  EyeOff as EyeOffIcon,
  Settings,
  TicketPercent,
  Check,
  Users as UsersIcon,
  Mail as MailIcon,
  Menu,
  Clock,
  Flame,
  Star,
  Sparkles,
  SlidersHorizontal,
  Search,
  ExternalLink,
  ArrowRight,
  RefreshCw,
  Layers,
  CheckCircle2,
  ChevronRight,
  LayoutGrid,
  MoveUp,
  MoveDown,
  Copy,
  CheckSquare,
  Square,
  MessageSquareQuote,
} from "lucide-react";
import { BlogPost } from "../types";
import RichTextEditor from "../components/RichTextEditor";
import PageSectionBuilder from "../components/PageSectionBuilder";
import { UsersTab } from "../components/UsersTab";
import { EmailTab } from "../components/EmailTab";
import { OrdersTab } from "../components/OrdersTab";
import { BannersTab } from "../components/BannersTab";
import { TestimonialsManager } from "../components/TestimonialsManager";
import { BlogSectionsTab } from "../components/BlogSectionsTab";
import { BlogCategoriesTab } from "../components/BlogCategoriesTab";
import { ProductCountdownsManager } from "../components/ProductCountdownsManager";
import ServicesManager from "../components/ServicesManager";
import { supabase } from "../lib/supabase";
import { Product, products as staticProducts } from "../data/products";
import {
  getStoreSettings,
  saveStoreSettings,
  StoreSettings,
  StoreCategory,
  defaultCategories,
  defaultStoreSettings,
  StoreSection,
  defaultSections,
  ProductCountdown,
  defaultProductCountdowns,
} from "../data/storeSettings";

// Interface for Coupon
interface Coupon {
  id: string;
  code: string;
  discount_percent: number;
  product_id: string | null; // null means all products
  product_name?: string; // For display
}

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("sacred_admin_logged_in") === "true";
    }
    return false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<
    "blog" | "duaa" | "products" | "orders" | "services" | "testimonials" | "database" | "sections" | "banners" | "users" | "email"
  >("blog");
  const [serviceCategories, setServiceCategories] = useState<
    {
      id: string;
      name: string;
      description: string;
      imageUrl: string;
      relatedProducts: string[];
      relatedArticles: string[];
    }[]
  >([]);
  const [serviceCategoryForm, setServiceCategoryForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });
  const [editingServiceCategoryId, setEditingServiceCategoryId] = useState<
    string | null
  >(null);
  const [serviceEditTab, setServiceEditTab] = useState<
    "details" | "products" | "articles"
  >("details");
  const [serviceSearchTerm, setServiceSearchTerm] = useState("");

  // Blog State
  const [blogView, setBlogView] = useState<"list" | "form">("list");
  const [blogSubTab, setBlogSubTab] = useState<"posts" | "categories" | "sections">("posts");
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [editPostId, setEditPostId] = useState<string | null>(null);
  const [blogForm, setBlogForm] = useState<Omit<BlogPost, "id"> & { displayPage?: string, displaySection?: string }>({
    title: "",
    excerpt: "",
    content: "",
    author: "",
    date: new Date().toISOString().slice(0, 16),
    imageUrl: "",
    category: "",
    status: "draft",
    displayPage: "all",
    displaySection: "all",
  });

  const handleSwitchToBlogCreate = () => {
    fetchPosts();
    setEditPostId(null);
    setBlogForm({
      title: "",
      excerpt: "",
      content: "",
      author: "",
      date: new Date().toISOString().slice(0, 16),
      imageUrl: "",
      category: "",
      status: "draft",
      displayPage: "all",
      displaySection: "all",
    });
    setBlogView("form");
  };

  const handleSwitchToBlogList = () => {
    setBlogView("list");
    setEditPostId(null);
  };

  const handleEditPost = (post: BlogPost) => {
    fetchPosts();
    setEditPostId(post.id);
    
    let parsedDisplayPage = "all";
    let parsedDisplaySection = "all";
    let parsedDate = post.date || new Date().toISOString().slice(0, 16);
    
    // Parse related_ids specifically array safely
    if (post.relatedIds && Array.isArray(post.relatedIds)) {
        if (post.relatedIds.length > 0) {
            try {
                const parsed = JSON.parse(post.relatedIds[0]);
                if (parsed.displayPage) parsedDisplayPage = parsed.displayPage;
                if (parsed.displaySection) parsedDisplaySection = parsed.displaySection;
            } catch(e) {}
        }
    } else if (post.relatedIds && typeof post.relatedIds === 'string') {
        try {
            const parsed = JSON.parse(post.relatedIds);
            if (parsed.displayPage) parsedDisplayPage = parsed.displayPage;
            if (parsed.displaySection) parsedDisplaySection = parsed.displaySection;
        } catch(e) {}
    }
    
    setBlogForm({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      author: post.author || "",
      date: parsedDate.length === 10 ? `${parsedDate}T12:00` : parsedDate.slice(0, 16),
      imageUrl: post.imageUrl || "",
      category: post.category || "",
      status: post.status || "draft",
      displayPage: parsedDisplayPage,
      displaySection: parsedDisplaySection,
    });
    setBlogView("form");
  };

  const handleDeletePost = (id: string) => {
    setDeleteDialog({ isOpen: true, type: 'post', id, message: 'Are you sure you want to delete this post?' });
  };

  const executeDeletePost = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase.from("posts").delete().eq("id", id);
    if (error) {
      console.warn("Error deleting post: " + error.message);
    } else {
      setNotification("Post deleted successfully.");
      fetchPosts();
      setTimeout(() => setNotification(null), 3000);
    }
    setIsLoading(false);
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (editPostId) {
      const { error } = await supabase
        .from("posts")
        .update({
          title: blogForm.title,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          author: blogForm.author,
          date: blogForm.date,
          image_url: blogForm.imageUrl,
          category: blogForm.category,
          status: blogForm.status,
          related_ids: [JSON.stringify({ displayPage: blogForm.displayPage || "all", displaySection: blogForm.displaySection || "all" })],
        })
        .eq("id", editPostId);

      if (error) {
        console.warn("Error updating post: " + error.message);
      } else {
        setNotification("Post updated successfully!");
        handleSwitchToBlogList();
        fetchPosts();
        setTimeout(() => setNotification(null), 3000);
      }
    } else {
      const { error } = await supabase.from("posts").insert([
        {
          title: blogForm.title,
          excerpt: blogForm.excerpt,
          content: blogForm.content,
          author: blogForm.author,
          date: blogForm.date,
          image_url: blogForm.imageUrl,
          category: blogForm.category,
          status: blogForm.status,
          related_ids: [JSON.stringify({ displayPage: blogForm.displayPage || "all", displaySection: blogForm.displaySection || "all" })],
        },
      ]);

      if (error) {
        console.warn("Error creating post: " + error.message);
      } else {
        setNotification("Post created successfully!");
        handleSwitchToBlogList();
        fetchPosts();
        setTimeout(() => setNotification(null), 3000);
      }
    }
    setIsLoading(false);
  };

  // Duaa State
  const [dailyDuaa, setDailyDuaa] = useState("");

  // Product State
  const [productView, setProductView] = useState<"list" | "form">("list");
  const [productSubTab, setProductSubTab] = useState<
    "inventory" | "sections" | "categories" | "counter" | "page_content" | "coupons"
  >("inventory");
  const [products, setProducts] = useState<Product[]>([]);
  const [editProductId, setEditProductId] = useState<string | null>(null);

  // Store Settings & Dynamic Categories / Counter States
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(getStoreSettings());
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>("All");
  const [productStockFilter, setProductStockFilter] = useState<string>("all");
  const [productAreaFilter, setProductAreaFilter] = useState<string>("all");
  const [productSearchQuery, setProductSearchQuery] = useState<string>("");

  // Storefront Sections Sub-Tab State
  const [editingSection, setEditingSection] = useState<StoreSection | null>(null);
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [sectionProductSearch, setSectionProductSearch] = useState("");
  const [sectionForm, setSectionForm] = useState<StoreSection>({
    id: "",
    heading: "",
    subheading: "",
    badge: "",
    enabled: true,
    order: 1,
    layout: {
      columns: 4,
      maxProducts: 8,
      showRating: true,
      showDescription: false,
    },
    productSource: {
      type: "all",
      selectedCategories: [],
      selectedProductIds: [],
      assignedArea: "featured",
    },
    showViewAll: true,
    viewAllCategory: "All",
  });

  // Categories Sub-Tab State
  const [editingCategory, setEditingCategory] = useState<StoreCategory | null>(null);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState<Omit<StoreCategory, "id">>({
    name: "",
    image: "https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=400&auto=format&fit=crop",
    subtitle: "Curated Blessed Items",
    isPopular: true,
  });

  // Counter & Flash Deal Sub-Tab Form State
  const [counterForm, setCounterForm] = useState({
    enabled: storeSettings.flashDeal?.enabled ?? true,
    productId: storeSettings.flashDeal?.productId || "1",
    customTitle: storeSettings.flashDeal?.customTitle || "Natural Yemeni Aqeeq Silver Ring",
    customPrice: storeSettings.flashDeal?.customPrice || "$65.00",
    customOriginalPrice: storeSettings.flashDeal?.customOriginalPrice || "$95.00",
    tag: storeSettings.flashDeal?.tag || "Flash Blessed Deal",
    days: storeSettings.flashDeal?.days || "02",
    hours: storeSettings.flashDeal?.hours || "14",
    minutes: storeSettings.flashDeal?.minutes || "38",
    seconds: storeSettings.flashDeal?.seconds || "45",
  });

  // Page Content & Banners Form State
  const [pageSettingsForm, setPageSettingsForm] = useState({
    announcement: { ...storeSettings.announcement },
    hero: { ...storeSettings.hero },
    trustPillars: [...storeSettings.trustPillars] as [
      { title: string; desc: string },
      { title: string; desc: string },
      { title: string; desc: string }
    ],
    promoBanners: {
      banner1: { ...storeSettings.promoBanners.banner1 },
      banner2: { ...storeSettings.promoBanners.banner2 },
    },
    testimonial: { ...storeSettings.testimonial },
    newsletter: { ...storeSettings.newsletter },
  });

  // Coupon State
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({
    code: "",
    percent: "",
    productId: "all",
  });

  // Updated Product Form State with new fields
  const [productForm, setProductForm] = useState<Omit<Product, "id">>({
    name: "",
    price: "",
    image: "",
    category: "",
    description: "",
    sku: "",
    salePrice: "",
    saleStart: "",
    saleEnd: "",
    isOutOfStock: false,
    isBlurBeforeBuy: false,
    isWrapBeforeBuy: false,
    displayArea: "catalog",
    assignedSections: [],
  });

  // Database Schema State
  const [missingTables, setMissingTables] = useState<string[]>([]);
  const [sqlInstructions, setSqlInstructions] = useState<string>("");

  // Loading States
  const [isLoading, setIsLoading] = useState(false);

  // Blog Form State
  const [editId, setEditId] = useState<string | null>(null);
  const [blogTitle, setBlogTitle] = useState("");
  const [blogExcerpt, setBlogExcerpt] = useState("");
  const [blogContent, setBlogContent] = useState("");
  const [blogAuthor, setBlogAuthor] = useState("Admin");
  const [blogImage, setBlogImage] = useState(
    "https://picsum.photos/id/1015/800/600",
  );

  // New Form Fields
  const [blogCategory, setBlogCategory] = useState("");
  const [newCategoryInput, setNewCategoryInput] = useState("");
  const [selectedRelatedIds, setSelectedRelatedIds] = useState<string[]>([]);

  const [notification, setNotification] = useState<string | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{isOpen: boolean, type: string, id: string, message: string}>({isOpen: false, type: '', id: '', message: ''});

  const confirmDeleteAction = async () => {
    const { id, type } = deleteDialog;
    setDeleteDialog({ ...deleteDialog, isOpen: false });
    
    if (type === 'post') await executeDeletePost(id);
    else if (type === 'category') await executeDeleteServiceCategory(id);
    else if (type === 'product') await executeDeleteProduct(id);
    else if (type === 'coupon') await executeDeleteCoupon(id);
  };

  // Initialize Data from Supabase
  useEffect(() => {
    if (isAuthenticated) {
      if (activeTab === "blog") fetchPosts();
      if (activeTab === "duaa") fetchDuaa();
      if (activeTab === "services") {
        fetchServiceCategories();
        fetchProducts();
        fetchPosts();
      }
      if (activeTab === "products") {
        fetchProducts();
        if (productSubTab === "coupons") fetchCoupons();
      }
      // database tab doesn't need fetch
    }
  }, [isAuthenticated, activeTab, productSubTab]);

  const fetchServiceCategories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error fetching service categories:", error);
        checkTableError(error, "service_categories");
        setServiceCategories([]);
      } else {
        const mapped = (data || []).map((c: any) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          imageUrl: c.image_url,
          relatedProducts: c.related_products || [],
          relatedArticles: c.related_articles || [],
        }));
        setServiceCategories(mapped);
        setMissingTables((prev) =>
          prev.filter((t) => t !== "service_categories"),
        );
      }
    } catch (err) {
      console.warn("Failed to fetch service categories (network/offline):", err);
      setServiceCategories([]);
    } finally {
      setIsLoading(false);
    }
  };

  const saveServiceCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (editingServiceCategoryId) {
      const { error } = await supabase
        .from("service_categories")
        .update({
          name: serviceCategoryForm.name,
          description: serviceCategoryForm.description,
          image_url: serviceCategoryForm.imageUrl,
        })
        .eq("id", editingServiceCategoryId);

      if (error) {
        console.warn("Error updating category: " + error.message);
      } else {
        setNotification("Service category updated successfully!");
        fetchServiceCategories();
        setTimeout(() => setNotification(null), 3000);
      }
    } else {
      const { error } = await supabase.from("service_categories").insert([
        {
          name: serviceCategoryForm.name,
          description: serviceCategoryForm.description,
          image_url: serviceCategoryForm.imageUrl,
          related_products: [],
          related_articles: [],
        },
      ]);

      if (error) {
        console.warn("Error creating category: " + error.message);
      } else {
        setNotification("Service category created successfully!");
        setServiceCategoryForm({ name: "", description: "", imageUrl: "" });
        fetchServiceCategories();
        setTimeout(() => setNotification(null), 3000);
      }
    }
    setIsLoading(false);
  };

  const updateServiceCategoryRelations = async (
    categoryId: string,
    type: "products" | "articles",
    relations: string[],
  ) => {
    const updateData =
      type === "products"
        ? { related_products: relations }
        : { related_articles: relations };
    const { error } = await supabase
      .from("service_categories")
      .update(updateData)
      .eq("id", categoryId);
    if (error) {
      console.warn("Error updating relations: " + error.message);
    } else {
      fetchServiceCategories();
    }
  };

  const deleteServiceCategory = (id: string) => {
    setDeleteDialog({ isOpen: true, type: 'category', id, message: 'Are you sure you want to delete this category?' });
  };

  const executeDeleteServiceCategory = async (id: string) => {
    setIsLoading(true);
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);
    if (error) {
      console.warn("Error deleting category: " + error.message);
    } else {
      setNotification("Category deleted successfully!");
      fetchServiceCategories();
      setTimeout(() => setNotification(null), 3000);
    }
    setIsLoading(false);
  };

  const checkTableError = (error: any, tableName: string) => {
    if (!error) return false;

    // Check for "undefined_table" error (Postgres code 42P01) or specific message
    const isMissingTable =
      error.code === "42P01" ||
      error.message?.includes("Could not find the table") ||
      error.message?.includes("does not exist");

    // Check for "undefined_column" or missing relation (PGRST200 is common for missing embedding)
    const isSchemaError =
      error.code === "PGRST204" || error.code === "PGRST200";

    if (isMissingTable || isSchemaError) {
      setMissingTables((prev) =>
        prev.includes(tableName) ? prev : [...prev, tableName],
      );
      setSqlInstructions(getSqlSetupInstructions(tableName));
      return true;
    }
    return false;
  };

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .neq("category", "_page_section_")
        .neq("category", "_form_lead_")
        .neq("category", "_banner_")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error fetching posts:", error);
        checkTableError(error, "posts");
      } else {
        const mappedPosts = (data || []).map((p: any) => ({
          ...p,
          imageUrl: p.image_url || p.imageUrl,
          relatedIds: p.related_ids || p.relatedIds,
          isLatest: p.is_latest || p.isLatest,
        }));
        setPosts(mappedPosts);
        setMissingTables((prev) => prev.filter((t) => t !== "posts"));
      }
    } catch (err) {
      console.warn("Failed to fetch posts:", err);
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        if (error) checkTableError(error, "products");
        const local = localStorage.getItem("sacred_store_products");
        if (local) {
          try {
            setProducts(JSON.parse(local));
          } catch {
            setProducts(staticProducts);
          }
        } else {
          setProducts(staticProducts);
          localStorage.setItem("sacred_store_products", JSON.stringify(staticProducts));
        }
      } else {
        // Map database snake_case to camelCase for frontend
        const mappedProducts = (data || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          image: p.image,
          category: p.category,
          description: p.description,
          sku: p.sku,
          salePrice: p.sale_price,
          saleStart: p.sale_start,
          saleEnd: p.sale_end,
          isOutOfStock: p.is_out_of_stock,
          isBlurBeforeBuy: p.is_blur_before_buy,
          isWrapBeforeBuy: p.is_wrap_before_buy,
        }));
        setProducts(mappedProducts);
        localStorage.setItem("sacred_store_products", JSON.stringify(mappedProducts));
        setMissingTables((prev) => prev.filter((t) => t !== "products"));
      }
    } catch (err) {
      console.warn("Failed to fetch products:", err);
      const local = localStorage.getItem("sacred_store_products");
      if (local) {
        try {
          setProducts(JSON.parse(local));
        } catch {
          setProducts(staticProducts);
        }
      } else {
        setProducts(staticProducts);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      // We select coupons and join with products to get product name
      const { data, error } = await supabase
        .from("coupons")
        .select(
          `
              *,
              products ( name )
          `,
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Error fetching coupons:", JSON.stringify(error, null, 2));
        checkTableError(error, "coupons");
        setCoupons([]);
      } else {
        // Safely map data
        const mapped = (data || []).map((c: any) => ({
          id: c.id,
          code: c.code,
          discount_percent: c.discount_percent,
          product_id: c.product_id,
          product_name: c.products ? c.products.name : "All Products",
        }));
        setCoupons(mapped);
        setMissingTables((prev) => prev.filter((t) => t !== "coupons"));
      }
    } catch (err) {
      console.warn("Failed to fetch coupons:", err);
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDuaa = () => {
    const stored = localStorage.getItem("lumina_daily_duaa");
    if (stored) setDailyDuaa(stored);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "admin123") {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("sacred_admin_logged_in", "true");
      }
    } else {
      console.warn("Invalid credentials");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      localStorage.removeItem("sacred_admin_logged_in");
    }
    setUsername("");
    setPassword("");
  };

  const resetForm = () => {
    setEditId(null);
    setBlogTitle("");
    setBlogExcerpt("");
    setBlogContent("");
    setBlogAuthor("Admin");
    setBlogImage("https://picsum.photos/id/1015/800/600");
    setBlogCategory("");
    setNewCategoryInput("");
    setSelectedRelatedIds([]);
  };

  const handleSwitchToCreate = () => {
    resetForm();
    setBlogView("form");
  };

  const handleSwitchToList = () => {
    resetForm();
    setBlogView("list");
  };

  const handleEdit = (post: BlogPost) => {
    setEditId(post.id);
    setBlogTitle(post.title);
    setBlogExcerpt(post.excerpt);
    setBlogContent(post.content);
    setBlogAuthor(post.author);
    setBlogImage(post.imageUrl);
    setBlogCategory(post.category || "");
    setNewCategoryInput("");
    setSelectedRelatedIds(post.relatedIds || []);
    setBlogView("form");
  };

  const handleDelete = async (id: string) => {
    if (true || window.confirm("Are you sure you want to delete this article?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) {
        console.warn("Error deleting post: " + (error.message || "Unknown error"));
      } else {
        setPosts(posts.filter((p) => p.id !== id));
        setNotification("Article deleted successfully.");
        setTimeout(() => setNotification(null), 3000);
      }
    }
  };

  const handleSaveBlog = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalCategory =
      newCategoryInput.trim() || blogCategory || "Uncategorized";

    const postPayload = {
      title: blogTitle,
      excerpt: blogExcerpt,
      content: blogContent,
      author: blogAuthor,
      image_url: blogImage,
      category: finalCategory,
      related_ids: selectedRelatedIds,
      status: "published",
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    let error;
    if (editId) {
      const { error: updateError } = await supabase
        .from("posts")
        .update(postPayload)
        .eq("id", editId);
      error = updateError;
      setNotification("Article updated successfully!");
    } else {
      const { error: insertError } = await supabase
        .from("posts")
        .insert([postPayload]);
      error = insertError;
      setNotification("Article published successfully!");
    }

    if (error) {
      console.warn("Save error:", JSON.stringify(error, null, 2));
      checkTableError(error, "posts");
      console.warn(
        "Failed to save post. " +
          (checkTableError(error, "posts")
            ? "The database table is missing."
            : error.message),
      );
      return;
    }

    await fetchPosts();

    setTimeout(() => {
      setNotification(null);
      handleSwitchToList();
    }, 1500);
  };

  const handleSaveDuaa = () => {
    localStorage.setItem("lumina_daily_duaa", dailyDuaa);
    setNotification("Daily Duaa updated successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // --- PRODUCT HANDLERS ---
  const resetProductForm = () => {
    setEditProductId(null);
    setProductForm({
      name: "",
      price: "",
      image: "",
      category: "",
      description: "",
      sku: "",
      salePrice: "",
      saleStart: "",
      saleEnd: "",
      isOutOfStock: false,
      isBlurBeforeBuy: false,
      isWrapBeforeBuy: false,
      displayArea: "catalog",
      assignedSections: [],
    });
  };

  const handleSwitchToProductCreate = () => {
    resetProductForm();
    setProductView("form");
  };

  const handleSwitchToProductList = () => {
    resetProductForm();
    setProductView("list");
  };

  const handleEditProduct = (product: Product) => {
    setEditProductId(product.id);
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      category: product.category,
      description: product.description || "",
      sku: product.sku || "",
      salePrice: product.salePrice || "",
      saleStart: product.saleStart || "",
      saleEnd: product.saleEnd || "",
      isOutOfStock: product.isOutOfStock || false,
      isBlurBeforeBuy: product.isBlurBeforeBuy || false,
      isWrapBeforeBuy: product.isWrapBeforeBuy || false,
      displayArea: product.displayArea || "catalog",
      assignedSections: product.assignedSections || [],
    });
    setProductView("form");
  };

  const handleQuickChangeDisplayArea = async (product: Product, newArea: Product["displayArea"]) => {
    const updated = products.map((p) => (p.id === product.id ? { ...p, displayArea: newArea } : p));
    setProducts(updated);
    try {
      localStorage.setItem("sacred_store_products", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("store_products_updated", { detail: updated }));
    } catch (e) {
      console.warn(e);
    }
    setNotification(`Updated "${product.name}" display area to ${newArea}.`);
    setTimeout(() => setNotification(null), 3000);

    try {
      await supabase.from("products").update({ display_area: newArea }).eq("id", product.id);
    } catch (e) {
      console.warn(e);
    }
  };

  // --- STOREFRONT SECTION HANDLERS ---
  const handleOpenCreateSectionModal = () => {
    setEditingSection(null);
    setSectionProductSearch("");
    const currentSections = storeSettings.sections || defaultSections;
    setSectionForm({
      id: `sec_${Date.now()}`,
      heading: "New Sacred Showcase",
      subheading: "Handcrafted spiritual collection",
      badge: "Curated",
      enabled: true,
      order: currentSections.length + 1,
      layout: {
        columns: 4,
        maxProducts: 8,
        showRating: true,
        showDescription: false,
      },
      productSource: {
        type: "all",
        selectedCategories: [],
        selectedProductIds: [],
        assignedArea: "featured",
      },
      showViewAll: true,
      viewAllCategory: "All",
    });
    setSectionModalOpen(true);
  };

  const handleOpenEditSectionModal = (section: StoreSection) => {
    setEditingSection(section);
    setSectionProductSearch("");
    setSectionForm({
      ...section,
      layout: { ...section.layout },
      productSource: {
        ...section.productSource,
        selectedCategories: [...(section.productSource.selectedCategories || [])],
        selectedProductIds: [...(section.productSource.selectedProductIds || [])],
      },
    });
    setSectionModalOpen(true);
  };

  const handleSaveSection = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!sectionForm.heading.trim()) {
      setNotification("Please provide a heading for this section.");
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    const currentSections = storeSettings.sections || defaultSections;
    let updatedSections: StoreSection[];

    if (editingSection) {
      updatedSections = currentSections.map((s) => (s.id === editingSection.id ? sectionForm : s));
    } else {
      updatedSections = [...currentSections, sectionForm];
    }

    const updatedSettings: StoreSettings = {
      ...storeSettings,
      sections: updatedSections,
    };

    saveStoreSettings(updatedSettings);
    setStoreSettings(updatedSettings);
    setSectionModalOpen(false);
    setNotification(`Section "${sectionForm.heading}" saved successfully.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleSectionEnabled = (sectionId: string) => {
    const currentSections = storeSettings.sections || defaultSections;
    const updatedSections = currentSections.map((s) =>
      s.id === sectionId ? { ...s, enabled: !s.enabled } : s
    );
    const updatedSettings = { ...storeSettings, sections: updatedSections };
    saveStoreSettings(updatedSettings);
    setStoreSettings(updatedSettings);
    const toggled = updatedSections.find((s) => s.id === sectionId);
    setNotification(`Section "${toggled?.heading}" is now ${toggled?.enabled ? "visible" : "hidden"}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleMoveSection = (index: number, direction: "up" | "down") => {
    const currentSections = [...(storeSettings.sections || defaultSections)];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= currentSections.length) return;

    const temp = currentSections[index];
    currentSections[index] = currentSections[targetIndex];
    currentSections[targetIndex] = temp;

    const reordered = currentSections.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updatedSettings = { ...storeSettings, sections: reordered };
    saveStoreSettings(updatedSettings);
    setStoreSettings(updatedSettings);
    setNotification("Section order updated.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteSection = (sectionId: string) => {
    const currentSections = storeSettings.sections || defaultSections;
    const toDelete = currentSections.find((s) => s.id === sectionId);
    if (!toDelete) return;

    const filtered = currentSections.filter((s) => s.id !== sectionId);
    const reordered = filtered.map((s, idx) => ({ ...s, order: idx + 1 }));
    const updatedSettings = { ...storeSettings, sections: reordered };
    saveStoreSettings(updatedSettings);
    setStoreSettings(updatedSettings);
    setNotification(`Section "${toDelete.heading}" deleted.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDuplicateSection = (section: StoreSection) => {
    const currentSections = storeSettings.sections || defaultSections;
    const duplicated: StoreSection = {
      ...section,
      id: `sec_${Date.now()}`,
      heading: `${section.heading} (Copy)`,
      order: currentSections.length + 1,
      layout: { ...section.layout },
      productSource: {
        ...section.productSource,
        selectedCategories: [...(section.productSource.selectedCategories || [])],
        selectedProductIds: [...(section.productSource.selectedProductIds || [])],
      },
    };
    const updatedSections = [...currentSections, duplicated];
    const updatedSettings = { ...storeSettings, sections: updatedSections };
    saveStoreSettings(updatedSettings);
    setStoreSettings(updatedSettings);
    setNotification(`Duplicated section "${section.heading}".`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteProduct = (id: string) => {
    setDeleteDialog({ isOpen: true, type: 'product', id, message: 'Are you sure you want to delete this product?' });
  };

  const executeDeleteProduct = async (id: string) => {
    // Update local state and localStorage first
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    try {
      localStorage.setItem("sacred_store_products", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("store_products_updated", { detail: updated }));
    } catch (e) {
      console.warn(e);
    }

    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      console.warn("Error deleting product from Supabase: " + (error.message || "Unknown error"));
    }
    setNotification("Product deleted successfully.");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleProductStock = async (product: Product) => {
    const nextStock = !product.isOutOfStock;
    const updated = products.map((p) =>
      p.id === product.id ? { ...p, isOutOfStock: nextStock } : p
    );
    setProducts(updated);
    try {
      localStorage.setItem("sacred_store_products", JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent("store_products_updated", { detail: updated }));
    } catch (e) {
      console.warn(e);
    }
    try {
      await supabase.from("products").update({ is_out_of_stock: nextStock }).eq("id", product.id);
    } catch (e) {
      console.warn(e);
    }
    setNotification(`Product "${product.name}" marked as ${nextStock ? "Out of Stock" : "In Stock"}.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newProduct: Product = {
      id: editProductId || `prod_${Date.now()}`,
      name: productForm.name,
      price: productForm.price,
      image: productForm.image,
      category: productForm.category,
      description: productForm.description,
      sku: productForm.sku,
      salePrice: productForm.salePrice,
      saleStart: productForm.saleStart,
      saleEnd: productForm.saleEnd,
      isOutOfStock: productForm.isOutOfStock,
      isBlurBeforeBuy: productForm.isBlurBeforeBuy,
      isWrapBeforeBuy: productForm.isWrapBeforeBuy,
      displayArea: productForm.displayArea || "catalog",
      assignedSections: productForm.assignedSections || [],
    };

    let updatedList: Product[];
    if (editProductId) {
      updatedList = products.map((p) => (p.id === editProductId ? newProduct : p));
    } else {
      updatedList = [newProduct, ...products];
    }
    setProducts(updatedList);
    try {
      localStorage.setItem("sacred_store_products", JSON.stringify(updatedList));
      window.dispatchEvent(new CustomEvent("store_products_updated", { detail: updatedList }));
    } catch (e) {
      console.warn(e);
    }

    // Map camelCase to snake_case for Supabase
    const payload = {
      name: productForm.name,
      price: productForm.price,
      image: productForm.image,
      category: productForm.category,
      description: productForm.description,
      sku: productForm.sku,
      sale_price: productForm.salePrice,
      sale_start: productForm.saleStart,
      sale_end: productForm.saleEnd,
      is_out_of_stock: productForm.isOutOfStock,
      is_blur_before_buy: productForm.isBlurBeforeBuy,
      is_wrap_before_buy: productForm.isWrapBeforeBuy,
      display_area: productForm.displayArea || "catalog",
      assigned_sections: productForm.assignedSections || [],
    };

    let error;
    try {
      if (editProductId) {
        const { error: updateError } = await supabase
          .from("products")
          .update(payload)
          .eq("id", editProductId);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("products")
          .insert([payload]);
        error = insertError;
      }
    } catch (err: any) {
      error = err;
    }

    if (error) {
      console.warn("Supabase sync warning for product:", error);
    }

    const successMessage = editProductId
      ? "Product updated successfully!"
      : "Product created successfully!";
    setNotification(successMessage);

    // Switch view immediately
    handleSwitchToProductList();
    setIsLoading(false);

    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // --- CATEGORY HANDLERS ---
  const handleOpenAddCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: "",
      image: "https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=400&auto=format&fit=crop",
      subtitle: "Curated Blessed Items",
      isPopular: true,
    });
    setCategoryModalOpen(true);
  };

  const handleEditCategory = (cat: StoreCategory) => {
    setEditingCategory(cat);
    setCategoryForm({
      name: cat.name,
      image: cat.image,
      subtitle: cat.subtitle,
      isPopular: cat.isPopular ?? true,
    });
    setCategoryModalOpen(true);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.name.trim()) return;

    const currentCats = storeSettings.categories && storeSettings.categories.length > 0
      ? storeSettings.categories
      : defaultCategories;

    let updatedCategories: StoreCategory[];
    if (editingCategory) {
      updatedCategories = currentCats.map((c) =>
        c.id === editingCategory.id ? { ...editingCategory, ...categoryForm } : c
      );
      setNotification(`Category "${categoryForm.name}" updated successfully!`);
    } else {
      const newCat: StoreCategory = {
        id: categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, "_") + "_" + Date.now(),
        ...categoryForm,
      };
      updatedCategories = [...currentCats, newCat];
      setNotification(`Category "${categoryForm.name}" created successfully!`);
    }

    const updatedSettings = { ...storeSettings, categories: updatedCategories };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setCategoryModalOpen(false);
    setEditingCategory(null);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleDeleteCategory = (catId: string, catName: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${catName}" category?`)) return;
    const currentCats = storeSettings.categories && storeSettings.categories.length > 0
      ? storeSettings.categories
      : defaultCategories;
    const updatedCategories = currentCats.filter((c) => c.id !== catId);
    const updatedSettings = { ...storeSettings, categories: updatedCategories };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setNotification(`Category "${catName}" removed.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleTogglePopularCategory = (catId: string) => {
    const currentCats = storeSettings.categories && storeSettings.categories.length > 0
      ? storeSettings.categories
      : defaultCategories;
    const updatedCategories = currentCats.map((c) =>
      c.id === catId ? { ...c, isPopular: !c.isPopular } : c
    );
    const updatedSettings = { ...storeSettings, categories: updatedCategories };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setNotification("Popular categories showcase updated!");
    setTimeout(() => setNotification(null), 2500);
  };

  const handleAddProductForCategory = (categoryName: string) => {
    setProductForm({
      name: "",
      price: "",
      image: "",
      category: categoryName,
      description: "",
      sku: "",
      salePrice: "",
      saleStart: "",
      saleEnd: "",
      isOutOfStock: false,
      isBlurBeforeBuy: false,
      isWrapBeforeBuy: false,
    });
    setEditProductId(null);
    setProductSubTab("inventory");
    setProductView("form");
  };

  // --- COUNTER & FLASH DEAL HANDLERS ---
  const handleSaveCounterSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...storeSettings,
      flashDeal: { ...counterForm },
    };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setNotification("Flash Deal & Countdown Counter saved successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  const handleSaveCountdowns = (newCountdowns: ProductCountdown[]) => {
    const updatedSettings: StoreSettings = {
      ...storeSettings,
      productCountdowns: newCountdowns,
    };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setNotification("Product countdown timers and section positions saved successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // --- PAGE CONTENT & BANNERS HANDLERS ---
  const handleSavePageSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSettings: StoreSettings = {
      ...storeSettings,
      announcement: { ...pageSettingsForm.announcement },
      hero: { ...pageSettingsForm.hero },
      trustPillars: [...pageSettingsForm.trustPillars] as [
        { title: string; desc: string },
        { title: string; desc: string },
        { title: string; desc: string },
      ],
      promoBanners: {
        banner1: { ...pageSettingsForm.promoBanners.banner1 },
        banner2: { ...pageSettingsForm.promoBanners.banner2 },
      },
      testimonial: { ...pageSettingsForm.testimonial },
      newsletter: { ...pageSettingsForm.newsletter },
    };
    setStoreSettings(updatedSettings);
    saveStoreSettings(updatedSettings);
    setNotification("Store Page Banners & Content saved successfully!");
    setTimeout(() => setNotification(null), 3000);
  };

  // --- COUPON HANDLERS ---
  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      code: couponForm.code.toUpperCase(),
      discount_percent: parseInt(couponForm.percent),
      product_id: couponForm.productId === "all" ? null : couponForm.productId,
    };

    const { error } = await supabase.from("coupons").insert([payload]);

    if (error) {
      console.warn("Coupon Error:", error);
      checkTableError(error, "coupons");
      console.warn(
        "Failed to save coupon. " +
          (checkTableError(error, "coupons")
            ? "The Coupons table is missing. Go to Database Setup tab."
            : error.message),
      );
    } else {
      setNotification("Coupon created successfully!");
      setCouponForm({ code: "", percent: "", productId: "all" });
      await fetchCoupons();
      setTimeout(() => setNotification(null), 3000);
    }
    setIsLoading(false);
  };

  const handleDeleteCoupon = (id: string) => {
    setDeleteDialog({ isOpen: true, type: 'coupon', id, message: 'Delete this coupon?' });
  };

  const executeDeleteCoupon = async (id: string) => {
    const { error } = await supabase.from("coupons").delete().eq("id", id);
    if (!error) {
      setCoupons((prev) => prev.filter((c) => c.id !== id));
      setNotification("Coupon deleted successfully!");
      setTimeout(() => setNotification(null), 3000);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spirit-50 px-4">
        {/* Login Form Code (Unchanged) */}
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-spirit-100">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-spirit-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-spirit-600" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-spirit-900">
              Admin Portal
            </h2>
            <p className="text-gray-500 text-sm">
              Please login to manage the sanctuary.
            </p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                placeholder="admin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                placeholder="admin123"
              />
            </div>
            <div className="space-y-4">
              <button className="w-full bg-spirit-900 text-white font-bold py-3 rounded-lg hover:bg-spirit-800 transition">
                Access Dashboard
              </button>
              <div className="text-center">
                <Link
                  to="/"
                  className="text-spirit-600 hover:text-spirit-800 text-sm font-medium transition"
                >
                  &larr; Return to Website
                </Link>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const getSqlSetupInstructions = (tableName: string) => {
    if (
      tableName === "products" ||
      tableName === "coupons" ||
      tableName === "all"
    ) {
      const prodSql = `-- 1. PRODUCTS TABLE SETUP
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  price text not null,
  image text not null,
  category text not null,
  description text,
  sku text,
  sale_price text,
  sale_start text,
  sale_end text,
  is_out_of_stock boolean default false,
  is_blur_before_buy boolean default false,
  is_wrap_before_buy boolean default false
);

-- Add columns if table exists but columns do not
alter table public.products add column if not exists sku text;
alter table public.products add column if not exists sale_price text;
alter table public.products add column if not exists sale_start text;
alter table public.products add column if not exists sale_end text;
alter table public.products add column if not exists is_out_of_stock boolean default false;
alter table public.products add column if not exists is_blur_before_buy boolean default false;
alter table public.products add column if not exists is_wrap_before_buy boolean default false;

-- Enable RLS for Products (Drop first to avoid duplication errors)
alter table public.products enable row level security;
drop policy if exists "Enable all access for all users" on public.products;
create policy "Enable all access for all users" on public.products for all using (true) with check (true);
`;

      const servicesSql = `
-- 5. SERVICE CATEGORIES TABLE SETUP
create table if not exists public.service_categories (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  description text,
  image_url text,
  related_products jsonb default '[]'::jsonb,
  related_articles jsonb default '[]'::jsonb
);

-- Add columns if table exists but columns do not
alter table public.service_categories add column if not exists related_products jsonb default '[]'::jsonb;
alter table public.service_categories add column if not exists related_articles jsonb default '[]'::jsonb;

alter table public.service_categories enable row level security;
drop policy if exists "Enable all access for all users" on public.service_categories;
create policy "Enable all access for all users" on public.service_categories for all using (true) with check (true);

-- 5B. SPIRITUAL SERVICES TABLE SETUP (With full rich content, pricing, procedures)
create table if not exists public.services (
  id text primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  slug text,
  description text,
  content text,
  category text,
  category_id uuid references public.service_categories(id) on delete set null,
  icon text,
  image_url text,
  price text,
  duration text,
  features jsonb default '[]'::jsonb,
  status text default 'active'
);

alter table public.services enable row level security;
drop policy if exists "Enable all access for all users" on public.services;
create policy "Enable all access for all users" on public.services for all using (true) with check (true);
`;

      const couponsSql = `
-- 4. COUPONS TABLE SETUP
create table if not exists public.coupons (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  code text not null,
  discount_percent numeric not null,
  product_id uuid references public.products(id) on delete cascade
);
-- Enable RLS for Coupons
alter table public.coupons enable row level security;
drop policy if exists "Enable all access for all users" on public.coupons;
create policy "Enable all access for all users" on public.coupons for all using (true) with check (true);

-- RELOAD SCHEMA CACHE (Critical for Foreign Keys)
NOTIFY pgrst, 'reload schema';
`;

      if (tableName === "coupons") return couponsSql;
      if (tableName !== "all") return prodSql;

      const ordersSql = `
-- 2. ORDERS TABLE SETUP
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  user_id uuid,
  items jsonb,
  total numeric,
  status text
);
-- Enable RLS for Orders (Drop first to avoid duplication errors)
alter table public.orders enable row level security;
drop policy if exists "Enable all access for all users" on public.orders;
create policy "Enable all access for all users" on public.orders for all using (true) with check (true);
`;
      const postsSql = `
-- 3. BLOG POSTS TABLE SETUP
create table if not exists public.posts (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  excerpt text,
  content text,
  author text,
  image_url text,
  category text,
  status text default 'draft',
  date text,
  is_latest boolean default false,
  related_ids text[]
);
-- Enable RLS for Posts (Drop first to avoid duplication errors)
alter table public.posts enable row level security;
drop policy if exists "Enable all access for all users" on public.posts;
create policy "Enable all access for all users" on public.posts for all using (true) with check (true);`;

      return prodSql + ordersSql + postsSql + couponsSql + servicesSql;
    }
    return "";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row pt-20">
      {/* Sidebar */}
      <aside className={`transition-all duration-300 ease-in-out bg-spirit-900 text-white min-h-[300px] md:min-h-screen flex-shrink-0 ${isSidebarOpen ? "w-full md:w-64" : "w-full md:w-20 overflow-hidden"}`}>
        <div className={`${isSidebarOpen ? "p-6" : "p-4"}`}>
          <div className={`flex items-center ${isSidebarOpen ? "justify-between" : "justify-center"} mb-8`}>
            {isSidebarOpen && (
              <h2 className="text-2xl font-serif font-bold flex items-center whitespace-nowrap">
                <LayoutDashboard className="mr-2 flex-shrink-0" /> Admin CMS
              </h2>
            )}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 hover:bg-spirit-800 rounded-md transition text-spirit-200"
            >
              <Menu size={20} />
            </button>
          </div>
          <nav className="space-y-2">
            <button
              onClick={() => setActiveTab("blog")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "blog" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Manage Blog"
            >
              <PenTool size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Manage Blog</span>}
            </button>
            <button
              onClick={() => setActiveTab("products")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "products" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Manage Products"
            >
              <ShoppingBag size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Manage Products</span>}
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "orders" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Manage Orders"
            >
              <Package size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Manage Orders</span>}
            </button>
            <button
              onClick={() => setActiveTab("services")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "services" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Manage Services"
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Manage Services</span>}
            </button>
            <button
              onClick={() => setActiveTab("duaa")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "duaa" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Manage Duaa"
            >
              <ScrollText size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Manage Duaa</span>}
            </button>
            <button
              onClick={() => setActiveTab("database")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "database" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Database Setup"
            >
              <Database size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Database Setup</span>}
            </button>
            <button
              onClick={() => setActiveTab("sections")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "sections" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Page Sections"
            >
              <LayoutDashboard size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Page Sections</span>}
            </button>
            <button
              onClick={() => setActiveTab("testimonials")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "testimonials" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Happy Clients"
            >
              <MessageSquareQuote size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Happy Clients</span>}
            </button>
            <button
              onClick={() => setActiveTab("banners")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "banners" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Home Banners"
            >
              <ImageIcon size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Home Banners</span>}
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "users" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Users"
            >
              <UsersIcon size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Users</span>}
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 rounded-lg transition ${activeTab === "email" ? "bg-spirit-700 text-white" : "text-spirit-200 hover:bg-spirit-800"}`}
              title="Email"
            >
              <MailIcon size={20} className="flex-shrink-0" />
              {isSidebarOpen && <span className="whitespace-nowrap">Email</span>}
            </button>
            <div className="pt-8 border-t border-spirit-800 mt-8">
              <button
                onClick={handleLogout}
                className={`w-full flex items-center ${isSidebarOpen ? "space-x-3 px-4" : "justify-center"} py-3 text-red-300 hover:text-red-100 hover:bg-spirit-800 rounded-lg transition`}
                title="Logout"
              >
                <LogOut size={20} className="flex-shrink-0" />
                {isSidebarOpen && <span className="whitespace-nowrap">Logout</span>}
              </button>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full transition-all duration-300">
        {notification && (
          <div className="mb-6 bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center animate-fade-in">
            <CircleCheck className="w-5 h-5 mr-2" />
            {notification}
          </div>
        )}

        {/* Database Missing Warning - Only show if not on Database tab (to avoid dupes) */}
        {missingTables.length > 0 && activeTab !== "database" && (
          <div className="mb-8 bg-spirit-50 border border-spirit-200 p-6 rounded-xl animate-fade-in">
            <div className="flex items-start gap-4">
              <Database className="w-6 h-6 text-spirit-700 mt-1 shrink-0" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-spirit-950 mb-2">
                  Database Issue Detected
                </h3>
                <p className="text-spirit-800 mb-4">
                  Tables or columns are missing. Go to the{" "}
                  <strong>Database Setup</strong> tab to copy the SQL setup
                  instructions.
                </p>
                <button
                  onClick={() => setActiveTab("database")}
                  className="bg-spirit-800 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spirit-700 transition"
                >
                  Go to Setup
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SECTIONS TAB */}
        {activeTab === "sections" && (
          <PageSectionBuilder />
        )}

        {/* BANNERS TAB */}
        {activeTab === "banners" && (
          <BannersTab />
        )}

        {/* USERS TAB */}
        {activeTab === "users" && (
          <UsersTab />
        )}

        {/* EMAIL TAB */}
        {activeTab === "email" && (
          <EmailTab />
        )}

        {/* ORDERS TAB */}
        {activeTab === "orders" && (
          <OrdersTab />
        )}

        {/* BLOG TAB */}
        {activeTab === "blog" && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800">
                  {blogView === "list" && blogSubTab === "posts"
                    ? "All Posts"
                    : blogView === "list" && blogSubTab === "categories"
                      ? "Categories"
                      : blogView === "list" && blogSubTab === "sections"
                        ? "Blog Page Layout"
                        : editPostId
                          ? "Edit Post"
                          : "Add New Post"}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Manage your spiritual insights and articles here.
                </p>
              </div>

              {blogView === "list" && (
                <div className="flex bg-gray-100 p-1 rounded-lg">
                  <button
                    onClick={() => { setBlogSubTab("posts"); fetchPosts(); }}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${blogSubTab === "posts" ? "bg-white shadow-sm text-spirit-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Posts
                  </button>
                  <button
                    onClick={() => setBlogSubTab("categories")}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${blogSubTab === "categories" ? "bg-white shadow-sm text-spirit-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Categories
                  </button>
                  <button
                    onClick={() => setBlogSubTab("sections")}
                    className={`px-4 py-2 rounded-md text-sm font-bold transition ${blogSubTab === "sections" ? "bg-white shadow-sm text-spirit-900" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    Layout Sections
                  </button>
                </div>
              )}

              {blogView === "list" && blogSubTab === "posts" ? (
                <button
                  onClick={handleSwitchToBlogCreate}
                  className="bg-spirit-600 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  New Post
                </button>
              ) : blogView === "form" ? (
                <button
                  onClick={handleSwitchToBlogList}
                  className="bg-white text-gray-600 font-bold py-2.5 px-6 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back to List
                </button>
              ) : null}
            </div>

            {blogView === "list" && blogSubTab === "categories" && (
              <BlogCategoriesTab />
            )}

            {blogView === "list" && blogSubTab === "sections" && (
              <BlogSectionsTab />
            )}

            {blogView === "list" && blogSubTab === "posts" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold border-b border-gray-100">
                          Image
                        </th>
                        <th className="p-4 font-bold border-b border-gray-100">
                          Title
                        </th>
                        <th className="p-4 font-bold border-b border-gray-100">
                          Category
                        </th>
                        <th className="p-4 font-bold border-b border-gray-100">
                          Date
                        </th>
                        <th className="p-4 font-bold border-b border-gray-100">
                          Status
                        </th>
                        <th className="p-4 font-bold border-b border-gray-100 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {posts.filter(p => !['_blog_section_', '_blog_category_'].includes(p.category)).length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="p-8 text-center text-gray-500"
                          >
                            No posts found. Click "New Post" to add one.
                          </td>
                        </tr>
                      ) : (
                        posts.filter(p => !['_blog_section_', '_blog_category_'].includes(p.category)).map((post) => (
                          <tr
                            key={post.id}
                            className="hover:bg-slate-50 transition"
                          >
                            <td className="p-4">
                              <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center">
                                {post.imageUrl ? (
                                  <img
                                    src={post.imageUrl}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <ImageIcon className="text-gray-400 w-5 h-5" />
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-spirit-900">
                                {post.title}
                              </div>
                              <div className="text-xs text-gray-500 max-w-xs truncate">
                                {post.excerpt}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded whitespace-nowrap text-xs font-medium">
                                {post.category || "Uncategorized"}
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm text-gray-600">
                                {post.date}
                              </span>
                            </td>
                            <td className="p-4">
                              <span
                                className={`inline-block px-2 py-1 rounded text-xs font-medium ${post.status === "published" ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}
                              >
                                {post.status?.toUpperCase() || "DRAFT"}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => handleEditPost(post)}
                                  className="p-2 text-gray-500 hover:text-spirit-600 hover:bg-spirit-50 rounded transition"
                                  title="Edit Post"
                                >
                                  <Pencil className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeletePost(post.id)}
                                  className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition"
                                  title="Delete Post"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {blogView === "form" && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <form onSubmit={handleSavePost} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Title
                      </label>
                      <input
                        required
                        type="text"
                        value={blogForm.title}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, title: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Excerpt (Short Summary)
                      </label>
                      <textarea
                        required
                        rows={2}
                        value={blogForm.excerpt}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, excerpt: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Full Content
                      </label>
                      <div className="border border-gray-300 rounded-lg overflow-hidden min-h-[300px]">
                        <RichTextEditor
                          key={editPostId || 'new'}
                          initialValue={blogForm.content}
                          onChange={(content) =>
                            setBlogForm({ ...blogForm, content })
                          }
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Author
                      </label>
                      <input
                        required
                        type="text"
                        value={blogForm.author}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, author: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="e.g. Master Spirit"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Schedule Date & Time
                      </label>
                      <input
                        required
                        type="datetime-local"
                        value={blogForm.date}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, date: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Category
                      </label>
                      <input
                        required
                        type="text"
                        list="blog-categories"
                        value={blogForm.category}
                        onChange={(e) =>
                          setBlogForm({ ...blogForm, category: e.target.value })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="e.g. Guidance"
                      />
                      <datalist id="blog-categories">
                        {posts.filter(p => p.category === '_blog_category_').map(cat => (
                            <option key={cat.id} value={cat.title} />
                        ))}
                      </datalist>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Display On Page
                          </label>
                          <select
                            value={blogForm.displayPage}
                            onChange={(e) =>
                              setBlogForm({ ...blogForm, displayPage: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none bg-white"
                          >
                            <option value="all">Everywhere / Default</option>
                            <option value="home">Home Page</option>
                            <option value="blog">Main Blog Page</option>
                            <optgroup label="Services Pages">
                              {serviceCategories.map(cat => (
                                  <option key={cat.id} value={`service_${cat.id}`}>{cat.name}</option>
                              ))}
                            </optgroup>
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Which page should this appear on?</p>
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2">
                            Display Section
                          </label>
                          <select
                            value={blogForm.displaySection}
                            onChange={(e) =>
                              setBlogForm({ ...blogForm, displaySection: e.target.value })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none bg-white"
                          >
                            <option value="all">Any / Default</option>
                            <optgroup label="Layout Sections">
                                {posts.filter(p => p.category === '_blog_section_').map(sec => (
                                    <option key={sec.id} value={sec.id}>{sec.title || "Unnamed Section"}</option>
                                ))}
                            </optgroup>
                          </select>
                          <p className="text-xs text-slate-500 mt-1">Bind to a specific Layout Section?</p>
                        </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Cover Image URL
                      </label>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <input
                            type="url"
                            value={blogForm.imageUrl}
                            onChange={(e) =>
                              setBlogForm({
                                ...blogForm,
                                imageUrl: e.target.value,
                              })
                            }
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                            placeholder="https://example.com/image.jpg"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Leave empty for a placeholder
                          </p>
                        </div>
                        {blogForm.imageUrl && (
                          <div className="w-16 h-10 rounded bg-gray-100 border flex-shrink-0 overflow-hidden">
                            <img
                              src={blogForm.imageUrl}
                              className="w-full h-full object-cover"
                              alt="Preview"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        value={blogForm.status}
                        onChange={(e) =>
                          setBlogForm({
                            ...blogForm,
                            status: e.target.value as "draft" | "published",
                          })
                        }
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-spirit-500 outline-none"
                      >
                        <option value="draft">Draft</option>
                        <option value="published">Published</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                      type="button"
                      onClick={handleSwitchToBlogList}
                      className="text-gray-500 font-bold py-3 px-6 hover:text-gray-700 transition mr-4"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-spirit-900 text-white font-bold py-3 px-8 rounded-full hover:bg-spirit-800 transition shadow-md flex items-center disabled:opacity-50"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 mr-2 animate-spin" />{" "}
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5 mr-2" />{" "}
                          {editPostId ? "Update Post" : "Create Post"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* DATABASE SETUP TAB */}
        {activeTab === "database" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-gray-800">
                Database Setup
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Run these SQL commands in your Supabase SQL Editor to configure
                the database schema.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-spirit-600" />
                  Full Schema (Products, Orders, Posts, Coupons)
                </h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      getSqlSetupInstructions("all"),
                    );
                    console.warn("SQL copied to clipboard!");
                  }}
                  className="text-xs bg-spirit-900 text-white px-3 py-2 rounded-lg font-bold hover:bg-spirit-800 transition"
                >
                  Copy All SQL
                </button>
              </div>
              <div className="p-0">
                <pre className="bg-slate-900 text-slate-50 p-6 overflow-x-auto text-xs font-mono leading-relaxed">
                  {getSqlSetupInstructions("all")}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {activeTab === "services" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <ServicesManager
              products={products}
              posts={posts}
              onNotification={(msg) => {
                setNotification(msg);
                setTimeout(() => setNotification(null), 3500);
              }}
            />
          </div>
        )}

        {/* TESTIMONIALS / HAPPY CLIENTS TAB */}
        {activeTab === "testimonials" && (
          <div className="max-w-6xl mx-auto animate-fade-in">
            <TestimonialsManager
              onNotification={(msg) => {
                setNotification(msg);
                setTimeout(() => setNotification(null), 3500);
              }}
            />
          </div>
        )}



        {/* DUAA TAB */}
        {activeTab === "duaa" && (
          <div className="max-w-4xl mx-auto">
            {/* ... Duaa code ... */}
            <div className="mb-8">
              <h1 className="text-3xl font-serif font-bold text-gray-800">
                Daily Duaa Management
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Update the scrolling message displayed below the website
                navigation.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Message Content
                </label>
                <textarea
                  rows={4}
                  value={dailyDuaa}
                  onChange={(e) => setDailyDuaa(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-lg"
                  placeholder="Enter the daily duaa or message here..."
                />
              </div>
              <div className="flex justify-end">
                <button
                  onClick={handleSaveDuaa}
                  className="bg-spirit-600 text-white font-bold py-3 px-8 rounded-full hover:bg-spirit-700 transition shadow-md flex items-center"
                >
                  <Save className="w-5 h-5 mr-2" /> Update Message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === "products" && (
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800 flex items-center gap-3">
                  {productView === "form" ? (
                    editProductId ? "Edit Product" : "Add New Product"
                  ) : productSubTab === "inventory" ? (
                    <>
                      <span>Products Catalog & Inventory</span>
                      <span className="text-xs font-sans px-2.5 py-1 bg-spirit-100 text-spirit-800 rounded-full font-bold">
                        {products.length} Items
                      </span>
                    </>
                  ) : productSubTab === "sections" ? (
                    <>
                      <span>Storefront Sections & Layouts</span>
                      <span className="text-xs font-sans px-2.5 py-1 bg-spirit-100 text-spirit-800 rounded-full font-bold border border-spirit-200/60">
                        {(storeSettings.sections || defaultSections).length} Sections
                      </span>
                    </>
                  ) : productSubTab === "categories" ? (
                    <>
                      <span>Categories & Popular Showcase</span>
                      <span className="text-xs font-sans px-2.5 py-1 bg-spirit-100 text-spirit-800 rounded-full font-bold border border-spirit-200/60">
                        {(storeSettings.categories || defaultCategories).length} Categories
                      </span>
                    </>
                  ) : productSubTab === "counter" ? (
                    <>
                      <span>Countdown Counter & Flash Deal</span>
                      <span className="text-xs font-sans px-2.5 py-1 bg-spirit-100 text-spirit-800 rounded-full font-bold border border-spirit-200/60 flex items-center gap-1">
                        <Flame className="w-3 h-3 text-spirit-600" /> Live Banner
                      </span>
                    </>
                  ) : productSubTab === "page_content" ? (
                    <span>Store Page Banners & Content</span>
                  ) : (
                    <span>Promotional Coupons</span>
                  )}
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  {productView === "form"
                    ? "Enter product specifications, pricing, category assignment, and display flags."
                    : productSubTab === "inventory"
                    ? "Add, filter, edit, and adjust products and in-stock inventory for the store."
                    : productSubTab === "sections"
                    ? "Add, arrange, and customize storefront sections, headings, grid columns, product count limits, and targeted products & categories."
                    : productSubTab === "categories"
                    ? "Manage store categories, taglines, and pick which ones are featured in the Popular Categories showcase."
                    : productSubTab === "counter"
                    ? "Configure the live countdown timer counter and flash blessed deal shown at the top of the Store page."
                    : productSubTab === "page_content"
                    ? "Customize hero banner, trust pillars, dual promotional cards, and customer testimonials."
                    : "Create and distribute promotional discount codes for your customers."}
                </p>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Link
                  to="/store"
                  target="_blank"
                  className="px-3.5 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition flex items-center shadow-sm"
                  title="Open customer storefront in a new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-spirit-600" />
                  View Store Front
                </Link>

                {productView === "list" && productSubTab === "inventory" && (
                  <button
                    onClick={handleSwitchToProductCreate}
                    className="bg-spirit-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Product
                  </button>
                )}

                {productView === "list" && productSubTab === "sections" && (
                  <button
                    onClick={handleOpenCreateSectionModal}
                    className="bg-spirit-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Section
                  </button>
                )}

                {productView === "list" && productSubTab === "categories" && (
                  <button
                    onClick={handleOpenAddCategory}
                    className="bg-spirit-800 text-white font-bold py-2 px-4 rounded-lg hover:bg-spirit-700 transition shadow-md flex items-center text-sm cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    New Category
                  </button>
                )}

                {productView === "form" && (
                  <button
                    onClick={handleSwitchToProductList}
                    className="bg-white text-gray-600 font-bold py-2 px-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition flex items-center text-sm cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back to Products
                  </button>
                )}
              </div>
            </div>

            {/* Sub-Tab Navigation Bar */}
            {productView === "list" && (
              <div className="flex bg-gray-100 p-1 rounded-xl mb-6 overflow-x-auto gap-1">
                <button
                  onClick={() => {
                    setProductSubTab("inventory");
                    fetchProducts();
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "inventory"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Package className="w-4 h-4 mr-2 text-spirit-600" />
                  Products ({products.length})
                </button>

                <button
                  onClick={() => setProductSubTab("sections")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "sections"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4 mr-2 text-spirit-600" />
                  Storefront Sections ({(storeSettings.sections || defaultSections).length})
                </button>

                <button
                  onClick={() => setProductSubTab("categories")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "categories"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Layers className="w-4 h-4 mr-2 text-spirit-600" />
                  Categories & Popular ({(storeSettings.categories || defaultCategories).length})
                </button>

                <button
                  onClick={() => setProductSubTab("counter")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "counter"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <Clock className="w-4 h-4 mr-2 text-spirit-600" />
                  Countdown & Flash Deal
                </button>

                <button
                  onClick={() => setProductSubTab("page_content")}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "page_content"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-spirit-600" />
                  Page Banners & Content
                </button>

                <button
                  onClick={() => {
                    setProductSubTab("coupons");
                    fetchCoupons();
                  }}
                  className={`px-4 py-2.5 rounded-lg text-sm font-bold transition flex items-center whitespace-nowrap cursor-pointer ${
                    productSubTab === "coupons"
                      ? "bg-white shadow-sm text-spirit-900"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  <TicketPercent className="w-4 h-4 mr-2 text-spirit-600" />
                  Coupons ({coupons.length})
                </button>
              </div>
            )}

            {/* COUPON SECTION */}
            {productView === "list" && productSubTab === "coupons" && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Create Coupon Form */}
                <div className="md:col-span-1">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <h3 className="font-bold text-gray-800 mb-4 flex items-center">
                      <TicketPercent className="w-5 h-5 mr-2 text-spirit-600" />{" "}
                      Create Coupon
                    </h3>
                    <form onSubmit={handleSaveCoupon} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Coupon Code
                        </label>
                        <input
                          type="text"
                          required
                          value={couponForm.code}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              code: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500 uppercase font-mono"
                          placeholder="SALE2024"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="100"
                          value={couponForm.percent}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              percent: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500"
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Applies To
                        </label>
                        <select
                          value={couponForm.productId}
                          onChange={(e) =>
                            setCouponForm({
                              ...couponForm,
                              productId: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-spirit-500 text-sm"
                        >
                          <option value="all">All Products</option>
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <button
                        disabled={isLoading}
                        className="w-full bg-spirit-900 text-white font-bold py-3 rounded-lg hover:bg-spirit-800 transition"
                      >
                        {isLoading ? (
                          <Loader2 className="animate-spin w-4 h-4 mx-auto" />
                        ) : (
                          "Create Coupon"
                        )}
                      </button>
                    </form>
                  </div>
                </div>

                {/* Coupon List */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">
                            Code
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">
                            Discount
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-sm uppercase">
                            Target
                          </th>
                          <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {coupons.length === 0 ? (
                          <tr>
                            <td
                              colSpan={4}
                              className="text-center py-8 text-gray-500"
                            >
                              No active coupons found.
                            </td>
                          </tr>
                        ) : (
                          coupons.map((c) => (
                            <tr key={c.id}>
                              <td className="px-6 py-4 font-mono font-bold text-spirit-900">
                                {c.code}
                              </td>
                              <td className="px-6 py-4 text-green-600 font-bold">
                                {c.discount_percent}% Off
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-600">
                                {c.product_name}
                              </td>
                              <td className="px-6 py-4 text-right">
                                <button
                                  onClick={() => handleDeleteCoupon(c.id)}
                                  className="text-gray-400 hover:text-red-500 transition"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT LIST & INVENTORY */}
            {productView === "list" && productSubTab === "inventory" && (
              <div className="space-y-6">
                {/* Search & Filter Bar */}
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      placeholder="Search products, SKU, category..."
                      className="w-full pl-9 pr-8 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                    />
                    {productSearchQuery && (
                      <button
                        onClick={() => setProductSearchQuery("")}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
                    {/* Category Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Category:</span>
                      <select
                        value={productCategoryFilter}
                        onChange={(e) => setProductCategoryFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      >
                        <option value="All">All Categories ({products.length})</option>
                        {(storeSettings.categories || defaultCategories).map((cat) => {
                          const count = products.filter(
                            (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                          ).length;
                          return (
                            <option key={cat.id} value={cat.name}>
                              {cat.name} ({count})
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Stock Status Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Status:</span>
                      <select
                        value={productStockFilter}
                        onChange={(e) => setProductStockFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      >
                        <option value="all">All Status</option>
                        <option value="instock">In Stock Only</option>
                        <option value="outofstock">Out of Stock Only</option>
                        <option value="onsale">On Sale Only</option>
                      </select>
                    </div>

                    {/* Display Area Filter */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">Area:</span>
                      <select
                        value={productAreaFilter}
                        onChange={(e) => setProductAreaFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                      >
                        <option value="all">All Display Areas</option>
                        <option value="featured">Featured Spotlight</option>
                        <option value="best_sellers">Best Sellers</option>
                        <option value="catalog">Catalog</option>
                        <option value="flash_deal">Flash Deal</option>
                        <option value="hero">Hero Spotlight</option>
                      </select>
                    </div>

                    {(productCategoryFilter !== "All" || productStockFilter !== "all" || productAreaFilter !== "all" || productSearchQuery) && (
                      <button
                        onClick={() => {
                          setProductCategoryFilter("All");
                          setProductStockFilter("all");
                          setProductAreaFilter("all");
                          setProductSearchQuery("");
                        }}
                        className="text-xs text-spirit-700 hover:text-spirit-900 font-bold underline px-2 cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider w-20">
                            Image
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                            Product & SKU
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                            Category
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                            Price
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                            Display Area
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider">
                            Stock Status
                          </th>
                          <th className="px-6 py-4 font-bold text-gray-700 text-xs uppercase tracking-wider text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {isLoading ? (
                          <tr>
                            <td colSpan={7} className="text-center py-8">
                              <Loader2 className="animate-spin w-6 h-6 mx-auto text-spirit-500" />
                            </td>
                          </tr>
                        ) : products.filter((p) => {
                            if (productSearchQuery.trim()) {
                              const q = productSearchQuery.toLowerCase();
                              const mName = p.name?.toLowerCase().includes(q);
                              const mSku = p.sku?.toLowerCase().includes(q);
                              const mCat = p.category?.toLowerCase().includes(q);
                              const mDesc = p.description?.toLowerCase().includes(q);
                              if (!mName && !mSku && !mCat && !mDesc) return false;
                            }
                            if (productCategoryFilter !== "All") {
                              if (p.category?.toLowerCase() !== productCategoryFilter.toLowerCase())
                                return false;
                            }
                            if (productStockFilter === "instock" && p.isOutOfStock) return false;
                            if (productStockFilter === "outofstock" && !p.isOutOfStock) return false;
                            if (productStockFilter === "onsale" && !p.salePrice) return false;
                            if (productAreaFilter !== "all") {
                              const currentArea = p.displayArea || "catalog";
                              if (currentArea !== productAreaFilter) return false;
                            }
                            return true;
                          }).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                              <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                              <p className="font-bold text-gray-700">No matching products found</p>
                              <p className="text-xs text-gray-400 mt-1">
                                Try resetting filters or click &quot;New Product&quot; to add an item.
                              </p>
                            </td>
                          </tr>
                        ) : (
                          products
                            .filter((p) => {
                              if (productSearchQuery.trim()) {
                                const q = productSearchQuery.toLowerCase();
                                const mName = p.name?.toLowerCase().includes(q);
                                const mSku = p.sku?.toLowerCase().includes(q);
                                const mCat = p.category?.toLowerCase().includes(q);
                                const mDesc = p.description?.toLowerCase().includes(q);
                                if (!mName && !mSku && !mCat && !mDesc) return false;
                              }
                              if (productCategoryFilter !== "All") {
                                if (p.category?.toLowerCase() !== productCategoryFilter.toLowerCase())
                                  return false;
                              }
                              if (productStockFilter === "instock" && p.isOutOfStock) return false;
                              if (productStockFilter === "outofstock" && !p.isOutOfStock) return false;
                              if (productStockFilter === "onsale" && !p.salePrice) return false;
                              if (productAreaFilter !== "all") {
                                const currentArea = p.displayArea || "catalog";
                                if (currentArea !== productAreaFilter) return false;
                              }
                              return true;
                            })
                            .map((product) => (
                              <tr key={product.id} className="hover:bg-gray-50/80 transition group">
                                <td className="px-6 py-3.5">
                                  <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 relative border border-gray-200">
                                    {product.image ? (
                                      <div className="w-full h-full relative">
                                        <img
                                          src={product.image}
                                          alt=""
                                          className={`w-full h-full object-cover ${
                                            product.isBlurBeforeBuy ? "blur-[2px]" : ""
                                          }`}
                                          style={
                                            product.isWrapBeforeBuy
                                              ? { clipPath: "polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)" }
                                              : undefined
                                          }
                                        />
                                        {product.isWrapBeforeBuy && (
                                          <div
                                            className="absolute inset-0 bg-amber-950/40 pointer-events-none"
                                            style={{
                                              clipPath: "polygon(0 0, 100% 0, 100% 35%, 35% 100%, 0 100%)",
                                            }}
                                          />
                                        )}
                                      </div>
                                    ) : (
                                      <ImageIcon className="w-6 h-6 m-3 text-gray-300" />
                                    )}
                                    {product.salePrice && (
                                      <div
                                        className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-xs"
                                        title="On Sale"
                                      />
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5">
                                  <div className="font-bold text-gray-900 text-sm">{product.name}</div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {product.sku && (
                                      <span className="text-[11px] text-gray-400 font-mono">
                                        SKU: {product.sku}
                                      </span>
                                    )}
                                    {product.isBlurBeforeBuy && (
                                      <span className="inline-flex items-center text-[10px] text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded font-semibold">
                                        <EyeOffIcon className="w-2.5 h-2.5 mr-1" /> Blurred
                                      </span>
                                    )}
                                    {product.isWrapBeforeBuy && (
                                      <span className="inline-flex items-center text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-semibold border border-amber-200">
                                        <Lock className="w-2.5 h-2.5 mr-1" /> Wrapped
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5">
                                  <button
                                    onClick={() => setProductCategoryFilter(product.category)}
                                    className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 hover:bg-spirit-50 hover:text-spirit-800 transition cursor-pointer"
                                    title={`Filter by ${product.category}`}
                                  >
                                    {product.category}
                                  </button>
                                </td>
                                <td className="px-6 py-3.5 text-sm font-bold text-spirit-900">
                                  {product.salePrice ? (
                                    <div>
                                      <span className="text-red-600 font-bold">{product.salePrice}</span>
                                      <span className="text-gray-400 text-xs line-through block font-normal">
                                        {product.price}
                                      </span>
                                    </div>
                                  ) : (
                                    product.price
                                  )}
                                </td>
                                <td className="px-6 py-3.5 text-xs">
                                  <div className="flex flex-col gap-1 items-start">
                                    <select
                                      value={product.displayArea || "catalog"}
                                      onChange={(e) => handleQuickChangeDisplayArea(product, e.target.value as any)}
                                      className="text-xs font-semibold px-2 py-1 rounded-md border border-gray-200 bg-white hover:border-spirit-400 focus:ring-1 focus:ring-spirit-500 cursor-pointer text-gray-700 shadow-2xs"
                                      title="Change storefront display area"
                                    >
                                      <option value="catalog">Catalog</option>
                                      <option value="featured">Featured Spotlight</option>
                                      <option value="best_sellers">Best Sellers</option>
                                      <option value="flash_deal">Flash Deal</option>
                                      <option value="hero">Hero Spotlight</option>
                                    </select>
                                    {product.assignedSections && product.assignedSections.length > 0 && (
                                      <div className="flex items-center gap-1 flex-wrap mt-0.5">
                                        {product.assignedSections.map((secId) => {
                                          const sec = (storeSettings.sections || defaultSections).find((s) => s.id === secId);
                                          return (
                                            <span
                                              key={secId}
                                              className="text-[10px] bg-spirit-50 text-spirit-800 px-1.5 py-0.5 rounded font-medium border border-spirit-200/80"
                                              title={`Assigned to section: ${sec?.heading || secId}`}
                                            >
                                              {sec?.heading || secId}
                                            </span>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-sm">
                                  {/* Quick toggle stock with 1 click */}
                                  <button
                                    onClick={() => handleToggleProductStock(product)}
                                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer shadow-2xs ${
                                      product.isOutOfStock
                                        ? "bg-red-50 text-red-700 border border-red-200 hover:bg-red-100"
                                        : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                    }`}
                                    title="Click to toggle stock status"
                                  >
                                    {product.isOutOfStock ? (
                                      <>
                                        <PackageX className="w-3.5 h-3.5 mr-1 text-red-500" />
                                        Out of Stock
                                      </>
                                    ) : (
                                      <>
                                        <CircleCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                                        In Stock
                                      </>
                                    )}
                                  </button>
                                </td>
                                <td className="px-6 py-3.5 text-right whitespace-nowrap">
                                  <div className="flex items-center justify-end space-x-1">
                                    <button
                                      onClick={() => handleEditProduct(product)}
                                      className="p-1.5 text-gray-400 hover:text-spirit-600 hover:bg-spirit-50 rounded-lg transition cursor-pointer"
                                      title="Edit Product"
                                    >
                                      <Pencil size={16} />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteProduct(product.id)}
                                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                      title="Delete Product"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* STOREFRONT SECTIONS & LAYOUTS SUB-TAB */}
            {productView === "list" && productSubTab === "sections" && (
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-gradient-to-r from-spirit-50 via-spirit-100/30 to-spirit-50 border border-spirit-200/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-spirit-950 font-bold text-base">
                      <LayoutGrid className="w-5 h-5 text-spirit-700" />
                      <span>Dynamic Storefront Section & Layout Builder</span>
                    </div>
                    <p className="text-xs text-spirit-900/80 mt-1 max-w-2xl leading-relaxed">
                      Build and manage your Store page layout directly from here. Add customized section headings,
                      adjust product grid columns, set maximum product limits, and target specific products or categories
                      to showcase in each section.
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      onClick={handleOpenCreateSectionModal}
                      className="bg-spirit-800 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-700 transition shadow-md flex items-center text-xs cursor-pointer whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4 mr-1.5" />
                      Add New Section
                    </button>
                  </div>
                </div>

                {/* Section Cards List */}
                <div className="space-y-4">
                  {((storeSettings.sections || defaultSections).length === 0) ? (
                    <div className="bg-white p-12 text-center rounded-2xl border border-gray-200">
                      <LayoutGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <h4 className="font-bold text-gray-800 text-base">No storefront sections configured</h4>
                      <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
                        Click &quot;Add New Section&quot; to create a custom product showcase with custom headings, layout adjustments, and curated products.
                      </p>
                      <button
                        onClick={handleOpenCreateSectionModal}
                        className="mt-4 bg-spirit-800 text-white font-bold py-2 px-4 rounded-lg text-xs hover:bg-spirit-700 transition cursor-pointer"
                      >
                        Create First Section
                      </button>
                    </div>
                  ) : (
                    (storeSettings.sections || defaultSections).map((section, index) => {
                      // Calculate matching products for preview
                      let matchingProducts: Product[] = [];
                      const src = section.productSource || { type: "all" };

                      if (src.type === "specific_products") {
                        const ids = src.selectedProductIds || [];
                        matchingProducts = products.filter((p) => ids.includes(p.id));
                      } else if (src.type === "by_category") {
                        const cats = (src.selectedCategories || []).map((c) => c.toLowerCase());
                        matchingProducts = products.filter((p) => cats.includes((p.category || "").toLowerCase()));
                      } else if (src.type === "assigned_area") {
                        const area = src.assignedArea || "featured";
                        matchingProducts = products.filter(
                          (p) =>
                            (p.displayArea === area) ||
                            (area === "featured" && (!p.displayArea || p.displayArea === "featured")) ||
                            (p.assignedSections && p.assignedSections.includes(section.id))
                        );
                      } else {
                        matchingProducts = [...products];
                      }

                      // Also check products explicitly assigned to this section
                      const explicit = products.filter((p) => p.assignedSections && p.assignedSections.includes(section.id));
                      explicit.forEach((p) => {
                        if (!matchingProducts.some((existing) => existing.id === p.id)) {
                          matchingProducts.push(p);
                        }
                      });

                      const totalMatching = matchingProducts.length;
                      const maxLimit = section.layout?.maxProducts || 8;
                      const displayedCount = Math.min(totalMatching, maxLimit);

                      return (
                        <div
                          key={section.id}
                          className={`bg-white rounded-2xl border transition shadow-xs hover:shadow-md p-5 ${
                            section.enabled ? "border-gray-200" : "border-gray-200/60 bg-gray-50/50 opacity-75"
                          }`}
                        >
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Left: Reorder & Main Info */}
                            <div className="flex items-start gap-3.5 flex-1 min-w-0">
                              {/* Order & Reorder Arrows */}
                              <div className="flex flex-col items-center justify-center shrink-0 pt-0.5">
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(index, "up")}
                                  disabled={index === 0}
                                  className={`p-1 rounded hover:bg-gray-100 transition cursor-pointer ${
                                    index === 0 ? "text-gray-200 cursor-not-allowed" : "text-gray-500 hover:text-spirit-700"
                                  }`}
                                  title="Move Section Up"
                                >
                                  <MoveUp size={14} />
                                </button>
                                <span className="text-[11px] font-bold font-mono text-gray-500 my-0.5">
                                  #{index + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleMoveSection(index, "down")}
                                  disabled={index === (storeSettings.sections || defaultSections).length - 1}
                                  className={`p-1 rounded hover:bg-gray-100 transition cursor-pointer ${
                                    index === (storeSettings.sections || defaultSections).length - 1
                                      ? "text-gray-200 cursor-not-allowed"
                                      : "text-gray-500 hover:text-spirit-700"
                                  }`}
                                  title="Move Section Down"
                                >
                                  <MoveDown size={14} />
                                </button>
                              </div>

                              {/* Title, Badge & Meta */}
                              <div className="space-y-1.5 min-w-0 flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-base font-serif font-bold text-gray-900 truncate">
                                    {section.heading}
                                  </h3>
                                  {section.badge && (
                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-spirit-50 text-spirit-800 border border-spirit-200 uppercase tracking-wider">
                                      {section.badge}
                                    </span>
                                  )}
                                  <button
                                    onClick={() => handleToggleSectionEnabled(section.id)}
                                    className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition ${
                                      section.enabled
                                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                                        : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200"
                                    }`}
                                    title="Click to toggle section visibility on the storefront"
                                  >
                                    {section.enabled ? (
                                      <>
                                        <CircleCheck className="w-3 h-3 mr-1 text-emerald-500" />
                                        Visible on Store
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="w-3 h-3 mr-1 text-gray-400" />
                                        Hidden
                                      </>
                                    )}
                                  </button>
                                </div>

                                {section.subheading && (
                                  <p className="text-xs text-gray-500 line-clamp-1">{section.subheading}</p>
                                )}

                                {/* Badges for layout, product source & limit */}
                                <div className="flex items-center gap-2 flex-wrap pt-1 text-[11px]">
                                  {/* Grid columns */}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                                    <LayoutGrid className="w-3 h-3 mr-1 text-gray-500" />
                                    {section.layout?.columns || 4} Columns Grid
                                  </span>

                                  {/* Max products limit */}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                                    <Tag className="w-3 h-3 mr-1 text-gray-500" />
                                    Limit: {maxLimit} Products (Showing {displayedCount})
                                  </span>

                                  {/* Product source */}
                                  <span className="inline-flex items-center px-2 py-0.5 rounded bg-spirit-50 text-spirit-800 font-medium border border-spirit-200/50">
                                    <Layers className="w-3 h-3 mr-1 text-spirit-600" />
                                    {src.type === "all"
                                      ? "Source: All Catalog"
                                      : src.type === "by_category"
                                      ? `Categories: ${(src.selectedCategories || []).join(", ") || "None"}`
                                      : src.type === "specific_products"
                                      ? `Specific: ${(src.selectedProductIds || []).length} Chosen Products`
                                      : `Area: ${src.assignedArea || "featured"}`}
                                  </span>

                                  {section.showViewAll && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-spirit-50 text-spirit-800 font-medium border border-spirit-200/50">
                                      View All: {section.viewAllCategory || "All"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Middle / Right: Product Avatars Preview & Actions */}
                            <div className="flex items-center justify-between lg:justify-end gap-4 w-full lg:w-auto border-t lg:border-t-0 pt-3 lg:pt-0 border-gray-100">
                              {/* Product avatars thumbnails */}
                              <div className="flex items-center gap-1.5" title="Sample products in this section">
                                {matchingProducts.slice(0, 4).map((p) => (
                                  <img
                                    key={p.id}
                                    src={p.image}
                                    alt={p.name}
                                    className="w-8 h-8 rounded-md object-cover border border-gray-200 bg-gray-50"
                                    title={p.name}
                                  />
                                ))}
                                {totalMatching > 4 && (
                                  <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-1 rounded">
                                    +{totalMatching - 4}
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditSectionModal(section)}
                                  className="px-3 py-1.5 text-xs font-bold text-spirit-800 bg-spirit-50 hover:bg-spirit-100 rounded-lg border border-spirit-200/80 transition flex items-center gap-1 cursor-pointer"
                                  title="Edit section layout, heading & products"
                                >
                                  <Pencil size={13} />
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDuplicateSection(section)}
                                  className="p-1.5 text-gray-400 hover:text-spirit-700 hover:bg-spirit-50 rounded-lg transition cursor-pointer"
                                  title="Duplicate Section"
                                >
                                  <Copy size={15} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(section.id)}
                                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                  title="Delete Section"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Section Add/Edit Modal */}
                {sectionModalOpen && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 max-w-2xl w-full p-6 my-auto max-h-[92vh] flex flex-col animate-fade-in">
                      {/* Modal Header */}
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100 shrink-0">
                        <div>
                          <h3 className="text-xl font-serif font-bold text-gray-900 flex items-center gap-2">
                            <LayoutGrid className="w-5 h-5 text-spirit-700" />
                            {editingSection ? "Edit Storefront Section" : "Create Storefront Section"}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Adjust section heading, column layout, product display limit, and targeted products.
                          </p>
                        </div>
                        <button
                          onClick={() => setSectionModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      {/* Modal Body */}
                      <form onSubmit={handleSaveSection} className="space-y-5 overflow-y-auto py-4 pr-1 flex-1">
                        {/* 1. SECTION HEADING & BADGE */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                            <PenTool className="w-3.5 h-3.5 text-spirit-700" />
                            Section Heading & Content
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="md:col-span-2">
                              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                Section Heading <span className="text-red-500">*</span>
                              </label>
                              <input
                                type="text"
                                required
                                value={sectionForm.heading}
                                onChange={(e) => setSectionForm({ ...sectionForm, heading: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-semibold text-gray-800"
                                placeholder="e.g. Rare Yemeni Aqeeq Treasures"
                              />
                            </div>
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                                Eyebrow Badge (Optional)
                              </label>
                              <input
                                type="text"
                                value={sectionForm.badge || ""}
                                onChange={(e) => setSectionForm({ ...sectionForm, badge: e.target.value })}
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                                placeholder="e.g. Sacred Collection"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">
                              Subheading / Description
                            </label>
                            <input
                              type="text"
                              value={sectionForm.subheading || ""}
                              onChange={(e) => setSectionForm({ ...sectionForm, subheading: e.target.value })}
                              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none text-gray-600"
                              placeholder="e.g. Masterfully engraved spiritual rings with authentic natural stones."
                            />
                          </div>

                          {/* View All button config */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 border-t border-gray-200/60">
                            <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                              <span className="text-xs font-semibold text-gray-700">Show &quot;View All&quot; Link</span>
                              <input
                                type="checkbox"
                                checked={sectionForm.showViewAll}
                                onChange={(e) => setSectionForm({ ...sectionForm, showViewAll: e.target.checked })}
                                className="rounded border-gray-300 text-spirit-800 focus:ring-spirit-500 w-4 h-4 cursor-pointer"
                              />
                            </div>
                            {sectionForm.showViewAll && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600 font-semibold whitespace-nowrap">Filter To:</span>
                                <select
                                  value={sectionForm.viewAllCategory || "All"}
                                  onChange={(e) => setSectionForm({ ...sectionForm, viewAllCategory: e.target.value })}
                                  className="w-full px-2.5 py-2 rounded-lg border border-gray-200 text-xs bg-white focus:ring-2 focus:ring-spirit-500 outline-none"
                                >
                                  <option value="All">All Categories</option>
                                  {(storeSettings.categories || defaultCategories).map((c) => (
                                    <option key={c.id} value={c.name}>
                                      {c.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 2. LAYOUT ADJUSTMENT & PRODUCT NUMBER */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                          <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5 text-spirit-700" />
                            Section Layout Adjustment & Product Limit
                          </h4>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Grid Columns */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">
                                Grid Columns (Desktop)
                              </label>
                              <div className="grid grid-cols-5 gap-1.5">
                                {[2, 3, 4, 5, 6].map((cols) => (
                                  <button
                                    type="button"
                                    key={cols}
                                    onClick={() =>
                                      setSectionForm({
                                        ...sectionForm,
                                        layout: { ...sectionForm.layout, columns: cols },
                                      })
                                    }
                                    className={`py-2 text-xs font-bold rounded-lg border transition cursor-pointer text-center ${
                                      sectionForm.layout?.columns === cols
                                        ? "bg-spirit-800 text-white border-spirit-800 shadow-xs"
                                        : "bg-white text-gray-700 border-gray-200 hover:bg-gray-100"
                                    }`}
                                  >
                                    {cols} Cols
                                  </button>
                                ))}
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                Controls how many product cards are displayed per row.
                              </p>
                            </div>

                            {/* Max Products Limit */}
                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1.5">
                                Number of Products to Display
                              </label>
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={1}
                                  max={48}
                                  value={sectionForm.layout?.maxProducts || 8}
                                  onChange={(e) =>
                                    setSectionForm({
                                      ...sectionForm,
                                      layout: {
                                        ...sectionForm.layout,
                                        maxProducts: Math.max(1, parseInt(e.target.value) || 1),
                                      },
                                    })
                                  }
                                  className="w-24 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white font-bold text-spirit-950 focus:ring-2 focus:ring-spirit-500 outline-none text-center"
                                />
                                <div className="flex items-center gap-1 flex-wrap">
                                  {[4, 8, 12, 16].map((num) => (
                                    <button
                                      type="button"
                                      key={num}
                                      onClick={() =>
                                        setSectionForm({
                                          ...sectionForm,
                                          layout: { ...sectionForm.layout, maxProducts: num },
                                        })
                                      }
                                      className={`px-2 py-1 text-[11px] font-bold rounded border transition cursor-pointer ${
                                        sectionForm.layout?.maxProducts === num
                                          ? "bg-spirit-100 text-spirit-800 border-spirit-300"
                                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                                      }`}
                                    >
                                      {num}
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <p className="text-[10px] text-gray-500 mt-1">
                                Caps maximum products shown in this section.
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 3. PRODUCT & CATEGORY TARGETING */}
                        <div className="bg-gray-50/70 p-4 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                              <Package className="w-3.5 h-3.5 text-spirit-700" />
                              Displaying Specific Products & Categories
                            </h4>
                            <span className="text-[11px] text-spirit-800 font-semibold bg-spirit-50 px-2 py-0.5 rounded border border-spirit-200">
                              Targeting Strategy
                            </span>
                          </div>

                          {/* Source Strategy Tabs */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-gray-200/70 p-1 rounded-lg">
                            <button
                              type="button"
                              onClick={() =>
                                setSectionForm({
                                  ...sectionForm,
                                  productSource: { ...sectionForm.productSource, type: "all" },
                                })
                              }
                              className={`py-1.5 px-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                                sectionForm.productSource.type === "all"
                                  ? "bg-white text-spirit-900 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              All Catalog
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSectionForm({
                                  ...sectionForm,
                                  productSource: { ...sectionForm.productSource, type: "by_category" },
                                })
                              }
                              className={`py-1.5 px-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                                sectionForm.productSource.type === "by_category"
                                  ? "bg-white text-spirit-900 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              By Category
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSectionForm({
                                  ...sectionForm,
                                  productSource: { ...sectionForm.productSource, type: "specific_products" },
                                })
                              }
                              className={`py-1.5 px-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                                sectionForm.productSource.type === "specific_products"
                                  ? "bg-white text-spirit-900 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Specific Products
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setSectionForm({
                                  ...sectionForm,
                                  productSource: { ...sectionForm.productSource, type: "assigned_area" },
                                })
                              }
                              className={`py-1.5 px-2 text-xs font-bold rounded-md transition cursor-pointer text-center ${
                                sectionForm.productSource.type === "assigned_area"
                                  ? "bg-white text-spirit-900 shadow-xs"
                                  : "text-gray-600 hover:text-gray-900"
                              }`}
                            >
                              Assigned Area
                            </button>
                          </div>

                          {/* 3A. Strategy: BY CATEGORY */}
                          {sectionForm.productSource.type === "by_category" && (
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-700">Select Categories for this Section:</span>
                                <span className="text-[11px] text-gray-500">
                                  {(sectionForm.productSource.selectedCategories || []).length} Selected
                                </span>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {(storeSettings.categories || defaultCategories).map((cat) => {
                                  const isSelected = (sectionForm.productSource.selectedCategories || []).includes(cat.name);
                                  const count = products.filter(
                                    (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                                  ).length;
                                  return (
                                    <label
                                      key={cat.id}
                                      className={`flex items-center gap-2 p-2 rounded-lg border text-xs cursor-pointer transition ${
                                        isSelected
                                          ? "bg-spirit-50 border-spirit-300 text-spirit-900 font-semibold"
                                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => {
                                          const current = sectionForm.productSource.selectedCategories || [];
                                          const updated = e.target.checked
                                            ? [...current, cat.name]
                                            : current.filter((c) => c !== cat.name);
                                          setSectionForm({
                                            ...sectionForm,
                                            productSource: {
                                              ...sectionForm.productSource,
                                              selectedCategories: updated,
                                            },
                                          });
                                        }}
                                        className="rounded border-gray-300 text-spirit-800 focus:ring-spirit-500 w-3.5 h-3.5 cursor-pointer"
                                      />
                                      <span className="truncate">{cat.name}</span>
                                      <span className="text-[10px] text-gray-400 font-normal ml-auto">({count})</span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* 3B. Strategy: SPECIFIC PRODUCTS PICKER */}
                          {sectionForm.productSource.type === "specific_products" && (
                            <div className="space-y-2.5 bg-white p-3.5 rounded-xl border border-gray-200">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                <span className="text-xs font-bold text-gray-700">
                                  Select Specific Products to Display:
                                </span>
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                  <div className="relative flex-1 sm:w-48">
                                    <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                                    <input
                                      type="text"
                                      value={sectionProductSearch}
                                      onChange={(e) => setSectionProductSearch(e.target.value)}
                                      placeholder="Search products..."
                                      className="w-full pl-8 pr-2 py-1 text-xs rounded border border-gray-200 outline-none focus:ring-1 focus:ring-spirit-500"
                                    />
                                  </div>
                                  <span className="text-[11px] font-bold text-spirit-800 bg-spirit-50 px-2 py-1 rounded border border-spirit-200 whitespace-nowrap">
                                    {(sectionForm.productSource.selectedProductIds || []).length} Picked
                                  </span>
                                </div>
                              </div>

                              {/* Checklist of products */}
                              <div className="max-h-52 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-lg pr-1">
                                {products
                                  .filter((p) => {
                                    if (!sectionProductSearch.trim()) return true;
                                    const q = sectionProductSearch.toLowerCase();
                                    return (
                                      p.name?.toLowerCase().includes(q) ||
                                      p.category?.toLowerCase().includes(q) ||
                                      p.sku?.toLowerCase().includes(q)
                                    );
                                  })
                                  .map((product) => {
                                    const isChecked = (
                                      sectionForm.productSource.selectedProductIds || []
                                    ).includes(product.id);
                                    return (
                                      <label
                                        key={product.id}
                                        className={`flex items-center gap-3 p-2 hover:bg-gray-50 text-xs cursor-pointer transition ${
                                          isChecked ? "bg-spirit-50/70" : ""
                                        }`}
                                      >
                                        <input
                                          type="checkbox"
                                          checked={isChecked}
                                          onChange={(e) => {
                                            const current =
                                              sectionForm.productSource.selectedProductIds || [];
                                            const updated = e.target.checked
                                              ? [...current, product.id]
                                              : current.filter((id) => id !== product.id);
                                            setSectionForm({
                                              ...sectionForm,
                                              productSource: {
                                                ...sectionForm.productSource,
                                                selectedProductIds: updated,
                                              },
                                            });
                                          }}
                                          className="rounded border-gray-300 text-spirit-800 focus:ring-spirit-500 w-4 h-4 cursor-pointer"
                                        />
                                        <img
                                          src={product.image}
                                          alt=""
                                          className="w-9 h-9 rounded object-cover border border-gray-200 bg-gray-100 shrink-0"
                                        />
                                        <div className="min-w-0 flex-1">
                                          <div className="font-bold text-gray-900 truncate">{product.name}</div>
                                          <div className="text-[11px] text-gray-400 flex items-center gap-2">
                                            <span>{product.category}</span>
                                            <span>•</span>
                                            <span className="font-semibold text-spirit-800">{product.price}</span>
                                          </div>
                                        </div>
                                      </label>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* 3C. Strategy: ASSIGNED DISPLAY AREA */}
                          {sectionForm.productSource.type === "assigned_area" && (
                            <div className="space-y-2 bg-white p-3.5 rounded-xl border border-gray-200">
                              <label className="block text-xs font-bold text-gray-700 mb-1">
                                Select Display Area:
                              </label>
                              <select
                                value={sectionForm.productSource.assignedArea || "featured"}
                                onChange={(e) =>
                                  setSectionForm({
                                    ...sectionForm,
                                    productSource: {
                                      ...sectionForm.productSource,
                                      assignedArea: e.target.value as any,
                                    },
                                  })
                                }
                                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white focus:ring-2 focus:ring-spirit-500 outline-none font-semibold text-gray-800"
                              >
                                <option value="featured">Featured Spotlight</option>
                                <option value="best_sellers">Best Sellers</option>
                                <option value="catalog">Standard Catalog</option>
                                <option value="flash_deal">Flash Deal</option>
                                <option value="hero">Hero Spotlight</option>
                              </select>
                              <p className="text-[11px] text-gray-500">
                                This section will pull all products whose &quot;Display Area&quot; matches this setting.
                              </p>
                            </div>
                          )}

                          {/* 3D. Strategy: ALL CATALOG */}
                          {sectionForm.productSource.type === "all" && (
                            <div className="bg-white p-3 rounded-lg border border-gray-200 text-xs text-gray-600">
                              This section will display all available catalog items up to the maximum product limit of{" "}
                              <strong className="text-spirit-950">{sectionForm.layout?.maxProducts || 8} products</strong>.
                            </div>
                          )}
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="flex justify-end gap-3 pt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setSectionModalOpen(false)}
                            className="px-5 py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-spirit-800 text-white hover:bg-spirit-700 transition shadow-md flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-4 h-4" />
                            {editingSection ? "Update Section" : "Create Section"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CATEGORIES & POPULAR SHOWCASE SUB-TAB */}
            {productView === "list" && productSubTab === "categories" && (
              <div className="space-y-6">
                {/* Info Card */}
                <div className="bg-gradient-to-r from-spirit-50 via-spirit-100/30 to-spirit-50 border border-spirit-200/80 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-spirit-950 font-bold">
                      <Sparkles className="w-5 h-5 text-spirit-700" />
                      <span>Dynamic Category System</span>
                    </div>
                    <p className="text-xs text-spirit-900/80 mt-1 max-w-2xl leading-relaxed">
                      Categories here dynamically populate the top filter bar and product groupings on the Store page.
                      Toggle the <strong className="text-spirit-950">⭐ Popular Showcase</strong> switch on any category
                      to feature it inside the prominent 4-card Popular Categories section.
                    </p>
                  </div>
                  <button
                    onClick={handleOpenAddCategory}
                    className="bg-spirit-800 text-white font-bold py-2.5 px-5 rounded-xl hover:bg-spirit-700 transition shadow-sm flex items-center text-sm shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Category
                  </button>
                </div>

                {/* Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(storeSettings.categories || defaultCategories).map((cat) => {
                    const categoryProducts = products.filter(
                      (p) => p.category?.toLowerCase() === cat.name.toLowerCase()
                    );
                    const isPopular = cat.isPopular ?? true;

                    return (
                      <div
                        key={cat.id}
                        className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col"
                      >
                        {/* Image Header */}
                        <div className="h-36 relative bg-gray-100 overflow-hidden">
                          <img
                            src={cat.image}
                            alt={cat.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                          <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                            <div>
                              <h3 className="text-lg font-serif font-bold text-white leading-tight">
                                {cat.name}
                              </h3>
                              <p className="text-xs text-spirit-200/90 font-medium mt-0.5">
                                {cat.subtitle || `${categoryProducts.length} Items`}
                              </p>
                            </div>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white font-bold">
                              {categoryProducts.length} Products
                            </span>
                          </div>

                          {/* Popular Tag Badge */}
                          <div className="absolute top-3 right-3">
                            <button
                              onClick={() => handleTogglePopularCategory(cat.id)}
                              className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center shadow-xs transition cursor-pointer ${
                                isPopular
                                  ? "bg-spirit-800 text-white hover:bg-spirit-700"
                                  : "bg-black/40 text-gray-300 hover:bg-black/60"
                              }`}
                              title={isPopular ? "Featured in Popular Showcase" : "Click to feature in Popular Showcase"}
                            >
                              <Star className={`w-3 h-3 mr-1 ${isPopular ? "fill-white" : ""}`} />
                              {isPopular ? "Popular" : "Standard"}
                            </button>
                          </div>
                        </div>

                        {/* Card Body & Actions */}
                        <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Showcase Status:</span>
                              <span className={isPopular ? "text-spirit-800 font-bold" : "text-gray-400 font-medium"}>
                                {isPopular ? "⭐ Active in 4-Card Grid" : "Top Filter Only"}
                              </span>
                            </div>

                            {/* Direct "Add Product for this Category" Button */}
                            <button
                              onClick={() => handleAddProductForCategory(cat.name)}
                              className="w-full py-2 px-3 rounded-lg bg-spirit-50 hover:bg-spirit-100 text-spirit-800 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer border border-spirit-200/60"
                            >
                              <Plus className="w-3.5 h-3.5 text-spirit-600" />
                              Add Product to {cat.name}
                            </button>
                          </div>

                          <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                            <button
                              onClick={() => {
                                setProductCategoryFilter(cat.name);
                                setProductSubTab("inventory");
                              }}
                              className="text-xs text-gray-500 hover:text-spirit-700 font-medium flex items-center gap-1 cursor-pointer"
                            >
                              View Products ({categoryProducts.length}) <ChevronRight className="w-3 h-3" />
                            </button>

                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEditCategory(cat)}
                                className="p-1.5 text-gray-400 hover:text-spirit-600 hover:bg-spirit-50 rounded-lg transition cursor-pointer"
                                title="Edit Category"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id, cat.name)}
                                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                title="Delete Category"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Category Add/Edit Modal */}
                {categoryModalOpen && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl sm:rounded-2xl shadow-2xl border border-gray-200 max-w-md w-full p-4 sm:p-5 my-auto max-h-[90vh] flex flex-col animate-fade-in">
                      <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-gray-100 shrink-0">
                        <h3 className="text-lg sm:text-xl font-serif font-bold text-gray-900">
                          {editingCategory ? "Edit Category" : "Add New Category"}
                        </h3>
                        <button
                          onClick={() => setCategoryModalOpen(false)}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                        >
                          <X size={18} />
                        </button>
                      </div>

                      <form onSubmit={handleSaveCategory} className="space-y-3 overflow-y-auto pr-1 flex-1">
                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                            Category Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={categoryForm.name}
                            onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                            placeholder="e.g. Sacred Oils & Oud"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                            Subtitle / Tagline
                          </label>
                          <input
                            type="text"
                            value={categoryForm.subtitle || ""}
                            onChange={(e) => setCategoryForm({ ...categoryForm, subtitle: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                            placeholder="e.g. 12+ Rare Pure Scents"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-gray-700 uppercase mb-1">
                            Cover Image URL
                          </label>
                          <input
                            type="text"
                            required
                            value={categoryForm.image}
                            onChange={(e) => setCategoryForm({ ...categoryForm, image: e.target.value })}
                            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                            placeholder="https://images.unsplash.com/..."
                          />

                          {/* Preset Images Chooser */}
                          <div className="mt-1.5">
                            <span className="text-[10px] text-gray-400 block mb-1 font-medium">
                              Or pick curated spiritual photography:
                            </span>
                            <div className="grid grid-cols-3 gap-1.5">
                              {[
                                { name: "Rings / Aqeeq", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=400&auto=format&fit=crop" },
                                { name: "Crystal Beads", url: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=400&auto=format&fit=crop" },
                                { name: "Pure Musk", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=400&auto=format&fit=crop" },
                                { name: "Zamzam Flacon", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=400&auto=format&fit=crop" },
                                { name: "Calligraphy", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=400&auto=format&fit=crop" },
                                { name: "Bakhoor & Oud", url: "https://images.unsplash.com/photo-1615486511262-c7b5c7f4297e?q=80&w=400&auto=format&fit=crop" },
                              ].map((preset) => (
                                <button
                                  type="button"
                                  key={preset.name}
                                  onClick={() => setCategoryForm({ ...categoryForm, image: preset.url })}
                                  className="text-[10px] py-1 px-1.5 rounded border border-gray-200 text-gray-600 hover:border-spirit-500 hover:text-spirit-800 bg-gray-50 text-left truncate transition cursor-pointer"
                                >
                                  {preset.name}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Popular Showcase Toggle */}
                        <div className="pt-2.5 pb-0.5 border-t border-gray-100 flex items-center justify-between">
                          <div>
                            <span className="text-xs sm:text-sm font-bold text-gray-800 flex items-center gap-1.5">
                              <Star className="w-3.5 h-3.5 text-spirit-600 fill-spirit-600" />
                              Feature in Popular Showcase
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-gray-500 block">
                              Include in visual cards showcase on store front.
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCategoryForm({ ...categoryForm, isPopular: !categoryForm.isPopular })}
                            className={`relative inline-flex h-5 w-10 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                              categoryForm.isPopular ? "bg-spirit-800" : "bg-gray-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                categoryForm.isPopular ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>

                        <div className="flex justify-end gap-2.5 pt-3 border-t border-gray-100 shrink-0">
                          <button
                            type="button"
                            onClick={() => setCategoryModalOpen(false)}
                            className="px-3.5 py-1.5 text-xs sm:text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-spirit-800 text-white text-xs sm:text-sm font-bold rounded-lg hover:bg-spirit-700 transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <Save className="w-3.5 h-3.5" />
                            {editingCategory ? "Update Category" : "Save Category"}
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* COUNTDOWN COUNTER & PRODUCT TIMERS SUB-TAB */}
            {productView === "list" && productSubTab === "counter" && (
              <div className="space-y-6">
                <ProductCountdownsManager
                  products={products}
                  countdowns={storeSettings.productCountdowns || defaultProductCountdowns}
                  onSave={handleSaveCountdowns}
                />
              </div>
            )}

            {/* STORE PAGE BANNERS & CONTENT SUB-TAB */}
            {productView === "list" && productSubTab === "page_content" && (
              <div className="space-y-6">
                <form onSubmit={handleSavePageSettings} className="space-y-8">
                  {/* Announcement Bar */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                      <h3 className="font-serif font-bold text-gray-900 text-lg">Top Announcement Bar</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-gray-500">Enable:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              announcement: {
                                ...pageSettingsForm.announcement,
                                enabled: !pageSettingsForm.announcement.enabled,
                              },
                            })
                          }
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            pageSettingsForm.announcement.enabled ? "bg-spirit-600" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              pageSettingsForm.announcement.enabled ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Announcement Text
                      </label>
                      <input
                        type="text"
                        value={pageSettingsForm.announcement.text}
                        onChange={(e) =>
                          setPageSettingsForm({
                            ...pageSettingsForm,
                            announcement: { ...pageSettingsForm.announcement, text: e.target.value },
                          })
                        }
                        className="w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                      />
                    </div>
                  </div>

                  {/* Sanctuary Hero Banner */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-serif font-bold text-gray-900 text-lg pb-3 border-b border-gray-100">
                      Storefront Hero Banner
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Badge Pill</label>
                        <input
                          type="text"
                          value={pageSettingsForm.hero.badge}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              hero: { ...pageSettingsForm.hero, badge: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Title Heading</label>
                        <input
                          type="text"
                          value={pageSettingsForm.hero.title}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              hero: { ...pageSettingsForm.hero, title: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Highlight Word (Gold Accent)
                        </label>
                        <input
                          type="text"
                          value={pageSettingsForm.hero.highlight}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              hero: { ...pageSettingsForm.hero, highlight: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none text-spirit-800 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Discount Tag</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={pageSettingsForm.hero.discountTag}
                            onChange={(e) =>
                              setPageSettingsForm({
                                ...pageSettingsForm,
                                hero: { ...pageSettingsForm.hero, discountTag: e.target.value },
                              })
                            }
                            className="flex-1 px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                          />
                          <input
                            type="text"
                            value={pageSettingsForm.hero.discountPercent}
                            onChange={(e) =>
                              setPageSettingsForm({
                                ...pageSettingsForm,
                                hero: { ...pageSettingsForm.hero, discountPercent: e.target.value },
                              })
                            }
                            className="w-20 px-2 py-2 text-center rounded-lg border border-gray-200 text-sm font-bold text-red-600"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Subtitle</label>
                        <textarea
                          rows={2}
                          value={pageSettingsForm.hero.subtitle}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              hero: { ...pageSettingsForm.hero, subtitle: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Hero Showcase Image URL
                        </label>
                        <input
                          type="text"
                          value={pageSettingsForm.hero.image}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              hero: { ...pageSettingsForm.hero, image: e.target.value },
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-spirit-500 outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Dual Promo Banners */}
                  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-4">
                    <h3 className="font-serif font-bold text-gray-900 text-lg pb-3 border-b border-gray-100">
                      Dual Promotional Banners (Amber & Emerald)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Banner 1 */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-3">
                        <span className="text-xs font-bold text-amber-900 uppercase">Banner 1 (Amber Glow)</span>
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner1.tag}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner1: { ...pageSettingsForm.promoBanners.banner1, tag: e.target.value },
                              },
                            })
                          }
                          placeholder="Tag"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner1.title}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner1: { ...pageSettingsForm.promoBanners.banner1, title: e.target.value },
                              },
                            })
                          }
                          placeholder="Title"
                          className="w-full px-3 py-1.5 text-sm font-bold rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner1.subtitle}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner1: { ...pageSettingsForm.promoBanners.banner1, subtitle: e.target.value },
                              },
                            })
                          }
                          placeholder="Subtitle"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner1.image}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner1: { ...pageSettingsForm.promoBanners.banner1, image: e.target.value },
                              },
                            })
                          }
                          placeholder="Image URL"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                      </div>

                      {/* Banner 2 */}
                      <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 space-y-3">
                        <span className="text-xs font-bold text-emerald-900 uppercase">Banner 2 (Emerald Grace)</span>
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner2.tag}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner2: { ...pageSettingsForm.promoBanners.banner2, tag: e.target.value },
                              },
                            })
                          }
                          placeholder="Tag"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner2.title}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner2: { ...pageSettingsForm.promoBanners.banner2, title: e.target.value },
                              },
                            })
                          }
                          placeholder="Title"
                          className="w-full px-3 py-1.5 text-sm font-bold rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner2.subtitle}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner2: { ...pageSettingsForm.promoBanners.banner2, subtitle: e.target.value },
                              },
                            })
                          }
                          placeholder="Subtitle"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                        <input
                          type="text"
                          value={pageSettingsForm.promoBanners.banner2.image}
                          onChange={(e) =>
                            setPageSettingsForm({
                              ...pageSettingsForm,
                              promoBanners: {
                                ...pageSettingsForm.promoBanners,
                                banner2: { ...pageSettingsForm.promoBanners.banner2, image: e.target.value },
                              },
                            })
                          }
                          placeholder="Image URL"
                          className="w-full px-3 py-1.5 text-xs rounded border border-gray-200 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-gray-100">
                    <button
                      type="submit"
                      className="bg-spirit-900 text-white font-bold px-8 py-3 rounded-xl hover:bg-spirit-800 transition shadow-md flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      Save Store Page Content
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PRODUCT FORM */}
            {productView === "form" && (
              <form
                onSubmit={handleSaveProduct}
                className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 space-y-8 animate-fade-in"
              >
                {/* Main Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      type="text"
                      required
                      value={productForm.name}
                      onChange={(e) =>
                        setProductForm({ ...productForm, name: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                      placeholder="e.g. Yemeni Aqeeq Ring"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Price ($)
                      </label>
                      <input
                        type="text"
                        required
                        value={productForm.price}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            price: e.target.value,
                          })
                        }
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="$85.00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center">
                        SKU{" "}
                        <span className="text-gray-400 text-xs ml-2 font-normal">
                          (Optional)
                        </span>
                      </label>
                      <div className="relative">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          value={productForm.sku}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              sku: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none"
                          placeholder="SKU-123"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Category Selector */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Product Category <span className="text-red-500">*</span>
                    </label>

                    {/* Pre-populated Category Select */}
                    <div className="relative">
                      <Layers className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <select
                        value={
                          (storeSettings.categories || defaultCategories).some(
                            (c) => c.name.toLowerCase() === productForm.category.toLowerCase()
                          )
                            ? productForm.category
                            : productForm.category
                            ? "CUSTOM"
                            : ""
                        }
                        onChange={(e) => {
                          if (e.target.value !== "CUSTOM") {
                            setProductForm({ ...productForm, category: e.target.value });
                          }
                        }}
                        className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none bg-white text-sm"
                      >
                        <option value="" disabled>
                          Select a Store Category...
                        </option>
                        {(storeSettings.categories || defaultCategories).map((cat) => (
                          <option key={cat.id} value={cat.name}>
                            {cat.name} {cat.isPopular ? "(⭐ Popular)" : ""}
                          </option>
                        ))}
                        <option value="CUSTOM">+ Enter Custom Category</option>
                      </select>
                    </div>

                    {/* Quick Category Chips for instant selection */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(storeSettings.categories || defaultCategories).map((cat) => (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setProductForm({ ...productForm, category: cat.name })}
                          className={`text-xs px-2.5 py-1 rounded-md font-semibold transition cursor-pointer ${
                            productForm.category?.toLowerCase() === cat.name.toLowerCase()
                              ? "bg-spirit-800 text-white shadow-xs"
                              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                          }`}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Manual Category Input fallback/custom */}
                    <div className="pt-1">
                      <input
                        type="text"
                        required
                        value={productForm.category}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            category: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:ring-2 focus:ring-spirit-500 outline-none"
                        placeholder="Or type/modify custom category name..."
                      />
                    </div>
                  </div>

                  {/* Image Field & Spiritual Presets */}
                  <div className="space-y-2">
                    <label className="block text-sm font-bold text-gray-700">
                      Product Image URL <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <ImageIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={productForm.image}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              image: e.target.value,
                            })
                          }
                          className="w-full pl-9 pr-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-sm"
                          placeholder="https://images.unsplash.com/..."
                        />
                      </div>
                      {productForm.image && (
                        <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200 shrink-0 relative">
                          <img
                            src={productForm.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                    </div>

                    {/* Curated Spiritual Photo Presets */}
                    <div className="pt-1">
                      <span className="text-[11px] text-gray-400 block mb-1 font-medium">
                        Curated Spiritual Presets:
                      </span>
                      <div className="grid grid-cols-3 gap-1.5">
                        {[
                          { name: "Aqeeq Ring", url: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=600&auto=format&fit=crop" },
                          { name: "Tasbih / Beads", url: "https://images.unsplash.com/photo-1590076215667-875d4ef2d7ee?q=80&w=600&auto=format&fit=crop" },
                          { name: "Pure Oud / Musk", url: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?q=80&w=600&auto=format&fit=crop" },
                          { name: "Holy Quran / Book", url: "https://images.unsplash.com/photo-1609599006353-e629aaabfeae?q=80&w=600&auto=format&fit=crop" },
                          { name: "Zamzam Flacon", url: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=600&auto=format&fit=crop" },
                          { name: "Calligraphy Slate", url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=600&auto=format&fit=crop" },
                        ].map((preset) => (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() => setProductForm({ ...productForm, image: preset.url })}
                            className="text-[11px] px-2 py-1 rounded border border-gray-200 text-gray-600 hover:border-spirit-500 hover:text-spirit-900 bg-gray-50 text-left truncate transition cursor-pointer"
                          >
                            {preset.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Storefront Display Area & Section Placement */}
                <div className="bg-spirit-50/50 p-6 rounded-xl border border-spirit-100 space-y-5">
                  <div className="flex items-center justify-between pb-3 border-b border-spirit-100">
                    <div>
                      <h4 className="text-sm font-bold text-spirit-950 uppercase tracking-wide flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-spirit-700" />
                        Storefront Display & Section Placement
                      </h4>
                      <p className="text-xs text-spirit-800/80 mt-0.5">
                        Control where this product appears on the Store page and in curated showcase sections.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Display Area Selector */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
                        <span>Store Display Area</span>
                        <span className="text-spirit-700 font-normal lowercase text-[11px]">automatic routing</span>
                      </label>
                      <select
                        value={productForm.displayArea || "catalog"}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            displayArea: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-spirit-500 outline-none text-sm font-medium text-gray-800"
                      >
                        <option value="catalog">Standard Catalog (Shown in main store catalog list)</option>
                        <option value="featured">Featured Spotlight (Primary top showcase section)</option>
                        <option value="best_sellers">Best Sellers (Top ranking spiritual items)</option>
                        <option value="flash_deal">Flash Deal (Countdown highlight block)</option>
                        <option value="hero">Hero Spotlight (Top banner showcase)</option>
                      </select>
                      <p className="text-[11px] text-gray-500 mt-1.5">
                        Sections configured with &quot;By Assigned Area&quot; will automatically display products matching this area.
                      </p>
                    </div>

                    {/* Direct Section Assignment */}
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5">
                        Assign to Specific Storefront Sections
                      </label>
                      <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1 border border-gray-200 rounded-lg p-2.5 bg-white">
                        {(storeSettings.sections || defaultSections).length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No storefront sections configured yet.</p>
                        ) : (
                          (storeSettings.sections || defaultSections).map((sec) => {
                            const isAssigned = (productForm.assignedSections || []).includes(sec.id);
                            return (
                              <label
                                key={sec.id}
                                className={`flex items-center justify-between p-2 rounded-md border text-xs cursor-pointer transition ${
                                  isAssigned
                                    ? "bg-spirit-50 border-spirit-200 text-spirit-900 font-semibold"
                                    : "border-gray-100 hover:bg-gray-50 text-gray-700"
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isAssigned}
                                    onChange={(e) => {
                                      const current = productForm.assignedSections || [];
                                      const updated = e.target.checked
                                        ? [...current, sec.id]
                                        : current.filter((id) => id !== sec.id);
                                      setProductForm({ ...productForm, assignedSections: updated });
                                    }}
                                    className="rounded border-gray-300 text-spirit-800 focus:ring-spirit-500 w-4 h-4 cursor-pointer"
                                  />
                                  <span>{sec.heading}</span>
                                </div>
                                {sec.badge && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/80 text-gray-600 border border-gray-200">
                                    {sec.badge}
                                  </span>
                                )}
                              </label>
                            );
                          })
                        )}
                      </div>
                      <p className="text-[11px] text-gray-500 mt-1">
                        Sections will explicitly feature this product regardless of its category.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Advanced Options (Sale & Stock) */}
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                  <h4 className="text-sm font-bold text-gray-800 uppercase tracking-wide mb-4 flex items-center">
                    Advanced Options{" "}
                    <span className="ml-2 text-xs text-gray-500 font-normal">
                      (Optional)
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Out of Stock Toggle */}
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              isOutOfStock: !productForm.isOutOfStock,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${productForm.isOutOfStock ? "bg-red-500" : "bg-gray-200"}`}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${productForm.isOutOfStock ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-bold text-gray-700 flex items-center">
                          <PackageX className="w-4 h-4 mr-2 text-gray-500" />
                          Mark Out of Stock
                        </span>
                      </div>

                      {/* Blur Image Toggle */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              isBlurBeforeBuy: !productForm.isBlurBeforeBuy,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${productForm.isBlurBeforeBuy ? "bg-spirit-600" : "bg-gray-200"}`}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${productForm.isBlurBeforeBuy ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-bold text-gray-700 flex items-center">
                          <EyeOffIcon className="w-4 h-4 mr-2 text-gray-500" />
                          Blur Before Purchase
                        </span>
                      </div>

                      {/* Wrap Image Toggle */}
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() =>
                            setProductForm({
                              ...productForm,
                              isWrapBeforeBuy: !productForm.isWrapBeforeBuy,
                            })
                          }
                          className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${productForm.isWrapBeforeBuy ? "bg-spirit-800" : "bg-gray-200"}`}
                        >
                          <span className="sr-only">Use setting</span>
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${productForm.isWrapBeforeBuy ? "translate-x-5" : "translate-x-0"}`}
                          />
                        </button>
                        <span className="ml-3 text-sm font-bold text-gray-700 flex items-center">
                          <Lock className="w-4 h-4 mr-2 text-gray-500" />
                          Wrap Image (Top Left Diagonal 60%)
                        </span>
                      </div>
                    </div>

                    {/* Sale Price */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                        Sale Price
                      </label>
                      <input
                        type="text"
                        value={productForm.salePrice || ""}
                        onChange={(e) =>
                          setProductForm({
                            ...productForm,
                            salePrice: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-sm"
                        placeholder="Leave empty for no sale"
                      />
                    </div>

                    {/* Sale Dates */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Sale Start
                        </label>
                        <input
                          type="datetime-local"
                          value={productForm.saleStart || ""}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              saleStart: e.target.value,
                            })
                          }
                          className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">
                          Sale End
                        </label>
                        <input
                          type="datetime-local"
                          value={productForm.saleEnd || ""}
                          onChange={(e) =>
                            setProductForm({
                              ...productForm,
                              saleEnd: e.target.value,
                            })
                          }
                          className="w-full px-2 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none text-xs"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={4}
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-spirit-500 outline-none resize-none"
                    placeholder="Detailed product description..."
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSwitchToProductList}
                    className="mr-4 text-gray-500 font-bold px-6 py-3 hover:text-gray-700 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-spirit-900 text-white font-bold px-8 py-3 rounded-lg hover:bg-spirit-800 transition shadow-lg flex items-center"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-5 h-5 mr-2" />
                    ) : (
                      <Save className="w-5 h-5 mr-2" />
                    )}
                    {editProductId ? "Update Product" : "Create Product"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
              <p className="text-gray-500 mb-6">{deleteDialog.message}</p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setDeleteDialog({...deleteDialog, isOpen: false})}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => confirmDeleteAction()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-bold hover:bg-red-700 transition cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Admin;
