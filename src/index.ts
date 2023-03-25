import { get_mail_request } from '@/get_mail_request'
import type { Env } from '@/types'
import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses'

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const mail_request = await get_mail_request(request)
    if (mail_request === undefined) return new Response('Invalid request!', { status: 400 })

    const mail = new SendEmailCommand({
      Destination: {
        ToAddresses: mail_request.to
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: mail_request.html
          }
        },
        Subject: {
          Charset: 'UTF-8',
          Data: mail_request.subject
        }
      },
      Source: mail_request.from
    })

    const client = new SESClient({ region: env.REGION })
    const send_mail = await client.send(mail)

    if (send_mail.MessageId === undefined) return new Response('Failed to send email!', { status: 500 })
    return new Response('Email sent!', { status: 200 })
  }
}
