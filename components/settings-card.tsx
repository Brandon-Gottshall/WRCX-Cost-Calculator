"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { SettingsState } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { calculateHardwareRequirements, getHardwareOptions } from "@/lib/hardware-calculator"

interface SettingsCardProps {
  title: string
  description: string
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  type:
    | "stream"
    | "live-to-vod"
    | "legacy-vod"
    | "storage-db"
    | "email"
    | "cdn"
    | "hardware-hosting"
    | "analytics"
    | "self-hosted-config"
}

export function SettingsCard({ title, description, settings, updateSettings, type }: SettingsCardProps) {
  // Simple fade animation without height changes
  const cardVariants = {
    visible: {
      opacity: 1,
      transition: {
        duration: 0.2,
      },
    },
  }

  return (
    <div className="mb-6">
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Each settings component is wrapped in its own motion.div for independent animation */}
          {type === "stream" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <StreamSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "live-to-vod" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <LiveToVodSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "legacy-vod" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <LegacyVodSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "storage-db" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <StorageDbSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "email" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <EmailSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "cdn" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <CdnSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "hardware-hosting" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <HardwareHostingSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "analytics" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <AnalyticsSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
          {type === "self-hosted-config" && (
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 1 }}
              variants={cardVariants}
              transition={{ duration: 0.2 }}
            >
              <SelfHostedSettings settings={settings} updateSettings={updateSettings} />
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StreamSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  // Use local state to ensure immediate UI updates
  const [showDvrSettings, setShowDvrSettings] = React.useState(settings.liveDvrEnabled)

  // Ensure local state stays in sync with parent state
  React.useEffect(() => {
    setShowDvrSettings(settings.liveDvrEnabled)
  }, [settings.liveDvrEnabled])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="streamEnabled">Live Streaming Enabled</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enable live streaming functionality</p>
        </div>
        <Switch
          id="streamEnabled"
          checked={settings.streamEnabled !== false} // Default to true if undefined
          onCheckedChange={(checked) => updateSettings({ streamEnabled: checked })}
        />
      </div>

      {settings.streamEnabled !== false && (
        <>
          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="channelCount">Channel Count (Live)</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="channelCount"
                  type="number"
                  min={1}
                  value={settings.channelCount}
                  onChange={(e) => updateSettings({ channelCount: Number.parseInt(e.target.value) || 1 })}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Number of simultaneous live channels</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peakConcurrentViewers">Peak Concurrent Viewers / Channel</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="peakConcurrentViewers"
                  type="number"
                  min={0}
                  value={settings.peakConcurrentViewers}
                  onChange={(e) => updateSettings({ peakConcurrentViewers: Number.parseInt(e.target.value) || 0 })}
                  className="w-full"
                />
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Maximum viewers at any given time</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="encodingPreset">Encoding Preset</Label>
            <Select
              value={settings.encodingPreset}
              onValueChange={(value) => updateSettings({ encodingPreset: value })}
            >
              <SelectTrigger id="encodingPreset">
                <SelectValue placeholder="Select encoding preset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1080p-tri-ladder">1080p Tri-ladder (5 Mbps × 2.8)</SelectItem>
                <SelectItem value="720p-tri-ladder">720p Tri-ladder (3 Mbps × 2.8)</SelectItem>
                <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">Quality and bitrate configuration</p>
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="liveDvrEnabled">Live DVR Enabled?</Label>
                <p className="text-sm text-slate-500 dark:text-slate-400">Allow viewers to rewind live streams</p>
              </div>
              <Switch
                id="liveDvrEnabled"
                checked={showDvrSettings}
                onCheckedChange={(checked) => {
                  // Update both local state and parent state
                  setShowDvrSettings(checked)
                  updateSettings({ liveDvrEnabled: checked })
                }}
              />
            </div>

            {/* Use AnimatePresence for smooth transitions */}
            <AnimatePresence>
              {showDvrSettings && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                    <Label htmlFor="recordingStorageLocation">Recording Storage Location</Label>
                    <Select
                      value={settings.recordingStorageLocation}
                      onValueChange={(value) => updateSettings({ recordingStorageLocation: value })}
                    >
                      <SelectTrigger id="recordingStorageLocation">
                        <SelectValue placeholder="Select storage location" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="same-as-vod">Same as VOD provider</SelectItem>
                        <SelectItem value="local-nas">Local-only (NAS)</SelectItem>
                        <SelectItem value="cloud-object">Cloud Object (R2/S3)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Where recordings are stored</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  )
}

function LiveToVodSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="vodEnabled">VOD Enabled</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Archive live streams as VOD content</p>
        </div>
        <Switch
          id="vodEnabled"
          checked={settings.vodEnabled}
          onCheckedChange={(checked) => updateSettings({ vodEnabled: checked })}
        />
      </div>

      {settings.vodEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="vodProvider">VOD Provider</Label>
            <Select value={settings.vodProvider} onValueChange={(value) => updateSettings({ vodProvider: value })}>
              <SelectTrigger id="vodProvider">
                <SelectValue placeholder="Select VOD provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same-as-live">Same as Live</SelectItem>
                <SelectItem value="mux">Mux</SelectItem>
                <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
                <SelectItem value="self-hosted-r2">Self-Hosted R2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">Service that hosts VOD content</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDayArchived">Hours per Day Archived</Label>
              <Input
                id="hoursPerDayArchived"
                type="number"
                min={0}
                max={24}
                value={settings.hoursPerDayArchived}
                onChange={(e) => updateSettings({ hoursPerDayArchived: Number.parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">Hours of content archived daily</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="retentionWindow">Retention Window</Label>
              <Select
                value={settings.retentionWindow.toString()}
                onValueChange={(value) => updateSettings({ retentionWindow: Number.parseInt(value) })}
              >
                <SelectTrigger id="retentionWindow">
                  <SelectValue placeholder="Select retention period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="365">365 days</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 dark:text-slate-400">How long content is kept</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="deliveryRegion">Delivery Region</Label>
              <Select
                value={settings.deliveryRegion}
                onValueChange={(value) => updateSettings({ deliveryRegion: value })}
              >
                <SelectTrigger id="deliveryRegion">
                  <SelectValue placeholder="Select delivery region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local</SelectItem>
                  <SelectItem value="us">US</SelectItem>
                  <SelectItem value="na">North America</SelectItem>
                  <SelectItem value="global">Global</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 dark:text-slate-400">Geographic distribution</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="peakConcurrentVodViewers">Peak Concurrent VOD Viewers</Label>
              <Input
                id="peakConcurrentVodViewers"
                type="number"
                min={0}
                value={settings.peakConcurrentVodViewers}
                onChange={(e) => updateSettings({ peakConcurrentVodViewers: Number.parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-slate-500 dark:text-slate-400">Maximum simultaneous VOD viewers</p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function LegacyVodSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="legacyEnabled">Legacy VOD Enabled</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Include existing video content</p>
        </div>
        <Switch
          id="legacyEnabled"
          checked={settings.legacyEnabled}
          onCheckedChange={(checked) => updateSettings({ legacyEnabled: checked })}
        />
      </div>

      {settings.legacyEnabled && (
        <>
          <div className="space-y-2">
            <Label htmlFor="backCatalogHours">Back-catalog Hours</Label>
            <Input
              id="backCatalogHours"
              type="number"
              min={0}
              value={settings.backCatalogHours}
              onChange={(e) => updateSettings({ backCatalogHours: Number.parseInt(e.target.value) || 0 })}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">Total hours of existing content</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="legacyProvider">Legacy Provider</Label>
            <Select
              value={settings.legacyProvider}
              onValueChange={(value) => updateSettings({ legacyProvider: value })}
            >
              <SelectTrigger id="legacyProvider">
                <SelectValue placeholder="Select legacy provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="same-as-vod">Same as VOD</SelectItem>
                <SelectItem value="mux">Mux</SelectItem>
                <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
                <SelectItem value="self-hosted-r2">Self-Hosted R2</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">Service that hosts legacy content</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="preEncoded">Pre-encoded?</Label>
              <p className="text-sm text-slate-500 dark:text-slate-400">Skip transcoding costs if already encoded</p>
            </div>
            <Switch
              id="preEncoded"
              checked={settings.preEncoded}
              onCheckedChange={(checked) => updateSettings({ preEncoded: checked })}
            />
          </div>

          {!settings.preEncoded && (
            <div className="space-y-2">
              <Label htmlFor="legacyEncodingPreset">Encoding Preset</Label>
              <Select
                value={settings.encodingPreset}
                onValueChange={(value) => updateSettings({ encodingPreset: value })}
              >
                <SelectTrigger id="legacyEncodingPreset">
                  <SelectValue placeholder="Select encoding preset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1080p-tri-ladder">1080p Tri-ladder (5 Mbps × 2.8)</SelectItem>
                  <SelectItem value="720p-tri-ladder">720p Tri-ladder (3 Mbps × 2.8)</SelectItem>
                  <SelectItem value="1080p-single">1080p Single (5 Mbps × 1)</SelectItem>
                  <SelectItem value="4k-tri-ladder">4K Tri-ladder (15 Mbps × 2.8)</SelectItem>
                  <SelectItem value="4k-single">4K Single (15 Mbps × 1)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 dark:text-slate-400">Quality and bitrate configuration</p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StorageDbSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="dataStore">Data Store</Label>
        <Select value={settings.dataStore} onValueChange={(value) => updateSettings({ dataStore: value })}>
          <SelectTrigger id="dataStore">
            <SelectValue placeholder="Select data store" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local-sqlite">Local SQLite</SelectItem>
            <SelectItem value="local-postgres">Local Postgres</SelectItem>
            <SelectItem value="cockroach-db">Cockroach DB</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Database for Payload CMS</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dbBackupRetention">DB Backup Retention</Label>
        <Select
          value={settings.dbBackupRetention.toString()}
          onValueChange={(value) => updateSettings({ dbBackupRetention: Number.parseInt(value) })}
        >
          <SelectTrigger id="dbBackupRetention">
            <SelectValue placeholder="Select backup retention" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="0">No DB</SelectItem>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="90">90 days</SelectItem>
            <SelectItem value="365">365 days</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">How long backups are kept</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="videoStorageStrategy">Video Storage Strategy</Label>
        <Select
          value={settings.videoStorageStrategy}
          onValueChange={(value) => updateSettings({ videoStorageStrategy: value })}
        >
          <SelectTrigger id="videoStorageStrategy">
            <SelectValue placeholder="Select storage strategy" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="local-nas">Local NAS</SelectItem>
            <SelectItem value="r2">Cloudflare R2</SelectItem>
            <SelectItem value="s3-standard-ia">S3 Standard IA</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Where video files are stored</p>
      </div>
    </div>
  )
}

function EmailSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="outboundEmail">Outbound Email?</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Enable email notifications</p>
        </div>
        <Switch
          id="outboundEmail"
          checked={settings.outboundEmail}
          onCheckedChange={(checked) => updateSettings({ outboundEmail: checked })}
        />
      </div>

      {settings.outboundEmail && (
        <div className="space-y-2">
          <Label htmlFor="monthlyEmailVolume">Monthly Email Volume</Label>
          <Input
            id="monthlyEmailVolume"
            type="number"
            min={0}
            value={settings.monthlyEmailVolume}
            onChange={(e) => updateSettings({ monthlyEmailVolume: Number.parseInt(e.target.value) || 0 })}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">Number of emails sent per month</p>
        </div>
      )}
    </div>
  )
}

function CdnSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-8">
      {/* Website CDN Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Website CDN</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Content delivery network for your Next.js application
        </p>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="websiteCdnPlan">Website CDN Plan</Label>
            <Select
              value={settings.websiteCdnPlan || settings.cdnPlan || "free"}
              onValueChange={(value) => updateSettings({ websiteCdnPlan: value })}
            >
              <SelectTrigger id="websiteCdnPlan">
                <SelectValue placeholder="Select CDN plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Cloudflare Free</SelectItem>
                <SelectItem value="pro">Cloudflare Pro ($20/mo)</SelectItem>
                <SelectItem value="business">Cloudflare Business ($200/mo)</SelectItem>
                <SelectItem value="enterprise">Cloudflare Enterprise (Custom)</SelectItem>
                <SelectItem value="vercel">Vercel Edge Network (Included)</SelectItem>
                <SelectItem value="netlify">Netlify CDN (Included)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">CDN for your website and application</p>
          </div>

          {(settings.websiteCdnPlan === "free" ||
            settings.websiteCdnPlan === "pro" ||
            settings.websiteCdnPlan === "business") && (
            <div className="space-y-2">
              <Label htmlFor="websiteCdnFeatures">Cloudflare Features</Label>
              <div className="grid grid-cols-1 gap-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${settings.websiteCdnPlan !== "free" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-sm">Web Application Firewall (WAF)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${settings.websiteCdnPlan !== "free" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-sm">Image Optimization</span>
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${settings.websiteCdnPlan === "business" || settings.websiteCdnPlan === "enterprise" ? "bg-green-500" : "bg-red-500"}`}
                  ></div>
                  <span className="text-sm">Advanced DDoS Protection</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Video CDN Section */}
      <div>
        <h3 className="text-lg font-medium mb-3">Video CDN</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Content delivery network for your video streaming content
        </p>

        {settings.platform === "mux" && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30">
            <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400">Mux Video CDN</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Mux includes a global CDN optimized for video delivery. No additional configuration required.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Global PoPs with low latency</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Automatic scaling based on demand</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Optimized for adaptive bitrate streaming</span>
              </div>
            </div>
          </div>
        )}

        {settings.platform === "cloudflare" && (
          <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/30">
            <h4 className="text-sm font-medium text-purple-700 dark:text-purple-400">Cloudflare Stream CDN</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Cloudflare Stream includes their global CDN network. No additional configuration required.
            </p>
            <div className="mt-3 grid grid-cols-1 gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">200+ global edge locations</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Integrated DDoS protection</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-xs">Optimized for HLS and DASH streaming</span>
              </div>
            </div>
          </div>
        )}

        {(settings.platform === "self-hosted" || settings.platform === "hybrid") && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="videoCdnProvider">Video CDN Provider</Label>
              <Select
                value={settings.videoCdnProvider || "cloudflare"}
                onValueChange={(value) => updateSettings({ videoCdnProvider: value })}
              >
                <SelectTrigger id="videoCdnProvider">
                  <SelectValue placeholder="Select video CDN provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cloudflare">Cloudflare Stream</SelectItem>
                  <SelectItem value="cloudfront">Amazon CloudFront</SelectItem>
                  <SelectItem value="fastly">Fastly</SelectItem>
                  <SelectItem value="bunny">Bunny.net</SelectItem>
                  <SelectItem value="none">No CDN (Direct from Origin)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-slate-500 dark:text-slate-400">CDN for video content delivery</p>
            </div>

            {settings.videoCdnProvider !== "none" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="videoCdnPlan">Video CDN Plan</Label>
                  <Select
                    value={settings.videoCdnPlan || "standard"}
                    onValueChange={(value) => updateSettings({ videoCdnPlan: value })}
                  >
                    <SelectTrigger id="videoCdnPlan">
                      <SelectValue placeholder="Select CDN plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="videoCdnEgressRate">CDN Egress Rate ($/GB)</Label>
                  <Input
                    id="videoCdnEgressRate"
                    type="number"
                    min={0}
                    step={0.001}
                    value={
                      settings.videoCdnEgressRate ||
                      (settings.videoCdnProvider === "cloudfront"
                        ? 0.085
                        : settings.videoCdnProvider === "bunny"
                          ? 0.01
                          : settings.videoCdnProvider === "fastly"
                            ? 0.12
                            : 0.01)
                    }
                    onChange={(e) => updateSettings({ videoCdnEgressRate: Number.parseFloat(e.target.value) || 0 })}
                  />
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Cost per GB for data transfer from CDN to viewers
                  </p>
                </div>
              </>
            )}

            {settings.videoCdnProvider === "none" && (
              <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-100 dark:border-amber-900/30">
                <h4 className="text-sm font-medium text-amber-700 dark:text-amber-400">Warning: No CDN</h4>
                <p className="text-xs text-amber-600 dark:text-amber-300 mt-1">
                  Serving video directly from your origin server will severely limit your viewer capacity and increase
                  bandwidth costs. This is only recommended for internal or very small-scale deployments.
                </p>
              </div>
            )}
          </div>
        )}

        {/* CDN Strategy Explanation */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
          <h4 className="text-sm font-medium mb-2">CDN Strategy</h4>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Your CDN strategy should be tailored to both your website and video content:
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-600 dark:text-slate-400 list-disc pl-4">
            <li>Website CDN handles your Next.js application, images, and API routes</li>
            <li>Video CDN is optimized for high-bandwidth streaming content</li>
            <li>Managed services (Mux, Cloudflare Stream) include their own video CDN</li>
            <li>Self-hosted solutions require a separate video CDN for scaling</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function HardwareHostingSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  const hardwareRequirements = calculateHardwareRequirements(settings)
  const hardwareOptions = getHardwareOptions()

  // Update recommended hardware when requirements change
  React.useEffect(() => {
    if (!settings.recommendedHardware || settings.recommendedHardware !== hardwareRequirements.recommendedHardware) {
      updateSettings({
        recommendedHardware: hardwareRequirements.recommendedHardware,
        serverType: hardwareRequirements.recommendedHardware
          .toLowerCase()
          .replace(/\s+$$.+$$/, "")
          .replace(/\s+/g, "-"),
        serverCost: hardwareRequirements.estimatedCost,
      })
    }
  }, [hardwareRequirements.recommendedHardware, settings.recommendedHardware, updateSettings])

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-4">
        <h3 className="text-sm font-medium mb-2">Estimated Hardware Requirements</h3>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            CPU: <span className="font-mono">{hardwareRequirements.cpuCores} cores</span>
          </div>
          <div>
            Memory: <span className="font-mono">{hardwareRequirements.memoryGB} GB</span>
          </div>
          <div>
            Storage: <span className="font-mono">{hardwareRequirements.storageGB} GB</span>
          </div>
          <div>
            Network: <span className="font-mono">{hardwareRequirements.networkMbps} Mbps</span>
          </div>
        </div>
        <div className="mt-2 text-xs">
          <strong>Recommended:</strong> {hardwareRequirements.recommendedHardware}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverType">Server Type</Label>
        <Select
          value={settings.serverType}
          onValueChange={(value) => {
            const selectedOption = hardwareOptions.find((option) => option.value === value)
            updateSettings({
              serverType: value,
              serverCost: selectedOption ? selectedOption.cost : settings.serverCost,
            })
          }}
        >
          <SelectTrigger id="serverType">
            <SelectValue placeholder="Select server type" />
          </SelectTrigger>
          <SelectContent>
            {hardwareOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label} ({option.specs})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Hardware for hosting services</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="hardwareAvailable">Hardware Already Available?</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Skip hardware purchase costs</p>
        </div>
        <Switch
          id="hardwareAvailable"
          checked={settings.hardwareAvailable || false}
          onCheckedChange={(checked) => updateSettings({ hardwareAvailable: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverCount">Server Count</Label>
        <Input
          id="serverCount"
          type="number"
          min={1}
          value={settings.serverCount}
          onChange={(e) => updateSettings({ serverCount: Number.parseInt(e.target.value) || 1 })}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">Number of servers for redundancy</p>
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="networkSwitchNeeded">Network Switch Needed?</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Include network switch in cost calculation</p>
        </div>
        <Switch
          id="networkSwitchNeeded"
          checked={settings.networkSwitchNeeded}
          onCheckedChange={(checked) => updateSettings({ networkSwitchNeeded: checked })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="rackHostingLocation">Rack Hosting Location</Label>
        <Select
          value={settings.rackHostingLocation}
          onValueChange={(value) => updateSettings({ rackHostingLocation: value })}
        >
          <SelectTrigger id="rackHostingLocation">
            <SelectValue placeholder="Select hosting location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="in-station">In-station</SelectItem>
            <SelectItem value="colo">Colocation</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Where hardware is hosted</p>
      </div>

      {settings.rackHostingLocation === "colo" && (
        <div className="space-y-2">
          <Label htmlFor="rackCost">Rack Cost ($/U mo)</Label>
          <Input
            id="rackCost"
            type="number"
            min={0}
            value={settings.rackCost}
            onChange={(e) => updateSettings({ rackCost: Number.parseInt(e.target.value) || 0 })}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly cost per rack unit</p>
        </div>
      )}
    </div>
  )
}

function AnalyticsSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  // Convert string-based analytics settings to an array of selected options
  const [selectedViewerAnalytics, setSelectedViewerAnalytics] = React.useState<string[]>(
    settings.viewerAnalytics && settings.viewerAnalytics !== "none" ? [settings.viewerAnalytics] : [],
  )

  const [selectedSiteAnalytics, setSelectedSiteAnalytics] = React.useState<string[]>(
    settings.siteAnalytics && settings.siteAnalytics !== "none" ? [settings.siteAnalytics] : [],
  )

  // Toggle selection of an analytics option
  const toggleViewerAnalytics = (value: string) => {
    setSelectedViewerAnalytics((prev) => {
      const newSelection = prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]

      // Update parent state directly here instead of in useEffect
      updateSettings({
        viewerAnalytics: newSelection.length > 0 ? newSelection[0] : "none",
      })

      return newSelection
    })
  }

  const toggleSiteAnalytics = (value: string) => {
    setSelectedSiteAnalytics((prev) => {
      const newSelection = prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]

      // Update parent state directly here instead of in useEffect
      updateSettings({
        siteAnalytics: newSelection.length > 0 ? newSelection[0] : "none",
      })

      return newSelection
    })
  }

  // Sync local state with parent state when parent state changes
  // This effect only runs when settings.viewerAnalytics or settings.siteAnalytics change
  React.useEffect(() => {
    // Only update local state if it's different from parent state
    if (
      settings.viewerAnalytics &&
      settings.viewerAnalytics !== "none" &&
      !selectedViewerAnalytics.includes(settings.viewerAnalytics)
    ) {
      setSelectedViewerAnalytics([settings.viewerAnalytics])
    } else if (settings.viewerAnalytics === "none" && selectedViewerAnalytics.length > 0) {
      setSelectedViewerAnalytics([])
    }

    if (
      settings.siteAnalytics &&
      settings.siteAnalytics !== "none" &&
      !selectedSiteAnalytics.includes(settings.siteAnalytics)
    ) {
      setSelectedSiteAnalytics([settings.siteAnalytics])
    } else if (settings.siteAnalytics === "none" && selectedSiteAnalytics.length > 0) {
      setSelectedSiteAnalytics([])
    }
  }, [settings.viewerAnalytics, settings.siteAnalytics])

  // Determine which viewer analytics options are available based on platform
  const viewerAnalyticsOptions = [
    {
      id: "mux-data",
      name: "Mux Data",
      description: "Comprehensive video QoS metrics, viewer experience scores, and engagement analytics",
      available: settings.platform === "mux" || settings.platform === "hybrid",
      cost: settings.platform === "mux" ? "Included" : "$50/mo",
      icon: "BarChart",
    },
    {
      id: "cf-analytics",
      name: "Cloudflare Analytics",
      description: "Basic viewer metrics and CDN performance insights",
      available: settings.platform === "cloudflare" || settings.platform === "hybrid",
      cost: settings.platform === "cloudflare" ? "Included" : "$20/mo",
      icon: "LineChart",
    },
    {
      id: "self-host-grafana",
      name: "Self-hosted Grafana",
      description: "Custom metrics dashboard with complete control over data collection and visualization",
      available: true,
      cost: "$10/mo (server costs)",
      icon: "PieChart",
    },
    {
      id: "google-analytics",
      name: "Google Analytics 4",
      description: "Free video event tracking integrated with website analytics",
      available: true,
      cost: "Free",
      icon: "Activity",
    },
  ]

  // Site analytics options
  const siteAnalyticsOptions = [
    {
      id: "ga4",
      name: "Google Analytics 4",
      description: "Comprehensive website analytics with audience insights and conversion tracking",
      available: true,
      cost: "Free",
      icon: "BarChart",
    },
    {
      id: "plausible",
      name: "Plausible Analytics",
      description: "Privacy-focused, lightweight analytics without cookies",
      available: true,
      cost: "$9/mo",
      icon: "TrendingUp",
    },
    {
      id: "fathom",
      name: "Fathom Analytics",
      description: "Simple, privacy-first analytics that's GDPR compliant",
      available: true,
      cost: "$14/mo",
      icon: "PieChart",
    },
    {
      id: "matomo",
      name: "Matomo",
      description: "Open-source analytics platform with full data ownership",
      available: true,
      cost: "Self-hosted: $5/mo, Cloud: $19/mo",
      icon: "Activity",
    },
  ]

  return (
    <div className="space-y-8">
      {/* Viewer Analytics Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Viewer Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Track viewer engagement, quality of service, and playback performance. Select all that apply.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {viewerAnalyticsOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 ${
                !option.available
                  ? "opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-700"
                  : selectedViewerAnalytics.includes(option.id)
                    ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                    : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`viewer-${option.id}`}
                      checked={selectedViewerAnalytics.includes(option.id)}
                      onChange={() => option.available && toggleViewerAnalytics(option.id)}
                      disabled={!option.available}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-400"
                    />
                    <label htmlFor={`viewer-${option.id}`} className="ml-2 text-sm font-medium">
                      {option.name}
                    </label>
                    <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
                      {option.cost}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 ml-6">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!selectedViewerAnalytics.length && (
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            No viewer analytics selected. You won't have insights into viewer experience or engagement.
          </p>
        )}
      </div>

      {/* Site Analytics Section */}
      <div>
        <h3 className="text-lg font-medium mb-4">Site Analytics</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Track website usage, user behavior, and content performance. Select all that apply.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {siteAnalyticsOptions.map((option) => (
            <div
              key={option.id}
              className={`border rounded-lg p-4 ${
                selectedSiteAnalytics.includes(option.id)
                  ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                  : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id={`site-${option.id}`}
                      checked={selectedSiteAnalytics.includes(option.id)}
                      onChange={() => toggleSiteAnalytics(option.id)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-800 dark:focus:ring-blue-400"
                    />
                    <label htmlFor={`site-${option.id}`} className="ml-2 text-sm font-medium">
                      {option.name}
                    </label>
                    <span className="ml-auto text-xs font-medium text-slate-500 dark:text-slate-400">
                      {option.cost}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 ml-6">{option.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">Analytics Integration Tips</h4>
        <ul className="text-xs text-blue-600 dark:text-blue-300 space-y-1 list-disc pl-4">
          <li>Combine viewer and site analytics for a complete picture of user engagement</li>
          <li>Consider data privacy regulations when selecting analytics providers</li>
          <li>Self-hosted options provide more control but require additional maintenance</li>
          <li>Cloud-based solutions offer easier setup with less operational overhead</li>
        </ul>
      </div>
    </div>
  )
}

function SelfHostedSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="serverType">Server Type</Label>
        <Select
          value={settings.serverType || "mac-mini"}
          onValueChange={(value) => updateSettings({ serverType: value })}
        >
          <SelectTrigger id="serverType">
            <SelectValue placeholder="Select server type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mac-mini">Mac Mini (M2 Pro)</SelectItem>
            <SelectItem value="mac-studio">Mac Studio (M2 Max)</SelectItem>
            <SelectItem value="linux-server">Linux Server (x86)</SelectItem>
            <SelectItem value="custom">Custom Hardware</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Primary server hardware</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverCount">Server Count</Label>
        <Input
          id="serverCount"
          type="number"
          min={1}
          value={settings.serverCount || 1}
          onChange={(e) => updateSettings({ serverCount: Number.parseInt(e.target.value) || 1 })}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">Number of servers for load balancing/redundancy</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serverCost">Server Cost ($)</Label>
        <Input
          id="serverCost"
          type="number"
          min={0}
          value={settings.serverCost || 1299}
          onChange={(e) => updateSettings({ serverCost: Number.parseInt(e.target.value) || 0 })}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">Cost of each server (amortized over 36 months)</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="networkInterface">Network Interface</Label>
        <Select
          value={settings.networkInterface || "1gbe"}
          onValueChange={(value) => updateSettings({ networkInterface: value })}
        >
          <SelectTrigger id="networkInterface">
            <SelectValue placeholder="Select network interface" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1gbe">1GbE (Standard)</SelectItem>
            <SelectItem value="10gbe">10GbE (Upgraded)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Network interface for the streaming server</p>
      </div>

      {settings.networkInterface === "10gbe" && (
        <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
          <Label htmlFor="nicCost">10GbE NIC Cost ($)</Label>
          <Input
            id="nicCost"
            type="number"
            min={0}
            value={settings.nicCost || 300}
            onChange={(e) => updateSettings({ nicCost: Number.parseInt(e.target.value) || 0 })}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">Cost of 10GbE network interface card</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="bandwidthCapacity">Bandwidth Capacity (Mbps)</Label>
        <Input
          id="bandwidthCapacity"
          type="number"
          min={0}
          value={settings.bandwidthCapacity || 1000}
          onChange={(e) => updateSettings({ bandwidthCapacity: Number.parseInt(e.target.value) || 0 })}
        />
        <p className="text-sm text-slate-500 dark:text-slate-400">Available outbound bandwidth</p>
      </div>

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="streamingServer">Streaming Server Software</Label>
        <Select
          value={settings.streamingServer || "mediamtx"}
          onValueChange={(value) => updateSettings({ streamingServer: value })}
        >
          <SelectTrigger id="streamingServer">
            <SelectValue placeholder="Select streaming server" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mediamtx">MediaMTX</SelectItem>
            <SelectItem value="nginx-rtmp">Nginx-RTMP</SelectItem>
            <SelectItem value="wowza">Wowza Streaming Engine</SelectItem>
            <SelectItem value="srt-live">SRT Live Server</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Software used for streaming</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="transcodingEngine">Transcoding Engine</Label>
        <Select
          value={settings.transcodingEngine || "hardware"}
          onValueChange={(value) => updateSettings({ transcodingEngine: value })}
        >
          <SelectTrigger id="transcodingEngine">
            <SelectValue placeholder="Select transcoding engine" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="hardware">Hardware (Apple Media Engine)</SelectItem>
            <SelectItem value="software">Software (CPU-based)</SelectItem>
            <SelectItem value="hybrid">Hybrid (Hardware + Software)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Method used for video transcoding</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="redundancyLevel">Redundancy Level</Label>
        <Select
          value={settings.redundancyLevel || "none"}
          onValueChange={(value) => updateSettings({ redundancyLevel: value })}
        >
          <SelectTrigger id="redundancyLevel">
            <SelectValue placeholder="Select redundancy level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (Single Server)</SelectItem>
            <SelectItem value="cold">Cold Standby (Manual Failover)</SelectItem>
            <SelectItem value="warm">Warm Standby (Semi-Automated)</SelectItem>
            <SelectItem value="hot">Hot Standby (Automated Failover)</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Level of redundancy for the streaming server</p>
      </div>

      {settings.redundancyLevel !== "none" && (
        <div className="space-y-2 pl-4 border-l-2 border-blue-200 dark:border-blue-900">
          <Label htmlFor="secondaryServerCost">Secondary Server Cost ($)</Label>
          <Input
            id="secondaryServerCost"
            type="number"
            min={0}
            value={settings.secondaryServerCost || 1300}
            onChange={(e) => updateSettings({ secondaryServerCost: Number.parseInt(e.target.value) || 0 })}
          />
          <p className="text-sm text-slate-500 dark:text-slate-400">Cost of secondary server hardware</p>
        </div>
      )}

      {settings.platform === "hybrid" && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="cloudProvider">Cloud Provider</Label>
            <Select
              value={settings.cloudProvider || "cloudflare"}
              onValueChange={(value) => updateSettings({ cloudProvider: value })}
            >
              <SelectTrigger id="cloudProvider">
                <SelectValue placeholder="Select cloud provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cloudflare">Cloudflare</SelectItem>
                <SelectItem value="aws">AWS CloudFront</SelectItem>
                <SelectItem value="gcp">Google Cloud CDN</SelectItem>
                <SelectItem value="azure">Azure CDN</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-slate-500 dark:text-slate-400">Cloud provider for hybrid delivery</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="originEgressCost">Origin Egress Cost ($/GB)</Label>
            <Input
              id="originEgressCost"
              type="number"
              min={0}
              step={0.001}
              value={settings.originEgressCost || 0.09}
              onChange={(e) => updateSettings({ originEgressCost: Number.parseFloat(e.target.value) || 0 })}
            />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Cost per GB for data transfer from origin to CDN
            </p>
          </div>
        </>
      )}

      <Alert className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-900/30">
        <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
          Self-hosted streaming requires technical expertise and ongoing maintenance. Ensure you have adequate resources
          for 24/7 operations.
        </AlertDescription>
      </Alert>
    </div>
  )
}
