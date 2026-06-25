"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Plus,
  Grid3X3,
  List,
  AlertTriangle,
  Crown,
  Mail,
} from "lucide-react";
import { IconBrandOnedrive } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ConnectedDriveCard } from "@/app/(private)/connections/_components/ConnectedDriveCard";
import { ConnectedDrivesList } from "@/app/(private)/connections/_components//ConnectedDriveList";
import { ConnectedOneDriveCard } from "@/app/(private)/connections/_components/ConnectedOneDriveCard";
import { ConnectedOneDrivesList } from "@/app/(private)/connections/_components/ConnectOneDriveList";
import {
  useConnectedDrives,
  useDeleteDrive,
} from "./hooks/useConnectedDrives";
import {
  useConnectedOneDrives,
  useDeleteOneDrive,
} from "./hooks/useConnectedOneDrive";
import { useConnectDriveAdvanced } from "./hooks/useConnectDrive";
import { useConnectOneDriveAdvanced } from "./hooks/useConnectOneDrive";
import { useSyncDrive } from "./hooks/useSyncDrive";
import { useSyncOneDrive } from "./hooks/useSyncOneDrive";

type DriveType = "google" | "onedrive";
type ViewMode = "grid" | "list";
type GoogleData = ReturnType<typeof useConnectedDrives>["data"];
type OneDriveData = ReturnType<typeof useConnectedOneDrives>["data"];

export default function ConnectionsContent() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [driveType, setDriveType] = useState<DriveType>("google");
  const [syncingDriveId, setSyncingDriveId] = useState<string | null>(null);

  const { data: googleData, isLoading: googleLoading } = useConnectedDrives();
  const deleteGoogleDrive = useDeleteDrive();
  const connectGoogleDrive = useConnectDriveAdvanced();
  const syncGoogleDrive = useSyncDrive();

  const { data: oneDriveData, isLoading: oneDriveLoading } = useConnectedOneDrives();
  const deleteOneDrive = useDeleteOneDrive();
  const connectOneDrive = useConnectOneDriveAdvanced();
  const syncOneDrive = useSyncOneDrive();

  // Pick everything for the active provider once, so the rest of the
  // component is branch-free.
  const isGoogle = driveType === "google";
  const driver = isGoogle
    ? {
        data: googleData,
        isLoading: googleLoading,
        deletePending: deleteGoogleDrive.isPending,
        runDelete: (driveId: string) => deleteGoogleDrive.mutate({ driveId }),
        runSync: (driveId: string, opts: { onSettled: () => void }) => syncGoogleDrive.mutate({ driveId }, opts),
        runConnect: () => connectGoogleDrive.connect(),
        checkStatus: () => connectGoogleDrive.checkConnectionStatus(),
        name: "Google Drive",
        icon: <Mail className="w-6 h-6 text-primary" />,
      }
    : {
        data: oneDriveData,
        isLoading: oneDriveLoading,
        deletePending: deleteOneDrive.isPending,
        runDelete: (driveId: string) => deleteOneDrive.mutate({ driveId }),
        runSync: (driveId: string, opts: { onSettled: () => void }) => syncOneDrive.mutate({ driveId }, opts),
        runConnect: () => connectOneDrive.connect(),
        checkStatus: () => connectOneDrive.checkConnectionStatus(),
        name: "OneDrive",
        icon: <IconBrandOnedrive size={24} color="#0078D4" />,
      };

  useEffect(() => {
    driver.checkStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleData, oneDriveData, driveType]);

  const handleDelete = (driveId: string) => driver.runDelete(driveId);

  const handleSync = (driveId: string) => {
    setSyncingDriveId(driveId);
    driver.runSync(driveId, { onSettled: () => setSyncingDriveId(null) });
  };

  const handleConnect = () => driver.runConnect();

  const googleDriveCount = googleData?.totalCount || 0;
  const oneDriveCount = oneDriveData?.totalCount || 0;
  const totalConnectedDrives = googleDriveCount + oneDriveCount;

  const subscriptionInfo = googleData?.subscription || oneDriveData?.subscription;
  const maxSlots = subscriptionInfo?.maxConnectedDrives || 2;
  const limitReached = subscriptionInfo ? !subscriptionInfo.canAddMore : false;
  const remainingSlots = subscriptionInfo?.remainingSlots ?? (maxSlots - totalConnectedDrives);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 lg:p-10 space-y-8 max-w-6xl"
    >
      <ConnectionsHeader
        packageName={subscriptionInfo?.packageName}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      <ProviderTabs
        driveType={driveType}
        setDriveType={setDriveType}
        googleData={googleData}
        oneDriveData={oneDriveData}
      />

      <UsageCard
        totalConnectedDrives={totalConnectedDrives}
        maxSlots={maxSlots}
        googleDriveCount={googleDriveCount}
        oneDriveCount={oneDriveCount}
        limitReached={limitReached}
        remainingSlots={remainingSlots}
      />

      <LimitWarning limitReached={limitReached} />

      <ConnectNewCard
        driveTypeName={driver.name}
        driveTypeIcon={driver.icon}
        limitReached={limitReached}
        onConnect={handleConnect}
      />

      <ConnectionsBody
        isLoading={driver.isLoading}
        currentData={driver.data}
        driveType={driveType}
        viewMode={viewMode}
        driveTypeName={driver.name}
        driveTypeIcon={driver.icon}
        limitReached={limitReached}
        onConnect={handleConnect}
        googleData={googleData}
        oneDriveData={oneDriveData}
        onDelete={handleDelete}
        onSync={handleSync}
        syncingDriveId={syncingDriveId}
        googleDeletePending={deleteGoogleDrive.isPending}
        oneDriveDeletePending={deleteOneDrive.isPending}
      />
    </motion.div>
  );
}

// ── Header (title + plan badge + view toggle) ────────────────

function ConnectionsHeader({ packageName, viewMode, setViewMode }: Readonly<{
  packageName?: string;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-foreground">
            Connected Drives
          </h1>
          {packageName && (
            <Badge className="bg-primary/10 text-primary border-0 text-xs">
              <Crown className="w-3 h-3 mr-1" />
              {packageName}
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your cloud storage connections
        </p>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 transition-colors ${
              viewMode === "grid"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 transition-colors ${
              viewMode === "list"
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted text-muted-foreground"
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Provider tabs ────────────────────────────────────────────

function ProviderTabs({ driveType, setDriveType, googleData, oneDriveData }: Readonly<{
  driveType: DriveType;
  setDriveType: (t: DriveType) => void;
  googleData: GoogleData;
  oneDriveData: OneDriveData;
}>) {
  const googleCount = googleData?.drives.length ?? 0;
  const oneDriveCount = oneDriveData?.drives.length ?? 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-4">
          <Tabs
            value={driveType}
            onValueChange={(value) => setDriveType(value as DriveType)}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 h-11">
              <TabsTrigger value="google" className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>Google Drive</span>
                {googleCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {googleCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="onedrive" className="flex items-center gap-2">
                <IconBrandOnedrive size={16} />
                <span>OneDrive</span>
                {oneDriveCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {oneDriveCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Usage card ───────────────────────────────────────────────

function UsageCard({ totalConnectedDrives, maxSlots, googleDriveCount, oneDriveCount, limitReached, remainingSlots }: Readonly<{
  totalConnectedDrives: number;
  maxSlots: number;
  googleDriveCount: number;
  oneDriveCount: number;
  limitReached: boolean;
  remainingSlots: number;
}>) {
  const slotWord = remainingSlots === 1 ? "slot" : "slots";
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                Total Drive Usage
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {totalConnectedDrives} of {maxSlots} drives connected
                {totalConnectedDrives > 0 && (
                  <span className="ml-1">
                    ({googleDriveCount} Google Drive, {oneDriveCount} OneDrive)
                  </span>
                )}
              </p>
            </div>
            {limitReached && (
              <Button size="sm" variant="destructive" className="text-xs h-8" asChild>
                <Link href="/settings/paddlePayment">Upgrade Plan</Link>
              </Button>
            )}
          </div>
          <Progress
            value={(totalConnectedDrives / maxSlots) * 100}
            className="h-2 rounded-full"
          />
          <p className="text-xs text-muted-foreground mt-2">
            {remainingSlots} {slotWord} remaining
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Limit warning banner ─────────────────────────────────────

function LimitWarning({ limitReached }: Readonly<{ limitReached: boolean }>) {
  if (!limitReached) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200/60 text-amber-800">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium">Connection Limit Reached</p>
          <p className="text-xs mt-0.5 text-amber-700">
            Upgrade your plan to connect more drive accounts. The limit applies to total accounts (Google Drive + OneDrive combined).
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ── Connect-new card ─────────────────────────────────────────

function ConnectNewCard({ driveTypeName, driveTypeIcon, limitReached, onConnect }: Readonly<{
  driveTypeName: string;
  driveTypeIcon: React.ReactNode;
  limitReached: boolean;
  onConnect: () => void;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <Card className="rounded-xl border-border/50 shadow-soft">
        <CardContent className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center">
              {driveTypeIcon}
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Connect New {driveTypeName}
              </p>
              <p className="text-xs text-muted-foreground">
                Securely link another {driveTypeName} account
              </p>
            </div>
          </div>
          <Button disabled={limitReached} onClick={onConnect} className="gap-2">
            <Plus className="w-4 h-4" />
            Connect {driveTypeName}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// ── Body (loading / empty / grid / list) ─────────────────────

function LoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {[1, 2, 3].map((i) => (
        <div key={i} className="rounded-xl bg-card border border-border/50 p-6 space-y-4">
          <div className="h-4 w-32 bg-muted shimmer rounded" />
          <div className="h-3 w-24 bg-muted shimmer rounded" />
          <div className="h-8 w-full bg-muted shimmer rounded" />
        </div>
      ))}
    </div>
  );
}

function EmptyState({ driveTypeName, driveTypeIcon, limitReached, onConnect }: Readonly<{
  driveTypeName: string;
  driveTypeIcon: React.ReactNode;
  limitReached: boolean;
  onConnect: () => void;
}>) {
  return (
    <Card className="rounded-xl border-border/50 shadow-soft">
      <CardContent className="p-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          {driveTypeIcon}
        </div>
        <h3 className="text-lg font-display font-semibold text-foreground mb-1">
          No {driveTypeName} Connected
        </h3>
        <p className="text-sm text-muted-foreground mb-6">
          Connect your {driveTypeName} to get started
        </p>
        <Button className="gap-2" onClick={onConnect} disabled={limitReached}>
          <Plus className="w-4 h-4" />
          Connect {driveTypeName}
        </Button>
      </CardContent>
    </Card>
  );
}

function ConnectionsBody(props: Readonly<{
  isLoading: boolean;
  currentData: GoogleData | OneDriveData;
  driveType: DriveType;
  viewMode: ViewMode;
  driveTypeName: string;
  driveTypeIcon: React.ReactNode;
  limitReached: boolean;
  onConnect: () => void;
  googleData: GoogleData;
  oneDriveData: OneDriveData;
  onDelete: (driveId: string) => void;
  onSync: (driveId: string) => void;
  syncingDriveId: string | null;
  googleDeletePending: boolean;
  oneDriveDeletePending: boolean;
}>) {
  const { isLoading, currentData, driveType, viewMode, onDelete, onSync, syncingDriveId } = props;

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!currentData?.drives || currentData.drives.length === 0) {
    return (
      <EmptyState
        driveTypeName={props.driveTypeName}
        driveTypeIcon={props.driveTypeIcon}
        limitReached={props.limitReached}
        onConnect={props.onConnect}
      />
    );
  }

  if (driveType === "google") {
    if (viewMode !== "grid") {
      return <ConnectedDrivesList onSync={onSync} syncingDriveId={syncingDriveId} />;
    }
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {props.googleData!.drives.map((drive) => (
          <ConnectedDriveCard
            key={drive.id}
            drive={drive}
            onDelete={onDelete}
            onSync={onSync}
            isLoading={props.googleDeletePending}
            isSyncing={syncingDriveId === drive.id}
            viewMode="grid"
          />
        ))}
      </div>
    );
  }

  if (viewMode !== "grid") {
    return <ConnectedOneDrivesList onSync={onSync} syncingDriveId={syncingDriveId} />;
  }
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
      {props.oneDriveData!.drives.map((drive) => (
        <ConnectedOneDriveCard
          key={drive.id}
          drive={drive}
          onDelete={onDelete}
          onSync={onSync}
          isLoading={props.oneDriveDeletePending}
          isSyncing={syncingDriveId === drive.id}
          viewMode="grid"
        />
      ))}
    </div>
  );
}
