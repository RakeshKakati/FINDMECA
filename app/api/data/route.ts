import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { parse } from 'csv-parse/sync'

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), 'data.csv')
    const fileContent = fs.readFileSync(filePath, 'utf-8')

    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      relax_column_count: true,
    })

    // Transform the data to a cleaner format
    const transformedData = records
      .filter((record: any) => {
        // Filter out empty rows
        const name = record['qBF1Pd'] || record['MW4etd']
        return name && name.trim() !== '' && name.trim() !== '·'
      })
      .map((record: any) => {
        const name = record['qBF1Pd'] || record['MW4etd'] || ''
        const rating = record['UY7F9'] || ''
        const reviews = record['W4Efsd'] || ''
        const type = record['W4Efsd 2'] || ''
        // Combine address parts, filtering out separators
        const addressParts = [
          record['W4Efsd 3'],
          record['W4Efsd 4'],
          record['W4Efsd 5'],
          record['W4Efsd 6']
        ].filter(part => part && part.trim() !== '' && part.trim() !== '·')
        const address = addressParts.join(' ').trim()
        const phone = record['UsdlK'] || ''
        const website = record['lcr4fd href'] || ''
        // Status might be in W4Efsd 7 or combined with other fields
        const status = record['W4Efsd 7'] || record['W4Efsd 4'] || ''
        const reviewText = (record['ah5Ghc'] || '').replace(/^"|"$/g, '').trim()
        const mapLink = record['hfpxzc href'] || ''

        return {
          name: name.trim(),
          rating: rating.trim(),
          reviews: reviews.trim(),
          type: type.trim(),
          address: address,
          phone: phone.trim(),
          website: website.trim(),
          status: status.trim(),
          reviewText: reviewText,
          mapLink: mapLink.trim(),
        }
      })

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('Error reading CSV file:', error)
    return NextResponse.json(
      { error: 'Failed to read data' },
      { status: 500 }
    )
  }
}

