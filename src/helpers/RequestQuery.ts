
import { StringOrDate, StringOrNumber } from './Types';




export interface QueryStringPagination {
  shopName: string
  from: number
  to: number
}


export interface QuerySalesReport {
  year: StringOrNumber
  month: string
  range: string
  date: StringOrDate
  vendor: string
};



export interface QueryOrderDetails {
  orderno: string
  shopName: string
}



export interface QueryStringProductDetails {
  vendor: string
  product_number: StringOrNumber
}


export interface QueryStringProducts extends QueryStringPagination {

}

export interface QueryStringOrders extends QueryStringPagination {

}

export interface QueryStringOrderEarnings extends QueryStringPagination {

}




export interface QueryStringOrdersDetails {
  shopName?: string,
  orderNO?: StringOrNumber,
  orderID?: StringOrNumber
}


