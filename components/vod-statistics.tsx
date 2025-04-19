"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Edit, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/utils"
import type { VodStatistics } from "@/lib/types"

interface VodStatisticsProps {
  vodCategories: VodStatistics[]
  updateVodCategories: (vodCategories: VodStatistics[]) => void
  defaultFillRate?: number
}

export function VodStatisticsManager({
  vodCategories,
  updateVodCategories,
  defaultFillRate = 100,
}: VodStatisticsProps) {
  const [editingCategory, setEditingCategory] = useState<VodStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState<Omit<VodStatistics, "id">>({
    name: "",
    monthlyViews: 0,
    averageWatchTimeMinutes: 0,
    adSpotsPerView: 0,
    cpmRate: 0,
    fillRate: defaultFillRate,
  })

  const handleAddCategory = () => {
    const category: VodStatistics = {
      ...newCategory,
      id: `vod-${Date.now()}`,
    }
    updateVodCategories([...vodCategories, category])
    setNewCategory({
      name: "",
      monthlyViews: 0,
      averageWatchTimeMinutes: 0,
      adSpotsPerView: 0,
      cpmRate: 0,
      fillRate: defaultFillRate,
    })
    setIsAdding(false)
  }

  const handleUpdateCategory = () => {
    if (!editingCategory) return

    updateVodCategories(
      vodCategories.map((category) => (category.id === editingCategory.id ? editingCategory : category)),
    )
    setEditingCategory(null)
  }

  const handleDeleteCategory = (id: string) => {
    updateVodCategories(vodCategories.filter((category) => category.id !== id))
  }

  const calculateVodRevenue = (category: VodStatistics) => {
    // Monthly revenue = views * ad spots per view * fill rate * CPM / 1000
    const fillRate = category.fillRate !== undefined ? category.fillRate / 100 : defaultFillRate / 100
    return (category.monthlyViews * category.adSpotsPerView * fillRate * category.cpmRate) / 1000
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/30 px-3 sm:px-4 py-3">
        <CardTitle>VOD Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-3 sm:space-y-4">
          {vodCategories.length > 0 ? (
            <div className="overflow-x-auto -mx-2 px-2">
              <div className="inline-block min-w-full align-middle px-3 sm:px-4">
                <div className="overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th
                          scope="col"
                          className="py-2 px-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5"
                        >
                          Category
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5"
                        >
                          Views
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5"
                        >
                          Watch Time
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5"
                        >
                          Revenue
                        </th>
                        <th
                          scope="col"
                          className="py-2 px-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-1/5"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                      {vodCategories.map((category) => (
                        <tr key={category.id}>
                          {editingCategory?.id === category.id ? (
                            // Editing mode - simplified for mobile
                            <>
                              <td className="py-2 px-1">
                                <Input
                                  value={editingCategory.name}
                                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                                  className="w-full text-sm"
                                />
                              </td>
                              <td className="py-2 px-1">
                                <Input
                                  type="number"
                                  value={editingCategory.monthlyViews}
                                  onChange={(e) =>
                                    setEditingCategory({ ...editingCategory, monthlyViews: Number(e.target.value) })
                                  }
                                  className="w-full text-sm text-right"
                                />
                              </td>
                              <td className="py-2 px-1">
                                <Input
                                  type="number"
                                  value={editingCategory.averageWatchTimeMinutes}
                                  onChange={(e) =>
                                    setEditingCategory({
                                      ...editingCategory,
                                      averageWatchTimeMinutes: Number(e.target.value),
                                    })
                                  }
                                  className="w-full text-sm text-right"
                                />
                              </td>
                              <td className="py-2 px-1 text-right font-mono text-xs">
                                {formatCurrency(calculateVodRevenue(editingCategory))}
                              </td>
                              <td className="py-2 px-1">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleUpdateCategory}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingCategory(null)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          ) : (
                            // View mode - simplified for mobile
                            <>
                              <td className="py-2 px-1 text-xs sm:text-sm">{category.name}</td>
                              <td className="py-2 px-1 text-right text-xs sm:text-sm">
                                {category.monthlyViews.toLocaleString()}
                              </td>
                              <td className="py-2 px-1 text-right text-xs sm:text-sm">
                                {category.averageWatchTimeMinutes}m
                              </td>
                              <td className="py-2 px-1 text-right font-mono text-xs">
                                {formatCurrency(calculateVodRevenue(category))}
                              </td>
                              <td className="py-2 px-1">
                                <div className="flex justify-end gap-1">
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setEditingCategory(category)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleDeleteCategory(category.id)}
                                    className="h-7 w-7 p-0"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-slate-500 dark:text-slate-400">
              No VOD categories added yet. Add a category to track statistics.
            </div>
          )}

          {isAdding ? (
            <div className="border rounded-md p-3 space-y-3">
              <h3 className="font-medium text-sm">Add New VOD Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="categoryName" className="text-xs">
                    Category Name
                  </Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="News Archives"
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="monthlyViews" className="text-xs">
                    Monthly Views
                  </Label>
                  <Input
                    id="monthlyViews"
                    type="number"
                    value={newCategory.monthlyViews}
                    onChange={(e) => setNewCategory({ ...newCategory, monthlyViews: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="watchTime" className="text-xs">
                    Avg. Watch Time (minutes)
                  </Label>
                  <Input
                    id="watchTime"
                    type="number"
                    value={newCategory.averageWatchTimeMinutes}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, averageWatchTimeMinutes: Number(e.target.value) })
                    }
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="adSpots" className="text-xs">
                    Ad Spots per View
                  </Label>
                  <Input
                    id="adSpots"
                    type="number"
                    value={newCategory.adSpotsPerView}
                    onChange={(e) => setNewCategory({ ...newCategory, adSpotsPerView: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fillRate" className="text-xs">
                    Fill Rate (%)
                  </Label>
                  <Input
                    id="fillRate"
                    type="number"
                    value={newCategory.fillRate !== undefined ? newCategory.fillRate : defaultFillRate}
                    onChange={(e) => setNewCategory({ ...newCategory, fillRate: Number(e.target.value) })}
                    placeholder={`Default (${defaultFillRate}%)`}
                    className="h-8 text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="cpmRate" className="text-xs">
                    CPM Rate ($)
                  </Label>
                  <Input
                    id="cpmRate"
                    type="number"
                    value={newCategory.cpmRate}
                    onChange={(e) => setNewCategory({ ...newCategory, cpmRate: Number(e.target.value) })}
                    className="h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="outline" onClick={() => setIsAdding(false)} size="sm">
                  Cancel
                </Button>
                <Button onClick={handleAddCategory} size="sm">
                  Add Category
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="w-full flex items-center gap-2"
              onClick={() => setIsAdding(true)}
              size="sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Add VOD Category</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { VodStatisticsManager as VodStatistics }
