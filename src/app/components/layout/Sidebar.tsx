'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Stack,
  Box,
  Badge,
  Tooltip,
  Text,
  Group,
} from '@mantine/core';
import {
  IconDashboard,
  IconPlugConnected,
  IconFiles,
  IconSearch,
  IconChartBar,
  IconSettings,
  IconAlertCircle,
  // IconSparkles, // Not used, removed for cleanup
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

// --- Define the Uniform Light Blue Color Scheme ---
const PRIMARY_COLOR = '#6B9ADF'; // A pleasing light blue
const ACCENT_BG_COLOR = 'rgba(107, 154, 223, 0.1)'; // Light blue with low opacity
const BORDER_COLOR = 'rgba(107, 154, 223, 0.2)'; // Light blue with low opacity

const navLinks = [
  {
    label: 'Dashboard',
    href: '/dashboard',
    icon: IconDashboard,
    requiresConnection: true,
  },
  {
    label: 'Connections',
    href: '/connections',
    icon: IconPlugConnected,
    requiresConnection: false,
  },
  {
    label: 'File Management',
    href: '/files',
    icon: IconFiles,
    requiresConnection: true,
  },
  {
    label: 'AI Search',
    href: '/search',
    icon: IconSearch,
    requiresConnection: true,
  },
  {
    label: 'Analytics',
    href: '/analytics',
    icon: IconChartBar,
    requiresConnection: true,
  },
  {
    label: 'Settings',
    href: '/settings/paddlePayment',
    icon: IconSettings,
    requiresConnection: false,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isConnected, setIsConnected] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const response = await fetch('/api/googleDrive/auth/status', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected && data.accountsCount > 0);
      }
    } catch (error) {
      console.error('Connection check failed:', error);
    } finally {
      setChecking(false);
    }
  };

  const handleNavClick = (link: typeof navLinks[0]) => {
    if (link.requiresConnection && !isConnected) {
      notifications.show({
        title: 'Connection Required',
        message: 'Please connect a drive first to access this feature',
        color: 'yellow',
        icon: <IconAlertCircle size={18} />,
      });
      router.push('/connections');
      return;
    }

    router.push(link.href);
  };

  return (
      <Box
          component="aside"
          style={{
            width: 280,
            minHeight: '100vh',
            background: 'linear-gradient(180deg, #ffffff 0%, #f5f7fa 100%)',
            borderRight: `1px solid ${BORDER_COLOR}`,
            padding: '24px 16px',
            position: 'relative',
            overflow: 'hidden',
          }}
      >
        <Stack gap="xs" style={{ position: 'relative', zIndex: 1 }}>
          {navLinks.map((link, index) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            const isDisabled = link.requiresConnection && !isConnected;

            const navItem = (
                <Box
                    key={link.href}
                    onClick={() => !isDisabled && handleNavClick(link)}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '14px',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      background: isActive
                          ? PRIMARY_COLOR // Active background is the solid light blue
                          : 'white',
                      border: `1px solid ${isActive ? 'transparent' : BORDER_COLOR}`,
                      boxShadow: isActive
                          ? `0 8px 24px ${ACCENT_BG_COLOR}` // Active shadow
                          : `0 2px 8px ${ACCENT_BG_COLOR}`, // Inactive shadow
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      opacity: isDisabled ? 0.5 : 1,
                      position: 'relative',
                      overflow: 'hidden',
                      animationDelay: `${index * 0.05}s`,
                    }}
                    className="fade-in"
                    onMouseEnter={(e) => {
                      if (!isDisabled && !isActive) {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = `0 4px 16px ${ACCENT_BG_COLOR}`;
                        e.currentTarget.style.background = ACCENT_BG_COLOR; // Hover background is a lighter tint
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDisabled && !isActive) {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = `0 2px 8px ${ACCENT_BG_COLOR}`;
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                >
                  <Group gap="sm" justify="space-between">
                    <Group gap="sm">
                      <Box
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '10px',
                            background: isActive
                                ? 'rgba(255, 255, 255, 0.2)'
                                : ACCENT_BG_COLOR, // Icon background
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease',
                          }}
                      >
                        <Icon
                            size={20}
                            color={isActive ? 'white' : PRIMARY_COLOR} // Icon color
                            stroke={2}
                            style={{
                              transition: 'all 0.3s ease',
                            }}
                        />
                      </Box>
                      <Text
                          size="sm"
                          fw={isActive ? 600 : 500}
                          c={isActive ? 'white' : 'var(--text-primary)'}
                          style={{
                            transition: 'all 0.3s ease',
                          }}
                      >
                        {link.label}
                      </Text>
                    </Group>

                    {isDisabled && (
                        <Badge
                            size="xs"
                            radius="xl"
                            style={{
                              // Using the primary color for the badge
                              background: PRIMARY_COLOR,
                              color: 'white',
                              border: 'none',
                              fontWeight: 600,
                            }}
                        >
                          Setup
                        </Badge>
                    )}
                  </Group>

                  {isActive && (
                      <Box
                          style={{
                            position: 'absolute',
                            top: '50%',
                            right: '8px',
                            transform: 'translateY(-50%)',
                            width: '4px',
                            height: '20px',
                            background: 'white',
                            borderRadius: '2px',
                            opacity: 0.6,
                          }}
                      />
                  )}
                </Box>
            );

            return isDisabled ? (
                <Tooltip
                    key={link.href}
                    label="Connect a drive to access this feature"
                    position="right"
                    withArrow
                    offset={12}
                >
                  <div>{navItem}</div>
                </Tooltip>
            ) : (
                navItem
            );
          })}
        </Stack>

        {!checking && (
            <Box
                mt="xl"
                p="md"
                style={{
                  borderRadius: '16px',
                  // Status box background based on connection status
                  background: isConnected
                      ? ACCENT_BG_COLOR // Connected: Light blue accent background
                      : 'rgba(242, 153, 74, 0.1)', // Setup Required: Kept a warning-like yellow/orange tint for clear messaging
                  border: `1px solid ${isConnected ? BORDER_COLOR : 'rgba(242, 153, 74, 0.2)'}`,
                  position: 'relative',
                  zIndex: 1,
                }}
            >
              <Group gap="xs" mb="xs">
                <Box
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      // Status light color
                      background: isConnected ? PRIMARY_COLOR : '#f2994a',
                      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                />
                <Text size="xs" fw={600} c="var(--text-secondary)" tt="uppercase" style={{ letterSpacing: '0.5px' }}>
                  Status
                </Text>
              </Group>
              <Text size="sm" fw={600} c="var(--text-primary)">
                {isConnected ? 'Connected & Ready' : 'Setup Required'}
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                {isConnected
                    ? 'All systems operational'
                    : 'Connect a drive to get started'}
              </Text>
            </Box>
        )}

        {/* Updated decorative background circle to use light blue */}
        <Box
            style={{
              position: 'absolute',
              bottom: '-50px',
              left: '-50px',
              width: '200px',
              height: '200px',
              background: PRIMARY_COLOR,
              borderRadius: '50%',
              opacity: 0.05,
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
        />

        <style jsx global>{`
          @keyframes floating {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-6px);
            }
          }

          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 1;
              transform: scale(1);
            }
            50% {
              opacity: 0.7;
              transform: scale(1.1);
            }
          }

          .fade-in {
            animation: fadeIn 0.4s ease-out forwards;
          }
        `}</style>
      </Box>
  );
}