export interface PurchaseOrder {
  id: number;
  supplierName: string;
  createdAt: Date;
  note?: string;
  userId: number;
  user?: {
    id: number;
    fullname: string;
    phoneNumber: string;
  };
  purchaseOrderDetails: PurchaseOrderDetail[];
}

export interface PurchaseOrderDetail {
  id: number;
  purchaseOrderId: number;
  productVariantId: number;
  quantity: number;
  importPrice: number;
  totalPrice: number;
  productVariant?: {
    id: number;
    color: string;
    size: string;
    price: number;
    stockQuantity: number;
    product: {
      id: number;
      name: string;
      description: string;
    };
  };
}

export interface CreatePurchaseOrderRequest {
  supplierName: string;
  note?: string;
  purchaseOrderDetails: CreatePurchaseOrderDetailRequest[];
}

export interface CreatePurchaseOrderDetailRequest {
  productVariantId: number;
  quantity: number;
  importPrice: number;
}

export interface UpdatePurchaseOrderRequest {
  id: number;
  supplierName: string;
  note?: string;
  purchaseOrderDetails: UpdatePurchaseOrderDetailRequest[];
}

export interface UpdatePurchaseOrderDetailRequest {
  id?: number;
  productVariantId: number;
  quantity: number;
  importPrice: number;
}