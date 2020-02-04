import app from "../App";
import * as request from "supertest";
import Respmsg from "../helpers/responseMessage";
import ResJson from "../helpers/responseJson";
import { Server } from "http";
import { fileExtension, splitString, getMaxNum, saveImagePath, isNullOrUndefined, isEmpty, isFalsy, forEach, testRequest } from "../helpers/Functions";


describe('test func isFalsy', () => {

  it('should return true with parameter false', () => {
    expect(isFalsy(false)).toBe(true);
  });
  it('should return true with parameter null', () => {
    expect(isFalsy(null)).toBe(true);
  });
  it('should return true with parameter "   "', () => {
    expect(isFalsy("  ")).toBe(true);
  });
  it('should return true with parameter ""', () => {
    expect(isFalsy("")).toBe(true);
  });
  it('should return true with parameter NaN', () => {
    expect(isFalsy(NaN)).toBe(true);
  });
  it('should return false with parameter "a"', () => {
    expect(isFalsy("a")).toBe(false);
  });
  it('should return true with parameter undefined', () => {
    expect(isFalsy(undefined)).toBe(true);
  });
  it('should return true with parameter -0', () => {
    expect(isFalsy(-0)).toBe(true);
  });
  it('should return true with parameter +0', () => {
    expect(isFalsy(+0)).toBe(true);
  });

})


describe('test func isNullOrUndefined', () => {
  it('should return true', () => {
    expect(isNullOrUndefined()).toBe(true);
  });

  it('should return false', () => {
    expect(isNullOrUndefined(false)).toBe(false);
  });


})

describe('test saveImagePath func', () => {

  //C:\Users\Mark A\Desktop\Projects\mlshopmerchantapi\build\build\static\media\ML Demo\product
  it('should return the correct path with shopName: "ML Demo" & savePath: "product" ', () => {

    // expect(saveImagePath('ML Demo', 'product'))
    //   .toBe("C:\\Users\\Mark A\\Desktop\\Projects\\API's\\mlshopmerchantapi\\build\\build\\static\\media\\ML Demo\\product");


    expect(saveImagePath('ML Demo', 'product'))
      .toBe('C:\\Users\\ABET17092001\\Desktop\\MLShop\\mlshopmerchantapi\\build\\build\\static\\media\\ML Demo\\product');


  })


  it('should return an error if "shopName" or "savePath" is not valid. ', () => {
    expect(saveImagePath())
      .toEqual('Shopname or Save Path must not be empty!')
  })


  it('should return "Shopname must be a typeof string." if shopname is not string', () => {
    expect(saveImagePath(true, ' '))
      .toBe('Shopname must be a string.')
  })
  it('should return "Save path must be a typeof string." if save path is not string', () => {
    expect(saveImagePath(' ', []))
      .toBe('Save Path must be a typeof string.')
  })

});



describe('test getMaxNum func', () => {

  it('should return 1', () => {
    let files = ['Thumbs.db', 'amawa.png'];
    expect(getMaxNum(files, 'aaa')).toBe(1);
  });


  it('should return 5', () => {

    let files = ['ML Demo_product1.png',
      'ML Demo_product3.jpg',
      'ML Demo_product4.jpeg',
      'ML Demo_product5.png',
      'ML Demo_product2.gif'];
    expect(getMaxNum(files, 'ML Demo')).toBe(6);


  });


  it('should return 10', () => {

    let files = ['ML Demo_product2.png',
      'ML Demo_product9.jpg',
      'ML Demo_product10.jpeg',
      'ML Demo_product5.png',
      'ML Demo_product2.gif'];
    expect(getMaxNum(files, 'ML Demo')).toBe(11);
  })


});
describe('test ResponseMessage func', () => {


  it('should return SUCCESS with no params provided', () => {
    expect(Respmsg()).toBe("SUCCESS");
  });


  it('should return Incomplete Parameters Provided. with param 16', () => {
    expect(Respmsg(16)).toBe("Incomplete Parameters Provided.");
  });


  it('should not return with param 16 provided', () => {
    expect(Respmsg(16)).not.toBe("")
  });

})



describe('test separator func', () => {
  it('should return sample.png with this string "sample.png?1550710753993"', () => {
    expect(splitString("sample.png?1550710753993", "?"))
      .toEqual("sample.png")
  });

  it('should return the string if separator is not string', () => {
    expect(splitString("sample.png", "?"))
      .toBe("sample.png")
  });

  it('should return empty string if string is undefined', () => {
    expect(splitString(undefined, "?"))
      .toBe("")
  });
  it('should return empty string if string is null', () => {
    expect(splitString(null, "?"))
      .toBe("")
  });
  it('should return empty string if string is empty', () => {
    expect(splitString("", "?"))
      .toBe("")
  });

});



describe('test extract extension func', () => {

  it('should return txt', () => {
    expect(fileExtension('asasda.sada.txt')).toEqual({
      ext: 'txt',
      filename: 'asasda.sada'
    });
  });

  it('should return jpg', () => {
    expect(fileExtension('german_shepherd.jpg')).toEqual({
      ext: 'jpg',
      filename: 'german_shepherd'
    });
  });


  it('should return png', () => {
    expect(fileExtension('german_shepherd.jpg.aaa.png')).toEqual({
      ext: 'png',
      filename: 'german_shepherd.jpg.aaa'
    });
  });


});

describe('Test service routes', () => {
  let service: Server, route = '/mlshopmerchant/route/', token: string = '';
  beforeAll(() => {
    service = app.listen();
  })


  describe('Test Login Controller', () => {
    it('should return 401', (d) => {
      return testRequest(service, 'post', 'login')
        .send({ email: 'mac21macky@gmail.com', password: '12' })
        .expect(200, ResJson(401, Respmsg(4)), d)
    });

    it('should return 200 with the wrong login credentials', (d) => {
      return testRequest(service, 'post', 'login')
        .send({ email: 'mac21macky@gmail.com', password: '12' })
        .expect(200, ResJson(401, Respmsg(4)), d)
    });


    it('should return 200 if all parameters are provided and are correct', (d) => {
      return testRequest(service, 'post', 'login')
        .send({ email: 'mac21macky@gmail.com', password: '12345' })
        .end((err, res) => {
          if (err) throw err;
          expect(res.body).toHaveProperty('merchant_details');
          token = res.body.merchant_details.token;
          d();
        })
    });
  });


  describe('Test getUserData Route', () => {
    it('should return 200', () => {
      return testRequest(service, 'get', 'getUserData')
        .set('Authorization', `Bearer ${token}`)
        .then(data => {
          expect(data.body).toHaveProperty('merchant_details');
        })
    })
  })

  describe('Test ResetPassword Route', () => {
    it('should return 463 response', (d) => {
      return testRequest(service, 'post', 'resetPassword')
        .send()
        .set('Accept', 'application/json')
        .expect(200, ResJson(463, Respmsg(16)), d)
    });
  });

  describe('Test Logout Route', () => {
    it('should return 200 response', (d) => {
      return testRequest(service, 'post', 'logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200, ResJson(200, Respmsg(200)), d)
    });
  });



  describe('Test Register Route', () => {
    it('should return 463 response with no params are provided', (d) => {
      return testRequest(service, 'post', 'register')
        .send()
        .set('Accept', 'application/json')
        .expect(200, ResJson(463, Respmsg(16)), d)
    });
    it('should return 463 response with incorrect params are provided', (d) => {
      return testRequest(service, 'post', 'register')
        .send({
          seller_name: '', shop_name: '', email: '', password: '123', store_address: '', city: '', zipcode: 6000, country: '',
          contact_number: '091122', store_description: 'okinawa'
        })
        .set('Accept', 'application/json')
        .expect(200, ResJson(463, Respmsg(16)), d)
    });
    it.skip('should return 500 response with the unknown error', (d) => {
      return testRequest(service, 'post', 'register')
        .send({
          seller_name: "theBestSellerEva", shop_name: "polo_marko", email: "gmail@bestSeller.com", password: "123456", store_address: "Cebu City, Labangon", city: "Cebu", zipcode: 6000, country: "Philippines",
          contact_number: "09667404625", store_description: "The Best Shop Eva"
        })
        .set('Accept', 'application/json')
        .expect(500, d)
    });
  });



  describe('Test route with auth header with token required', () => {
    it('should return 401 editInfo without token', (d) => {
      return testRequest(service, 'post', 'editInfo')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 dashboard without token', (d) => {
      return testRequest(service, 'post', 'dashboard')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 dashboardData without token', (d) => {
      return testRequest(service, 'post', 'dashboardData')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 changePassword without token', (d) => {
      return testRequest(service, 'post', 'changePassword')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 orders without token', (d) => {
      return testRequest(service, 'post', 'orders')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 orderEarnings without token', (d) => {
      return testRequest(service, 'post', 'orderEarnings')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 orderInvoice without token', (d) => {
      return testRequest(service, 'post', 'orderInvoice')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 products without token', (d) => {
      return testRequest(service, 'post', 'products')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 paymentDetails without token', (d) => {
      return testRequest(service, 'post', 'paymentDetails')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 addEditProduct without token', (d) => {
      return testRequest(service, 'post', 'addEditProduct')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 productDetails without token', (d) => {
      return testRequest(service, 'post', 'productDetails')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 loggerUI without token', (d) => {
      return testRequest(service, 'post', 'loggerUI')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 salesReport without token', (d) => {
      return testRequest(service, 'post', 'salesReport')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 productInventory without token', (d) => {
      return testRequest(service, 'post', 'productInventory')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 getProfileImages without token', (d) => {
      return testRequest(service, 'post', 'getProfileImages')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 changeImage without token', (d) => {
      return testRequest(service, 'post', 'changeImage')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 orderDetails without token', (d) => {
      return testRequest(service, 'post', 'orderDetails')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 logout without token', (d) => {
      return testRequest(service, 'post', 'logout')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 editVariant without token', (d) => {
      return testRequest(service, 'post', 'editVariant')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 addImages without token', (d) => {
      return testRequest(service, 'post', 'addImages')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 removeProduct without token', (d) => {
      return testRequest(service, 'post', 'removeProduct')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 removeImage without token', (d) => {
      return testRequest(service, 'post', 'removeImage')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });
    it('should return 401 getUserData without token', (d) => {
      return testRequest(service, 'post', 'getUserData')
        .expect(200, ResJson(401, Respmsg(401)), d)
    });

  })

  afterAll((d) => {
    service.close(d);
  })


})


describe('Test isEmpty func', () => {


  it('should return true when param is undefined', () => {
    expect(isEmpty(undefined)).toBeTruthy();
  });

  it('should return true when param is null', () => {
    expect(isEmpty(null)).toBeTruthy();
  });

  it('should return true when param is an empty arr', () => {
    expect(isEmpty([])).toBeTruthy();
  });

  it('should return true when param is an obj with no properties', () => {
    expect(isEmpty({})).toBeTruthy();
  });

  it('should return false when param is arr is not empty', () => {
    expect(isEmpty([1])).toBeFalsy();
  });

  it('should return false when param is an obj with properties', () => {
    expect(isEmpty({ name: 'Mark' })).toBeFalsy();
  });

});


describe('Test forEach func', () => {


  it('should match the return value', () => {
    const words: string[] = ['what', 'the', 'hell'];
    let allWords: string = ''
    forEach(words, (item: string) => {
      allWords += item;
    })
    expect(allWords).toBe("whatthehell");
  });

  it('should match the return value', () => {
    let total = 0;
    forEach([1, 2, 3, 4, 5], numba => total += numba);
    expect(total).toBe(15);
  });



})