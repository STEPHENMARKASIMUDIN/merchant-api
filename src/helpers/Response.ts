import { StringOrDate, StringOrNumber } from './Types';
import { Router } from 'express';





export interface MLShopAPIResponse {
  ResponseCode: number
  ResponseMessage: string
}



export interface ProductDetailsImages {
  imagePath: string
  id: number
  image: string
}


export type Images = ProductDetailsImages[] | string[];



export interface MerchantRoutes {
  path: string
  router: Router
}


export interface PriceSet {
  amount: string
  currency_code: string
}

export interface LoginResponse extends MLShopAPIResponse {
  merchant_details?: {
    seller_name: string
    city: string
    contact_number: string
    country: string
    merchant_id: string
    orders: number
    products: number
    shop_name: string
    status: string
    store_address: string
    store_description: string
    store_details: string
    store_policies: string
    syscreated: string
    sysmodified: string
    zipcode: string
  }
}

export interface DashboardDataResponse extends MLShopAPIResponse {
  Recent_Orders?: [{
    order_no: string
    date: StringOrDate
    customer_name: string
    order_total: number
    status: string
  }],
  Order_Earnings?: StringOrNumber
}

export interface SmartCollectionResponse extends MLShopAPIResponse {
  smart_collection?: [{
    id: number
    handle: string
    title: string
    updated_at: StringOrDate
    body_html: string
    published_at: string
    sort_order: string
    rules: [{
      column: string
      relation: string
      condition: string
    }],
    published_scope: string
    image: {
      created_at: StringOrDate
      alt: string
      width: number
      height: number
      src: string
    }
  }]
}




export interface ProductsResponse extends MLShopAPIResponse {
  Product_List?: [{
    product_number: number
    image: string
    product_name: string
    price: string
    quantity: number
    status: string
    imagePath?: string
  }]
}


export interface ProductDetailsResponse extends MLShopAPIResponse {
  Product_Details?: {
    image_id: number[]
    product_id: number
    product_name: string
    product_tags: string
    product_type: string
    description: string
    status: string
    images: string[]
    imagesDetails: ProductDetailsImages[]
  }
  Product_Variant?: [{
    variant_id: number
    images: string
    variant_title: string
    sku: string
    barcode: string
    compare_at_price: number
    price: number
    weight: number
    quantity: number
    requires_shipping: any
    taxable: string
  }]
}


export interface OrdersResponse extends MLShopAPIResponse {
  Order_List?: [{
    order_id: number
    order_no: string
    date: StringOrDate
    customer_name: string
    payment_mode: string
    payment_status: string
    fulfillment_status: string
  }]
}

export interface OrderEarningsResponse extends MLShopAPIResponse {
  Order_Earnings?: [{
    order_no: string
    date: StringOrDate
    product_earnings: number
    shipping_charge: number
    tax_charge: number
    total_order: number
  }]
}



export interface OrderInvoiceResponse extends MLShopAPIResponse {
  payment_invoice?: {
    invoice_number: string,
    order_id: number,
    orderno: string,
    product_number: number,
    product_name: string,
    quantity: number,
    price: number,
    sku: string,
    delivery_method: string,
    order_total: number,
    line_items: [{
      id: StringOrNumber,
      variant_id: number,
      title: string,
      quantity: number,
      price: string,
      sku: string,
      variant_title: null | string,
      fulfillment_service: string,
      product_id: number,
      requires_shipping: boolean,
      taxable: boolean,
      gift_card: boolean,
      name: string,
      variant_inventory_management: string,
      properties: [],
      product_exists: boolean,
      fulfillable_quantity: number,
      grams: number,
      total_discount: string,
      fulfillment_status: null | string,
      price_set: {
        shop_money: PriceSet,
        presentment_money: PriceSet,
      },
      total_discount_set: {
        shop_money: PriceSet,
        presentment_money: PriceSet,
      },
      discount_allocations: [],
      admin_graphql_api_id: string,
      tax_lines: []
    }]
    fulfillments: [],
    tags: string,
    total_price_usd: number,
    subtotal_price: number,
    total_line_items_price: number,
    total_shipping: string,
    total_price: number,
    total_tax: number,
    invoice_date: StringOrDate,
    customer_name: string,
    customer_address: string,
    email: string,
    customer_phone: null | string
    shipping_city: string
    shipping_address: string
    shipping_lines: []
    shipping_postal_code: string
    shipping_company: null | string
    shipping_contact: null | string
    shipping_country: string
    shipping_province: string
    billing_city: string
    billing_address: string
    billing_postal_code: string
    billing_company: string
    billing_contact: string
    billing_country: string
    billing_province: string
    payment_mode: string
    payment_details: {}
    payment_status: string
    fulfillment_status: string
    created_at: StringOrDate
    seller_address: string
    seller_contact: string
    seller_email: string
    shopName: string
  }
}






export interface SalesReportResponse extends MLShopAPIResponse {
  sales_data: [{
    order_date: StringOrDate,
    order_no: string,
    quantity: number,
    barcode: string,
    description: string,
    gross_price: number,
    net_price: number,
    shipping_fee: number
  }]
}
export interface ProductInventoryResponse extends MLShopAPIResponse {
  product_reports: [{
    create_at: StringOrDate,
    product_id: string,
    inventory_quantity: number,
    barcode: string,
    description: string,
    gross_price: number,
    net_price: number
  }]
}



export interface OrderDetailsResponse extends MLShopAPIResponse {
  Order_List?: {
    invoice_number: string
    order_id: StringOrNumber
    orderno: string
    product_number: number
    product_name: string
    quantity: number
    price: number
    sku: string
    delivery_method: string
    order_total: number
    line_items: [{
      id: StringOrNumber
      variant_id: StringOrNumber
      title: string
      quantity: number
      price: number
      sku: string
      variant_title: string
      vendor: string
      fulfillment_service: string
      product_id: string
      requires_shipping: number
      taxable: number
      gift_card: number
      name: string
      variant_inventory_management: null | string
      product_exists: number
      fulfillment_quantity: null | number
      grams: number
      total_discount: number
      fulfillment_status: string
    }]
    fulfillments: any[]
    tags: null
    total_price_usd: number
    subtotal_price: number
    total_line_items_price: number
    total_shipping: number
    total_price: number
    total_tax: number
    invoice_data: string
    customer_name: string
    customer_address: string
    email: string
    customer_phone: string
    shipping_city: string
    shipping_address: string
    shipping_lines: any[]
    shipping_postal_code: number
    shipping_company: string
    shipping_contact: string
    shipping_country: string
    shipping_province: string
    billing_city: string
    billing_address: string
    billing_postal_code: number
    billing_company: string
    billing_contact: null | string
    billing_province: string
    payment_mode: string
    payment_status: string
    fulfillment_status: string
    created_at: StringOrDate
  }
}

