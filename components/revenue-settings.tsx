"use client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import type { RevenueState } from "@/lib/types"

interface RevenueSettingsProps {
  revenue: RevenueState
  updateRevenue: (revenue: Partial<RevenueState>) => void
}

export function RevenueSettings({ revenue, updateRevenue }: RevenueSettingsProps) {
  return (
    <Card className="border-slate-200 dark:border-slate-800">
      <CardHeader className="bg-gradient-to-r from-slate-50 to-green-50 dark:from-slate-900 dark:to-green-900/30">
        <CardTitle>Revenue Estimation</CardTitle>
        <CardDescription>Configure your revenue streams</CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs defaultValue="live-ads" className="w-full">
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="live-ads">Live Ad Revenue</TabsTrigger>
            <TabsTrigger value="paid-programming">Paid Programming</TabsTrigger>
            <TabsTrigger value="vod-ads">VOD Ad Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="live-ads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="liveAdsEnabled">Live Ads Enabled</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable live ad revenue calculations</p>
              </div>
              <Switch
                id="liveAdsEnabled"
                checked={revenue.liveAdsEnabled}
                onCheckedChange={(checked) => updateRevenue({ liveAdsEnabled: checked })}
              />
            </div>

            {revenue.liveAdsEnabled && (
              <>
                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="averageDailyUniqueViewers">Average Daily Unique Viewers</Label>
                      <span className="text-sm font-mono">{revenue.averageDailyUniqueViewers.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="averageDailyUniqueViewers"
                        min={0}
                        max={100000}
                        step={100}
                        value={[revenue.averageDailyUniqueViewers]}
                        onValueChange={(value) => updateRevenue({ averageDailyUniqueViewers: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={100000}
                        value={revenue.averageDailyUniqueViewers}
                        onChange={(e) => updateRevenue({ averageDailyUniqueViewers: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Number of unique viewers per day</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="averageViewingHoursPerViewer">Average Viewing Hours per Viewer per Day</Label>
                      <span className="text-sm font-mono">{revenue.averageViewingHoursPerViewer.toFixed(1)} hours</span>
                    </div>
                    <Slider
                      id="averageViewingHoursPerViewer"
                      min={0}
                      max={24}
                      step={0.1}
                      value={[revenue.averageViewingHoursPerViewer]}
                      onValueChange={(value) => updateRevenue({ averageViewingHoursPerViewer: value[0] })}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      How many hours each viewer watches per day
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="adSpotsPerHour">Ad Spots per Hour</Label>
                      <span className="text-sm font-mono">{revenue.adSpotsPerHour.toFixed(1)} spots</span>
                    </div>
                    <Slider
                      id="adSpotsPerHour"
                      min={0}
                      max={12}
                      step={0.5}
                      value={[revenue.adSpotsPerHour]}
                      onValueChange={(value) => updateRevenue({ adSpotsPerHour: value[0] })}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Number of ad spots per hour of content</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="cpmRate">CPM Rate</Label>
                      <span className="text-sm font-mono">${revenue.cpmRate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="cpmRate"
                        min={0.01}
                        max={100}
                        step={0.01}
                        value={[revenue.cpmRate]}
                        onValueChange={(value) => updateRevenue({ cpmRate: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0.01}
                        max={100}
                        step={0.01}
                        value={revenue.cpmRate}
                        onChange={(e) => updateRevenue({ cpmRate: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Cost per thousand impressions (CPM)</p>
                  </div>
                </div>

                {/* Advanced Revenue Controls */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="advanced-controls">
                    <AccordionTrigger className="text-sm font-medium">Advanced Revenue Controls</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="peakTimeMultiplier">Peak Time Multiplier</Label>
                            <span className="text-sm font-mono">
                              {revenue.peakTimeMultiplier?.toFixed(2) || "1.00"}x
                            </span>
                          </div>
                          <Slider
                            id="peakTimeMultiplier"
                            min={1}
                            max={3}
                            step={0.05}
                            value={[revenue.peakTimeMultiplier || 1]}
                            onValueChange={(value) => updateRevenue({ peakTimeMultiplier: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Multiplier for ad rates during peak viewing hours
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="seasonalMultiplier">Seasonal Multiplier</Label>
                            <span className="text-sm font-mono">
                              {revenue.seasonalMultiplier?.toFixed(2) || "1.00"}x
                            </span>
                          </div>
                          <Slider
                            id="seasonalMultiplier"
                            min={0.8}
                            max={1.5}
                            step={0.05}
                            value={[revenue.seasonalMultiplier || 1]}
                            onValueChange={(value) => updateRevenue({ seasonalMultiplier: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Seasonal adjustment for ad rates (e.g., higher during holidays)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="targetDemographicValue">Target Demographic Value</Label>
                            <span className="text-sm font-mono">
                              {revenue.targetDemographicValue?.toFixed(2) || "1.00"}x
                            </span>
                          </div>
                          <Slider
                            id="targetDemographicValue"
                            min={0.5}
                            max={2}
                            step={0.05}
                            value={[revenue.targetDemographicValue || 1]}
                            onValueChange={(value) => updateRevenue({ targetDemographicValue: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Value multiplier based on audience demographics
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-300">
                    Live Ad Revenue Calculation
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {revenue.averageDailyUniqueViewers.toLocaleString()} viewers ×{" "}
                    {revenue.averageViewingHoursPerViewer.toFixed(1)} hours × {revenue.adSpotsPerHour.toFixed(1)} spots
                    × ${revenue.cpmRate.toFixed(2)} CPM ÷ 1,000 × 30 days
                    {revenue.peakTimeMultiplier && revenue.peakTimeMultiplier !== 1
                      ? ` × ${revenue.peakTimeMultiplier.toFixed(2)} peak multiplier`
                      : ""}
                    {revenue.seasonalMultiplier && revenue.seasonalMultiplier !== 1
                      ? ` × ${revenue.seasonalMultiplier.toFixed(2)} seasonal multiplier`
                      : ""}
                    {revenue.targetDemographicValue && revenue.targetDemographicValue !== 1
                      ? ` × ${revenue.targetDemographicValue.toFixed(2)} demographic value`
                      : ""}
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="paid-programming" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="paidProgrammingEnabled">Paid Programming Enabled</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Enable paid programming revenue calculations
                </p>
              </div>
              <Switch
                id="paidProgrammingEnabled"
                checked={revenue.paidProgrammingEnabled}
                onCheckedChange={(checked) => updateRevenue({ paidProgrammingEnabled: checked })}
              />
            </div>

            {revenue.paidProgrammingEnabled && (
              <>
                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="monthlyPaidBlocks">Monthly Paid Blocks</Label>
                      <span className="text-sm font-mono">{revenue.monthlyPaidBlocks} blocks</span>
                    </div>
                    <Slider
                      id="monthlyPaidBlocks"
                      min={0}
                      max={20}
                      step={1}
                      value={[revenue.monthlyPaidBlocks]}
                      onValueChange={(value) => updateRevenue({ monthlyPaidBlocks: value[0] })}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Number of 30-minute paid programming blocks per month
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="ratePerBlock">Rate per 30-min Block</Label>
                      <span className="text-sm font-mono">${revenue.ratePerBlock.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="ratePerBlock"
                        min={0}
                        max={1000}
                        step={10}
                        value={[revenue.ratePerBlock]}
                        onValueChange={(value) => updateRevenue({ ratePerBlock: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={1000}
                        step={10}
                        value={revenue.ratePerBlock}
                        onChange={(e) => updateRevenue({ ratePerBlock: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Price charged per 30-minute block</p>
                  </div>
                </div>

                {/* Premium Sponsorship Options */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="premium-sponsorship">
                    <AccordionTrigger className="text-sm font-medium">Premium Sponsorship Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="space-y-0.5">
                            <Label htmlFor="premiumSponsorshipEnabled">Premium Sponsorships</Label>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              Enable premium sponsorship revenue
                            </p>
                          </div>
                          <Switch
                            id="premiumSponsorshipEnabled"
                            checked={revenue.premiumSponsorshipEnabled || false}
                            onCheckedChange={(checked) => updateRevenue({ premiumSponsorshipEnabled: checked })}
                          />
                        </div>

                        {revenue.premiumSponsorshipEnabled && (
                          <>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor="premiumSponsorshipCount">Number of Premium Sponsors</Label>
                                <span className="text-sm font-mono">{revenue.premiumSponsorshipCount || 0}</span>
                              </div>
                              <Slider
                                id="premiumSponsorshipCount"
                                min={0}
                                max={10}
                                step={1}
                                value={[revenue.premiumSponsorshipCount || 0]}
                                onValueChange={(value) => updateRevenue({ premiumSponsorshipCount: value[0] })}
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <Label htmlFor="premiumSponsorshipRate">Premium Sponsorship Rate</Label>
                                <span className="text-sm font-mono">
                                  ${(revenue.premiumSponsorshipRate || 0).toFixed(2)}
                                </span>
                              </div>
                              <div className="flex items-center gap-4">
                                <Slider
                                  id="premiumSponsorshipRate"
                                  min={0}
                                  max={5000}
                                  step={100}
                                  value={[revenue.premiumSponsorshipRate || 0]}
                                  onValueChange={(value) => updateRevenue({ premiumSponsorshipRate: value[0] })}
                                  className="flex-1"
                                />
                                <Input
                                  type="number"
                                  min={0}
                                  max={5000}
                                  step={100}
                                  value={revenue.premiumSponsorshipRate || 0}
                                  onChange={(e) => updateRevenue({ premiumSponsorshipRate: Number(e.target.value) })}
                                  className="w-24"
                                />
                              </div>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Monthly rate per premium sponsor
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-300">
                    Paid Programming Revenue Calculation
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {revenue.monthlyPaidBlocks} blocks × ${revenue.ratePerBlock.toFixed(2)} per block
                    {revenue.premiumSponsorshipEnabled
                      ? ` + ${revenue.premiumSponsorshipCount || 0} premium sponsors × $${(revenue.premiumSponsorshipRate || 0).toFixed(2)}`
                      : ""}
                  </p>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="vod-ads" className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="vodAdsEnabled">VOD Ads Enabled</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Enable VOD ad revenue calculations</p>
              </div>
              <Switch
                id="vodAdsEnabled"
                checked={revenue.vodAdsEnabled}
                onCheckedChange={(checked) => updateRevenue({ vodAdsEnabled: checked })}
              />
            </div>

            {revenue.vodAdsEnabled && (
              <>
                <Separator />

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="monthlyVodViews">Monthly VOD Views</Label>
                      <span className="text-sm font-mono">{revenue.monthlyVodViews.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="monthlyVodViews"
                        min={0}
                        max={500000}
                        step={1000}
                        value={[revenue.monthlyVodViews]}
                        onValueChange={(value) => updateRevenue({ monthlyVodViews: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0}
                        max={500000}
                        step={1000}
                        value={revenue.monthlyVodViews}
                        onChange={(e) => updateRevenue({ monthlyVodViews: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Total number of VOD views per month</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="adSpotsPerVodView">Ad Spots per VOD View</Label>
                      <span className="text-sm font-mono">{revenue.adSpotsPerVodView.toFixed(1)} spots</span>
                    </div>
                    <Slider
                      id="adSpotsPerVodView"
                      min={0}
                      max={3}
                      step={0.1}
                      value={[revenue.adSpotsPerVodView]}
                      onValueChange={(value) => updateRevenue({ adSpotsPerVodView: value[0] })}
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400">Number of ad spots per VOD view</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="vodCpmRate">VOD CPM Rate</Label>
                      <span className="text-sm font-mono">${revenue.vodCpmRate.toFixed(2)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <Slider
                        id="vodCpmRate"
                        min={0.01}
                        max={100}
                        step={0.01}
                        value={[revenue.vodCpmRate]}
                        onValueChange={(value) => updateRevenue({ vodCpmRate: value[0] })}
                        className="flex-1"
                      />
                      <Input
                        type="number"
                        min={0.01}
                        max={100}
                        step={0.01}
                        value={revenue.vodCpmRate}
                        onChange={(e) => updateRevenue({ vodCpmRate: Number(e.target.value) })}
                        className="w-24"
                      />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Cost per thousand impressions (CPM) for VOD
                    </p>
                  </div>
                </div>

                {/* VOD Advanced Options */}
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="vod-advanced">
                    <AccordionTrigger className="text-sm font-medium">VOD Advanced Options</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-2">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="vodSkipRate">Ad Skip Rate</Label>
                            <span className="text-sm font-mono">{(revenue.vodSkipRate || 0) * 100}%</span>
                          </div>
                          <Slider
                            id="vodSkipRate"
                            min={0}
                            max={0.5}
                            step={0.01}
                            value={[revenue.vodSkipRate || 0]}
                            onValueChange={(value) => updateRevenue({ vodSkipRate: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Percentage of ads skipped by viewers (reduces revenue)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="vodCompletionRate">Content Completion Rate</Label>
                            <span className="text-sm font-mono">{(revenue.vodCompletionRate || 1) * 100}%</span>
                          </div>
                          <Slider
                            id="vodCompletionRate"
                            min={0.5}
                            max={1}
                            step={0.01}
                            value={[revenue.vodCompletionRate || 1]}
                            onValueChange={(value) => updateRevenue({ vodCompletionRate: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Percentage of viewers who watch to the end (affects ad views)
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label htmlFor="vodPremiumPlacementRate">Premium Placement Rate</Label>
                            <span className="text-sm font-mono">{(revenue.vodPremiumPlacementRate || 0) * 100}%</span>
                          </div>
                          <Slider
                            id="vodPremiumPlacementRate"
                            min={0}
                            max={0.3}
                            step={0.01}
                            value={[revenue.vodPremiumPlacementRate || 0]}
                            onValueChange={(value) => updateRevenue({ vodPremiumPlacementRate: value[0] })}
                          />
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Percentage of premium ad placements (increases revenue)
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2 text-green-800 dark:text-green-300">
                    VOD Ad Revenue Calculation
                  </h3>
                  <p className="text-xs text-green-700 dark:text-green-400">
                    {revenue.monthlyVodViews.toLocaleString()} views × {revenue.adSpotsPerVodView.toFixed(1)} spots × $
                    {revenue.vodCpmRate.toFixed(2)} CPM ÷ 1,000
                    {revenue.vodSkipRate ? ` × (1 - ${(revenue.vodSkipRate * 100).toFixed(0)}% skip rate)` : ""}
                    {revenue.vodCompletionRate && revenue.vodCompletionRate !== 1
                      ? ` × ${(revenue.vodCompletionRate * 100).toFixed(0)}% completion rate`
                      : ""}
                    {revenue.vodPremiumPlacementRate
                      ? ` × (1 + ${(revenue.vodPremiumPlacementRate * 100).toFixed(0)}% premium placement)`
                      : ""}
                  </p>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
