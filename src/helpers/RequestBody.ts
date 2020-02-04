
import { StringOrDate, StringOrNumber } from './Types';
import { PathLike } from 'fs';
import { Field, Instance } from 'multer';



export interface RemoveProductBody {
  product_id: StringOrNumber
  shopName: string
  imageLocalPath: string
  image: string,
  from: StringOrNumber,
  to: StringOrNumber
}

export interface RequestWithBody extends Request {
  body: any
}


export interface ResetPasswordBody {
  email: string,
  contact_number: StringOrNumber
}


export interface LoggerBody {
  messageOccurred: string
  reason: string,
  info: string
}



export interface ChangeImagesBody {
  email: string
  shop_name: string
  inputName: string
  currentPathToFile: string
}

export interface RegisterBody {
  seller_name?: string
  shop_name?: string
  email?: string
  password?: string
  store_address?: string
  city?: string
  zipcode?: StringOrNumber
  country?: string
  contact_number?: StringOrNumber
  store_description?: string
  business_permit?: Field
  brgy_clearance?: Field
  police_clearance?: Field
  valid_id?: Field
}


export interface AddImageBody {
  shop_name: string
  type: string
  product_id: StringOrNumber
  newFile1?: Field
  newFile2?: Field
  newFile3?: Field
  newFile4?: Field
  newFile5?: Field
}




export interface RemoveImageBody {
  shopName: string
  product_id: StringOrNumber
  image_id: StringOrNumber
  image: string
}


export interface ChangePasswordBody {
  old_password?: string
  new_password?: string
}


export interface LoginBody {
  email?: string
  password?: string
}



export interface DashboardTotalSaleBody {
  shopName: string
  from?: StringOrDate
  to?: StringOrDate
}



export interface PaymentDetailsBody {
  merchant_id: StringOrNumber
  bank_name: string
  cardholder_name: string
  account_number: string
  payment_method: string
  email: string
  seller_name: string
}




export interface EditInfoBody {
  seller_name: string
  shop_name: string
  store_address?: string
  city?: string
  country?: string
  zipcode?: StringOrNumber
  contact_number?: StringOrNumber
  store_description?: string
  store_details?: string
  store_policies?: string
  email?: string
}






export interface EditVariantBody {
  variant_title: string
  price: StringOrNumber
  compare_at_price: StringOrNumber
  taxable: string | boolean
  sku: string
  barcode: string
  quantity: StringOrNumber
  weight: number
  requires_shipping: boolean
  product_id: StringOrNumber
  variant_id: StringOrNumber
}



export interface EditProductBody {
  product_id: StringOrNumber
  product_name: string
  product_title: string
  product_type: string
  description: string
  tags: string[]
  vendor: string
  weight: StringOrNumber
  price: StringOrNumber
  compare_at_price: StringOrNumber
  sku: string
  barcode: StringOrNumber
  quantity: StringOrNumber
  type: 'edit_product' | 'add_product'
  options?: OptsData[] | boolean
}


export interface OptsData {
  opt_name: string
  opt_value: string
}



