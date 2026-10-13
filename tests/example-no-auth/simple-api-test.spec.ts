import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'

test.describe('GET/product/{id}', () => {
  test('get product with correct id should receive code 200', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 200
    expect(statusCode).toBe(StatusCodes.OK)
  })

  test('get product with correct id should receive code 404', async ({ request }) => {
    const allProductResponse = await request.get('https://shop.tl-academy.ee/api/products')
    const allProductBody = await allProductResponse.json()
    const lastProductId: number = allProductBody.length

    const oneProductResponse = await request.get(
      'https://shop.tl-academy.ee/api/products' + lastProductId + 1,
    )

    const oneProductBody = await oneProductResponse.json()
    const oneProductStatusCode = oneProductResponse.status()

    console.log('response body:', oneProductBody)
    // Check if the response status is 404
    expect(oneProductStatusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('get product with incorrect id should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/q1231wefqwef1232')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 400
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with negative id should receive code 400', async ({ request }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/-1')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 400
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('get product with incorrect id with number first should receive code 400', async ({
    request,
  }) => {
    // Build and send a GET request to the server
    const response = await request.get('https://shop.tl-academy.ee/api/products/1fewfwfwfwf')

    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status, body and headers
    console.log('response body:', responseBody)
    // Check if the response status is 400
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

test.describe('POST/product/{id}', () => {
  test('post product with correct data should receive code 201', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.CREATED)
    // check that body.name is string type
    expect(typeof responseBody.name).toBe('string')
    // check that body.price is number type
    expect(typeof responseBody.price).toBe('number')
  })

  test('post product where name is absent should receive code 400', async ({ request }) => {
    // prepare request body
    const requestBody = {
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
  test('post product where name contains more than 100 symbols should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'OrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrangeOrang',
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product where category is absent should receive code 400', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product where category contains more than 50 symbols should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'FruitFruitFruitFruitFruitFruitFruitFruitFruitFruitF',
      price: 2.39,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product where price has string type should receive code 400', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: '2.39',
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test.fail(
    'post product where price is negative number should receive code 400',
    async ({ request }) => {
      // prepare request body
      const requestBody = {
        name: 'Orange',
        category: 'Fruit',
        price: -2.39,
        quantity: 10,
      }
      // Send a POST request to the server
      const response = await request.post('https://shop.tl-academy.ee/api/products', {
        data: requestBody,
      })
      // parse raw response body to json
      const responseBody = await response.json()
      const statusCode = response.status()

      // Log the response status and body
      console.log('response status:', statusCode)
      console.log('response body:', responseBody)
      expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test.fail('post product where price is 0 should receive code 400', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 0,
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product where price is absent should receive code 400', async ({ request }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      quantity: 10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
    //В пункте "2. Модель продукта" указано, что price - обязательное поле.
    // Значит в случае если поле price отсутствует, то наверное ожидается сообщение об ошибке "Price is required" (по аналогии с name и category).
    // Но такое сообщение не указано в пункте "2.1. Правила валидации".
    // И сейчас в случае если поле price отсутствует, выдается сообщение об ошибке 'Price must be a number'.
  })

  test('post product where quantity is a fractional number should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 10.8,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('post product where quantity is a negative number should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: -10,
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test.fail(
    'post product where quantity is 0 and available is true should receive code 400',
    async ({ request }) => {
      // prepare request body
      const requestBody = {
        name: 'Orange',
        category: 'Fruit',
        price: 2.39,
        quantity: 0,
        available: true,
      }
      // Send a POST request to the server
      const response = await request.post('https://shop.tl-academy.ee/api/products', {
        data: requestBody,
      })
      // parse raw response body to json
      const responseBody = await response.json()
      const statusCode = response.status()

      // Log the response status and body
      console.log('response status:', statusCode)
      console.log('response body:', responseBody)
      expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test.fail(
    'post product where quantity field is absent and available is true should receive code 400',
    async ({ request }) => {
      // prepare request body
      const requestBody = {
        name: 'Orange',
        category: 'Fruit',
        price: 2.39,
        available: true,
      }
      // Send a POST request to the server
      const response = await request.post('https://shop.tl-academy.ee/api/products', {
        data: requestBody,
      })
      // parse raw response body to json
      const responseBody = await response.json()
      const statusCode = response.status()

      // Log the response status and body
      console.log('response status:', statusCode)
      console.log('response body:', responseBody)
      expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test('post product where available is not a boolean should receive code 400', async ({
    request,
  }) => {
    // prepare request body
    const requestBody = {
      name: 'Orange',
      category: 'Fruit',
      price: 2.39,
      quantity: 10,
      available: 'yes',
    }
    // Send a POST request to the server
    const response = await request.post('https://shop.tl-academy.ee/api/products', {
      data: requestBody,
    })
    // parse raw response body to json
    const responseBody = await response.json()
    const statusCode = response.status()

    // Log the response status and body
    console.log('response status:', statusCode)
    console.log('response body:', responseBody)
    expect(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})
