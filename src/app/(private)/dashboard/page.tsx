"use client"

import { motion } from "framer-motion";
import StatsPanel from "@/app/(private)/dashboard/_components/StatsCard";
import MimeTypeOverview from "@/app/(private)/dashboard/_components/MimitypeOverview";
import {
  useGoogleDriveStatus,
  useUserId,
  useOneDriveStatus,
} from "@/app/(private)/hooks/useAuthStatus";

const Dashboard = () => {
  const { userId } = useUserId();
  const { accounts: googleAccounts } = useGoogleDriveStatus();
  const { accounts: onedriveAccounts } = useOneDriveStatus();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 md:p-8 lg:p-10 space-y-10 max-w-[1400px]"
    >
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <h1 className="text-2xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your workspace at a glance</p>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsPanel
          userId={userId ?? undefined}
          googleAccounts={googleAccounts || []}
          onedriveAccounts={onedriveAccounts || []}
        />
      </div>

      {/* Overview */}
      <MimeTypeOverview
        userId={userId}
        googleAccounts={googleAccounts || []}
        onedriveAccounts={onedriveAccounts || []}
      />
    </motion.div>
  );
};

export default Dashboard;