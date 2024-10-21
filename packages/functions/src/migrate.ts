import fs from 'node:fs'
import csv from 'csv-parser'
import { viaprize } from './utils/viaprize'
function readCSVFile(filePath: string): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const results: any[] = []
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err))
  })
}
export const handler = async () => {
  const csvData = await readCSVFile('user.csv')
}
