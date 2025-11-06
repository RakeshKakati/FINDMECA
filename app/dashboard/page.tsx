'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface CPAFirm {
  name: string
  rating: string
  reviews: string
  type: string
  address: string
  phone: string
  website: string
  status: string
  reviewText: string
  mapLink: string
}

export default function Dashboard() {
  const router = useRouter()
  const [data, setData] = useState<CPAFirm[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCity, setSelectedCity] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  useEffect(() => {
    const paymentCompleted = sessionStorage.getItem('paymentCompleted')
    if (paymentCompleted !== 'true') {
      router.push('/')
      return
    }

    fetch('/api/data')
      .then(res => {
        if (!res.ok) {
          throw new Error('Failed to fetch data')
        }
        return res.json()
      })
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [router])

  const handleLogout = () => {
    sessionStorage.removeItem('paymentCompleted')
    sessionStorage.removeItem('paymentIntentId')
    router.push('/')
  }

  // Convert data to CSV format
  const convertToCSV = (dataToExport: CPAFirm[]): string => {
    const headers = ['Name', 'Rating', 'Reviews', 'Address', 'Phone', 'Website', 'Status', 'Review Text']
    const rows = dataToExport.map(firm => [
      firm.name || '',
      firm.rating || '',
      firm.reviews || '',
      firm.address || '',
      firm.phone || '',
      firm.website || '',
      firm.status || '',
      (firm.reviewText || '').replace(/"/g, '""') // Escape quotes in CSV
    ])
    
    // Escape fields that contain commas, quotes, or newlines
    const escapeCSV = (field: string): string => {
      if (field.includes(',') || field.includes('"') || field.includes('\n')) {
        return `"${field.replace(/"/g, '""')}"`
      }
      return field
    }
    
    const csvRows = [
      headers.map(escapeCSV).join(','),
      ...rows.map(row => row.map(escapeCSV).join(','))
    ]
    
    return csvRows.join('\n')
  }

  // Download CSV file
  const downloadCSV = (dataToExport: CPAFirm[], filename: string) => {
    const csv = convertToCSV(dataToExport)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleDownloadFiltered = () => {
    const filename = selectedCity 
      ? `cpa-directory-${selectedCity.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`
      : `cpa-directory-filtered-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(filteredData, filename)
  }

  const handleDownloadAll = () => {
    const filename = `cpa-directory-all-${new Date().toISOString().split('T')[0]}.csv`
    downloadCSV(data, filename)
  }

  // Helper function to extract review count
  const getReviewCount = (reviews: string): number => {
    if (!reviews) return 0
    const match = reviews.match(/\((\d+)\)/)
    return match ? parseInt(match[1], 10) : 0
  }

  // Extract city from address
  const extractCity = (address: string): string | null => {
    if (!address) return null
    
    // Common street types and words to exclude
    const excludeWords = new Set([
      'Ave', 'Avenue', 'Blvd', 'Blvd.', 'Boulevard', 'Boul', 'Boul.', 'St', 'St.', 'Street', 
      'Rd', 'Rd.', 'Road', 'Dr', 'Dr.', 'Drive', 'Ln', 'Ln.', 'Lane', 'Ct', 'Ct.', 'Court',
      'Cres', 'Cres.', 'Crescent', 'Way', 'Pl', 'Pl.', 'Place', 'Pkwy', 'Pkwy.', 'Parkway',
      'Hwy', 'Hwy.', 'Highway', 'N', 'S', 'E', 'W', 'North', 'South', 'East', 'West',
      'Suite', 'Ste', 'Ste.', 'Unit', 'Apt', 'Apt.', 'Apartment', 'Floor', 'Fl', 'Fl.',
      'Bathurst', 'Bloor', 'Bond', 'Beaubien', 'Bishop', 'B305', 'ON', 'BC', 'QC', 'AB', 
      'MB', 'SK', 'NS', 'NB', 'NL', 'PE', 'YT', 'NT', 'NU', 'Canada'
    ])
    
    // Known Canadian cities (major and common ones)
    const knownCities = new Set([
      'Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg',
      'Quebec', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Saskatoon',
      'Regina', 'St. John\'s', 'Charlottetown', 'Whitehorse', 'Yellowknife', 'Iqaluit',
      'Mississauga', 'Brampton', 'Surrey', 'Burnaby', 'Richmond', 'Markham', 'Vaughan',
      'Windsor', 'Oakville', 'Burlington', 'Oshawa', 'St. Catharines', 'Cambridge',
      'Guelph', 'Barrie', 'Ajax', 'Whitby', 'Thunder Bay', 'Sudbury', 'Red Deer',
      'Lethbridge', 'St. Albert', 'Medicine Hat', 'Grande Prairie', 'Airdrie',
      'Spruce Grove', 'Fort McMurray', 'Leduc', 'Okotoks', 'Coquitlam', 'Kelowna',
      'Langley', 'Nanaimo', 'Kamloops', 'Prince George', 'Chilliwack', 'Maple Ridge',
      'New Westminster', 'Laval', 'Gatineau', 'Longueuil', 'Sherbrooke', 'Saguenay',
      'Lévis', 'Trois-Rivières', 'Terrebonne', 'Brossard', 'Repentigny', 'Brandon',
      'Steinbach', 'Thompson', 'Portage la Prairie', 'Winkler', 'Prince Albert',
      'Moose Jaw', 'Swift Current', 'Yorkton', 'Dartmouth', 'Sydney', 'Truro',
      'New Glasgow', 'Glace Bay', 'Moncton', 'Saint John', 'Fredericton', 'Dieppe',
      'Riverview', 'Miramichi', 'Mount Pearl', 'Corner Brook', 'Conception Bay South',
      'Grand Falls-Windsor', 'Gander', 'Summerside'
    ])
    
    // Try to find known cities first
    for (const city of knownCities) {
      const regex = new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i')
      if (regex.test(address)) {
        return city
      }
    }
    
    // Pattern: City before province code
    const cityProvincePattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:ON|BC|QC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/i
    const match1 = address.match(cityProvincePattern)
    if (match1) {
      const potentialCity = match1[1].trim()
      if (!excludeWords.has(potentialCity) && potentialCity.length > 2) {
        return potentialCity
      }
    }
    
    // Pattern: City, Province
    const cityCommaPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s*,\s*(?:ON|BC|QC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)\b/i
    const match2 = address.match(cityCommaPattern)
    if (match2) {
      const potentialCity = match2[1].trim()
      if (!excludeWords.has(potentialCity) && potentialCity.length > 2) {
        return potentialCity
      }
    }
    
    // Pattern: Look for city-like words (capitalized, not in exclude list, before province)
    const parts = address.split(/[,\s]+/)
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i].trim()
      const nextPart = parts[i + 1].trim()
      
      // If next part is a province code, this might be a city
      if (/^(ON|BC|QC|AB|MB|SK|NS|NB|NL|PE|YT|NT|NU)$/i.test(nextPart)) {
        if (part.length > 2 && 
            /^[A-Z]/.test(part) && 
            !excludeWords.has(part) &&
            !/^\d+$/.test(part)) {
          return part
        }
      }
    }
    
    return null
  }

  // Get unique cities from data
  const getUniqueCities = (): string[] => {
    const cities = new Set<string>()
    data.forEach(firm => {
      const city = extractCity(firm.address)
      if (city) {
        cities.add(city)
      }
    })
    return Array.from(cities).sort()
  }

  const uniqueCities = getUniqueCities()
  
  // Major cities to show first (top cities in Canada)
  const majorCities = ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Edmonton', 'Ottawa', 'Winnipeg', 'Hamilton', 'Kitchener', 'London', 'Victoria', 'Halifax', 'Saskatoon', 'Regina']
  const sortedCities = [
    ...majorCities.filter(city => uniqueCities.includes(city)),
    ...uniqueCities.filter(city => !majorCities.includes(city))
  ].slice(0, 20) // Limit to top 20 cities

  const filteredData = data.filter(firm => {
    // City filter
    if (selectedCity) {
      const firmCity = extractCity(firm.address)
      if (firmCity?.toLowerCase() !== selectedCity.toLowerCase()) {
        return false
      }
    }
    
    // Search filter
    const searchLower = searchTerm.toLowerCase()
    return (
      firm.name.toLowerCase().includes(searchLower) ||
      firm.address.toLowerCase().includes(searchLower) ||
      firm.phone.includes(searchTerm)
    )
  })

  const totalPages = Math.ceil(filteredData.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedData = filteredData.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">findmeca</h1>
                <p className="text-sm text-gray-500">CPA Directory</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleDownloadFiltered} 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download Filtered</span>
                <span className="sm:hidden">Filtered</span>
                <span className="text-xs">({filteredData.length})</span>
              </Button>
              <Button 
                onClick={handleDownloadAll} 
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Download All</span>
                <span className="sm:hidden">All</span>
                <span className="text-xs">({data.length})</span>
              </Button>
              <Button onClick={handleLogout} variant="secondary" size="sm">
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Firms</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{data.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filtered Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-600">{filteredData.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6 space-y-4">
          {/* City Filter Badges */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-medium text-gray-700">Filter by City:</span>
              {selectedCity && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedCity(null)
                    setCurrentPage(1)
                  }}
                  className="h-6 text-xs"
                >
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {sortedCities.map((city) => {
                const isSelected = selectedCity === city
                return (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedCity(isSelected ? null : city)
                      setCurrentPage(1)
                    }}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isSelected
                        ? 'bg-red-600 text-white shadow-md hover:bg-red-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    {city}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Search Input */}
          <Input
            type="text"
            placeholder="Search by name, address, or phone..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full max-w-2xl"
          />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Address</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-10 text-gray-500">
                        No results found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedData.map((firm, index) => {
                      const reviewCount = getReviewCount(firm.reviews)
                      const hasHighReviews = reviewCount > 100
                      
                      return (
                        <TableRow 
                          key={index}
                          className={hasHighReviews ? "bg-green-50 hover:bg-green-100 border-green-200" : ""}
                        >
                          <TableCell>
                            <div className="font-semibold">{firm.name || 'N/A'}</div>
                            {firm.reviewText && (
                              <div className="text-sm text-gray-500 italic mt-1" title={firm.reviewText}>
                                "{firm.reviewText.substring(0, 50)}..."
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold text-amber-600">{firm.rating || 'N/A'}</span>
                            {firm.reviews && (
                              <span className={`text-sm ml-1 ${hasHighReviews ? 'font-bold text-green-700' : 'text-gray-500'}`}>
                                ({firm.reviews})
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-gray-700">{firm.address || 'N/A'}</TableCell>
                        <TableCell>
                          {firm.phone ? (
                            <a href={`tel:${firm.phone}`} className="text-red-600 hover:underline">
                              {firm.phone}
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {firm.website ? (
                            <a
                              href={firm.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-red-600 hover:underline"
                            >
                              Visit Website
                            </a>
                          ) : (
                            <span className="text-gray-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              firm.status?.toLowerCase().includes('open')
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {firm.status || 'N/A'}
                          </span>
                        </TableCell>
                      </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              variant="outline"
            >
              Previous
            </Button>
            <span className="text-sm font-medium text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
