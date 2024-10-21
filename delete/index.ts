import fs from 'node:fs'
import { PrivyClient } from '@privy-io/server-auth'
import csv from 'csv-parser' // For reading the CSV
import { createObjectCsvWriter } from 'csv-writer' // For writing the CSV

const privy = new PrivyClient(
  'clj3fyjbc005hl908rg61eo9v',
  '57ZvoncZCKELntbfQFaS4yGj9W57egvStvhB1eY5tjUmGfKNPr6Mw9oJEKudfsU5Rco4SuJjq9V4jiFamKBMr7wi',
)

// Function to read the CSV and return the data as an array
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

// Function to write a new CSV file with the filtered users
function writeCSVFile(data: any[], filePath: string): Promise<void> {
  const csvWriter = createObjectCsvWriter({
    path: filePath,
    header: [
      { id: 'id', title: 'id' },
      { id: 'email', title: 'email' },
      { id: 'authId', title: 'authId' },
      { id: 'name', title: 'name' },
      { id: 'username', title: 'username' },
      { id: 'isAdmin', title: 'isAdmin' },
      { id: 'bio', title: 'bio' },
      { id: 'avatar', title: 'avatar' },
      { id: 'proficiencies', title: 'proficiencies' },
      { id: 'priorities', title: 'priorities' },
      { id: 'walletAddress', title: 'walletAddress' },
    ],
  })

  return csvWriter.writeRecords(data)
}

// Main function to filter and create a new CSV file
async function filterAndCreateNewCSV() {
  try {
    // Fetch users from PrivyClient
    const users = await privy.getUsers()

    // Read CSV data
    const csvData = await readCSVFile('user.csv') // Provide the correct path to your CSV file

    // Filter the CSV data where authId matches user.id and the user has an email
    const filteredUsers = csvData.filter((csvUser: any) => {
      const matchedUser = users.find((user: any) => csvUser.authId === user.id)
      return matchedUser && matchedUser.email // Ensure the user has an email
    })

    // Write the filtered data to a new CSV file
    await writeCSVFile(filteredUsers, 'filtered_users.csv') // Specify the new CSV file name

    console.log('Filtered CSV file created successfully!')
  } catch (error) {
    console.error('Error:', error)
  }
}

// Run the filtering function
filterAndCreateNewCSV()
