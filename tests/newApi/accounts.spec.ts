import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'
import { AccountDTO2 } from '../../dto/AccountDTO2'
import { AccountDTO3 } from '../../dto/AccountDTO3'
//import { number, string } from 'zod'

const baseUrl = 'https://shop.tl-academy.ee'
const authHeader = {
  'X-API-KEY': 'my-api-key',
}
//   interface CreatedAccountResp {
//     id: number,
//     owner: string,
//     currency: string,
//     balance:number,
//     createdAt:string
// }

type CreatedAccountResp = {
  id: number
  owner: string
  currency: string
  balance: number
  createdAt: string
}

type CreatedAccountErrorResp = {
  error: string
}

type TransferResponse = {
  from: {
    id: number
    owner: string
    currency: string
    balance: number
    createdAt: string
  }
  to: {
    id: number
    owner: string
    currency: string
    balance: number
    createdAt: string
  }
  amount: number
}

test.describe('/api/accounts critical path', () => {
  test('TL-11-1 POST /api/accounts with valid data without currency', async ({ request }) => {
    const account = new AccountDTO('Test Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody: CreatedAccountResp = await response.json()
    console.log(respBody)
    expect(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect(response.status()).toBe(StatusCodes.CREATED)
    expect(respBody.owner).toBe(account.owner)
  })

  const currencies = ['USD', 'EUR', 'GBP']
  test(`TL-11-2 POST /api/accounts with valid data and all supported currencies: ${currencies}`, async ({
    request,
  }) => {
    for (const currency of currencies) {
      const account = new AccountDTO('Test Owner', currency)
      const response = await request.post(baseUrl + '/api/accounts', {
        headers: authHeader,
        data: account,
      })
      const respBody: CreatedAccountResp = await response.json()
      console.log(respBody)
      expect.soft(response.status(), `Tested ${currency}currency`).not.toBe(StatusCodes.FORBIDDEN)
      expect.soft(response.status(), `Tested ${currency}currency`).toBe(StatusCodes.CREATED)
      expect.soft(respBody.owner, `Tested ${currency}currency`).toBe(account.owner)
      expect.soft(respBody.currency, `Tested ${currency}currency`).toBe(account.currency)
    }
  })
})

test.describe('/api/accounts negative tests', () => {
  test('TL-11-3 POST /api/accounts with invalid data', async ({ request }) => {
    const account = new AccountDTO('Test Owner', 'PLN')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })

    const respBody: CreatedAccountErrorResp = await response.json()
    console.log(respBody)
    expect.soft(response.status()).not.toBe(StatusCodes.FORBIDDEN)
    expect.soft(response.status()).toBe(StatusCodes.BAD_REQUEST)
    expect.soft(respBody.error).not.toBeUndefined()
    expect.soft(respBody.error.length).toBeGreaterThan(0)
  })
})

//Homework 11
test.describe('GET/api/accounts critical path', () => {
  test('TL-11-4 get list of accounts should receive code 200 when header with correct API key is used', async ({
    request,
  }) => {
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp[] = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.OK)
  })
})

test.describe('GET/api/accounts negative tests', () => {
  test('TL-11-5 get list of accounts should receive code 401 if header with incorrect API key is used', async ({
    request,
  }) => {
    const invalidAuthHeader = {
      'X-API-KEY': 'invalid-key',
    }
    const response = await request.get(baseUrl + '/api/accounts', {
      headers: invalidAuthHeader,
    })
    const responseBody: CreatedAccountResp[] = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect(statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })

  test('TL-11-6 get list of accounts should receive code 401 if no header with API key is used', async ({
    request,
  }) => {
    const response = await request.get(baseUrl + '/api/accounts')

    const responseBody: CreatedAccountResp[] = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect(statusCode).toBe(StatusCodes.UNAUTHORIZED)
  })
})

test.describe('GET/api/accounts/{id} critical path', () => {
  test('TL-11-7 get account with correct id should receive code 200 if header with correct API key is used', async ({
    request,
  }) => {
    const response = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.OK)
  })
})

test.describe('GET/api/accounts/{id} negative tests', () => {
  test('TL-11-8 get account with correct id should receive code 404', async ({ request }) => {
    const allAccountsResponse = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const allAccountsBody: CreatedAccountResp[] = await allAccountsResponse.json()
    const lastAccountId: number = allAccountsBody.length

    const oneAccountResponse = await request.get(baseUrl + '/api/accounts' + lastAccountId + 1)

    const oneAccountBody: CreatedAccountResp = await oneAccountResponse.json()
    const oneAccountStatusCode = oneAccountResponse.status()

    console.log('response body:', oneAccountBody)
    console.log('status code:', oneAccountStatusCode)
    expect(oneAccountStatusCode).toBe(StatusCodes.NOT_FOUND)
  })

  test('TL-11-9 get account with id which contains letters should receive code 400', async ({
    request,
  }) => {
    const response = await request.get(baseUrl + '/api/accounts/1hjjhk2', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-10 get account with negative id should receive code 400', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/-1', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-11 get account with fractional number id should receive code 400', async ({
    request,
  }) => {
    const response = await request.get(baseUrl + '/api/accounts/1.7', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-12 get account with id=0 should receive code 400', async ({ request }) => {
    const response = await request.get(baseUrl + '/api/accounts/0', {
      headers: authHeader,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })
})

//Deposit
test.describe('POST/api/accounts/{id}/deposit critical path', () => {
  test('TL-11-13 post /api/accounts/{id}/deposit with valid data should receive code 200', async ({
    request,
  }) => {
    //Get account with id=1 to identify balance before deposit
    const responseBeforeDeposit = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const responseBodyBeforeDeposit: CreatedAccountResp = await responseBeforeDeposit.json()
    const statusCodeBeforeDeposit = responseBeforeDeposit.status()
    console.log('response body before deposit:', responseBodyBeforeDeposit)
    console.log('status code before deposit:', statusCodeBeforeDeposit)

    //Post /api/accounts/{id}/deposit with valid data
    const accountDeposit = new AccountDTO2(500)
    const responseAfterDeposit = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: accountDeposit,
    })
    const responseBodyAfterDeposit: CreatedAccountResp = await responseAfterDeposit.json()
    const statusCodeAfterDeposit = responseAfterDeposit.status()
    console.log('response body after deposit:', responseBodyAfterDeposit)
    console.log('status code after deposit:', statusCodeAfterDeposit)
    expect.soft(statusCodeAfterDeposit).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterDeposit).toBe(StatusCodes.OK)

    //Verify that account balance increased by amount
    expect
      .soft(responseBodyAfterDeposit.balance)
      .toBeCloseTo(responseBodyBeforeDeposit.balance + accountDeposit.amount, 2)
  })
})

test.describe('/api/accounts/{id}/deposit negative tests', () => {
  test('TL-11-14 POST /api/accounts/{id}/deposit with amount = 0 should receive code 400', async ({
    request,
  }) => {
    const account = new AccountDTO2(0)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: account,
    })
    const responseBodyAfterDeposit: CreatedAccountResp = await response.json()
    const statusCodeAfterDeposit = response.status()
    console.log('response body after deposit:', responseBodyAfterDeposit)
    console.log('status code after deposit:', statusCodeAfterDeposit)
    expect.soft(statusCodeAfterDeposit).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterDeposit).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-15 POST /api/accounts/{id}/deposit with negative amount should receive code 400', async ({
    request,
  }) => {
    const account = new AccountDTO2(-8)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: account,
    })
    const responseBodyAfterDeposit: CreatedAccountResp = await response.json()
    const statusCodeAfterDeposit = response.status()
    console.log('response body after deposit:', responseBodyAfterDeposit)
    console.log('status code after deposit:', statusCodeAfterDeposit)
    expect.soft(statusCodeAfterDeposit).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterDeposit).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-16 POST /api/accounts/{id}/deposit with amount which is more than 1 000 000 should receive code 400', async ({
    request,
  }) => {
    const account = new AccountDTO2(1000001)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: account,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-17 POST /api/accounts/{id}/deposit when amount exceeds 2 decimal places should receive code 400', async ({
    request,
  }) => {
    const account = new AccountDTO2(20.123)
    const response = await request.post(baseUrl + '/api/accounts/1/deposit', {
      headers: authHeader,
      data: account,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test("TL-11-18 POST /api/accounts/{id}/deposit with id that doesn't exist should receive code 404", async ({
    request,
  }) => {
    //Identify last account ID
    const allAccountsResponse = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const allAccountsBody: CreatedAccountResp[] = await allAccountsResponse.json()
    const lastAccountId: number = allAccountsBody.length

    //POST /api/accounts/{id}/deposit with ID that doesn't exist
    const oneAccountResponseDeposit = await request.post(
      baseUrl + '/api/accounts' + lastAccountId + 1 + '/deposit',
    )

    const oneAccountBodyDeposit: CreatedAccountResp = await oneAccountResponseDeposit.json()
    const oneAccountStatusCodeDeposit = oneAccountResponseDeposit.status()

    console.log('response body:', oneAccountBodyDeposit)
    console.log('status code:', oneAccountStatusCodeDeposit)
    expect(oneAccountStatusCodeDeposit).toBe(StatusCodes.NOT_FOUND)
  })
})

//Transfer
test.describe('POST/api/accounts/{id}/transfer critical path', () => {
  test('TL-11-19 post /api/accounts/{id}/transfer with valid data should receive code 200', async ({
    request,
  }) => {
    //Get account with id=1 to identify sender balance before transfer
    const senderResponseBeforeTransfer = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const senderResponseBodyBeforeTransfer: CreatedAccountResp =
      await senderResponseBeforeTransfer.json()
    const senderStatusCodeBeforeTransfer = senderResponseBeforeTransfer.status()
    console.log('Sender response body before transfer:', senderResponseBodyBeforeTransfer)
    console.log('Sender status code before transfer:', senderStatusCodeBeforeTransfer)

    //Get account with id=3 to identify recipient balance before transfer
    const recipientResponseBeforeTransfer = await request.get(baseUrl + '/api/accounts/3', {
      headers: authHeader,
    })
    const recipientResponseBodyBeforeTransfer: CreatedAccountResp =
      await recipientResponseBeforeTransfer.json()
    const recipientStatusCodeBeforeTransfer = recipientResponseBeforeTransfer.status()
    console.log('Recipient response body before transfer:', recipientResponseBodyBeforeTransfer)
    console.log('Recipient status code before transfer:', recipientStatusCodeBeforeTransfer)

    //Post /api/accounts/{id}/transfer with valid data
    const accountTransfer = new AccountDTO3(3, 150)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.OK)

    expect
      .soft(responseBodyAfterTransfer.from.balance)
      .toBeCloseTo(senderResponseBodyBeforeTransfer.balance - accountTransfer.amount, 2)
    expect
      .soft(responseBodyAfterTransfer.to.balance)
      .toBeCloseTo(recipientResponseBodyBeforeTransfer.balance + accountTransfer.amount, 2)
  })
})

test.describe('POST/api/accounts/{id}/transfer negative tests', () => {
  test.fail(
    'TL-11-20 post /api/accounts/{id}/transfer should receive code 400 when sender account id is the same as recipient account id',
    async ({ request }) => {
      const accountTransfer = new AccountDTO3(1, 150)
      const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: accountTransfer,
      })
      const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
      const statusCodeAfterTransfer = responseAfterTransfer.status()
      console.log('Response body after transfer:', responseBodyAfterTransfer)
      console.log('Status code after transfer:', statusCodeAfterTransfer)
      expect
        .soft(statusCodeAfterTransfer, `status code authorization`)
        .not.toBe(StatusCodes.UNAUTHORIZED)
      expect
        .soft(statusCodeAfterTransfer, `status code after transfer between the same accounts`)
        .toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test('TL-11-21 post /api/accounts/{id}/transfer should receive code 400 when recipient account id is negative number', async ({
    request,
  }) => {
    const accountTransfer = new AccountDTO3(-3, 150)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-22 post /api/accounts/{id}/transfer should receive code 400 when recipient account id is fractional number', async ({
    request,
  }) => {
    const accountTransfer = new AccountDTO3(3.5, 150)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test.fail(
    'TL-11-23 post /api/accounts/{id}/transfer should receive code 400 when currencies of sender account and recipient account do not match',
    async ({ request }) => {
      //Get account with id=1 to identify sender account currency
      const senderResponseBeforeTransfer = await request.get(baseUrl + '/api/accounts/1', {
        headers: authHeader,
      })
      const senderResponseBodyBeforeTransfer: CreatedAccountResp =
        await senderResponseBeforeTransfer.json()
      console.log('Sender response body before transfer:', senderResponseBodyBeforeTransfer)

      //Get account with id=2 to identify recipient account currency
      const recipientResponseBeforeTransfer = await request.get(baseUrl + '/api/accounts/2', {
        headers: authHeader,
      })
      const recipientResponseBodyBeforeTransfer: CreatedAccountResp =
        await recipientResponseBeforeTransfer.json()
      console.log('Recipient response body before transfer:', recipientResponseBodyBeforeTransfer)

      //Post /api/accounts/{id}/ when currencies of sender account and recipient account do not match
      const accountTransfer = new AccountDTO3(2, 150)
      const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
        headers: authHeader,
        data: accountTransfer,
      })
      const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
      const statusCodeAfterTransfer = responseAfterTransfer.status()
      console.log('Response body after transfer:', responseBodyAfterTransfer)
      console.log('Status code after transfer:', statusCodeAfterTransfer)
      expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
      expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
    },
  )

  test('TL-11-24 post /api/accounts/{id}/transfer should receive code 400 when amount = 0', async ({
    request,
  }) => {
    const accountTransfer = new AccountDTO3(3, 0)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-25 post /api/accounts/{id}/transfer should receive code 400 when amount exceeds 2 decimal places', async ({
    request,
  }) => {
    const accountTransfer = new AccountDTO3(3, 100.123)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-26 post /api/accounts/{id}/transfer should receive code 400 when amount exceeds sender account balance', async ({
    request,
  }) => {
    //Get account with id=1 to identify sender account balance
    const senderResponseBeforeTransfer = await request.get(baseUrl + '/api/accounts/1', {
      headers: authHeader,
    })
    const senderResponseBodyBeforeTransfer: CreatedAccountResp =
      await senderResponseBeforeTransfer.json()
    console.log('Sender response body before transfer:', senderResponseBodyBeforeTransfer)

    //Post /api/accounts/{id}/transfer with invalid data
    const accountTransfer = new AccountDTO3(3, senderResponseBodyBeforeTransfer.balance + 1)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.CONFLICT)
  })

  test("TL-11-27 POST /api/accounts/{id}/transfer should receive code 404 when recipient account ID doesn't exist", async ({
    request,
  }) => {
    //Identify last account ID
    const allAccountsResponse = await request.get(baseUrl + '/api/accounts', {
      headers: authHeader,
    })
    const allAccountsBody: CreatedAccountResp[] = await allAccountsResponse.json()
    const lastAccountId: number = allAccountsBody.length

    //POST /api/accounts/{id}/transfer with recipient account ID that doesn't exist
    const accountTransfer = new AccountDTO3(lastAccountId + 1, 100)
    const responseAfterTransfer = await request.post(baseUrl + '/api/accounts/1/transfer', {
      headers: authHeader,
      data: accountTransfer,
    })
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.NOT_FOUND)
  })
})
