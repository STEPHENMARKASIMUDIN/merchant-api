import { MerchantRoutes } from '../helpers/Response';

import loginRouter from './login';
import logoutRouter from './logout';
import ordersRouter from './orders';
import productsRouter from './products';
import registerRouter from './registration';
import loggerUIRouter from './logger-ui';
import editInfoRouter from './edit-info';
import dashboardRouter from './dashboard';
import addImagesRouter from './add_images';
import editVariantRouter from './edit-variant';
import removeImageRouter from './remove_image';
import salesReportRouter from './sales_report';
import changeImagesRouter from './change_images';
import orderDetailsRouter from './order_details';
import orderInvoiceRouter from './order-invoice';
import dashboardDataRouter from './dashboard-data';
import removeProductRouter from './remove_product';
import orderEarningsRouter from './order-earnings';
import reset_passwordRouter from './reset-password';
import addEditProductRouter from './add-edit-product';
import paymentDetailsRouter from './payment-details';
import getUserDetailsRouter from './get_user_details';
import productDetailsRouter from './product-details';
import change_passwordRouter from './change_password';
import productInventoryRouter from './product_inventory';
import getProfileImagesRouter from './get_profile_images';



const mainPath = '/mlshopmerchant/route/'

export const merchantRoutes: MerchantRoutes[] = [
  {
    path: `${mainPath}login`,
    router: loginRouter
  },
  {
    path: `${mainPath}register`,
    router: registerRouter
  },
  {
    path: `${mainPath}resetPassword`,
    router: reset_passwordRouter
  },
  {
    path: `${mainPath}editInfo`,
    router: editInfoRouter
  }, {
    path: `${mainPath}dashboard`,
    router: dashboardRouter
  }, {
    path: `${mainPath}dashboardData`,
    router: dashboardDataRouter
  }, , {
    path: `${mainPath}changePassword`,
    router: change_passwordRouter
  }, {
    path: `${mainPath}orders`,
    router: ordersRouter
  }, {
    path: `${mainPath}orderEarnings`,
    router: orderEarningsRouter
  }, {
    path: `${mainPath}orderInvoice`,
    router: orderInvoiceRouter
  }, {
    path: `${mainPath}products`,
    router: productsRouter
  }, {
    path: `${mainPath}paymentDetails`,
    router: paymentDetailsRouter
  }, {
    path: `${mainPath}addEditProduct`,
    router: addEditProductRouter
  }, {
    path: `${mainPath}productDetails`,
    router: productDetailsRouter
  }, {
    path: `${mainPath}loggerUI`,
    router: loggerUIRouter
  }, {
    path: `${mainPath}salesReport`,
    router: salesReportRouter
  },
  {
    path: `${mainPath}productInventory`,
    router: productInventoryRouter
  },
  {
    path: `${mainPath}getProfileImages`,
    router: getProfileImagesRouter
  }, {
    path: `${mainPath}changeImage`,
    router: changeImagesRouter
  },
  {
    path: `${mainPath}orderDetails`,
    router: orderDetailsRouter
  },
  {
    path: `${mainPath}logout`,
    router: logoutRouter
  },
  {
    path: `${mainPath}removeProduct`,
    router: removeProductRouter
  },
  {
    path: `${mainPath}editVariant`,
    router: editVariantRouter
  },
  {
    path: `${mainPath}addImages`,
    router: addImagesRouter
  },
  {
    path: `${mainPath}removeImage`,
    router: removeImageRouter
  },
  {
    path: `${mainPath}getUserData`,
    router: getUserDetailsRouter
  }
]
