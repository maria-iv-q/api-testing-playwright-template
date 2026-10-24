import { StatusCodes } from 'http-status-codes'
import { expect, test } from '@playwright/test'
import { AccountDTO } from '../../dto/AccountDTO'
import { DepositAccountDTO } from '../../dto/DepositAccountDTO'
import { TransferAccountDTO } from '../../dto/TransferAccountDTO'
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
    //Create new account
    const account = new AccountDTO('ABC Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const respBody: CreatedAccountResp = await response.json()
    console.log('response body before deposit:', respBody)

    //Post /api/accounts/{id}/deposit with valid data
    const accountDeposit = new DepositAccountDTO(500)
    const id: number = respBody.id
    const responseAfterDeposit = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
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
      .toBeCloseTo(respBody.balance + accountDeposit.amount, 2)
  })
})

test.describe('/api/accounts/{id}/deposit negative tests', () => {
  let id: number

  test.beforeEach(async ({ request }) => {
    //Create new account
    const account = new AccountDTO('ABC Owner')
    const response = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: account,
    })
    const responseBody: CreatedAccountResp = await response.json()
    id = responseBody.id
    console.log('response body before deposit:', responseBody)
  })

  test('TL-11-14 POST /api/accounts/{id}/deposit with amount = 0 should receive code 400', async ({
    request,
  }) => {
    const accountDeposit = new DepositAccountDTO(0)
    const response = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
      headers: authHeader,
      data: accountDeposit,
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
    const accountDeposit = new DepositAccountDTO(-8)
    const response = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
      headers: authHeader,
      data: accountDeposit,
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
    const accountDeposit = new DepositAccountDTO(1000001)
    const response = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
      headers: authHeader,
      data: accountDeposit,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body after deposit:', responseBody)
    console.log('status code after deposit:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-17 POST /api/accounts/{id}/deposit when amount exceeds 2 decimal places should receive code 400', async ({
    request,
  }) => {
    const accountDeposit = new DepositAccountDTO(20.123)
    const response = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
      headers: authHeader,
      data: accountDeposit,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body after deposit:', responseBody)
    console.log('status code after deposit:', statusCode)
    expect.soft(statusCode).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCode).toBe(StatusCodes.BAD_REQUEST)
  })

  test("TL-11-18 POST /api/accounts/{id}/deposit with id that doesn't exist should receive code 404", async ({
    request,
  }) => {
    const accountDeposit = new DepositAccountDTO(170)
    const id = 7777
    const response = await request.post(baseUrl + `/api/accounts/${id}/deposit`, {
      headers: authHeader,
      data: accountDeposit,
    })
    const responseBody: CreatedAccountResp = await response.json()
    const statusCode = response.status()
    console.log('response body:', responseBody)
    console.log('status code:', statusCode)
    expect.soft(statusCode).toBe(StatusCodes.NOT_FOUND)
  })
})

//Transfer
test.describe('POST/api/accounts/{id}/transfer critical path', () => {
  let senderId: number
  let recipientId: number
  let recipientResponseBody: CreatedAccountResp
  let senderResponseBodyAfterDeposit: CreatedAccountResp

  test.beforeEach(async ({ request }) => {
    //Create new sender account
    const senderAccount = new AccountDTO('ABC Owner')
    const senderResponse = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: senderAccount,
    })
    const senderResponseBody: CreatedAccountResp = await senderResponse.json()
    senderId = senderResponseBody.id
    console.log('initial sender balance:', senderResponseBody.balance)

    //Create new recipient account
    const recipientAccount = new AccountDTO('DDF Owner')
    const recipientResponse = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: recipientAccount,
    })
    recipientResponseBody = await recipientResponse.json()
    recipientId = recipientResponseBody.id
    console.log('initial recipient balance:', recipientResponseBody.balance)

    //Deposit money into sender account
    const senderAccountDeposit = new DepositAccountDTO(700)
    const response = await request.post(baseUrl + `/api/accounts/${senderId}/deposit`, {
      headers: authHeader,
      data: senderAccountDeposit,
    })
    senderResponseBodyAfterDeposit = await response.json()
    console.log('sender balance after deposit:', senderResponseBodyAfterDeposit.balance)
  })

  test('TL-11-19 post /api/accounts/{id}/transfer with valid data should receive code 200', async ({
    request,
  }) => {
    const accountTransfer = new TransferAccountDTO(recipientId, 150)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.OK)

    expect
      .soft(responseBodyAfterTransfer.from.balance)
      .toBeCloseTo(senderResponseBodyAfterDeposit.balance - accountTransfer.amount, 2)
    expect
      .soft(responseBodyAfterTransfer.to.balance)
      .toBeCloseTo(recipientResponseBody.balance + accountTransfer.amount, 2)
  })
})

test.describe('POST/api/accounts/{id}/transfer negative tests', () => {
  let senderResponseBodyAfterDeposit: CreatedAccountResp
  let senderId: number
  let recipientId: number

  test.beforeEach(async ({ request }) => {
    //Create new sender account
    const senderAccount = new AccountDTO('ABC Owner')
    const senderResponse = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: senderAccount,
    })
    const senderResponseBody: CreatedAccountResp = await senderResponse.json()
    senderId = senderResponseBody.id
    console.log('initial sender balance:', senderResponseBody.balance)

    //Create new recipient account
    const recipientAccount = new AccountDTO('DDF Owner')
    const recipientResponse = await request.post(baseUrl + '/api/accounts', {
      headers: authHeader,
      data: recipientAccount,
    })
    const recipientResponseBody: CreatedAccountResp = await recipientResponse.json()
    recipientId = recipientResponseBody.id
    console.log('initial recipient balance:', recipientResponseBody.balance)

    //Deposit money into sender account
    const senderAccountDeposit = new DepositAccountDTO(700)
    const response = await request.post(baseUrl + `/api/accounts/${senderId}/deposit`, {
      headers: authHeader,
      data: senderAccountDeposit,
    })
    senderResponseBodyAfterDeposit = await response.json()
    console.log('sender balance after deposit:', senderResponseBodyAfterDeposit.balance)
  })
  test.fail(
    'TL-11-20 post /api/accounts/{id}/transfer should receive code 400 when sender account id is the same as recipient account id',
    async ({ request }) => {
      const accountTransfer = new TransferAccountDTO(senderId, 150)
      const responseAfterTransfer = await request.post(
        baseUrl + `/api/accounts/${senderId}/transfer`,
        {
          headers: authHeader,
          data: accountTransfer,
        },
      )
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
    const accountTransfer = new TransferAccountDTO(-3, 150)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
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
    const accountTransfer = new TransferAccountDTO(3.5, 150)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-23 post /api/accounts/{id}/transfer should receive code 400 when amount = 0', async ({
    request,
  }) => {
    const accountTransfer = new TransferAccountDTO(recipientId, 0)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-24 post /api/accounts/{id}/transfer should receive code 400 when amount exceeds 2 decimal places', async ({
    request,
  }) => {
    const accountTransfer = new TransferAccountDTO(recipientId, 100.123)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
  })

  test('TL-11-25 post /api/accounts/{id}/transfer should receive code 400 when amount exceeds sender account balance', async ({
    request,
  }) => {
    const accountTransfer = new TransferAccountDTO(
      recipientId,
      senderResponseBodyAfterDeposit.balance + 1,
    )
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.CONFLICT)
  })

  test("TL-11-26 POST /api/accounts/{id}/transfer should receive code 404 when recipient account ID doesn't exist", async ({
    request,
  }) => {
    const accountTransfer = new TransferAccountDTO(99000000, 100)
    const responseAfterTransfer = await request.post(
      baseUrl + `/api/accounts/${senderId}/transfer`,
      {
        headers: authHeader,
        data: accountTransfer,
      },
    )
    const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
    const statusCodeAfterTransfer = responseAfterTransfer.status()
    console.log('Response body after transfer:', responseBodyAfterTransfer)
    console.log('Status code after transfer:', statusCodeAfterTransfer)
    expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
    expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.NOT_FOUND)
  })
  test.fail(
    'TL-11-23 post /api/accounts/{id}/transfer should receive code 400 when currencies of sender account and recipient account do not match',
    async ({ request }) => {
      //Create new recipient USD account
      const usdRecipientAccount = new AccountDTO('DDF Owner', 'USD')
      const usdRecipientResponse = await request.post(baseUrl + '/api/accounts', {
        headers: authHeader,
        data: usdRecipientAccount,
      })
      const usdRecipientResponseBody = await usdRecipientResponse.json()
      const usdRecipientId = usdRecipientResponseBody.id
      console.log('initial recipient balance - USD account:', usdRecipientResponseBody.balance)

      //Transfer money from EUR to USD account
      const accountTransfer = new TransferAccountDTO(usdRecipientId, 150)
      const responseAfterTransfer = await request.post(
        baseUrl + `/api/accounts/${senderId}/transfer`,
        {
          headers: authHeader,
          data: accountTransfer,
        },
      )
      const responseBodyAfterTransfer: TransferResponse = await responseAfterTransfer.json()
      const statusCodeAfterTransfer = responseAfterTransfer.status()
      console.log('Response body after transfer:', responseBodyAfterTransfer)
      console.log('Status code after transfer:', statusCodeAfterTransfer)
      expect.soft(statusCodeAfterTransfer).not.toBe(StatusCodes.UNAUTHORIZED)
      expect.soft(statusCodeAfterTransfer).toBe(StatusCodes.BAD_REQUEST)
    },
  )
})
