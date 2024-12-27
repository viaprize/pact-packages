import * as crypto from 'node:crypto'

export class AESCipher {
  private algorithm: string
  private key: Buffer

  constructor(secretKey: string) {
    this.algorithm = 'aes-256-cbc'
    this.key = crypto.scryptSync(secretKey, 'salt', 32)
  }

  encrypt(text: string): string {
    const iv = crypto.randomBytes(16)
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')

    const encryptedData = iv.toString('hex') + ':' + encrypted
    return encryptedData
  }

  decrypt(encryptedData: string): string {
    const [ivHex, encryptedHex] = encryptedData.split(':')
    if (!ivHex) {
      throw new Error('Invalid encrypted data: missing IV')
    }
    const iv = Buffer.from(ivHex, 'hex')
    if (!encryptedHex) {
      throw new Error('Invalid encrypted data: missing encrypted text')
    }
    const encryptedText = Buffer.from(encryptedHex, 'hex')

    const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv)
    let decrypted = decipher.update(encryptedText)
    decrypted = Buffer.concat([decrypted, decipher.final()])

    return decrypted.toString('utf8')
  }
}
