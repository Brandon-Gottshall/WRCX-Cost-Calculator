"use client"

import { useState } from "react"
import { PlusCircle, Trash2, Edit, Save, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatCurrency } from "@/lib/utils"
import type { VodStatistics } from "@/lib/types"

interface VodStatisticsProps {
  vodCategories: VodStatistics[]
  updateVodCategories: (vodCategories: VodStatistics[]) => void
}

export function VodStatisticsManager({ vodCategories, updateVodCategories }: VodStatisticsProps) {
  const [editingCategory, setEditingCategory] = useState<VodStatistics | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState<Omit<VodStatistics, "id">>({
    name: "",
    monthlyViews: 0,
    averageWatchTimeMinutes: 0,
    adSpotsPerView: 0,
    cpmRate: 0,
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
    // Monthly revenue = views * ad spots per view * CPM / 1000
    return (category.monthlyViews * category.adSpotsPerView * category.cpmRate) / 1000
  }

  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-900/30">
        <CardTitle>VOD Statistics</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4">
          {vodCategories.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category Name</TableHead>
                  <TableHead className="text-right">Monthly Views</TableHead>
                  <TableHead className="text-right">Avg. Watch Time (min)</TableHead>
                  <TableHead className="text-right">Ad Spots/View</TableHead>
                  <TableHead className="text-right">CPM Rate</TableHead>
                  <TableHead className="text-right">Est. Monthly Revenue</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vodCategories.map((category) => (
                  <TableRow key={category.id}>
                    {editingCategory?.id === category.id ? (
                      // Editing mode
                      <>
                        <TableCell>
                          <Input
                            value={editingCategory.name}
                            onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={editingCategory.monthlyViews}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, monthlyViews: Number(e.target.value) })
                            }
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={editingCategory.averageWatchTimeMinutes}
                            onChange={(e) =>
                              setEditingCategory({
                                ...editingCategory,
                                averageWatchTimeMinutes: Number(e.target.value),
                              })
                            }
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={editingCategory.adSpotsPerView}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, adSpotsPerView: Number(e.target.value) })
                            }
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Input
                            type="number"
                            value={editingCategory.cpmRate}
                            onChange={(e) =>
                              setEditingCategory({ ...editingCategory, cpmRate: Number(e.target.value) })
                            }
                            className="w-24 text-right ml-auto"
                          />
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(calculateVodRevenue(editingCategory))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={handleUpdateCategory}>
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingCategory(null)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      // View mode
                      <>
                        <TableCell>{category.name}</TableCell>
                        <TableCell className="text-right">{category.monthlyViews.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{category.averageWatchTimeMinutes}</TableCell>
                        <TableCell className="text-right">{category.adSpotsPerView}</TableCell>
                        <TableCell className="text-right">${category.cpmRate.toFixed(2)}</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(calculateVodRevenue(category))}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="ghost" onClick={() => setEditingCategory(category)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteCategory(category.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              No VOD categories added yet. Add a category to track statistics.
            </div>
          )}

          {isAdding ? (
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Add New VOD Category</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="News Archives"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="monthlyViews">Monthly Views</Label>
                  <Input
                    id="monthlyViews"
                    type="number"
                    value={newCategory.monthlyViews}
                    onChange={(e) => setNewCategory({ ...newCategory, monthlyViews: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="watchTime">Avg. Watch Time (minutes)</Label>
                  <Input
                    id="watchTime"
                    type="number"
                    value={newCategory.averageWatchTimeMinutes}
                    onChange={(e) =>
                      setNewCategory({ ...newCategory, averageWatchTimeMinutes: Number(e.target.value) })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adSpots">Ad Spots per View</Label>
                  <Input
                    id="adSpots"
                    type="number"
                    value={newCategory.adSpotsPerView}
                    onChange={(e) => setNewCategory({ ...newCategory, adSpotsPerView: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cpmRate">CPM Rate ($)</Label>
                  <Input
                    id="cpmRate"
                    type="number"
                    value={newCategory.cpmRate}
                    onChange={(e) => setNewCategory({ ...newCategory, cpmRate: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAdding(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddCategory}>Add Category</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full flex items-center gap-2" onClick={() => setIsAdding(true)}>
              <PlusCircle className="h-4 w-4" />
              <span>Add VOD Category</span>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
