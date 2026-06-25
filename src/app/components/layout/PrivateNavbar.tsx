'use client';

import { useState, useEffect } from 'react';
import {
    Group,
    Menu,
    Avatar,
    Text,
    UnstyledButton,
    Burger,
    Drawer,
    Stack,
    Badge,
    Tooltip,
    Box,
    ActionIcon,
    Indicator,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
    IconLogout,
    IconSettings,
    IconUser,
    IconChevronDown,
    IconPlugConnected,
    IconAlertCircle,
    IconCloud,
    IconSparkles,
    IconBell,
} from '@tabler/icons-react';
import { useRouter, usePathname } from 'next/navigation';
import { notifications } from '@mantine/notifications';
import { useSession } from '@/app/providers/SessionProvider';

export default function PrivateNavbar() {
    const router = useRouter();
    const pathname = usePathname();
    const [opened, { toggle, close }] = useDisclosure(false);

    const { user, logout } = useSession();

    const [isConnected, setIsConnected] = useState(false);
    const [accountsCount, setAccountsCount] = useState(0);
    const [checkingConnection, setCheckingConnection] = useState(true);

    useEffect(() => {
        checkConnectionStatus();
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const response = await fetch('/api/googleDrive/auth/status', {
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                setIsConnected(data.connected && data.accountsCount > 0);
                setAccountsCount(data.accountsCount || 0);
            }
        } catch (error) {
            console.error('Connection check failed:', error);
        } finally {
            setCheckingConnection(false);
        }
    };

    const handleNavigation = (path: string) => {
        const allowedRoutes = ['/connections', '/settings'];

        if (!isConnected && !allowedRoutes.includes(path)) {
            notifications.show({
                title: 'Connection Required',
                message: 'Please connect a drive first to access this feature',
                color: 'yellow',
                icon: <IconAlertCircle size={18} />,
            });
            router.push('/connections');
            return;
        }

        router.push(path);
        close();
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout failed:', error);
            notifications.show({
                title: 'Error',
                message: 'Failed to logout. Please try again.',
                color: 'red',
            });
        }
    };

    if (checkingConnection) {
        return (
            <Box
                style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                    width: '100%',
                }}
            >
                <Group h={70} justify="space-between" style={{ width: '100%' }}>
                    <Group gap="xs">
                        <IconCloud size={32} color="white" />
                        <Text fw={800} size="xl" c="white" style={{ letterSpacing: '0.5px' }}>
                            DriveUnity
                        </Text>
                    </Group>
                    <Avatar radius="xl" size="md" />
                </Group>
            </Box>
        );
    }

    return (
        <Box
            style={{
                position: 'relative',
                width: '95%',
            }}
        >
            <Group h={70} justify="space-between" style={{ width: '100%' }}>
                <Group gap="xs">
                    <Box
                        style={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            borderRadius: '12px',
                            padding: '8px',
                            backdropFilter: 'blur(10px)',
                        }}
                    >
                        <IconCloud size={28} color="white" />
                    </Box>
                    <Box>
                        <Text
                            fw={800}
                            size="xl"
                            c="black"
                            style={{
                                letterSpacing: '0.5px',
                                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                            }}
                        >
                            DriveUnity
                        </Text>
                        <Text size="xs" c="black" fw={500}>
                            Unified Cloud Storage
                        </Text>
                    </Box>
                </Group>

                <Group gap="md" visibleFrom="md">
                    {isConnected ? (
                        <Tooltip
                            label={`${accountsCount} drive${accountsCount > 1 ? 's' : ''} connected`}
                            position="bottom"
                            withArrow
                        >
                            <Badge
                                leftSection={<IconPlugConnected size={14} />}
                                color="teal"
                                variant="light"
                                size="lg"
                                radius="xl"
                                style={{
                                    cursor: 'pointer',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    color: '#12b886',
                                    fontWeight: 600,
                                    padding: '10px 16px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.3s ease',
                                }}
                                onClick={() => router.push('/connections')}
                                className="hover:scale-105"
                            >
                                {accountsCount} Connected
                            </Badge>
                        </Tooltip>
                    ) : (
                        <Tooltip label="Connect your first drive" position="bottom" withArrow>
                            <Badge
                                leftSection={<IconAlertCircle size={14} />}
                                variant="light"
                                size="lg"
                                radius="xl"
                                style={{
                                    cursor: 'pointer',
                                    background: 'rgba(255, 255, 255, 0.95)',
                                    color: '#fa5252',
                                    fontWeight: 600,
                                    padding: '10px 16px',
                                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                                    animation: 'pulse 2s infinite',
                                }}
                                onClick={() => router.push('/connections')}
                            >
                                Not Connected
                            </Badge>
                        </Tooltip>
                    )}
                </Group>

                <Group gap="sm" visibleFrom="sm">
                    <Menu
                        shadow="xl"
                        width={280}
                        radius="md"
                        transitionProps={{ transition: 'pop-top-right' }}
                    >
                        <Menu.Target>
                            <UnstyledButton
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    borderRadius: '50px',
                                    padding: '6px 16px 6px 6px',
                                    backdropFilter: 'blur(10px)',
                                    border: '2px solid rgba(255, 255, 255, 0.3)',
                                    transition: 'all 0.3s ease',
                                }}
                                className="hover:scale-105"
                            >
                                <Group gap="sm">
                                    <Avatar
                                        src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                                        alt={user?.name || 'User'}
                                        radius="xl"
                                        size="md"
                                        style={{
                                            border: '2px solid white',
                                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                        }}
                                    />
                                    <Box visibleFrom="sm">
                                        <Text size="sm" fw={600} c="black">
                                            {user?.name || 'User'}
                                        </Text>
                                        <Text size="xs" c="black">
                                            {user?.email}
                                        </Text>
                                    </Box>
                                    <IconChevronDown size={16} color="black" />
                                </Group>
                            </UnstyledButton>
                        </Menu.Target>

                        <Menu.Dropdown
                            style={{
                                border: 'none',
                                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <Menu.Label>
                                <Group gap="xs">
                                    <IconSparkles size={16} />
                                    <Text>Account</Text>
                                </Group>
                            </Menu.Label>

                            <Menu.Item
                                leftSection={<IconUser size={18} />}
                                onClick={() => handleNavigation('/settings')}
                                style={{
                                    borderRadius: '8px',
                                    margin: '4px',
                                }}
                            >
                                <Box>
                                    <Text size="sm" fw={500}>Profile</Text>
                                    <Text size="xs" c="dimmed">View and edit your profile</Text>
                                </Box>
                            </Menu.Item>

                            <Menu.Item
                                leftSection={<IconSettings size={18} />}
                                onClick={() => handleNavigation('/settings')}
                                style={{
                                    borderRadius: '8px',
                                    margin: '4px',
                                }}
                            >
                                <Box>
                                    <Text size="sm" fw={500}>Settings</Text>
                                    <Text size="xs" c="dimmed">Manage preferences</Text>
                                </Box>
                            </Menu.Item>

                            <Menu.Divider />

                            <Menu.Label>
                                <Group gap="xs">
                                    <IconCloud size={16} />
                                    <Text>Storage</Text>
                                </Group>
                            </Menu.Label>

                            <Menu.Item
                                leftSection={<IconPlugConnected size={18} />}
                                onClick={() => router.push('/connections')}
                                rightSection={
                                    <Badge
                                        color={isConnected ? 'teal' : 'orange'}
                                        variant="light"
                                        size="sm"
                                        radius="xl"
                                    >
                                        {isConnected ? `${accountsCount} Active` : 'Setup'}
                                    </Badge>
                                }
                                style={{
                                    borderRadius: '8px',
                                    margin: '4px',
                                }}
                            >
                                <Box>
                                    <Text size="sm" fw={500}>Connections</Text>
                                    <Text size="xs" c="dimmed">Manage your drives</Text>
                                </Box>
                            </Menu.Item>

                            <Menu.Divider />

                            <Menu.Item
                                color="red"
                                leftSection={<IconLogout size={18} />}
                                onClick={handleLogout}
                                style={{
                                    borderRadius: '8px',
                                    margin: '4px',
                                }}
                            >
                                <Text size="sm" fw={500}>Logout</Text>
                            </Menu.Item>
                        </Menu.Dropdown>
                    </Menu>
                </Group>

                <Burger
                    opened={opened}
                    onClick={toggle}
                    hiddenFrom="sm"
                    size="sm"
                    color="white"
                />
            </Group>

            <Drawer
                opened={opened}
                onClose={close}
                padding="lg"
                size="sm"
                position="right"
                hiddenFrom="sm"
                title={
                    <Group gap="sm">
                        <Avatar
                            src="https://img.freepik.com/free-vector/blue-circle-with-white-user_78370-4707.jpg"
                            alt={user?.name || 'User'}
                            radius="xl"
                            size="md"
                            style={{ border: '2px solid #667eea' }}
                        />
                        <Box>
                            <Text size="sm" fw={600}>
                                {user?.name || 'User'}
                            </Text>
                            <Text size="xs" c="dimmed">
                                {user?.email}
                            </Text>
                        </Box>
                    </Group>
                }
                styles={{
                    header: {
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                    },
                    title: {
                        color: 'white',
                    },
                    close: {
                        color: 'white',
                        '&:hover': {
                            background: 'rgba(255, 255, 255, 0.2)',
                        },
                    },
                }}
            >
                <Stack gap="md">
                    <Box
                        onClick={() => {
                            router.push('/connections');
                            close();
                        }}
                        style={{
                            padding: '16px',
                            borderRadius: '12px',
                            background: isConnected
                                ? 'linear-gradient(135deg, #51cf66 0%, #37b24d 100%)'
                                : 'linear-gradient(135deg, #ffd43b 0%, #fd7e14 100%)',
                            cursor: 'pointer',
                            transition: 'transform 0.2s ease',
                        }}
                        className="hover:scale-105"
                    >
                        <Group justify="space-between" mb="xs">
                            <Group gap="sm">
                                <IconPlugConnected size={20} color="white" />
                                <Text size="sm" fw={600} c="white">Connections</Text>
                            </Group>
                            <Badge color="white" variant="filled" size="sm">
                                {isConnected ? accountsCount : '0'}
                            </Badge>
                        </Group>
                        <Text size="xs" c="rgba(255, 255, 255, 0.9)">
                            {isConnected
                                ? `${accountsCount} drive${accountsCount > 1 ? 's' : ''} connected`
                                : 'Connect your first drive'}
                        </Text>
                    </Box>

                    <Stack gap="xs">
                        <UnstyledButton
                            onClick={() => handleNavigation('/settings')}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-gray-50 hover:border-blue-300"
                        >
                            <Group gap="sm">
                                <Box
                                    style={{
                                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <IconUser size={18} color="white" />
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <Text size="sm" fw={500}>Profile</Text>
                                    <Text size="xs" c="dimmed">View and edit profile</Text>
                                </Box>
                            </Group>
                        </UnstyledButton>

                        <UnstyledButton
                            onClick={() => handleNavigation('/settings')}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                border: '2px solid #e9ecef',
                                transition: 'all 0.2s ease',
                            }}
                            className="hover:bg-gray-50 hover:border-blue-300"
                        >
                            <Group gap="sm">
                                <Box
                                    style={{
                                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                                        borderRadius: '8px',
                                        padding: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <IconSettings size={18} color="white" />
                                </Box>
                                <Box style={{ flex: 1 }}>
                                    <Text size="sm" fw={500}>Settings</Text>
                                    <Text size="xs" c="dimmed">Manage preferences</Text>
                                </Box>
                            </Group>
                        </UnstyledButton>

                        <UnstyledButton
                            onClick={() => {
                                handleLogout();
                                close();
                            }}
                            style={{
                                padding: '14px 16px',
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                                color: 'white',
                                marginTop: '16px',
                                transition: 'all 0.2s ease',
                            }}
                            className="hover:scale-105"
                        >
                            <Group gap="sm">
                                <IconLogout size={18} />
                                <Text size="sm" fw={600}>Logout</Text>
                            </Group>
                        </UnstyledButton>
                    </Stack>
                </Stack>
            </Drawer>

            <style jsx global>{`
                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .hover\\:scale-105:hover {
                    transform: scale(1.05);
                }

                .hover\\:bg-gray-50:hover {
                    background-color: #f8f9fa;
                }

                .hover\\:border-blue-300:hover {
                    border-color: #74c0fc;
                }
            `}</style>
        </Box>
    );
}