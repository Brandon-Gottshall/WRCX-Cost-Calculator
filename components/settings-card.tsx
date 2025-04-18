"use client"

import { motion } from "framer-motion"
import type { SettingsState } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"

interface SettingsCardProps {
  title: string
  description: string
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
  type: "stream" | "live-to-vod" | "legacy-vod" | "storage-db" | "email" | "cdn" | "hardware-hosting" | "analytics"
}

export function SettingsCard({ title, description, settings, updateSettings, type }: SettingsCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: 24,
      marginBottom: 24,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      marginTop: 0,
      marginBottom: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  return (
    <motion.div initial="hidden" animate="visible" exit="exit" variants={cardVariants} layout>
      <Card className="overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900/30">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {type === "stream" && <StreamSettings settings={settings} updateSettings={updateSettings} />}
          {type === "live-to-vod" && <LiveToVodSettings settings={settings} updateSettings={updateSettings} />}
          {type === "legacy-vod" && <LegacyVodSettings settings={settings} updateSettings={updateSettings} />}
          {type === "storage-db" && <StorageDbSettings settings={settings} updateSettings={updateSettings} />}
          {type === "email" && <EmailSettings settings={settings} updateSettings={updateSettings} />}
          {type === "cdn" && <CdnSettings settings={settings} updateSettings={updateSettings} />}
          {type === "hardware-hosting" && (
            <HardwareHostingSettings settings={settings} updateSettings={updateSettings} />
          )}
          {type === "analytics" && <AnalyticsSettings settings={settings} updateSettings={updateSettings} />}
        </CardContent>
      </Card>
    </motion.div>
  )
}

function StreamSettings({
  settings,
  updateSettings,
}: {
  settings: SettingsState
  updateSettings: (settings: Partial<SettingsState>) => void
}) {
  return (
    <div className="space-y-6">
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
        <Select value={settings.encodingPreset} onValueChange={(value) => updateSettings({ encodingPreset: value })}>
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
            checked={settings.liveDvrEnabled}
            onCheckedChange={(checked) => updateSettings({ liveDvrEnabled: checked })}
          />
        </div>

        {settings.liveDvrEnabled && (
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
        )}
      </div>
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
            <SelectItem value="yaml">YAML flat-files</SelectItem>
            <SelectItem value="local-postgres">Local Postgres</SelectItem>
            <SelectItem value="remote-cockroach">Remote Cockroach</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">How metadata is stored</p>
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
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="cdnPlan">CDN Plan</Label>
        <Select value={settings.cdnPlan} onValueChange={(value) => updateSettings({ cdnPlan: value })}>
          <SelectTrigger id="cdnPlan">
            <SelectValue placeholder="Select CDN plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="free">Cloudflare Free</SelectItem>
            <SelectItem value="pro">Cloudflare Pro</SelectItem>
            <SelectItem value="enterprise">Cloudflare Enterprise</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Content delivery network tier</p>
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
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="macMiniNeeded">Mac Mini Needed?</Label>
          <p className="text-sm text-slate-500 dark:text-slate-400">Include Mac Mini in cost calculation</p>
        </div>
        <Switch
          id="macMiniNeeded"
          checked={settings.macMiniNeeded}
          onCheckedChange={(checked) => updateSettings({ macMiniNeeded: checked })}
        />
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
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="viewerAnalytics">Viewer Analytics</Label>
        <Select value={settings.viewerAnalytics} onValueChange={(value) => updateSettings({ viewerAnalytics: value })}>
          <SelectTrigger id="viewerAnalytics">
            <SelectValue placeholder="Select viewer analytics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="mux-data">Mux Data</SelectItem>
            <SelectItem value="cf-analytics">Cloudflare Analytics</SelectItem>
            <SelectItem value="self-host-grafana">Self-host Grafana</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track viewer engagement and quality</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="siteAnalytics">Site Analytics</Label>
        <Select value={settings.siteAnalytics} onValueChange={(value) => updateSettings({ siteAnalytics: value })}>
          <SelectTrigger id="siteAnalytics">
            <SelectValue placeholder="Select site analytics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            <SelectItem value="ga4">GA4</SelectItem>
            <SelectItem value="plausible">Plausible</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-sm text-slate-500 dark:text-slate-400">Track website usage</p>
      </div>
    </div>
  )
}
